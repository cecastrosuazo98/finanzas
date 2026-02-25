import { createClient } from '@/lib/supabase/server';
import { CreditCard, Calendar, ArrowDownCircle, PieChart, ShieldAlert, TrendingDown } from 'lucide-react';
import CreditForm from './credit-form';

export default async function CreditsPage() {
  const supabase = await createClient();

  // 1. Carga de datos desde la tabla credits
  const { data: credits } = await supabase
    .from('credits')
    .select('*')
    .order('created_at', { ascending: false });

  // Cálculo de Deuda Total para el Header
  const totalDebt = credits?.reduce((acc, curr) => acc + Number(curr.remaining_amount), 0) || 0;

  const inputStyles = "bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-sm text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all backdrop-blur-md w-full appearance-none";

  return (
    <div className="space-y-8 md:space-y-12 pb-20">
      
      {/* HEADER DE GESTIÓN DE RIESGO */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
        <div className="flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-800 bg-slate-900/50 backdrop-blur-md w-fit">
            <CreditCard size={14} className="text-rose-500" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Gestión de Pasivos</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter italic leading-none">
            Créditos<span className="text-rose-600">.</span>
          </h1>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.3em] max-w-md">
            Control de apalancamiento y amortización de deuda
          </p>
        </div>

        {/* Resumen de Exposición Financiera */}
        <div className="bg-rose-500/5 border border-rose-500/10 p-6 md:px-10 rounded-[2.5rem] backdrop-blur-xl flex items-center gap-6 group hover:border-rose-500/30 transition-all">
          <div className="p-4 bg-rose-500 rounded-2xl shadow-[0_0_20px_rgba(244,63,94,0.2)] group-hover:scale-110 transition-transform">
            <TrendingDown size={24} className="text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black text-rose-500/60 uppercase tracking-[0.2em] mb-1">Deuda Viva Total</p>
            <p className="text-3xl md:text-4xl font-black text-white font-mono leading-none">
              ${totalDebt.toLocaleString('es-CL')}
            </p>
          </div>
        </div>
      </div>

      {/* 2. FORMULARIO (Componente de Cliente) */}
      <section className="relative z-10">
        <div className="bg-slate-900/40 border border-white/5 p-6 md:p-8 rounded-[2.5rem] backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-8">
            <ShieldAlert size={18} className="text-rose-500" />
            <h2 className="text-white font-black text-lg uppercase tracking-tighter">Registrar Nueva Obligación</h2>
          </div>
          <CreditForm inputStyles={inputStyles} />
        </div>
      </section>

      {/* 3. GRID DE CRÉDITOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {credits && credits.length > 0 ? (
          credits.map((item) => {
            const totalCTC = Number(item.total_amount) || 0;
            const vCuota = Number(item.installment_value) || 0;
            const pCuotas = Number(item.paid_installments) || 0;
            const tCuotas = Number(item.total_installments) || 1;
            const saldoRestante = Number(item.remaining_amount) || 0;
            const progress = Math.min(100, (pCuotas / tCuotas) * 100);

            return (
              <div key={item.id} className="group p-8 bg-[#0A0C10] border border-white/5 rounded-[3rem] shadow-2xl relative overflow-hidden transition-all hover:border-rose-500/20 flex flex-col justify-between">
                <div className="absolute -right-20 -top-20 w-48 h-48 bg-rose-500/5 blur-[70px] group-hover:bg-rose-500/10 transition-all duration-700" />
                
                <div className="relative z-10 mb-8">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl md:text-3xl font-black text-white italic tracking-tight uppercase truncate max-w-[250px]">
                        {item.name}
                      </h3>
                      <div className="flex flex-wrap gap-4 mt-3">
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
                          <Calendar size={12} className="text-rose-500" /> {pCuotas} / {tCuotas} CUOTAS
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-500/5 px-3 py-1 rounded-full border border-rose-500/10">
                          <PieChart size={12} /> {progress.toFixed(0)}% COMPLETADO
                        </div>
                      </div>
                    </div>
                    <div className="text-right bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                      <span className="text-[9px] font-black text-slate-500 uppercase block mb-1 tracking-tighter">Mensualidad</span>
                      <p className="text-2xl font-mono font-black text-white">
                        ${vCuota.toLocaleString('es-CL')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 md:gap-6 mb-8 relative z-10">
                  <div className="p-5 rounded-[2rem] bg-slate-950 border border-white/5">
                    <span className="text-[9px] font-black text-slate-600 uppercase block mb-2 tracking-widest">Carga Total</span>
                    <span className="text-lg md:text-xl font-mono font-black text-slate-400">
                      ${totalCTC.toLocaleString('es-CL')}
                    </span>
                  </div>
                  <div className="p-5 rounded-[2rem] bg-rose-950/20 border border-rose-500/20">
                    <span className="text-[9px] font-black text-rose-500 uppercase block mb-2 tracking-widest">Saldo Restante</span>
                    <span className="text-lg md:text-xl font-mono font-black text-rose-500">
                      ${saldoRestante.toLocaleString('es-CL')}
                    </span>
                  </div>
                </div>

                {/* Barra de Progreso de Amortización */}
                <div className="space-y-4 relative z-10">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Amortización</span>
                    <span className="text-xs font-mono font-black text-rose-400">{progress.toFixed(1)}%</span>
                  </div>
                  <div className="relative w-full h-5 bg-slate-900 rounded-full border border-white/5 overflow-hidden p-[3px]">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-rose-800 via-rose-600 to-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.4)] transition-all duration-1000 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full p-24 text-center border-2 border-dashed border-slate-800 rounded-[3.5rem] bg-slate-950/20">
            <div className="inline-flex p-6 bg-slate-900 rounded-full text-slate-700 mb-6 border border-white/5">
              <ArrowDownCircle size={48} className="opacity-20" />
            </div>
            <p className="text-slate-500 italic font-black uppercase tracking-[0.3em] text-sm">
              Libre de pasivos externos detectados
            </p>
          </div>
        )}
      </div>
    </div>
  );
}