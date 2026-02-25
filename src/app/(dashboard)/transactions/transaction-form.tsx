'use client';

import { useState, useRef } from 'react';
import { Plus, ReceiptText } from 'lucide-react';
import { addTransaction } from './actions';

export default function TransactionForm({ savings, credits, inputStyles }: any) {
  const [type, setType] = useState('expense');
  const [destination, setDestination] = useState('normal');
  const [displayAmount, setDisplayAmount] = useState(''); 
  const formRef = useRef<HTMLFormElement>(null);

  const formatCurrency = (value: string) => {
    const digits = value.replace(/\D/g, "");
    return digits === "" ? "" : new Intl.NumberFormat('en-US').format(parseInt(digits));
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    setType(newType);
    setDestination('normal'); // Resetear destino al cambiar tipo
  };

  return (
    <div className="p-5 md:p-8 bg-slate-900/30 backdrop-blur-2xl border border-white/5 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl relative overflow-hidden">
      <div className="flex items-center gap-3 mb-6 md:mb-8 text-indigo-400">
        <ReceiptText size={20} />
        <h2 className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em]">Nuevo Movimiento</h2>
      </div>
      
      <form 
        ref={formRef}
        action={async (formData) => {
          await addTransaction(formData);
          formRef.current?.reset();
          setDisplayAmount('');
          setDestination('normal');
        }} 
        className="space-y-4 md:space-y-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <input name="description" placeholder="Descripción" className={inputStyles} required />
          
          <div className="relative">
            <input 
              type="text"
              value={displayAmount}
              onChange={(e) => setDisplayAmount(formatCurrency(e.target.value))}
              placeholder="Monto ($)" 
              className={`${inputStyles} font-bold text-indigo-400 font-mono`} 
              required 
            />
            <input type="hidden" name="amount" value={displayAmount.replace(/,/g, "")} />
          </div>

          <select 
            name="type" 
            className={`${inputStyles} font-bold`}
            value={type}
            onChange={handleTypeChange}
          >
            <option value="expense" className="bg-[#0A0C10]">🔴 Gasto / Salida</option>
            <option value="income" className="bg-[#0A0C10]">🟢 Ingreso / Entrada</option>
          </select>

          <select 
            name="destination" 
            className={`${inputStyles} font-bold text-indigo-400`}
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          >
            {type === 'expense' ? (
              <>
                <option value="normal" className="bg-[#0A0C10]">Gasto</option>
                <option value="saving" className="bg-[#0A0C10]">Ahorro (Depósito)</option>
                <option value="withdraw_saving" className="bg-[#0A0C10]">Retiro de Ahorros</option>
                <option value="credit" className="bg-[#0A0C10]">Pago de Crédito</option>
              </>
            ) : (
              <>
                <option value="normal" className="bg-[#0A0C10]">Entrada a Capital</option>
                <option value="saving" className="bg-[#0A0C10]">Ingreso Extra a Ahorro</option>
              </>
            )}
          </select>

          <input name="category" placeholder="Categoría" className={inputStyles} />
        </div>

        {/* Lógica Dinámica para Ahorros (Tanto para depósito como para retiro) */}
        <div className="grid grid-cols-1 gap-4">
          {(destination === 'saving' || destination === 'withdraw_saving') && (
            <div className="flex flex-col gap-1.5 animate-in slide-in-from-top-2 duration-300">
              <label className={`text-[9px] font-black uppercase tracking-widest px-1 italic ${destination === 'withdraw_saving' ? 'text-rose-400' : 'text-amber-500'}`}>
                {destination === 'withdraw_saving' ? 'Fondo de Ahorro a Retirar' : 'Meta de Ahorro Destino'}
              </label>
              <select 
                name="saving_id" 
                className={`${inputStyles} italic text-xs border-amber-500/20 ${destination === 'withdraw_saving' ? 'text-rose-200' : 'text-amber-200'}`} 
                required
              >
                <option value="" className="bg-[#0A0C10]">Seleccionar fondo...</option>
                {savings?.map((s: any) => (
                  <option key={s.id} value={s.id} className="bg-[#0A0C10]">{s.name}</option>
                ))}
              </select>
            </div>
          )}
          
          {destination === 'credit' && (
            <div className="flex flex-col gap-1.5 animate-in slide-in-from-top-2 duration-300">
              <label className="text-[9px] font-black text-rose-500 uppercase tracking-widest px-1 italic">Crédito a Abonar</label>
              <select name="credit_id" className={`${inputStyles} italic text-xs text-rose-200 border-rose-500/20`} required>
                <option value="" className="bg-[#0A0C10]">Seleccionar deuda...</option>
                {credits?.map((c: any) => <option key={c.id} value={c.id} className="bg-[#0A0C10]">{c.name}</option>)}
              </select>
            </div>
          )}
        </div>

        <button type="submit" className="w-full md:w-auto px-10 bg-white text-black font-black py-4 rounded-xl md:rounded-2xl hover:bg-slate-200 transition-all active:scale-95 flex items-center justify-center gap-3 uppercase text-[10px] md:text-[11px] tracking-widest shadow-xl">
          <Plus size={18} strokeWidth={3} /> Registrar Movimiento
        </button>
      </form>
    </div>
  );
}