import React, { useState, useEffect } from 'react';
import { X, Activity, AlertTriangle, ShieldCheck, Cpu } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface ObdScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DtcCode {
  code: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

const POSSIBLE_DTCS: DtcCode[] = [
  { code: 'P0171', description: 'System Too Lean (Bank 1)', severity: 'medium' },
  { code: 'P0300', description: 'Random/Multiple Cylinder Misfire Detected', severity: 'high' },
  { code: 'P0420', description: 'Catalyst System Efficiency Below Threshold', severity: 'low' },
  { code: 'P0442', description: 'Evaporative Emission System Leak Detected (small leak)', severity: 'low' },
  { code: 'U0100', description: 'Lost Communication with ECM/PCM "A"', severity: 'high' },
  { code: 'C0201', description: 'Anti-Lock Brake System (ABS) Valve Relay Circuit', severity: 'high' },
  { code: 'B1813', description: 'Driver Airbag Initiator Circuit High Resistance', severity: 'high' },
];

export function ObdScannerModal({ isOpen, onClose }: ObdScannerModalProps) {
  const [scanState, setScanState] = useState<'idle' | 'connecting' | 'scanning' | 'complete'>('idle');
  const [foundDtcs, setFoundDtcs] = useState<DtcCode[]>([]);

  useEffect(() => {
    if (isOpen) {
      setScanState('idle');
      setFoundDtcs([]);
    }
  }, [isOpen]);

  const startScan = () => {
    setScanState('connecting');
    
    setTimeout(() => {
      setScanState('scanning');
      
      setTimeout(() => {
        // Randomly select 0-3 DTCs
        const numDtcs = Math.floor(Math.random() * 4);
        const shuffled = [...POSSIBLE_DTCS].sort(() => 0.5 - Math.random());
        setFoundDtcs(shuffled.slice(0, numDtcs));
        setScanState('complete');
      }, 3000);
    }, 1500);
  };

  const clearCodes = () => {
    setFoundDtcs([]);
    setScanState('idle');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />
          
          {/* Modal */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50 dark:border-white/10 dark:bg-[#0B0F14]">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-700/20 rounded-lg border border-purple-300">
                  <Cpu className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                   <h2 className="text-lg font-semibold text-gray-900 dark:text-white">OBD-II Diagnostic Scanner</h2>
                   <p className="text-xs text-gray-500 font-mono dark:text-slate-400">ECU COMM // J1962 INTERFACE</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {scanState === 'idle' && (
                 <div className="py-12 flex flex-col items-center justify-center text-center">
                     <Activity className="w-16 h-16 text-slate-600 mb-4" />
                     <h3 className="text-xl font-medium text-gray-700 mb-2 dark:text-slate-200">Scanner Ready</h3>
                     <p className="text-gray-400 max-w-sm mb-6 dark:text-slate-500">Initiate to connect to the vehicle's Electronic Control Unit (ECU) and read Diagnostic Trouble Codes (DTCs).</p>
                     <button
                        onClick={startScan}
                        className="px-6 py-2.5 bg-cyan-600 hover:bg-purple-700 text-gray-900 rounded-lg font-medium transition-colors shadow-lg shadow-cyan-500/20 flex items-center space-x-2 dark:text-white"
                     >
                         <Activity className="w-4 h-4" />
                         <span>Start Diagnostic Scan</span>
                     </button>
                 </div>
              )}

              {(scanState === 'connecting' || scanState === 'scanning') && (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                     <div className="relative mb-6">
                        <Cpu className="w-16 h-16 text-yellow-600 animate-pulse" />
                        <div className="absolute inset-0 border-4 border-t-cyan-400 border-purple-200 rounded-full animate-spin" style={{ margin: '-12px' }}></div>
                     </div>
                     <h3 className="text-xl font-medium text-gray-700 mb-2 dark:text-slate-200">
                         {scanState === 'connecting' ? 'Establishing ECU Connection...' : 'Reading DTC Pending/Stored Codes...'}
                     </h3>
                     <p className="text-gray-400 max-w-sm font-mono text-sm dark:text-slate-500">
                         {scanState === 'connecting' ? 'INIT: ISO 15765-4 CAN (11 bit ID, 500 Kbaud)' : 'REQ: 09 02 ... WAIT ...'}
                     </p>
                </div>
              )}

              {scanState === 'complete' && (
                <div className="space-y-6">
                     <div className="flex items-center justify-between">
                         <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2 dark:text-white">
                             {foundDtcs.length > 0 ? (
                                 <>
                                   <AlertTriangle className="w-5 h-5 text-yellow-600" />
                                   <span>{foundDtcs.length} Codes Found</span>
                                 </>
                             ) : (
                                <>
                                   <ShieldCheck className="w-5 h-5 text-emerald-400" />
                                   <span>No Trouble Codes Found</span>
                                </>
                             )}
                         </h3>
                         <span className="text-xs font-mono text-gray-500 px-2 py-1 bg-gray-100 rounded dark:text-slate-400 dark:bg-slate-800">MIL STATUS: {foundDtcs.some(d => d.severity === 'high') ? 'ON' : 'OFF'}</span>
                     </div>

                     {foundDtcs.length > 0 ? (
                         <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                             {foundDtcs.map((dtc, idx) => (
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
                                         <h4 className="text-gray-900 font-medium dark:text-white">{dtc.description}</h4>
                                         <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider dark:text-slate-500">Severity: <span className={cn(
                                             dtc.severity === 'high' ? "text-red-400" :
                                             dtc.severity === 'medium' ? "text-yellow-600" : "text-gray-500"
                                         )}>{dtc.severity}</span></p>
                                     </div>
                                 </div>
                             ))}
                         </div>
                     ) : (
                         <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-6 text-center">
                             <p className="text-emerald-400/80 mb-2">Systems operating within normal parameters.</p>
                             <p className="text-sm text-gray-400 font-mono dark:text-slate-500">Emissions monitors ready.</p>
                         </div>
                     )}

                     <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3 dark:border-white/10">
                         {foundDtcs.length > 0 && (
                             <button 
                                 onClick={clearCodes}
                                 className="px-4 py-2 border border-slate-700 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors text-sm font-medium dark:hover:bg-slate-800 dark:text-slate-200"
                             >
                                 Clear Codes
                             </button>
                         )}
                         <button 
                             onClick={startScan}
                             className="px-4 py-2 bg-cyan-600 hover:bg-purple-700 text-gray-900 rounded-lg transition-colors text-sm font-medium shadow-lg shadow-cyan-500/20 dark:text-white"
                         >
                             Rescan System
                         </button>
                     </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
