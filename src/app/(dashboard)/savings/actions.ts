'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addSaving(formData: FormData) {
  const supabase = await createClient();

  const name = formData.get('name') as string;
  const target_amount = parseFloat(formData.get('target_amount') as string);

  const { error } = await supabase.from('savings').insert([
    {
      name,
      target_amount,
      current_amount: 0, // Toda meta inicia en cero
    }
  ]);

  if (error) {
    console.error("Error saving goal:", error.message);
    return;
  }

  revalidatePath('/savings');
  revalidatePath('/transactions'); // Para que aparezca en el select de transacciones
}