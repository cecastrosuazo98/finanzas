'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * FUNCIÓN: addTransaction
 * Registra el movimiento y actualiza saldos de Créditos o Ahorros automáticamente.
 */
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

  // El monto se guarda negativo si es un gasto, positivo si es un ingreso
  // Importante: Los retiros de ahorros se consideran "gastos" del capital general
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

  if (txError) {
    console.error("Error en Transacción:", txError.message);
    throw new Error(`Error en DB: ${txError.message}`);
  }

  // 2. ACTUALIZACIÓN AUTOMÁTICA DEL CRÉDITO
  if (destination === 'credit' && credit_id) {
    const { data: credit } = await supabase
      .from('credits')
      .select('remaining_amount, paid_installments')
      .eq('id', credit_id)
      .single();

    if (credit) {
      const paymentAmount = Math.abs(amount); 
      const currentRemaining = Number(credit.remaining_amount) || 0;
      const newRemaining = Math.max(0, currentRemaining - paymentAmount);

      await supabase
        .from('credits')
        .update({ 
          paid_installments: (credit.paid_installments || 0) + 1,
          remaining_amount: newRemaining,
          remaining_balance: newRemaining 
        })
        .eq('id', credit_id);
    }
  }

  // 3. ACTUALIZACIÓN DE AHORROS (Depósitos y Retiros)
  if ((destination === 'saving' || destination === 'withdraw_saving') && saving_id) {
    const { data: saving } = await supabase
      .from('savings')
      .select('current_amount')
      .eq('id', saving_id)
      .single();

    if (saving) {
      const currentSaving = Number(saving.current_amount) || 0;
      const txAmount = Math.abs(amount);
      
      // LOGICA: Si es withdraw_saving RESTA del fondo, si es saving SUMA al fondo.
      const newAmount = destination === 'withdraw_saving' 
        ? currentSaving - txAmount 
        : currentSaving + txAmount;

      await supabase
        .from('savings')
        .update({ current_amount: newAmount })
        .eq('id', saving_id);
    }
  }

  revalidatePath('/transactions');
  revalidatePath('/credits');
  revalidatePath('/savings');
  revalidatePath('/dashboard');
}

/**
 * FUNCIÓN: deleteTransaction
 * Elimina la transacción y revierte los saldos para mantener la integridad.
 */
export async function deleteTransaction(id: string): Promise<void> {
  const supabase = await createClient();

  const { data: tx, error: fetchError } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !tx) return;

  const absAmount = Math.abs(tx.amount);

  // REVERTIR CRÉDITOS
  if (tx.destination === 'credit' && tx.credit_id) {
    const { data: credit } = await supabase
      .from('credits')
      .select('remaining_amount, paid_installments')
      .eq('id', tx.credit_id)
      .single();

    if (credit) {
      const restoredBalance = Number(credit.remaining_amount) + absAmount;
      await supabase
        .from('credits')
        .update({
          remaining_amount: restoredBalance,
          remaining_balance: restoredBalance,
          paid_installments: Math.max(0, (credit.paid_installments || 0) - 1)
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
      
      // Si borro un retiro, el dinero debe VOLVER al fondo (+).
      // Si borro un depósito, el dinero debe SALIR del fondo (-).
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