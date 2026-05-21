import React from 'react';
import { cn } from '../lib/utils';
import { STATE_POLICIES, type StateName } from './PolicySidebar';

interface HUDProps {
  speed: number;
  speedLimit: number;
  safetyScore: number;
  isRashDriving: boolean;
  gForce: number;
  fuelLevel?: number;
  tirePressure?: [number, number, number, number];
  engineTemp?: number;
  currentState: StateName;
  center: { lat: number; lng: number };
  className?: string;
}

export function HUD({ speed, speedLimit, safetyScore, isRashDriving, gForce, currentState, center, className }: HUDProps) {
  const ratio = speed / speedLimit;
  const isSpeeding = ratio > 1;

  // Colors based on speed
  const spdColor = ratio < 1 ? 'text-emerald-500' : ratio < 1.1 ? 'text-yellow-600' : 'text-red-500';
  const spdBg = ratio < 1 ? 'bg-emerald-500' : ratio < 1.1 ? 'bg-yellow-500' : 'bg-red-500';

  const scoreArcOffset = 138.2 - (safetyScore / 100) * 138.2;
  const scoreColor = safetyScore > 70 ? 'stroke-emerald-500' : safetyScore > 40 ? 'stroke-yellow-500' : 'stroke-red-500';

  const cp = Math.max(0, Math.min(100, 100 - (ratio - 1) * 200));
  const sm = Math.max(0, Math.min(100, 100 - Math.abs(speed - 60) * 0.8));
  const rf = gForce;
  const rp = Math.min(100, rf * 150);
  
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {/* Speed Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg relative overflow-hidden flex flex-col justify-center min-h-[220px] dark:bg-[#111827] dark:border-white/10">
        {/* Subtle background glow depending on speed */}
        <div className={cn("absolute inset-0 opacity-5", spdBg)} style={{ filter: 'blur(40px)' }} />
        
        <div className={cn("font-mono text-8xl font-black text-center transition-colors tracking-tighter leading-none z-10", spdColor)}>
            {Math.round(speed)}
        </div>
        <div className="text-[11px] text-gray-400 tracking-[0.2em] font-bold uppercase text-center mt-2 z-10 dark:text-slate-500">km/h</div>
        
        <div className="mt-6 z-10">
          <div className="flex justify-between text-[10px] text-gray-400 mb-2 font-mono uppercase tracking-wider font-bold dark:text-slate-500">
              <span>0</span>
              <span className={isSpeeding ? "text-red-400" : "text-gray-500"}>Limit {speedLimit}</span>
              <span>200</span>
          </div>
          <div className="h-1 bg-[#1F2937] rounded-full relative overflow-visible">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (speed/200)*100)}%`, backgroundColor: ratio < 1 ? '#0ea5e9' : ratio < 1.1 ? '#f59e0b' : '#ef4444' }} />
              <div className="absolute top-[-4px] h-3 w-[2px] bg-white rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(255,255,255,0.8)] dark:bg-[#111827]" style={{ left: `${(speedLimit/200)*100}%` }} />
          </div>
        </div>
      </div>

      {/* Safety Score Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-lg dark:bg-[#111827] dark:border-white/10">
        <div className="text-[11px] font-bold tracking-widest uppercase text-gray-500 mb-4 flex items-center justify-between dark:text-slate-400">
            <span>Safety Rating</span>
            <span className={cn("text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-gray-200", scoreColor.replace('stroke-', 'text-'))}>{safetyScore > 80 ? 'EXCELLENT' : safetyScore > 60 ? 'GOOD' : safetyScore > 40 ? 'CAUTION' : 'HIGH RISK'}</span>
        </div>
        <div className="flex items-center gap-5 mb-5">
          <div className="relative">
              <svg width="64" height="64" viewBox="0 0 64 64" className="rotate-[-90deg]">
                <circle cx="32" cy="32" r="26" fill="none" stroke="#1F2937" strokeWidth="4"/>
                <circle cx="32" cy="32" r="26" fill="none" className={cn("transition-all duration-700 ease-out", scoreColor)} strokeWidth="4" strokeLinecap="round" strokeDasharray="163.3" strokeDashoffset={163.3 - (safetyScore / 100) * 163.3}/>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-mono text-xl font-bold tracking-tighter text-gray-900 dark:text-white">
                  {Math.round(safetyScore)}
              </div>
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold dark:text-slate-500">Speed Comp.</span>
                <span className="text-[10px] font-mono font-bold text-gray-700 dark:text-slate-200">{Math.round(cp)}%</span>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold dark:text-slate-500">Smoothness</span>
                <span className="text-[10px] font-mono font-bold text-gray-700 dark:text-slate-200">{Math.round(sm)}%</span>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold dark:text-slate-500">G-Force (Rash)</span>
                <span className={cn("text-[10px] font-mono font-bold", rf > 0.4 ? 'text-red-400' : rf > 0.25 ? 'text-yellow-600' : 'text-emerald-400')}>{rf > 0.4 ? 'HIGH' : rf > 0.25 ? 'MED' : 'LOW'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rash Driving Detector */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-lg dark:bg-[#111827] dark:border-white/10">
        <div className="text-[11px] font-bold tracking-widest uppercase text-gray-500 mb-4 flex items-center justify-between dark:text-slate-400">
            <span>Dynamic Telemetry</span>
            <span className="text-[10px] font-mono text-yellow-600 bg-purple-700/10 px-1.5 rounded">LIVE</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
            <div className="border border-gray-200 bg-white rounded-lg p-3 relative overflow-hidden group dark:border-white/10 dark:bg-[#111827]">
                <div className="text-[20px] font-bold font-mono text-gray-900 dark:text-white">{(rf * 0.6).toFixed(2)}<span className="text-gray-400 text-xs ml-1 dark:text-slate-500">g</span></div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mt-1 dark:text-slate-500">Lateral Force</div>
            </div>
            <div className="border border-gray-200 bg-white rounded-lg p-3 relative overflow-hidden dark:border-white/10 dark:bg-[#111827]">
                <div className="text-[20px] font-bold font-mono text-gray-900 dark:text-white">{(rf * 0.8).toFixed(2)}<span className="text-gray-400 text-xs ml-1 dark:text-slate-500">g</span></div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mt-1 dark:text-slate-500">Long. Force</div>
            </div>
        </div>
      </div>

      {/* Live Telemetry details */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-lg flex-1 min-h-[150px] dark:bg-[#111827] dark:border-white/10">
        <div className="text-[11px] font-bold tracking-widest uppercase text-gray-500 mb-4 dark:text-slate-400">Vehicle Identity</div>
        <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-white/10">
                <span className="text-[11px] text-gray-400 uppercase tracking-wider font-bold dark:text-slate-500">Registration</span>
                <span className="font-mono font-bold text-gray-900 text-[13px] bg-white/5 px-2 py-0.5 rounded border border-gray-200 dark:text-white dark:border-white/10">TS 09 EZ 1234</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-white/10">
                <span className="text-[11px] text-gray-400 uppercase tracking-wider font-bold dark:text-slate-500">Driver ID</span>
                <span className="text-gray-900 text-[12px] font-bold dark:text-white">Ravi Kumar</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-[11px] text-gray-400 uppercase tracking-wider font-bold dark:text-slate-500">Location</span>
                <span className="text-gray-700 text-[11px] text-right max-w-[120px] truncate dark:text-slate-200">{currentState}</span>
            </div>
        </div>
      </div>
    </div>
  );
}

