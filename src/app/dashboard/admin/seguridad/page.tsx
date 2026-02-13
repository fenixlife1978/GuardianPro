'use client';

import { useInstitution } from '@/app/(admin)/institution-context';
import FilterConfig from '@/components/admin/FilterConfig';
import { ShieldAlert, ShieldCheck, Lock } from 'lucide-react';

export default function SeguridadPage() {
  const { institutionId } = useInstitution();

  if (!institutionId) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <div className="animate-pulse text-slate-400 font-black uppercase tracking-widest">
          Cargando parámetros de seguridad...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter italic">
            <span className="text-slate-950">EFAS</span>{' '}
            <span className="text-orange-500">ServiControlPro</span>
          </h1>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-[0.3em]">
            🛡️ Central de Seguridad y Filtros
          </p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-2xl flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span className="text-[10px] font-black text-emerald-600 uppercase">Sistema Activo</span>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Columna principal: Configuración de URLs */}
        <div className="xl:col-span-2">
          <FilterConfig activeId={institutionId} />
        </div>
        
        {/* Columna lateral: Info y Estado */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl shadow-slate-200">
            <Lock className="w-10 h-10 text-blue-400 mb-4" />
            <h3 className="text-xl font-black uppercase italic tracking-tighter mb-2">Protección Global</h3>
            <p className="text-slate-400 text-xs leading-relaxed font-medium">
              Los cambios aplicados en esta sección se sincronizan instantáneamente con todas las tablets vinculadas a esta institución.
            </p>
            <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-slate-500">Estado del Firewall</span>
                <span className="text-[10px] font-black uppercase text-blue-400">Encriptado</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-slate-500">Latencia de Red</span>
                <span className="text-[10px] font-black uppercase text-emerald-400">&lt; 100ms</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-[2rem] p-8 border border-blue-100">
            <ShieldAlert className="w-10 h-10 text-blue-600 mb-4" />
            <h3 className="text-lg font-black text-blue-900 uppercase italic tracking-tighter">¿Cómo funciona?</h3>
            <ul className="mt-4 space-y-3">
              <li className="text-xs text-blue-700 font-bold flex gap-2">
                <span className="bg-blue-200 w-4 h-4 rounded-full flex items-center justify-center text-[10px]">1</span>
                Agrega dominios (ej. tiktok.com)
              </li>
              <li className="text-xs text-blue-700 font-bold flex gap-2">
                <span className="bg-blue-200 w-4 h-4 rounded-full flex items-center justify-center text-[10px]">2</span>
                Presiona "Aplicar Cambios"
              </li>
              <li className="text-xs text-blue-700 font-bold flex gap-2">
                <span className="bg-blue-200 w-4 h-4 rounded-full flex items-center justify-center text-[10px]">3</span>
                La tablet bloquea el acceso mediante el Agente GuardianPro.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
