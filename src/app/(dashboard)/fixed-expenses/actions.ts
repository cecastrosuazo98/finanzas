'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function addExpenseAction(formData: FormData) {
  const supabase = await createClient();

  const data = {
    description: formData.get('description') as string,
    amount: Number(formData.get('amount')),
    due_day: Number(formData.get('due_day')),
    category: formData.get('category') as string,
    is_active: true
  };

  const { error } = await supabase
    .from('fixed_expenses')
    .insert([data]);

  if (error) {
    console.error("❌ Error en la acción:", error.message);
    throw new Error(error.message);
  }

  redirect('/fixed-expenses');
}

export async function deleteExpenseAction(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get('id');

  const { error } = await supabase
    .from('fixed_expenses')
    .delete()
    .eq('id', id);

  if (!error) revalidatePath('/fixed-expenses');
}

/**
 * ✅ Registrar UN gasto fijo
 */
export async function payFixedExpenseAction(expense: { 
  description: string, 
  amount: number, 
  category: string 
}) {
  const supabase = await createClient();

  const transactionData = {
    description: `Pago: ${expense.description}`,
    amount: -Math.abs(expense.amount),
    type: 'expense',
    category: expense.category,
    destination: 'normal',
    created_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('transactions')
    .insert([transactionData]);

  if (error) {
    console.error("❌ Error al procesar el pago:", error.message);
    throw new Error(error.message);
  }

  const montoFormateado = Math.abs(expense.amount).toLocaleString('es-CL');

  redirect(`/fixed-expenses?msg=Pago de $${montoFormateado} registrado`);
}

/**
 * 🔥 Registrar TODOS los gastos fijos
 */
export async function payAllFixedExpensesAction() {
  const supabase = await createClient();

  const { data: fixedExpenses, error } = await supabase
    .from('fixed_expenses')
    .select('*')
    .eq('is_active', true);

  if (error) {
    console.error("❌ Error obteniendo gastos:", error.message);
    throw new Error(error.message);
  }

  if (!fixedExpenses || fixedExpenses.length === 0) {
    redirect('/fixed-expenses?msg=No hay gastos activos');
  }

  const transactions = fixedExpenses.map((expense) => ({
    description: `Pago automático: ${expense.description}`,
    amount: -Math.abs(expense.amount),
    type: 'expense',
    category: expense.category,
    destination: 'normal',
    created_at: new Date().toISOString(),
  }));

  const { error: insertError } = await supabase
    .from('transactions')
    .insert(transactions);

  if (insertError) {
    console.error("❌ Error insertando transacciones:", insertError.message);
    throw new Error(insertError.message);
  }

  if (transactions.length === 1) {
    const monto = Math.abs(fixedExpenses[0].amount).toLocaleString('es-CL');
    redirect(`/fixed-expenses?msg=Pago de $${monto} registrado`);
  }

  redirect(`/fixed-expenses?msg=Se registraron ${transactions.length} pagos`);
}