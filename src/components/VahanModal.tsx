import React from 'react';
import { X, Car, User, FileText, Calendar, ShieldCheck, Database } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export interface VahanData {
  plateNumber: string;
  ownerName: string;
  vehicleClass: string;
  registrationDate: string;
  fuelType: string;
  chassisNumber: string;
  engineNumber: string;
  insuranceValidUpto: string;
  rcStatus: string;
}

interface VahanModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: VahanData | null;
  isLoading?: boolean;
}

export function VahanModal({ isOpen, onClose, data, isLoading }: VahanModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-slate-900 border border-gray-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col dark:border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-slate-950/50 flex justify-between items-center relative overflow-hidden dark:border-white/10">
                <div className="absolute inset-0 bg-purple-700/5" />
                <div className="flex items-center space-x-3 relative z-10">
                    <div className="p-2 bg-purple-700/20 text-yellow-600 rounded-lg border border-purple-200">
                        <Database className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Vahan API Registry</h2>
                        <p className="text-xs text-gray-500 font-mono tracking-wider dark:text-slate-400">SECURE GOV LINK</p>
                    </div>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative z-10 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Body */}
            <div className="p-6 relative min-h-[300px] flex flex-col justify-center">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="relative flex h-12 w-12">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-20"></span>
                            <div className="relative inline-flex rounded-full h-12 w-12 bg-gray-100 border-2 border-purple-300 items-center justify-center dark:bg-slate-800">
                                <Database className="w-5 h-5 text-yellow-600 animate-pulse" />
                            </div>
                        </div>
                        <p className="text-yellow-600 text-sm font-mono animate-pulse">Querying Central DB...</p>
                    </div>
                ) : data ? (
                    <div className="space-y-6">
                        {/* Number Plate Mock */}
                        <div className="flex justify-center">
                            <div className="border-[3px] border-gray-200 bg-white rounded-md px-6 py-2 shadow-inner inline-block dark:border-white/10 dark:bg-[#111827]">
                                <span className="text-black font-bold text-2xl tracking-widest font-mono">
                                    {data.plateNumber}
                                </span>
                            </div>
                        </div>

                        {/* Prominent Owner Info */}
                        <div className="bg-[#0062e0] border border-purple-200 rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-purple-700/20 rounded-full">
                                    <User className="w-6 h-6 text-yellow-600" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-yellow-600/80 uppercase tracking-widest">Registered Owner</span>
                                    <span className="text-lg font-semibold text-cyan-50">{data.ownerName}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] text-gray-500 uppercase tracking-widest dark:text-slate-400">Vehicle Class</span>
                                <div className="flex items-center space-x-1.5 justify-end mt-0.5">
                                    <Car className="w-4 h-4 text-gray-700 dark:text-slate-200" />
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{data.vehicleClass}</span>
                                </div>
                            </div>
                        </div>

                        {/* Data Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <DataField icon={<Calendar />} label="Reg. Date" value={data.registrationDate} />
                            <DataField icon={<FileText />} label="Fuel Type" value={data.fuelType} />
                            <DataField icon={<FileText />} label="Chassis No." value={data.chassisNumber} mask />
                            <DataField icon={<FileText />} label="Engine No." value={data.engineNumber} mask />
                            
                            <div className="col-span-2 grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-white/10">
                                <DataField icon={<ShieldCheck />} label="Insurance Valid" value={data.insuranceValidUpto} 
                                    valueClass="text-emerald-400 font-semibold" />
                                <DataField icon={<ShieldCheck />} label="RC Status" value={data.rcStatus} 
                                    valueClass="text-emerald-400 font-semibold" />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-gray-400 dark:text-slate-500">
                        No data available.
                    </div>
                )}
            </div>
            
            {/* Footer */}
            <div className="px-6 py-4 bg-slate-950 border-t border-gray-200 text-xs text-gray-400 flex justify-between dark:border-white/10 dark:text-slate-500">
                <span>Data sourced via API Setu Gov Portal</span>
                <span className="font-mono">VERIFIED</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function DataField({ icon, label, value, mask, valueClass }: { icon: React.ReactNode, label: string, value: string, mask?: boolean, valueClass?: string }) {
    const displayValue = mask && value && value.length > 4 
        ? '*'.repeat(value.length - 4) + value.slice(-4) 
        : value;
        
    return (
        <div className="bg-slate-950/50 p-3 rounded-xl border border-gray-200 flex items-start space-x-3 dark:border-white/10">
            <div className="text-yellow-600/50 mt-0.5 child-w-4 child-h-4">
                {React.cloneElement(icon as React.ReactElement, { className: "w-4 h-4" })}
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest dark:text-slate-400">{label}</span>
                <span className={cn("text-sm text-gray-900 mt-0.5", mask ? "font-mono" : "", valueClass)}>
                    {displayValue}
                </span>
            </div>
        </div>
    )
}
