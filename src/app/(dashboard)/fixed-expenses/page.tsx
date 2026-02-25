import { createClient } from '@/lib/supabase/server';
import { Trash2, Calendar, AlertCircle, CreditCard, Layers, Zap } from 'lucide-react';
import ExpenseForm from './ExpenseForm';
import { 
  addExpenseAction, 
  deleteExpenseAction, 
  payFixedExpenseAction,
  payAllFixedExpensesAction 
} from './actions';

export default async function FixedExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ pagos?: string }>;
}) {
  const supabase = await createClient();

  const { data: fixedExpenses } = await supabase
    .from('fixed_expenses')
    .select('*')
    .order('due_day', { ascending: true });

  const params = await searchParams;
  const pagosAgregados = params?.pagos;

  // Cálculo de total para el header
  const totalMensual = fixedExpenses?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

  return (
    <div className="space-y-8 md:space-y-12 pb-20 p-4 md:p-6">
      
      {/* HEADER DINÁMICO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter italic">
            Gastos <span className="text-indigo-500">Fijos.</span>
          </h1>
          <p className="text-slate-500 font-bold text-[10px] md:text-xs uppercase tracking-[0.4em]">
            Estructura de costos mensuales
          </p>
        </div>

        <div className="bg-indigo-500/5 border border-indigo-500/10 p-6 md:px-8 rounded-[2rem] backdrop-blur-md flex items-center gap-6">
          <div className="p-3 bg-indigo-500 rounded-2xl hidden sm:block">
            <Zap size={20} className="text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Carga Total Mes</p>
            <p className="text-2xl md:text-3xl font-black text-white font-mono leading-none">
              ${totalMensual.toLocaleString('es-CL')}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
        
        {/* COLUMNA FORMULARIO (Sticky en Desktop) */}
        <div className="lg:col-span-4 h-fit lg:sticky lg:top-24">
          <div className="bg-slate-900/40 border border-white/5 p-6 md:p-8 rounded-[2.5rem] backdrop-blur-xl">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Layers size={16} className="text-indigo-400" />
                <h2 className="text-white font-black text-lg uppercase tracking-tighter">Nueva Obligación</h2>
              </div>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                Configura un pago recurrente
              </p>
            </div>
            <ExpenseForm addExpenseAction={addExpenseAction} />
          </div>
        </div>

        {/* COLUMNA LISTADO */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">
              Compromisos Registrados
            </h2>
            <span className="text-[10px] bg-white/5 text-slate-400 border border-white/10 px-4 py-1.5 rounded-full font-black uppercase tracking-tighter">
              {fixedExpenses?.length || 0} Items
            </span>
          </div>

          {pagosAgregados && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] px-6 py-4 rounded-2xl text-center animate-in fade-in zoom-in duration-300">
              🚀 {pagosAgregados} PAGOS PROCESADOS EN EL LIBRO MAYOR
            </div>
          )}

          {(!fixedExpenses || fixedExpenses.length === 0) && (
            <div className="border-2 border-dashed border-slate-800/50 rounded-[3rem] p-16 md:p-24 flex flex-col items-center justify-center text-center gap-4 bg-slate-950/20">
              <AlertCircle size={40} className="text-slate-800" />
              <p className="text-slate-600 font-black uppercase text-xs tracking-widest">
                No hay gastos fijos registrados
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {fixedExpenses?.map((expense) => (
              <div
                key={expense.id}
                className="bg-slate-900/20 border border-white/5 p-5 md:p-6 rounded-[2.2rem] flex flex-col md:flex-row md:items-center justify-between hover:bg-slate-800/40 transition-all group gap-6 md:gap-4"
              >
                <div className="flex items-center gap-5">
                  <div className="h-14 w-14 shrink-0 bg-slate-950 border border-slate-800 text-indigo-500 rounded-2xl flex items-center justify-center shadow-inner group-hover:border-indigo-500/30 transition-colors">
                    <Calendar size={22} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-white font-bold text-lg md:text-xl tracking-tight truncate uppercase">
                      {expense.description}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-[9px] font-black text-indigo-400 border border-indigo-500/20 bg-indigo-500/5 px-2 py-0.5 rounded-md uppercase tracking-widest">
                        Día {expense.due_day}
                      </span>
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                        {expense.category}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 md:gap-8 border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                  <div className="text-left md:text-right">
                    <p className="text-[8px] font-black text-slate-600 uppercase mb-1 tracking-tighter">
                      Monto Mensual
                    </p>
                    <span className="text-xl md:text-2xl font-black text-white font-mono tracking-tighter">
                      ${Number(expense.amount).toLocaleString('es-CL')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <form
                      action={async () => {
                        'use server';
                        await payFixedExpenseAction({
                          description: expense.description,
                          amount: expense.amount,
                          category: expense.category,
                        });
                      }}
                    >
                      <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-[9px] font-black px-5 py-3.5 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95 whitespace-nowrap"
                      >
                        <CreditCard size={12} />
                        PAGAR
                      </button>
                    </form>

                    <form action={deleteExpenseAction}>
                      <input type="hidden" name="id" value={expense.id} />
                      <button
                        type="submit"
                        className="h-11 w-11 flex items-center justify-center rounded-xl text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                      >
                        <Trash2 size={18} />
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ACCIÓN MASIVA */}
          {fixedExpenses && fixedExpenses.length > 0 && (
            <div className="mt-12 flex justify-center">
              <form action={payAllFixedExpensesAction} className="w-full max-w-md">
                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black px-8 py-5 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 active:scale-95 group"
                >
                  <div className="p-1.5 bg-white/20 rounded-lg group-hover:scale-110 transition-transform">
                    <CreditCard size={14} />
                  </div>
                  PAGAR TODA LA ESTRUCTURA FIJA
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}