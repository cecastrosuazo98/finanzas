'use client';

import { useState } from 'react';
import { Plus, Target } from 'lucide-react';
import { addSaving } from './actions';

export default function SavingForm({ inputStyles }: { inputStyles: string }) {
  const [displayAmount, setDisplayAmount] = useState('');

  // Función para dar formato de moneda en tiempo real
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Remueve todo lo que no sea número
    if (value === "") {
      setDisplayAmount("");
      return;
    }
    // Formatea con separador de miles
    const formatted = new Intl.NumberFormat('en-US').format(parseInt(value));
    setDisplayAmount(formatted);
  };

  return (
    <div className="p-8 bg-slate-900/30 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
      <div className="flex items-center gap-3 mb-8 text-amber-400">
        <Target size={20} />
        <h2 className="text-xs font-black uppercase tracking-[0.3em]">Inicializar Nueva Meta</h2>
      </div>

      <form action={addSaving} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Input de Nombre */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-slate-500 uppercase px-1">Nombre de la Meta</label>
          <input 
            name="name" 
            placeholder="Ej: Fondo de Emergencia" 
            className={inputStyles} 
            required 
          />
        </div>

        {/* Input de Monto con Máscara */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-slate-500 uppercase px-1">Monto Objetivo</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500 font-mono font-bold">$</span>
            <input 
              type="text" // Cambiamos a text para permitir el formato
              value={displayAmount}
              onChange={handleAmountChange}
              placeholder="0,00" 
              className={`${inputStyles} pl-8 font-mono font-black text-amber-400 text-lg`} 
              required 
            />
            {/* Input oculto para enviar el número real (sin comas) al server action */}
            <input 
              type="hidden" 
              name="target_amount" 
              value={displayAmount.replace(/,/g, "")} 
            />
          </div>
        </div>

        <div className="flex items-end">
          <button 
            type="submit" 
            className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-slate-200 transition-all active:scale-95 shadow-[0_10px_20px_-10px_rgba(255,255,255,0.3)] flex items-center justify-center gap-3 uppercase text-[11px] tracking-widest"
          >
            <Plus size={18} strokeWidth={3} /> Activar Meta
          </button>
        </div>
      </form>
    </div>
  );
}