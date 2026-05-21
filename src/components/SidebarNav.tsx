import React from 'react';
import { LayoutDashboard, Activity, AlertOctagon, BrainCircuit, Cpu, Scale } from 'lucide-react';
import { cn } from '../lib/utils';

export type ViewMode = 'dashboard' | 'analytics' | 'evidence' | 'agent' | 'system' | 'policy' | 'diagnostics';

interface Props {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export function SidebarNav({ currentView, onViewChange }: Props) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'diagnostics', label: 'Diagnostics', icon: Activity },
    { id: 'analytics', label: 'Analytics', icon: Activity },
    { id: 'evidence', label: 'Evidence Log', icon: AlertOctagon },
    { id: 'agent', label: 'AI Agent', icon: BrainCircuit },
    { id: 'system', label: 'System Info', icon: Cpu },
    { id: 'policy', label: 'Policy Settings', icon: Scale },
  ] as const;

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col shrink-0 z-20 dark:bg-[#111827] dark:border-white/10">
      <div className="p-5 border-b border-gray-200 flex items-center gap-3 shrink-0 dark:border-white/10">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm bg-yellow-400/20 border border-yellow-400/30 text-yellow-600">⚡</div>
        <div>
            <div className="text-[13px] font-bold tracking-widest uppercase text-gray-900 dark:text-white">AI Studio <span className="opacity-50">Auto</span></div>
            <div className="text-[10px] text-gray-500 font-mono tracking-widest uppercase dark:text-slate-400">VISION CORE v2.0</div>
        </div>
      </div>
      
      <div className="p-3 flex flex-col gap-1 flex-1 overflow-y-auto">
        {navItems.map(item => {
          const active = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-lg transition-all text-[11px] font-bold tracking-wider uppercase text-left w-full",
                active 
                  ? "bg-purple-100 border border-purple-200 text-purple-700 shadow-sm translate-x-1" 
                  : "border border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          )
        })}
      </div>
{/* Added some decorative text at the bottom */}
      <div className="p-4 border-t border-gray-200 mt-auto text-[9px] text-gray-400 font-mono tracking-widest uppercase text-center dark:border-white/10 dark:text-slate-500">
        System Active • v2.0.4
      </div>
    </div>
  );
}
