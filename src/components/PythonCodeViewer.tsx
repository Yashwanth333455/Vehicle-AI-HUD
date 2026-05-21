import React, { useState } from 'react';
import { Terminal, Download, Code } from 'lucide-react';
import { cn } from '../lib/utils';
import telemetryScript from './telemetryScript';
import reactAgentScript from './reactAgentScript';

interface CodeViewerProps {
  className?: string;
}

export function PythonCodeViewer({ className }: CodeViewerProps) {
  const [activeTab, setActiveTab] = useState<'telemetry' | 'react'>('telemetry');

  return (
    <div className={cn("flex flex-col bg-white backdrop-blur-md border border-gray-200 rounded-2xl overflow-hidden", className)}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-slate-950/50 dark:border-white/10">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-yellow-600" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">Raspberry Pi Deployment Scripts</h3>
        </div>
        <div className="flex space-x-1">
          <button 
            onClick={() => setActiveTab('telemetry')}
            className={cn("px-3 py-1 text-xs rounded-md transition-colors", activeTab === 'telemetry' ? "bg-purple-700/20 text-cyan-300" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100")}
          >
            obd_telemetry.py
          </button>
          <button 
            onClick={() => setActiveTab('react')}
            className={cn("px-3 py-1 text-xs rounded-md transition-colors", activeTab === 'react' ? "bg-purple-700/20 text-cyan-300" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100")}
          >
            react_agent.py
          </button>
        </div>
      </div>
      <div className="p-4 overflow-auto text-xs font-mono text-cyan-100/70 h-full scrollbar-thin scrollbar-thumb-white/10">
        <pre>
          <code>
            {activeTab === 'telemetry' ? telemetryScript : reactAgentScript}
          </code>
        </pre>
      </div>
    </div>
  );
}
