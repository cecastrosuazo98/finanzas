import Link from 'next/link';
import { ArrowRight, Wallet, ShieldCheck, Zap, PieChart, Activity } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0C10] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Luces de fondo (Efecto Neo-Dark) */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-900/10 rounded-full blur-[120px]"></div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Badge superior */}
        <div className="mb-6 px-4 py-1.5 rounded-full border border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center gap-2">
          <Activity size={14} className="text-emerald-400" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Sistema Financiero</span>
        </div>

        {/* Icono Principal */}
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-5 rounded-[2rem] mb-8 shadow-[0_0_50px_-12px_rgba(79,70,229,0.5)]">
          <Wallet className="h-12 w-12 text-white" />
        </div>
        
        {/* Nombre de la App: Finanzas */}
        <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-6">
          Finanzas<span className="text-indigo-500">.</span>
        </h1>
        

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-4 mb-24 w-full max-w-md px-4">
          <Link 
            href="/dashboard" 
            className="flex-1 bg-white text-black px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-slate-200 transition-all active:scale-95 shadow-[0_10px_20px_-10px_rgba(255,255,255,0.3)]"
          >
            IR <ArrowRight className="h-5 w-5" />
          </Link>
          
        </div>

      </div>

      <footer className="absolute bottom-8 text-slate-600 text-[10px] font-bold uppercase tracking-[0.3em]">
        © 2026 
      </footer>
    </div>
  );
}