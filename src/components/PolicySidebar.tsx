import React from 'react';
import { Scale, Map as MapIcon, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';

export const STATE_POLICIES = {
  "Delhi": {
    speed_limit_highway: 80,
    speed_limit_city: 50,
    fine_over_20_percent: "₹1000 - ₹2000",
    fine_rash_driving: "Court Challan",
    notes: "Camera-based e-challan active. Strict pollution rules.",
    regulations: [
        "Jumping red light / signal violation: Court challan.",
        "Using mobile phone while driving: ₹5,000 (1st).",
        "Driving without PUC certificate: ₹10,000.",
        "Use of illegal / fancy number plate: ₹5,000."
    ],
    base_speeding_fine: 1500,
    base_rash_fine: 5000
  },
  "Maharashtra": {
    speed_limit_highway: 100,
    speed_limit_city: 50,
    fine_over_20_percent: "₹1000 - ₹2000",
    fine_rash_driving: "₹5000 + License Susp",
    notes: "Mumbai-Pune E-way monitored heavily",
    regulations: [
        "Using mobile phone while driving: ₹1,000 (1st).",
        "Driving without PUC certificate: ₹500.",
        "Jumping red light / signal violation: ₹500.",
        "Use of illegal / fancy number plate: up to ₹1000."
    ],
    base_speeding_fine: 1500,
    base_rash_fine: 5000
  },
  "Tamil Nadu": {
    speed_limit_highway: 80,
    speed_limit_city: 40,
    fine_over_20_percent: "₹1000",
    fine_rash_driving: "₹2000",
    notes: "Frequent traffic checks",
    regulations: [
        "Using mobile phone while driving: ₹1,000.",
        "Driving without PUC certificate: ₹500.",
        "Jumping red light / signal violation: ₹500.",
        "Use of illegal / fancy number plate: ₹1,500."
    ],
    base_speeding_fine: 1000,
    base_rash_fine: 2000
  },
  "Uttar Pradesh": {
    speed_limit_highway: 100,
    speed_limit_city: 50,
    fine_over_20_percent: "₹1000 - ₹2000",
    fine_rash_driving: "₹5000",
    notes: "Expressways monitored strictly",
    regulations: [
        "Violation of stop line: ₹300-₹600.",
        "Using mobile phone while driving: ₹1,000.",
        "Driving without PUC certificate: ₹10,000.",
        "Use of illegal / fancy number plate: ₹100."
    ],
    base_speeding_fine: 1500,
    base_rash_fine: 5000
  },
  "Andhra Pradesh": {
    speed_limit_highway: 80,
    speed_limit_city: 50,
    fine_over_20_percent: "₹800",
    fine_rash_driving: "₹1500",
    notes: "Frequent random checks",
    regulations: [
        "Speed guns active on Vijayawada-Guntur highway.",
        "Heavy vehicle restrictions inside city limits during peak hours.",
        "Zero tolerance for signal jumping at automated intersections."
    ],
    base_speeding_fine: 800,
    base_rash_fine: 1500
  },
  "Telangana": {
    speed_limit_highway: 80,
    speed_limit_city: 40,
    fine_over_20_percent: "₹1000",
    fine_rash_driving: "₹2000 + Point Deduction",
    notes: "Strict enforcement via ORR cameras",
    regulations: [
        "ORR (Outer Ring Road) specific regulations apply. Lane disciplines strictly enforced.",
        "Helmet mandatory for riders and pillion.",
        "Strict anti-drunk driving checks during weekends."
    ],
    base_speeding_fine: 1000,
    base_rash_fine: 2000
  }
} as const;

export type StateName = keyof typeof STATE_POLICIES;

export const FINES_DB: Record<StateName, Record<string, string | number>> = {
  "Delhi": {
    "Driving without licence": 5000,
    "Driving without insurance": 2000,
    "Driving without valid RC": 5000,
    "Driving without PUC certificate": 10000,
    "Jumping red light / signal violation": "Court Challan",
    "Disobeying lawful direction of traffic police": 2000,
    "Violation of stop line": 500,
    "Violation of stop sign": "Court Challan",
    "Violation of one-way / mandatory signs": 500,
    "Driving without seat belt (driver)": 1000,
    "Triple riding on two-wheeler": 1000,
    "Using mobile phone while driving": 5000,
    "Driving without helmet (rider/pillion)": 1000,
    "Driving without helmet": 1000,
    "Overspeeding (light motor vehicle)": "1000-2000",
    "Overspeeding": "1000-2000",
    "Driving without indicator": 500,
    "Use of illegal / fancy number plate": 5000,
    "Drunk driving (DUI)": "Court Challan",
    "Driving without valid permit (where applicable)": "Court Challan",
    "Rash Driving": "Court Challan"
  },
  "Maharashtra": {
    "Driving without licence": 5000,
    "Driving without insurance": 2000,
    "Driving without valid RC": 2000,
    "Driving without PUC certificate": 500,
    "Jumping red light / signal violation": 500,
    "Disobeying lawful direction of traffic police": 750,
    "Violation of stop line": 500,
    "Violation of stop sign": 500,
    "Violation of one-way / mandatory signs": 500,
    "Driving without seat belt (driver)": 200,
    "Triple riding on two-wheeler": "1000 + 3-month DL disqualification",
    "Using mobile phone while driving": 1000,
    "Driving without helmet (rider/pillion)": "500 + 3-month DL disqualification",
    "Driving without helmet": 500,
    "Overspeeding (light motor vehicle)": "1000-2000",
    "Overspeeding": "1000-2000",
    "Driving without indicator": 500,
    "Use of illegal / fancy number plate": 1000,
    "Drunk driving (DUI)": 10000,
    "Driving without valid permit (where applicable)": "5000-10000",
    "Rash Driving": 5000
  },
  "Tamil Nadu": {
    "Driving without licence": 5000,
    "Driving without insurance": 2000,
    "Driving without valid RC": 2500,
    "Driving without PUC certificate": 500,
    "Jumping red light / signal violation": 500,
    "Disobeying lawful direction of traffic police": 2000,
    "Violation of stop line": "N/A",
    "Violation of stop sign": 1000,
    "Violation of one-way / mandatory signs": 500,
    "Driving without seat belt (driver)": 1000,
    "Triple riding on two-wheeler": 1000,
    "Using mobile phone while driving": 1000,
    "Driving without helmet (rider/pillion)": 1000,
    "Driving without helmet": 1000,
    "Overspeeding (light motor vehicle)": 1000,
    "Overspeeding": 1000,
    "Driving without indicator": "N/A",
    "Use of illegal / fancy number plate": 1500,
    "Drunk driving (DUI)": 10000,
    "Driving without valid permit (where applicable)": 5000,
    "Rash Driving": 2000
  },
  "Uttar Pradesh": {
    "Driving without licence": 5000,
    "Driving without insurance": 2000,
    "Driving without valid RC": 5000,
    "Driving without PUC certificate": 10000,
    "Jumping red light / signal violation": 1000,
    "Disobeying lawful direction of traffic police": 2000,
    "Violation of stop line": "300-600",
    "Violation of stop sign": "300-600",
    "Violation of one-way / mandatory signs": 100,
    "Driving without seat belt (driver)": 1000,
    "Triple riding on two-wheeler": 1000,
    "Using mobile phone while driving": 1000,
    "Driving without helmet (rider/pillion)": 1000,
    "Driving without helmet": 1000,
    "Overspeeding (light motor vehicle)": "1000-2000",
    "Overspeeding": "1000-2000",
    "Driving without indicator": 500,
    "Use of illegal / fancy number plate": 100,
    "Drunk driving (DUI)": 10000,
    "Driving without valid permit (where applicable)": "5000-10000",
    "Rash Driving": 5000
  },
  "Andhra Pradesh": {
    "Driving without licence": 5000,
    "Driving without insurance": 2000,
    "Driving without valid RC": 5000,
    "Driving without PUC certificate": 1000,
    "Jumping red light / signal violation": 1000,
    "Driving without seat belt (driver)": 1000,
    "Triple riding on two-wheeler": 1000,
    "Using mobile phone while driving": 1000,
    "Driving without helmet": 1000,
    "Overspeeding": 800,
    "Rash Driving": 1500
  },
  "Telangana": {
    "Driving without licence": 5000,
    "Driving without insurance": 2000,
    "Driving without valid RC": 5000,
    "Driving without PUC certificate": 1000,
    "Jumping red light / signal violation": 1000,
    "Driving without seat belt (driver)": 1000,
    "Triple riding on two-wheeler": 1000,
    "Using mobile phone while driving": 1000,
    "Driving without helmet": 1000,
    "Overspeeding": 1000,
    "Rash Driving": 2000
  }
};

export function getFineAmount(state: StateName, message: string): string {
    const fines = FINES_DB[state];
    if (!fines) return "1000";
    
    if (message.includes('ACCIDENT')) return fines["Rash Driving"]?.toString() || "5000";
    if (message.includes('SPEEDING')) return fines["Overspeeding"]?.toString() || "1000";
    if (message.includes('RASH')) return fines["Rash Driving"]?.toString() || "2000";
    
    for (const [key, val] of Object.entries(fines)) {
        if (message.includes(key)) {
            return String(val);
        }
    }
    
    return "1000";
}

interface PolicySidebarProps {
  currentState: StateName;
  className?: string;
  onStateChange: (s: StateName) => void;
}

export function PolicySidebar({ currentState, className, onStateChange }: PolicySidebarProps) {
  const policy = STATE_POLICIES[currentState];

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex items-center space-x-3 mb-4">
        <Scale className="w-5 h-5 text-yellow-600" />
        <h2 className="text-gray-900 font-medium text-sm dark:text-white">Policy Engine</h2>
      </div>

      <div className="mb-5">
        <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 block font-bold dark:text-slate-400">Current Jurisdiction</label>
        <div className="relative">
          <MapIcon className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none dark:text-slate-400" />
          <select 
            value={currentState}
            onChange={(e) => onStateChange(e.target.value as StateName)}
            className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-xs text-gray-900 appearance-none outline-none focus:border-purple-300 transition-colors cursor-pointer dark:bg-[#111827] dark:border-white/10 dark:text-white"
          >
            {(Object.keys(STATE_POLICIES) as StateName[]).map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        <div>
          <span className="text-xs text-gray-400 uppercase tracking-widest block mb-1 dark:text-slate-500">Speed Limits</span>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-gray-500 text-xs mb-1 dark:text-slate-400">Highway</div>
              <div className="text-gray-900 font-mono dark:text-white">{policy.speed_limit_highway} km/h</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-gray-500 text-xs mb-1 dark:text-slate-400">City</div>
              <div className="text-gray-900 font-mono dark:text-white">{policy.speed_limit_city} km/h</div>
            </div>
          </div>
        </div>

        <div>
          <span className="text-xs text-gray-400 uppercase tracking-widest block mb-1 dark:text-slate-500">Fines & Penalties</span>
          <div className="space-y-2">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start space-x-3">
              <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-red-200 text-xs font-semibold mb-0.5">Speeding {'>'} 20%</div>
                <div className="text-red-400 font-mono text-sm">{policy.fine_over_20_percent}</div>
              </div>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start space-x-3">
              <Scale className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-red-200 text-xs font-semibold mb-0.5">Rash Driving (G {'>'} 0.8)</div>
                <div className="text-red-400 font-mono text-sm">{policy.fine_rash_driving}</div>
              </div>
            </div>
          </div>
        </div>
        
        {policy.notes && (
            <div className="bg-purple-700/10 border border-purple-200 rounded-lg p-3 mt-4 text-xs text-cyan-200/80">
                <strong>Intelligence Note:</strong> {policy.notes}
            </div>
        )}

        {policy.regulations && policy.regulations.length > 0 && (
            <div className="mt-4">
                <span className="text-xs text-gray-400 uppercase tracking-widest block mb-2 dark:text-slate-500">Local Regulations</span>
                <ul className="space-y-1.5 list-disc pl-4">
                    {policy.regulations.map((rule, idx) => (
                        <li key={idx} className="text-xs text-gray-700 leading-relaxed marker:text-yellow-600 dark:text-slate-200">
                            {rule}
                        </li>
                    ))}
                </ul>
            </div>
        )}
      </div>
    </div>
  );
}
