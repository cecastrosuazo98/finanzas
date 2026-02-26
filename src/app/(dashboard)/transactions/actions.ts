'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addTransaction(formData: FormData): Promise<void> {
  const supabase = await createClient();

  const description = formData.get('description') as string;
  const type = formData.get('type') as string;
  const category = (formData.get('category') as string) || 'General';
  const destination = (formData.get('destination') as string) || 'normal';
  const saving_id = formData.get('saving_id') as string || null;
  const credit_id = formData.get('credit_id') as string || null;

  const amountRaw = formData.get('amount');
  let amount = amountRaw ? parseFloat(amountRaw as string) : 0;
  if (isNaN(amount) || amount === 0) return;

  // Normalizar monto: negativo para gastos, positivo para ingresos
  amount = type === 'expense' ? -Math.abs(amount) : Math.abs(amount);

  // 1. Inserción de la Transacción
  const { error: txError } = await supabase
    .from('transactions')
    .insert([{
        description,
        amount,
        type,
        category,
        destination,
        saving_id: (destination === 'saving' || destination === 'withdraw_saving') ? saving_id : null,
        credit_id: destination === 'credit' ? credit_id : null,
    }]);

  if (txError) throw new Error(`Error en DB: ${txError.message}`);

  // 2. ACTUALIZACIÓN INTELIGENTE DEL CRÉDITO
  if (destination === 'credit' && credit_id) {
    const { data: credit } = await supabase
      .from('credits')
      .select('remaining_amount, paid_installments, installment_value, total_installments')
      .eq('id', credit_id)
      .single();

    if (credit) {
      const paymentAmount = Math.abs(amount); 
      const currentRemaining = Number(credit.remaining_amount) || 0;
      const vCuota = Number(credit.installment_value) || 0;
      
      // Cálculo de nuevo saldo
      const newRemaining = Math.max(0, currentRemaining - paymentAmount);
      
      // LÓGICA DE CUOTAS: 
      // Calculamos cuántas cuotas completas cubre este pago. 
      // Si el pago es menor a una cuota, solo sumamos 1 si el saldo baja significativamente.
      const cuotasPagadasEnEsteActo = vCuota > 0 ? Math.floor(paymentAmount / vCuota) : 1;
      const totalPaidUpdated = (credit.paid_installments || 0) + (cuotasPagadasEnEsteActo || 1);

      // Si el saldo llega a 0, lo eliminamos automáticamente
      if (newRemaining <= 0) {
        await supabase.from('credits').delete().eq('id', credit_id);
      } else {
        await supabase
          .from('credits')
          .update({ 
            paid_installments: Math.min(totalPaidUpdated, credit.total_installments),
            remaining_amount: newRemaining,
            remaining_balance: newRemaining // Sincronizamos ambos campos
          })
          .eq('id', credit_id);
      }
    }
  }

  // 3. ACTUALIZACIÓN DE AHORROS
  if ((destination === 'saving' || destination === 'withdraw_saving') && saving_id) {
    const { data: saving } = await supabase
      .from('savings')
      .select('current_amount')
      .eq('id', saving_id)
      .single();

    if (saving) {
      const currentSaving = Number(saving.current_amount) || 0;
      const txAmount = Math.abs(amount);
      const newAmount = destination === 'withdraw_saving' 
        ? currentSaving - txAmount 
        : currentSaving + txAmount;

      await supabase
        .from('savings')
        .update({ current_amount: Math.max(0, newAmount) })
        .eq('id', saving_id);
    }
  }

  // Revalidación masiva para asegurar que todo el dashboard se actualice
  revalidatePath('/transactions');
  revalidatePath('/credits');
  revalidatePath('/savings');
  revalidatePath('/dashboard');
}

export async function deleteTransaction(id: string): Promise<void> {
  const supabase = await createClient();

  const { data: tx } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', id)
    .single();

  if (!tx) return;

  const absAmount = Math.abs(tx.amount);

  // REVERTIR CRÉDITOS
  if (tx.destination === 'credit' && tx.credit_id) {
    const { data: credit } = await supabase
      .from('credits')
      .select('remaining_amount, paid_installments, installment_value')
      .eq('id', tx.credit_id)
      .single();

    if (credit) {
      const vCuota = Number(credit.installment_value) || 0;
      const cuotasARestar = vCuota > 0 ? Math.floor(absAmount / vCuota) : 1;
      
      const restoredBalance = Number(credit.remaining_amount) + absAmount;
      
      await supabase
        .from('credits')
        .update({
          remaining_amount: restoredBalance,
          remaining_balance: restoredBalance,
          paid_installments: Math.max(0, (credit.paid_installments || 0) - (cuotasARestar || 1))
        })
        .eq('id', tx.credit_id);
    }
  }

  // REVERTIR AHORROS
  if ((tx.destination === 'saving' || tx.destination === 'withdraw_saving') && tx.saving_id) {
    const { data: saving } = await supabase
      .from('savings')
      .select('current_amount')
      .eq('id', tx.saving_id)
      .single();

    if (saving) {
      const currentSaving = Number(saving.current_amount) || 0;
      const restoredAmount = tx.destination === 'withdraw_saving'
        ? currentSaving + absAmount
        : currentSaving - absAmount;

      await supabase
        .from('savings')
        .update({ current_amount: Math.max(0, restoredAmount) })
        .eq('id', tx.saving_id);
    }
  }

  await supabase.from('transactions').delete().eq('id', id);

  revalidatePath('/transactions');
  revalidatePath('/dashboard');
  revalidatePath('/savings');
  revalidatePath('/credits');
}