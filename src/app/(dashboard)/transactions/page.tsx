import { createClient } from '@/lib/supabase/server';
import { Activity, Trash2, ArrowUpDown, Filter } from 'lucide-react';
import TransactionForm from './transaction-form';
import { deleteTransaction } from './actions';

export default async function TransactionsPage() {
  const supabase = await createClient();
  
  // 1. Carga de datos paralela (Arquitectura de alto rendimiento)
  const [
    { data: transactions },
    { data: savings },
    { data: credits }
  ] = await Promise.all([
    supabase.from('transactions').select('*').order('created_at', { ascending: false }),
    supabase.from('savings').select('id, name'),
    supabase.from('credits').select('id, name')
  ]);

  // Estilo global para inputs consistentes (Se pasan al Client Component)
  const inputStyles = "bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-sm text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all backdrop-blur-md w-full appearance-none";

  return (
    <div className="space-y-8 md:space-y-12 pb-20">
      
      {/* HEADER NEO-DARK */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-800 bg-slate-900/50 backdrop-blur-md w-fit">
            <Activity size={12} className="text-emerald-400" />
            <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Libro Mayor Digital</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter italic">
            Transacciones<span className="text-indigo-500">.</span>
          </h1>
        </div>

<div className="bg-[#0A0C10] border border-white/10 p-5 rounded-[2rem] flex items-center justify-between gap-6 group hover:border-indigo-500/30 transition-all w-full lg:w-auto">
           <div className="px-2">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Registros Totales</p>
              <p className="text-3xl font-black text-white font-mono tracking-tighter">{transactions?.length || 0}</p>
           </div>
           <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
              <Activity size={24} />
           </div>
        </div>
      </div>

      {/* 2. FORMULARIO INTERACTIVO */}
      <section className="relative z-20">
        <TransactionForm 
          savings={savings || []} 
          credits={credits || []} 
          inputStyles={inputStyles} 
        />
      </section>

      {/* 3. TABLA DE RESULTADOS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2 text-slate-500">
            <Filter size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest italic">Historial de Operaciones</span>
          </div>
        </div>

        <div className="bg-[#0A0C10] backdrop-blur-md border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5">
                  <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Timestamp</th>
                  <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Detalle</th>
                  <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">Protocolo</th>
                  <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Volumen</th>
                  <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center w-24">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions && transactions.length > 0 ? (
                  transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-white/[0.02] transition-all group">
                      {/* Fecha con estilo mono */}
                      <td className="p-6">
                        <div className="flex flex-col">
                          <span className="text-slate-200 font-mono text-xs italic">
                            {new Date(t.created_at).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                          </span>
                          <span className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter">Verified</span>
                        </div>
                      </td>
                      
                      {/* Info Principal */}
                      <td className="p-6">
                        <div className="font-bold text-slate-200 text-sm md:text-base group-hover:text-white transition-colors uppercase tracking-tight">
                          {t.description}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded flex items-center gap-1 font-bold uppercase">
                            {t.category || 'General'}
                          </span>
                        </div>
                      </td>

                      {/* Badge de Destino */}
                      <td className="p-6 text-center">
                        <div className="flex justify-center">
                          <span className={`px-4 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest shadow-sm ${
                            t.destination === 'saving' ? 'border-amber-500/20 bg-amber-500/5 text-amber-500' :
                            t.destination === 'credit' ? 'border-rose-500/20 bg-rose-500/5 text-rose-500' :
                            'border-indigo-500/20 bg-indigo-500/5 text-indigo-400'
                          }`}>
                            {t.destination === 'saving' ? 'Ahorro' :
                             t.destination === 'credit' ? 'Pago Crédito' :
                             'General'}
                          </span>
                        </div>
                      </td>

                      {/* Monto con formato monetario imponente */}
                      <td className={`p-6 text-right font-mono font-black text-sm md:text-base ${
                        t.type === 'income' ? 'text-emerald-400' : 'text-rose-500'
                      }`}>
                        <div className="flex flex-col items-end">
                          <span>{t.type === 'income' ? '+' : '-'} ${Math.abs(Number(t.amount)).toLocaleString('es-CL')}</span>
                          <span className="text-[8px] opacity-40 uppercase tracking-widest">{t.type === 'income' ? 'Asset' : 'Liability'}</span>
                        </div>
                      </td>

                      {/* Botón de eliminar */}
                      <td className="p-6 text-center">
                        <form action={async () => {
                          'use server';
                          await deleteTransaction(t.id);
                        }}>
                          <button 
                            type="submit"
                            className="text-slate-700 hover:text-rose-500 hover:bg-rose-500/10 p-3 rounded-2xl transition-all active:scale-90 group/btn"
                          >
                            <Trash2 size={18} className="group-hover/btn:rotate-12 transition-transform" />
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-32 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-20">
                        <ArrowUpDown size={48} className="text-slate-500" />
                        <p className="text-slate-500 italic text-xs tracking-[0.3em] uppercase font-black">
                          Sin actividad en el ledger
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}