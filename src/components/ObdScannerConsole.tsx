import React from 'react';
import { cn } from '../lib/utils';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

export function ObdScannerConsole({ tirePressure, engineTemp }: any) {
  const isHighTemp = engineTemp > 105;
  const isTireAbnormal = tirePressure.some((p: number) => p < 25 || p > 40);
  
  const activeDtcs = [];
  if (isHighTemp) {
      activeDtcs.push({ code: 'P0128', description: 'Coolant Thermostat (Coolant Temperature Below Thermostat Regulating Temperature)', severity: 'high' });
  }
  if (isTireAbnormal) {
      activeDtcs.push({ code: 'C02XX', description: 'TPMS PSI Alert (Tire Pressure Monitoring System)', severity: 'medium' });
  }

  return (
    <div className="space-y-4">
        <div className="text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2 dark:text-slate-400">OBD-II Diagnostics</div>
        <div className="grid grid-cols-2 gap-2">
            <div className={cn("bg-gray-100 border rounded-xl p-3 transition-colors dark:bg-slate-800", isHighTemp ? "border-red-500/50" : "border-gray-200 dark:border-white/10")}>
                <div className="text-xl mb-1">🔥</div>
                <div className="text-xs font-bold text-gray-900 dark:text-white">Engine Temp</div>
                <div className={cn("text-[10px] font-medium", isHighTemp ? "text-red-400" : "text-emerald-400")}>
                    {isHighTemp ? `Warning — ${engineTemp.toFixed(1)}°C` : `Good — ${engineTemp.toFixed(1)}°C`}
                </div>
            </div>
            <div className={cn("bg-gray-100 border rounded-xl p-3 transition-colors dark:bg-slate-800", isTireAbnormal ? "border-orange-500/50" : "border-gray-200 dark:border-white/10")}>
                <div className="text-xl mb-1">⭕</div>
                <div className="text-xs font-bold text-gray-900 dark:text-white">TPMS Sensors</div>
                <div className={cn("text-[10px] font-medium", isTireAbnormal ? "text-orange-400" : "text-emerald-400")}>
                    {isTireAbnormal ? 'Warning — PSI Abnormal' : 'Good — Sensors OK'}
                </div>
            </div>
            <div className="bg-gray-100 border border-gray-200 rounded-xl p-3 transition-colors dark:bg-slate-800 dark:border-white/10">
                <div className="text-xl mb-1">🛑</div>
                <div className="text-xs font-bold text-gray-900 dark:text-white">Brakes</div>
                <div className="text-[10px] font-medium text-emerald-400">Good — 94%</div>
            </div>
            <div className="bg-gray-100 border border-gray-200 rounded-xl p-3 transition-colors dark:bg-slate-800 dark:border-white/10">
                <div className="text-xl mb-1">🔋</div>
                <div className="text-xs font-bold text-gray-900 dark:text-white">Battery</div>
                <div className="text-[10px] font-medium text-emerald-400">Good — 13.8V</div>
            </div>
        </div>

        <div className="mt-4">
            <div className="text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2 dark:text-slate-400">Fault Codes (DTC)</div>
            {activeDtcs.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                    {activeDtcs.map((dtc, idx) => (
                        <div key={idx} className="bg-gray-100/50 border border-slate-700 rounded-xl p-4 flex items-start space-x-4">
                            <div className={cn(
                                "px-2 py-1 rounded inline-block font-mono text-sm font-bold border",
                                dtc.severity === 'high' ? "bg-red-500/10 border-red-500/30 text-red-400" :
                                dtc.severity === 'medium' ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-600" :
                                "bg-slate-500/10 border-slate-500/30 text-gray-700"
                            )}>
                                {dtc.code}
                            </div>
                            <div className="flex-1">
                                <h4 className="text-gray-900 font-medium text-sm leading-tight dark:text-white">{dtc.description}</h4>
                                <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider dark:text-slate-500">Severity: <span className={cn(
                                    dtc.severity === 'high' ? "text-red-400" :
                                    dtc.severity === 'medium' ? "text-yellow-600" : "text-gray-500"
                                )}>{dtc.severity}</span></p>
                            </div>
                            <div className="shrink-0 text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded uppercase font-bold tracking-widest">
                                Active
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                        <p className="text-sm font-medium text-emerald-400">Systems operating within normal parameters.</p>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5 dark:text-slate-500">Emissions monitors ready.</p>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
}
