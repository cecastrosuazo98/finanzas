import { UserButton } from "@clerk/nextjs"; // O tu componente de perfil de Supabase
import { Bell } from "lucide-react";

export function Navbar() {
  return (
    <div className="flex items-center p-4 border-b bg-white justify-between">
      <div className="flex items-center gap-x-2">
        {/* Aquí podrías poner un buscador o breadcrumbs */}
        <span className="text-sm text-slate-500">Bienvenido de nuevo</span>
      </div>
      <div className="flex items-center gap-x-4">
        <button className="relative p-2 hover:bg-slate-100 rounded-full transition">
          <Bell className="h-5 w-5 text-slate-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="h-8 w-8 rounded-full bg-slate-200 border"></div> 
      </div>
    </div>
  )
}