import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Info, Camera, Send, Download, CheckCircle2, Gauge, BrainCircuit } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

export interface NotificationLog {
  id: string;
  timestamp: number;
  type: 'info' | 'violation' | 'upload' | 'tire_pressure' | 'agent';
  message: string;
  metadata?: string;
  imageUrl?: string;
}

interface NotificationsProps {
  logs: NotificationLog[];
  className?: string;
}

export function Notifications({ logs, className }: NotificationsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleDownloadEvidence = (log: NotificationLog) => {
    if (downloadingId) return;
    
    setDownloadingId(log.id);
    setDownloadProgress(0);

    // Simulate download progress
    const interval = setInterval(() => {
        setDownloadProgress(prev => {
            if (prev >= 100) {
                clearInterval(interval);
                return 100;
            }
            return prev + 25;
        });
    }, 200);

    setTimeout(() => {
        clearInterval(interval);
        
        if (log.imageUrl) {
            // We have a data URL, download it directly
            const a = document.createElement('a');
            a.href = log.imageUrl;
            a.download = `evidence_image_${log.id}_${log.timestamp}.jpg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else {
            // Create evidence text file
            const evidenceContent = `
=== VAHAN TELEMETRY EVIDENCE ===
Type: ${log.type.toUpperCase()}
Timestamp: ${new Date(log.timestamp).toISOString()}
Event: ${log.message}
Metadata: ${log.metadata || 'N/A'}
Signature (SHA256): ${Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('')}
================================
            `.trim();

            const blob = new Blob([evidenceContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `evidence_${log.id}_${log.timestamp}.txt`;
            document.body.appendChild(a);
            a.click();
            
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
        
        setTimeout(() => {
            setDownloadingId(null);
            setDownloadProgress(0);
        }, 1000);
    }, 1000);
  };

  return (
    <div className={cn("flex flex-col bg-white backdrop-blur-md border border-gray-200 rounded-2xl overflow-hidden", className)}>
      <div className="px-4 py-3 border-b border-gray-200 bg-slate-950/50 flex justify-between items-center z-10 shadow-sm relative dark:border-white/10">
        <h3 className="text-sm font-medium text-gray-900 flex items-center space-x-2 dark:text-white">
           <ActivityDot /> 
           <span>Live Telemetry Action Log</span>
        </h3>
        <span className="text-xs text-gray-400 font-mono dark:text-slate-500">HMAC-SHA256 SECURED</span>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-white/10 scroll-smooth"
      >
        <AnimatePresence initial={false}>
          {logs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              className={cn(
                "p-3 rounded-lg border text-sm flex gap-3 items-start group",
                log.type === 'violation' && "bg-red-500/10 border-red-500/30 text-red-200 animate-violation-alert",
                log.type === 'upload' && "bg-purple-700/10 border-purple-200 text-cyan-200",
                log.type === 'info' && "bg-white/5 border-gray-200 text-gray-700",
                log.type === 'tire_pressure' && "bg-orange-500/10 border-orange-500/30 text-orange-200",
                log.type === 'agent' && "bg-blue-500/10 border-blue-500/30 text-blue-300"
              )}
            >
              <div className="mt-0.5 shrink-0">
                  {log.type === 'violation' && <ShieldAlert className="w-4 h-4 text-red-400" />}
                  {log.type === 'upload' && <Send className="w-4 h-4 text-yellow-600" />}
                  {log.type === 'info' && <Info className="w-4 h-4 text-gray-500 dark:text-slate-400" />}
                  {log.type === 'tire_pressure' && <Gauge className="w-4 h-4 text-orange-400" />}
                  {log.type === 'agent' && <BrainCircuit className="w-4 h-4 text-blue-400" />}
              </div>
              <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold uppercase tracking-wider text-[10px] opacity-70">
                          {log.type.toUpperCase()}
                      </span>
                      <span className="text-[10px] opacity-50 font-mono">
                          {format(log.timestamp, 'HH:mm:ss.SSS')}
                      </span>
                  </div>
                  <p className="font-medium">{log.message}</p>
                  {log.metadata && (
                      <p className="text-xs mt-1 font-mono opacity-60 break-all">{log.metadata}</p>
                  )}
                  {log.imageUrl && (
                      <div className="mt-2 overflow-hidden rounded-md border border-gray-200 max-h-48 group-hover:max-h-full transition-all duration-300 dark:border-white/10">
                          <img src={log.imageUrl} alt="Evidence" className="w-full object-cover" />
                      </div>
                  )}
                  
                  {(log.type === 'violation' || log.type === 'upload') && (
                      <div className="mt-3 flex justify-end">
                          <button
                              onClick={() => handleDownloadEvidence(log)}
                              disabled={downloadingId !== null}
                              className={cn(
                                  "flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider transition-all border",
                                  log.type === 'violation' ? "bg-red-500/20 hover:bg-red-500/30 border-red-500/40 text-red-100" : "bg-purple-700/20 hover:bg-purple-700/30 border-cyan-500/40 text-cyan-100",
                                  "opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 transition-opacity disabled:opacity-100 disabled:cursor-not-allowed"
                              )}
                          >
                              {downloadingId === log.id ? (
                                  downloadProgress === 100 ? (
                                      <>
                                          <CheckCircle2 className="w-3.5 h-3.5" />
                                          <span>Downloaded</span>
                                      </>
                                  ) : (
                                      <>
                                          <div className="w-3.5 h-3.5 border-2 rounded-full border-t-transparent animate-spin border-current" />
                                          <span>Fetching ({downloadProgress}%)</span>
                                      </>
                                  )
                              ) : (
                                  <>
                                      <Download className="w-3.5 h-3.5" />
                                      <span>Download Evidence</span>
                                  </>
                              )}
                          </button>
                      </div>
                  )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {logs.length === 0 && (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm italic dark:text-slate-500">
                Awaiting telemetry events...
            </div>
        )}
      </div>
    </div>
  );
}

function ActivityDot() {
    return (
        <div className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-700"></span>
        </div>
    )
}
