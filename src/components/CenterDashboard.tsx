import React, { useState, useEffect } from 'react';
import { Download, Send, Phone, CarFront, HeartPulse, ShieldAlert, Navigation, Megaphone, CheckCircle, Navigation2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { PythonCodeViewer } from './PythonCodeViewer';
import { NotificationLog } from './Notifications';
import { MapWidget } from './MapWidget';
import { ObdScannerConsole } from './ObdScannerConsole';
import { STATE_POLICIES, StateName, getFineAmount } from './PolicySidebar';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function CenterDashboard({ logs, center, speed, speedLimit, tirePressure, engineTemp, odometer, tripDistance, currentState, isAccident, fuelLevel, gForce }: any) {
  const [activeTab, setActiveTab] = useState('agent');
  const [roadReporter, setRoadReporter] = useState({ state: 'idle', message: '' });
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    setHistory(prev => {
      const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const newHistory = [...prev, { time: ts, speed: speed || 0, gForce: gForce || 0, fuelLevel: fuelLevel || 0 }];
      if (newHistory.length > 30) {
        return newHistory.slice(newHistory.length - 30);
      }
      return newHistory;
    });
  }, [speed, gForce, fuelLevel]);

  const violationsCount = logs.filter((l: any) => l.type === 'violation').length;

  const potholeMarkers = logs
    .filter((l: any) => l.metadata && l.metadata.includes('Loc:') && l.message.includes('Severe Pothole'))
    .map((l: any) => {
       const locMatch = l.metadata?.match(/Loc:\s*([0-9.]+),\s*([0-9.]+)/);
       if (locMatch) {
           return { lat: parseFloat(locMatch[1]), lng: parseFloat(locMatch[2]), title: l.message };
       }
       return null;
    }).filter(Boolean);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#111827]">
      {/* Map Header details overlay */}
      <div className="bg-white border-b border-gray-200 shadow-md shrink-0 flex items-center justify-between px-4 py-3 z-10 w-full relative dark:bg-[#111827] dark:border-white/10">
          <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-purple-700 animate-pulse shadow-[0_0_8px_#06b6d4]"></span>
              <span className="text-[11px] font-bold tracking-widest uppercase text-gray-700 dark:text-slate-200">Smart Map Overlay — NH65</span>
          </div>
          <button className="bg-white/5 border border-gray-200 hover:bg-white/10 text-gray-900 rounded px-3 py-1.5 text-[10px] font-bold transition-colors dark:border-white/10 dark:text-white">
              SIMULATE CRASH
          </button>
      </div>

      {/* Main Map Area */}
      <div className="flex-1 relative min-h-0 bg-white overflow-hidden z-0 dark:bg-[#111827]">
         <div className="absolute inset-0 z-0">
           <MapWidget 
                center={center} 
                speed={speed} 
                speedLimit={speedLimit} 
                onCaptureEvidence={() => {}}
                className="w-full h-full border-0 rounded-none !min-h-0" 
            />
         </div>
      </div>

      {/* Middle Tab System */}
      <div className="bg-white border-t border-gray-200 shadow-[0_-10px_20px_rgba(0,0,0,0.5)] z-20 shrink-0 flex flex-col h-[320px] dark:bg-[#111827] dark:border-white/10">
          <div className="flex border-b border-gray-200 px-2 pt-2 gap-2 overflow-x-auto custom-scrollbar shrink-0 bg-white/50 dark:border-white/10">
             {['agent', 'challan', 'govtmsg', 'emerg', 'vhealth', 'mech', 'road', 'apis'].map(tab => (
                 <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                        "px-4 py-2.5 text-[10px] uppercase tracking-widest font-bold border-b-2 whitespace-nowrap transition-colors",
                        activeTab === tab ? "border-cyan-500 text-yellow-600" : "border-transparent text-gray-400 hover:text-gray-700 hover:border-white/20"
                    )}
                 >
                     {tab === 'challan' && '🧾 Challan Evidence'}
                     {tab === 'govtmsg' && '🏛️ Gov Notice'}
                     {tab === 'emerg' && '🆘 SOS Rescue'}
                     {tab === 'vhealth' && '🔧 Telemetry'}
                     {tab === 'mech' && '🔩 Service'}
                     {tab === 'road' && '🚧 Infrastructure'}
                     {tab === 'agent' && '🤖 AI Reasoning'}
                     {tab === 'apis' && '</> APIs'}
                 </button>
             ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar relative">
              {activeTab === 'agent' && (
                  <div className="h-full">
                      <div className="text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2 dark:text-slate-400">ReAct Agent — Live Reasoning Trace</div>
                      <div className="space-y-2">
                          {logs.filter((l: any) => l.type === 'upload' || l.type === 'info').map((log: any, idx: number) => (
                              <div key={idx} className={cn("px-3 py-2 rounded-lg font-mono text-[11px] leading-snug border-l-2", log.type === 'upload' ? 'bg-blue-500/10 border-blue-500 text-blue-200' : 'bg-emerald-500/10 border-emerald-500 text-emerald-200')}>
                                  <span className="text-[9px] tracking-wider opacity-60 block mb-0.5">{log.type === 'upload' ? 'ACT' : 'OBS'}</span>
                                  {log.message} - {log.metadata}
                              </div>
                          ))}
                          {logs.length === 0 && <div className="text-sm text-gray-400 dark:text-slate-500">Agent initializing...</div>}
                      </div>
                  </div>
              )}

              {activeTab === 'apis' && (
                  <div className="h-full">
                      <PythonCodeViewer className="h-full" />
                  </div>
              )}

              {activeTab === 'vhealth' && (
                  <div className="h-full">
                       <ObdScannerConsole tirePressure={tirePressure} engineTemp={engineTemp} />
                  </div>
              )}

              {activeTab === 'challan' && (
                  <div className="h-full space-y-4">
                      {logs.filter((l: any) => l.type === 'violation').length > 0 ? (
                          logs.filter((l: any) => l.type === 'violation').map((log: any, idx: number) => (
                              <div key={idx} className="bg-white text-black p-4 rounded-lg shadow-md border-t-8 border-red-600 relative dark:bg-[#111827]">
                                  <div className="flex justify-between items-start border-b border-gray-200 pb-2 mb-2 dark:border-white/10">
                                      <div className="flex items-center gap-2">
                                          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/308px-Emblem_of_India.svg.png" className="w-6 h-8 opacity-80" alt="Govt Logo" />
                                          <div>
                                              <div className="text-xs font-bold uppercase text-slate-800">{currentState} Traffic Police</div>
                                              <div className="text-[9px] text-gray-500 font-mono dark:text-slate-400">e-CHALLAN RECEIPT</div>
                                          </div>
                                      </div>
                                      <div className="text-right">
                                          <div className="text-xs font-mono font-bold text-red-600">{getFineAmount(currentState as StateName, log.message) === "Court Challan" ? "Court Challan" : `₹${getFineAmount(currentState as StateName, log.message)}`}</div>
                                          <div className="text-[9px] text-gray-400 dark:text-slate-500">UNPAID</div>
                                      </div>
                                  </div>
                                  <div className="text-[10px] space-y-1 mb-3">
                                      <div className="flex justify-between">
                                          <span className="text-gray-500 dark:text-slate-400">Vehicle:</span>
                                          <span className="font-bold text-slate-800">TS 09 EZ 1234</span>
                                      </div>
                                      <div className="flex justify-between">
                                          <span className="text-gray-500 dark:text-slate-400">Date/Time:</span>
                                          <span className="font-bold text-slate-800">{new Date(log.timestamp).toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between">
                                          <span className="text-gray-500 dark:text-slate-400">Offense:</span>
                                          <span className="font-bold text-red-600 text-right w-2/3">{log.message}</span>
                                      </div>
                                      <div className="flex items-start justify-between mt-1 pt-1 border-t border-gray-100">
                                          <span className="text-gray-500 dark:text-slate-400">Details:</span>
                                          <span className="font-mono text-gray-600 text-right w-2/3">{log.metadata || "GPS Tracking Enabled"}</span>
                                      </div>
                                  </div>
                                  
                                  <div className="flex justify-end pt-2">
                                      <button 
                                          onClick={() => {
                                              const blob = new Blob([`GOVERNMENT OF ${currentState?.toUpperCase()}\nTRAFFIC POLICE E-CHALLAN\n--------------------------\nVehicle: TS 09 EZ 1234\nDate: ${new Date(log.timestamp).toLocaleString()}\nOffense: ${log.message}\nFine: INR ${getFineAmount(currentState as StateName, log.message)}\nDetails: ${log.metadata}\n`], { type: 'text/plain' });
                                              const url = URL.createObjectURL(blob);
                                              const a = document.createElement('a');
                                              a.href = url;
                                              a.download = `Challan_TS09EZ1234_${log.timestamp}.txt`;
                                              a.click();
                                          }}
                                          className="flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-200 px-2 py-1 rounded text-[10px] font-bold hover:bg-red-100 transition-colors"
                                      >
                                          <Download className="w-3 h-3" />
                                          Download Ticket
                                      </button>
                                  </div>
                              </div>
                          )).reverse()
                      ) : (
                          <div className="text-center text-gray-400 text-xs py-8 dark:text-slate-500">No violations yet. Drive safely.</div>
                      )}
                  </div>
              )}
              {activeTab === 'govtmsg' && (
                  <div className="h-full space-y-4">
                      {logs.filter((l: any) => l.type === 'violation' || l.type === 'upload').length > 0 ? (
                           logs.filter((l: any) => l.message.includes('ACCIDENT') || l.message.includes('SPEEDING') || l.message.includes('RASH') || l.type === 'upload').reverse().slice(0, 10).map((log: any, idx: number) => (
                              <div key={idx} className="bg-gray-100/80 border border-gray-200 rounded-lg p-3 dark:border-white/10">
                                   <div className="flex items-center gap-2 mb-2">
                                       <Send className="w-3.5 h-3.5 text-blue-400" />
                                       <div className="text-[10px] font-bold text-gray-700 dark:text-slate-200">AUTO-DISPATCH EVENT</div>
                                       <div className="text-[9px] text-gray-400 ml-auto font-mono dark:text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</div>
                                   </div>
                                   <p className="text-[11px] text-gray-500 dark:text-slate-400">
                                       {log.type === 'upload' ? 'System Notification: ' : 'Traffic Dept Notification: '} 
                                       <span className="text-gray-900 dark:text-white">{log.message}</span>
                                   </p>
                                   <div className="mt-2 text-[9px] text-blue-400 bg-blue-500/10 px-2 py-1 rounded inline-block font-mono">
                                       Status: DELIVERED ✓
                                   </div>
                              </div>
                           ))
                      ) : (
                          <div className="text-center text-gray-400 text-xs py-8 dark:text-slate-500">Awaiting first violation to generate notice...</div>
                      )}
                  </div>
              )}
              {activeTab === 'emerg' && (
                  <div className="h-full space-y-4">
                      {isAccident ? (
                          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                              <div className="flex items-center gap-3 mb-4">
                                  <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                                      <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />
                                  </div>
                                  <div>
                                      <h3 className="text-red-500 font-bold">EMERGENCY DECLARED</h3>
                                      <p className="text-red-400/80 text-xs text-mono">{center.lat.toFixed(5)}, {center.lng.toFixed(5)}</p>
                                  </div>
                              </div>
                              <div className="space-y-2">
                                  {[
                                      { name: "Apollo Trauma Center", type: "Trauma Care", dist: "1.2 km", eta: "3 mins", icon: HeartPulse, color: "text-rose-400" },
                                      { name: "City Ambulance Service", type: "Ambulance", dist: "0.8 km", eta: "2 mins", icon: HeartPulse, color: "text-rose-400" },
                                      { name: "Highway Patrol Station 4", type: "Police", dist: "3.5 km", eta: "5 mins", icon: ShieldAlert, color: "text-blue-400" },
                                      { name: "QuickTow Rescue", type: "Vehicle Recovery", dist: "2.1 km", eta: "4 mins", icon: CarFront, color: "text-yellow-600" }
                                  ].map((svc, i) => (
                                      <div key={i} className="flex items-center justify-between bg-gray-100 p-3 rounded-lg border border-gray-200 dark:bg-slate-800 dark:border-white/10">
                                          <div className="flex items-center gap-3">
                                              <div className={`p-2 rounded bg-white/5 ${svc.color}`}>
                                                  <svc.icon className="w-4 h-4" />
                                              </div>
                                              <div>
                                                  <div className="text-sm font-bold text-gray-900 dark:text-white">{svc.name}</div>
                                                  <div className="text-[10px] text-gray-400 dark:text-slate-500">{svc.type}</div>
                                              </div>
                                          </div>
                                          <div className="text-right">
                                              <div className="text-xs font-mono text-gray-700 dark:text-slate-200">{svc.dist}</div>
                                              <div className="text-[10px] text-emerald-400">ETA {svc.eta}</div>
                                              <div className="text-[9px] text-blue-400 mt-1 uppercase tracking-wider">Dispatched</div>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                              <div className="mt-4 pt-4 border-t border-red-500/20 text-center">
                                  <button className="bg-red-500 hover:bg-red-600 text-gray-900 px-6 py-2 rounded-lg font-bold text-sm tracking-wider transition-colors shadow-lg shadow-red-500/20 dark:text-white">
                                      CANCEL SOS
                                  </button>
                                  <div className="text-[9px] text-red-400/60 mt-2 uppercase tracking-widest">Help is continually tracked until canceled</div>
                              </div>
                          </div>
                      ) : (
                          <div className="bg-gray-100/50 border border-gray-200 rounded-xl p-4 dark:border-white/10">
                              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-white/10">
                                  <div>
                                      <h3 className="text-gray-700 font-bold text-sm dark:text-slate-200">Nearby Emergency Services</h3>
                                      <p className="text-gray-400 text-[10px] uppercase tracking-wider dark:text-slate-500">Location: {center.lat.toFixed(3)}, {center.lng.toFixed(3)}</p>
                                  </div>
                                  <Navigation2 className="w-5 h-5 text-blue-500/50" />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                  {[
                                      { name: "Trauma Center", dist: "1.2 km", icon: HeartPulse, color: "text-rose-400" },
                                      { name: "Police Station", dist: "3.5 km", icon: ShieldAlert, color: "text-blue-400" },
                                      { name: "Vehicle Rescue", dist: "2.1 km", icon: CarFront, color: "text-yellow-600" },
                                      { name: "Highway Patrol", dist: "5.0 km", icon: ShieldAlert, color: "text-blue-400" }
                                  ].map((svc, i) => (
                                      <div key={i} className="bg-white p-3 rounded border border-gray-200 flex items-start gap-2 dark:bg-[#111827] dark:border-white/10">
                                          <svc.icon className={`w-4 h-4 mt-0.5 ${svc.color}`} />
                                          <div>
                                              <div className="text-xs font-bold text-gray-700 dark:text-slate-200">{svc.name}</div>
                                              <div className="text-[10px] text-gray-400 font-mono dark:text-slate-500">{svc.dist} away</div>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                              <div className="mt-6 text-center">
                                  <button className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 px-6 py-3 rounded-xl font-bold tracking-widest w-full transition-colors flex justify-center items-center gap-2">
                                      <Phone className="w-4 h-4" />
                                      MANUAL SOS CALL
                                  </button>
                                  <p className="text-gray-400 text-[9px] mt-3 uppercase tracking-wider dark:text-slate-500">Triggers automated dispatch based on location</p>
                              </div>
                          </div>
                      )}
                  </div>
              )}
              {activeTab === 'road' && (
                  <div className="h-full space-y-4">
                      {/* Public Spending Transparency */}
                      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
                          <h3 className="text-emerald-400 font-bold text-sm mb-1">State Road Infrastructure</h3>
                          <div className="text-[10px] text-gray-500 mb-3 flex items-center justify-between dark:text-slate-400">
                              <span>Currently Tracking: {currentState || "Telangana"}</span>
                              <span className="text-emerald-500">Live Data</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 mb-4">
                              <div className="bg-gray-100 p-2 rounded border border-gray-200 dark:bg-slate-800 dark:border-white/10">
                                  <div className="text-[9px] text-gray-400 uppercase tracking-wider mb-1 dark:text-slate-500">Annual Budget</div>
                                  <div className="text-sm font-bold font-mono text-gray-700 dark:text-slate-200">₹{((currentState === "Maharashtra" ? 1800 : 1200) * 1.05).toFixed(0)} Cr</div>
                              </div>
                              <div className="bg-gray-100 p-2 rounded border border-gray-200 dark:bg-slate-800 dark:border-white/10">
                                  <div className="text-[9px] text-gray-400 uppercase tracking-wider mb-1 dark:text-slate-500">Fund Utilized</div>
                                  <div className="text-sm font-bold font-mono text-emerald-400">{((currentState === "Maharashtra" ? 68 : 72) + Math.random() * 2).toFixed(1)}%</div>
                              </div>
                          </div>
                      </div>

                      {/* Road Reporting */}
                      <div className="bg-gray-100/50 border border-gray-200 rounded-xl p-4 dark:border-white/10">
                          <div className="flex justify-between items-center mb-3">
                              <h3 className="text-gray-700 font-bold text-sm dark:text-slate-200">Road Quality & Auto-Scanning</h3>
                              <div className="flex items-center gap-1.5 text-[9px] text-blue-400 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20 font-mono">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                                  LIVE AI SCAN {potholeMarkers.length > 0 ? `(${potholeMarkers.length} found)` : ''}
                              </div>
                          </div>
                          
                          <div className="mb-4 bg-slate-900 border border-gray-200 rounded-lg overflow-hidden h-[160px] dark:border-white/10">
                              <MapWidget center={center} className="w-full h-full min-h-[160px]" disableControls markers={potholeMarkers} />
                          </div>

                          {roadReporter.state === 'idle' ? (
                              <div className="space-y-3 border-t border-gray-200 pt-3 dark:border-white/10">
                                  <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider dark:text-slate-500">Manual Report Override</h4>
                                  <select 
                                      className="w-full bg-white border border-gray-200 rounded p-2 text-xs text-gray-700 focus:outline-none focus:border-blue-500 dark:bg-[#111827] dark:border-white/10 dark:text-slate-200"
                                      onChange={(e) => setRoadReporter(prev => ({ ...prev, message: e.target.value }))}
                                      value={roadReporter.message}
                                  >
                                      <option value="">Select Condition...</option>
                                      <option value="Pothole Damage">Severe Potholes</option>
                                      <option value="Water Logging">Water Logging</option>
                                      <option value="Damaged Divider">Damaged Divider/Signage</option>
                                      <option value="Unmarked Speed Breaker">Unmarked Speed Breaker</option>
                                  </select>
                                  
                                  <button 
                                      disabled={!roadReporter.message}
                                      onClick={() => {
                                          setRoadReporter(prev => ({ ...prev, state: 'submitting' }));
                                          setTimeout(() => setRoadReporter(prev => ({ ...prev, state: 'done' })), 1500);
                                          setTimeout(() => setRoadReporter({ state: 'idle', message: '' }), 4500);
                                      }}
                                      className="w-full bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded text-xs font-bold transition-colors flex items-center justify-center gap-2"
                                  >
                                      <Megaphone className="w-3.5 h-3.5" />
                                      Submit Geo-Tagged Report
                                  </button>
                              </div>
                          ) : roadReporter.state === 'submitting' ? (
                              <div className="text-center py-6">
                                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                                  <div className="text-xs text-blue-400">Transmitting to PWD...</div>
                              </div>
                          ) : (
                              <div className="text-center py-6">
                                  <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                                  <div className="text-sm font-bold text-emerald-500 mb-1">Report Verified</div>
                                  <div className="text-[10px] text-gray-500 dark:text-slate-400">Ticket #PWD-{Math.floor(Math.random() * 90000) + 10000} generated.<br/>Track progress on State Infrastructure Portal.</div>
                              </div>
                          )}
                      </div>
                  </div>
              )}
              {activeTab === 'mech' && (
                  <div className="space-y-4">
                      {odometer >= 50000 ? (
                          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-start space-x-4">
                              <div className="text-2xl">🔧</div>
                              <div className="flex-1">
                                  <h4 className="text-yellow-600 font-bold text-sm">Scheduled Maintenance Due</h4>
                                  <p className="text-gray-700 text-xs mt-1 dark:text-slate-200">Odometer reached {(odometer || 0).toFixed(0)} km (Next interval: 50,000 km).</p>
                                  <ul className="text-gray-400 text-[11px] mt-2 list-disc pl-4 space-y-1 dark:text-slate-500">
                                      <li>Engine Oil & Filter Change</li>
                                      <li>Tire Rotation (all 4)</li>
                                      <li>Brake Pad Inspection</li>
                                  </ul>
                                  <button className="mt-3 bg-yellow-500/20 text-yellow-600 border border-yellow-500/30 hover:bg-yellow-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                                      Schedule Service
                                  </button>
                              </div>
                          </div>
                      ) : (
                          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 flex items-start space-x-4">
                              <div className="text-2xl">✓</div>
                              <div className="flex-1">
                                  <h4 className="text-emerald-400 font-bold text-sm">Maintenance Up to Date</h4>
                                  <p className="text-gray-500 text-xs mt-1 dark:text-slate-400">Next scheduled service at 50,000 km.</p>
                                  <div className="mt-3 bg-gray-100 rounded-full h-1.5 w-full overflow-hidden dark:bg-slate-800">
                                      <div className="bg-emerald-500 h-full" style={{ width: `${(odometer / 50000) * 100}%` }} />
                                  </div>
                                  <div className="text-[10px] text-right font-mono text-gray-400 mt-1 dark:text-slate-500">{Math.max(0, 50000 - odometer).toFixed(0)} km remaining</div>
                              </div>
                          </div>
                      )}
                      <div className="text-center text-gray-400 text-[10px] py-4 uppercase tracking-widest border-t border-gray-200 pt-4 dark:text-slate-500 dark:border-white/10">Certified mechanics auto-notified when critical OBD-II faults detected.</div>
                  </div>
              )}
          </div>
      </div>

      {/* Metrics & Stats */}
      <div className="flex flex-col gap-3 mt-4 shrink-0 px-4 pb-4">
          <div className="grid grid-cols-3 gap-3">
              <div className="h-28 bg-white border border-gray-200 shadow-md rounded-lg relative overflow-hidden dark:bg-[#111827] dark:border-white/10 p-2">
                   <div className="text-[9px] uppercase tracking-wider font-bold text-gray-400 absolute top-2 left-2 z-10">Speed (km/h)</div>
                   <div className="text-sm font-mono font-bold text-gray-900 dark:text-white absolute top-2 right-2 z-10">{speed?.toFixed(1) || 0}</div>
                   <div className="h-full w-full mt-4">
                       <ResponsiveContainer width="100%" height="80%">
                            <AreaChart data={history}>
                                <Tooltip contentStyle={{ fontSize: '10px', backgroundColor: '#111827', color: '#fff', border: 'none', borderRadius: '4px' }} />
                                <Area type="monotone" dataKey="speed" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} isAnimationActive={false} />
                            </AreaChart>
                       </ResponsiveContainer>
                   </div>
              </div>
              <div className="h-28 bg-white border border-gray-200 shadow-md rounded-lg relative overflow-hidden dark:bg-[#111827] dark:border-white/10 p-2">
                   <div className="text-[9px] uppercase tracking-wider font-bold text-gray-400 absolute top-2 left-2 z-10">G-Force (g)</div>
                   <div className="text-sm font-mono font-bold text-gray-900 dark:text-white absolute top-2 right-2 z-10">{gForce?.toFixed(2) || 0} g</div>
                   <div className="h-full w-full mt-4">
                       <ResponsiveContainer width="100%" height="80%">
                            <AreaChart data={history}>
                                <Tooltip contentStyle={{ fontSize: '10px', backgroundColor: '#111827', color: '#fff', border: 'none', borderRadius: '4px' }} />
                                <Area type="monotone" dataKey="gForce" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} strokeWidth={2} isAnimationActive={false} />
                            </AreaChart>
                       </ResponsiveContainer>
                   </div>
              </div>
              <div className="h-28 bg-white border border-gray-200 shadow-md rounded-lg relative overflow-hidden dark:bg-[#111827] dark:border-white/10 p-2">
                   <div className="text-[9px] uppercase tracking-wider font-bold text-gray-400 absolute top-2 left-2 z-10">Fuel Level (%)</div>
                   <div className="text-sm font-mono font-bold text-gray-900 dark:text-white absolute top-2 right-2 z-10">{fuelLevel?.toFixed(1) || 0}%</div>
                   <div className="h-full w-full mt-4">
                       <ResponsiveContainer width="100%" height="80%">
                            <AreaChart data={history}>
                                <Tooltip contentStyle={{ fontSize: '10px', backgroundColor: '#111827', color: '#fff', border: 'none', borderRadius: '4px' }} />
                                <YAxis domain={[0, 100]} hide yAxisId={0} />
                                <Area type="monotone" dataKey="fuelLevel" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} isAnimationActive={false} yAxisId={0} />
                            </AreaChart>
                       </ResponsiveContainer>
                   </div>
              </div>
          </div>
          
          {/* Real-time Engine Stats */}
          <div className="grid grid-cols-3 gap-3">
              {[
                  { lbl: 'Engine RPM', val: Math.max(800, Math.floor((speed || 0) * 35 + 800 + (Math.random() * 40 - 20))).toLocaleString(), unit: 'RPM', color: speed > 80 ? 'text-orange-500' : 'text-blue-500' },
                  { lbl: 'Coolant Temp', val: (engineTemp || 90).toFixed(0), unit: '°C', color: engineTemp > 105 ? 'text-red-500' : 'text-emerald-500' },
                  { lbl: 'Oil Pressure', val: Math.max(20, Math.floor(40 + (speed || 0) * 0.15 + (Math.random() * 2 - 1))).toFixed(0), unit: 'PSI', color: 'text-amber-500' }
              ].map((stat, idx) => (
                  <div key={idx} className="bg-white border border-gray-200 shadow-md rounded-lg p-2 relative overflow-hidden dark:bg-[#111827] dark:border-white/10 flex items-center justify-between">
                      <div>
                          <div className="text-[9px] uppercase tracking-wider font-bold text-gray-400 mb-0.5 dark:text-slate-500">{stat.lbl}</div>
                          <div className="flex items-baseline gap-1">
                              <span className={cn("text-lg font-bold font-mono tracking-tight", stat.color)}>{stat.val}</span>
                              <span className="text-[9px] text-gray-500 font-bold">{stat.unit}</span>
                          </div>
                      </div>
                  </div>
              ))}
          </div>

          <div className="grid grid-cols-3 gap-3">
              {[
                  { val: violationsCount.toString(), lbl: 'Flags', color: violationsCount > 0 ? 'text-red-400' : 'text-gray-700' },
                  { val: '₹' + (violationsCount > 0 ? violationsCount * 1000 : 0).toString(), lbl: 'Est. Fines', color: violationsCount > 0 ? 'text-yellow-600' : 'text-gray-400' },
                  { val: '0', lbl: 'SOS', color: 'text-gray-400' }
              ].map((s, idx) => (
                  <div key={idx} className="bg-white border border-gray-200 shadow-md rounded-lg p-2 text-center relative overflow-hidden group dark:bg-[#111827] dark:border-white/10">
                      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className={cn("text-lg font-bold font-mono tracking-tight", s.color || "text-gray-900")}>{s.val}</div>
                      <div className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mt-0.5 dark:text-slate-500">{s.lbl}</div>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
}
