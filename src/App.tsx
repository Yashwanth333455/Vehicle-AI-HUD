import React, { useEffect, useCallback, useRef } from 'react';
import { useAppStore } from './store/appStore';
import { HUD } from './components/HUD';
import { CenterDashboard } from './components/CenterDashboard';
import { PolicySidebar, STATE_POLICIES, type StateName, getFineAmount } from './components/PolicySidebar';
import { Notifications, type NotificationLog } from './components/Notifications';
import { VahanModal, type VahanData } from './components/VahanModal';
import { AIVisionModal } from './components/AIVisionModal';
import { CabinCameraAgent } from './components/CabinCameraAgent';
import { ObdScannerModal } from './components/ObdScannerModal';
import { ObdScannerConsole } from './components/ObdScannerConsole';
import { ShieldCheck, AlertTriangle, Volume2, VolumeX, Database, MapPin, Satellite, MapPinOff, Cpu, BrainCircuit, Activity, Sun, Moon, Gauge, Mic, MicOff } from 'lucide-react';
import { cn } from './lib/utils';
import { SidebarNav, type ViewMode } from './components/SidebarNav';

export default function App() {
  const { theme, setTheme, mediaError, setMediaError, isListening, setIsListening, currentView, setCurrentView, speed, setSpeed, gForce, setGForce, accelX, setAccelX, accelY, setAccelY, currentState, setCurrentState, safetyScore, setSafetyScore, logs, setLogs, addLog, center, setCenter, isRashDriving, setIsRashDriving, audioEnabled, setAudioEnabled, gpsVerified, setGpsVerified, fuelLevel, setFuelLevel, tirePressure, setTirePressure, engineTemp, setEngineTemp, hasAccident, setHasAccident, odometer, setOdometer, tripDistance, setTripDistance, isVahanModalOpen, setIsVahanModalOpen, isVahanLoading, setIsVahanLoading, vahanData, setVahanData, isAIVisionModalOpen, setIsAIVisionModalOpen, isObdScannerModalOpen, setIsObdScannerModalOpen } = useAppStore();

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check initial device capabilities or permissions
    const checkMediaPermissions = async () => {
      try {
        // Just checking if we can enumerate devices, or attempting to silently check permissions
        if (navigator.permissions && navigator.permissions.query) {
          try {
            const camPerm = await navigator.permissions.query({ name: 'camera' as PermissionName });
            const micPerm = await navigator.permissions.query({ name: 'microphone' as PermissionName });
            
            if (camPerm.state === 'denied' || micPerm.state === 'denied') {
              setMediaError({
                message: 'Camera or Microphone access is denied.',
                subMessage: 'Please enable permissions in your browser settings for the AI Vision & DMS features to fully function.'
              });
            }
            
            const handlePermChange = () => {
              if (camPerm.state === 'denied' || micPerm.state === 'denied') {
                setMediaError({
                  message: 'Camera or Microphone access is denied.',
                  subMessage: 'Please enable permissions in your browser settings for the AI Vision & DMS features to fully function.'
                });
              } else {
                setMediaError(null);
              }
            };
            
            camPerm.addEventListener('change', handlePermChange);
            micPerm.addEventListener('change', handlePermChange);
            
            return () => {
              camPerm.removeEventListener('change', handlePermChange);
              micPerm.removeEventListener('change', handlePermChange);
            };
          } catch (e) {
            // Some browsers don't support query for camera/mic
          }
        }
      } catch (err) {
        console.warn("Could not check media permissions:", err);
      }
    };
    
    checkMediaPermissions();
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const steeringEventsRef = useRef<number[]>([]);

  const violationTicksRef = useRef(0);
  const lastAudioPlayTimeRef = useRef(0);
  const audioEnabledRef = useRef(audioEnabled);
  const vahanModalFiredRef = useRef(false);
  const hasAccidentRef = useRef(false);
  const hasTireAlertRef = useRef(false);
  const hasEngineAlertRef = useRef(false);
  const pendingAccidentRef = useRef<boolean | string>(false);
  const lastMaintenanceAlertOdometerRef = useRef(49999.8);

  useEffect(() => {
    audioEnabledRef.current = audioEnabled;
  }, [audioEnabled]);

  const triggerVahanLookup = useCallback(async (plate: string = "TS 09 EZ 1234") => {
    setIsVahanModalOpen(true);
    setIsVahanLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setVahanData({
        plateNumber: plate,
        ownerName: "YASHWANT REDDY",
        vehicleClass: "Motor Car(LMV)",
        registrationDate: "12-Aug-2021",
        fuelType: "PETROL",
        chassisNumber: "MA3**********1234",
        engineNumber: "G12B********",
        insuranceValidUpto: "11-Aug-2026",
        rcStatus: "ACTIVE"
    });
    setIsVahanLoading(false);
    addLog('info', 'Vahan API: Retrieved vehicle owner details.', `Reg: ${plate}`);
  }, [addLog]);

  const handleVoiceCommand = useCallback((command: string) => {
    console.log("Voice command:", command);
    if (command.includes('pothole') || command.includes('pot hole')) {
      addLog('agent', '[VOICE COMMAND] "Report Pothole" detected.', 'Routing to Public Works Dept...');
      setTimeout(() => {
        addLog('info', '[AGENT RESPONSE] Your request about the pothole has been forwarded to the road corporations and higher authorities.', 'Status: Forwarded');
        if (audioEnabledRef.current) {
            const speech = new SpeechSynthesisUtterance("Pothole reported. Thank you for your contribution to road safety.");
            window.speechSynthesis.speak(speech);
        }
      }, 1000);
    } else if (command.includes('vahan') || command.includes('details')) {
      addLog('agent', '[VOICE COMMAND] "Show Vahan details" detected.', 'Opening Vahan Database...');
      triggerVahanLookup("TS 09 EZ 1234");
    } else {
      addLog('agent', `[VOICE COMMAND] Recognized: "${command}"`, 'Command not natively handled, routing to LLM...');
    }
  }, [addLog, triggerVahanLookup]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (typeof window !== 'undefined' && SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        handleVoiceCommand(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        if (event.error === 'not-allowed') {
          addLog('error', 'Microphone access denied.', 'Please check browser or iframe permissions.');
        }
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [handleVoiceCommand]);

  const toggleVoiceCommand = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
         try {
             recognitionRef.current.start();
             setIsListening(true);
         } catch (e) {
             console.error("Failed to start speech recognition:", e);
         }
      } else {
         addLog('info', 'Speech Recognition is not supported in this browser.', 'Browser Support');
      }
    }
  };

  const simulateAccident = useCallback(() => {
    pendingAccidentRef.current = 'loss_of_control';
    setAudioEnabled(true);
  }, []);

  useEffect(() => {
    const locs: Record<StateName, { lat: number, lng: number }> = {
        "Telangana": { lat: 17.3850, lng: 78.4867 },
        "Andhra Pradesh": { lat: 16.5062, lng: 80.6480 },
        "Maharashtra": { lat: 19.0760, lng: 72.8777 },
        "Delhi": { lat: 28.6139, lng: 77.2090 },
        "Tamil Nadu": { lat: 13.0827, lng: 80.2707 },
        "Uttar Pradesh": { lat: 26.8467, lng: 80.9462 }
    };
    setCenter(locs[currentState]);
  }, [currentState]);

  useEffect(() => {
    const interval = setInterval(() => {
        const policy = STATE_POLICIES[currentState];
        const limit = policy.speed_limit_highway;
        
        setSpeed(prev => {
            if (hasAccidentRef.current) return 0;
            
            let next = prev + (Math.random() * 10 - 4);
            if (next < 20) next += 10;
            if (next > 160) next -= 20;
            
            const isSpeeding20 = next > limit * 1.2;
            const randomCrashChance = Math.random() < 0.005;
            const randomPotholeChance = Math.random() < 0.015;
            
            let isPothole = false;
            let newAccelX = (next - prev) * 0.08; // Base map
            let newAccelY = Math.random() * 0.2 - 0.1;
            
            // Generate steering event if there's a strong lateral move
            if (Math.abs(newAccelY) > 0.15) {
                steeringEventsRef.current.push(Date.now());
            }
            steeringEventsRef.current = steeringEventsRef.current.filter(t => Date.now() - t < 5000);
            
            // Random spikes for acceleration
            if (Math.random() < 0.05) newAccelX = 0.38 + Math.random() * 0.1; // Rapid accel > 0.35
            if (Math.random() < 0.05) newAccelX = -(0.48 + Math.random() * 0.1); // Harsh brake < -0.45
            if (Math.random() < 0.05) {
                newAccelY = (Math.random() > 0.5 ? 1 : -1) * (0.42 + Math.random() * 0.1); // Sharp turn > 0.4
            }
            // Force swerve randomly
            if (Math.random() < 0.02) {
                const now = Date.now();
                steeringEventsRef.current = [now, now, now, now, now, now];
            }

            let newGForce = Math.sqrt(newAccelX * newAccelX + newAccelY * newAccelY);
            if (newGForce < 0.1) newGForce = 0.1 + Math.random() * 0.1;

            let currentCrashPhase = pendingAccidentRef.current;
            if (currentCrashPhase === true) currentCrashPhase = 'loss_of_control'; // handle boolean case
            
            if (currentCrashPhase === 'loss_of_control') {
                newAccelX = 0.2 + Math.random() * 0.3; // sudden accel
                newAccelY = (Math.random() > 0.5 ? 1 : -1) * (0.8 + Math.random() * 0.5); // violent swerve
                newGForce = Math.sqrt(newAccelX * newAccelX + newAccelY * newAccelY);
                pendingAccidentRef.current = 'braking';
            } else if (currentCrashPhase === 'braking') {
                // Hard braking, ABS kicking in
                newAccelX = -1.5 - Math.random() * 0.8;
                newAccelY = (Math.random() - 0.5) * 0.6; // losing traction
                newGForce = Math.sqrt(newAccelX * newAccelX + newAccelY * newAccelY);
                pendingAccidentRef.current = 'impact';
            } else if (currentCrashPhase === 'impact' || randomCrashChance) {
                // The actual collision
                const isFrontal = Math.random() > 0.3;
                if (isFrontal) {
                    newGForce = 25.0 + Math.random() * 15.0; // 25-40G
                    newAccelX = -newGForce * (0.9 + Math.random() * 0.1); 
                    newAccelY = (Math.random() - 0.5) * newGForce * 0.3;
                } else {
                    newGForce = 18.0 + Math.random() * 10.0; // Side impact
                    newAccelX = -newGForce * 0.4;
                    newAccelY = (Math.random() > 0.5 ? 1 : -1) * newGForce * 0.9;
                }
                pendingAccidentRef.current = 'rebound';
            } else if (currentCrashPhase === 'rebound') {
                // Vehicle rebounding and spinning out
                newGForce = 6.0 + Math.random() * 4.0;
                newAccelX = newGForce * 0.3; // bounce back
                newAccelY = (Math.random() - 0.5) * newGForce * 0.9; // spin
                pendingAccidentRef.current = false;
            } else if (randomPotholeChance) {
                isPothole = true;
                newGForce = 1.8 + Math.random() * 0.8;
                newAccelX = -(Math.random() * 0.5);
                newAccelY = 0;
            }
            
            setAccelX(newAccelX);
            setAccelY(newAccelY);
            setGForce(newGForce);
            const isAccident = newGForce >= 4.0;
            const rash = newGForce > 0.8 && !isAccident && !isPothole;
            
            if (rash) setIsRashDriving(true);

            setFuelLevel(f => Math.max(0, f - (Math.random() * 0.05)));
            
            // ReAct Agent Simulation Cycle
            const agentCycle = () => {
                const limit = policy.speed_limit_highway;
                const g_force = newGForce;
                
                // Reasoning Step 1: Accident
                if (isAccident) {
                    addLog('agent', `[THOUGHT] Severe impact detected (${g_force.toFixed(2)}g). Initiating Hospital protocol.`);
                    addLog('agent', `[ACTION] Alerting City General Hospital (ETA 3m). Payload: [Accident]`);
                    return;
                }
                
                // Reasoning Step 2: Rash Driving
                if (rash) {
                    if (newAccelX > 0.35) {
                         addLog('agent', `[THOUGHT] Rapid Acceleration (${newAccelX.toFixed(2)}g). Triggering alert.`);
                    } else if (newAccelX < -0.45) {
                         addLog('agent', `[THOUGHT] Harsh Braking (${newAccelX.toFixed(2)}g). Triggering alert.`);
                    } else if (Math.abs(newAccelY) > 0.40) {
                         addLog('agent', `[THOUGHT] Dangerous Turn (${Math.abs(newAccelY).toFixed(2)}g lateral). Triggering alert.`);
                    } else if (steeringEventsRef.current.length > 5) {
                         addLog('agent', `[THOUGHT] Swerving (${steeringEventsRef.current.length} steering changes in 5s). Triggering alert.`);
                    } else {
                         addLog('agent', `[THOUGHT] High G-Force (${g_force.toFixed(2)}g). Rash Driving evident.`);
                    }
                    addLog('agent', `[ACTION] Reporting to Authorities: Rash Driving.`);
                    return;
                }
                
                // Reasoning Step 3: Speeding
                if (isSpeeding20) {
                    addLog('agent', `[THOUGHT] Speed ${next.toFixed(1)} is >20% over limit ${limit}. Tracking duration...`);
                    if (violationTicksRef.current >= 4) { // Warning early
                        addLog('agent', `[THOUGHT] Speeding threshold exceeded! Action required.`);
                        addLog('agent', `[ACTION] TTS Warning: "You are exceeding the speed limit."`);
                    }
                }
            };
            
            agentCycle();
            
            setTirePressure(prev => {
                const nextTires = prev.map(p => Math.max(15, Math.min(45, p + (Math.random() * 0.4 - 0.2)))) as [number, number, number, number];
                if (Math.random() < 0.005) {
                    const randomTire = Math.floor(Math.random() * 4);
                    nextTires[randomTire] = Math.random() < 0.5 ? 22 : 42;
                }
                const abnormalIndex = nextTires.findIndex(p => p < 25 || p > 40);
                if (abnormalIndex !== -1 && !hasTireAlertRef.current) {
                    hasTireAlertRef.current = true;
                    const tireNames = ['Front Left', 'Front Right', 'Rear Left', 'Rear Right'];
                    const pressure = nextTires[abnormalIndex];
                    const issue = pressure < 25 ? 'Low Pressure' : 'Overpressure';
                    setTimeout(() => {
                        addLog('info', `DTC ALERT: C02XX - TPMS PSI Alert`, `${issue} on ${tireNames[abnormalIndex]} tire (${pressure.toFixed(1)} PSI). System recommends immediate inspection.`);
                        addLog('upload', `[AI Agent] report_to_authorities(target="Mechanic") triggered`, `Alerting nearest certified mechanic for TPMS service.`);
                        try {
                            if (audioEnabledRef.current && !hasAccidentRef.current) window.speechSynthesis.speak(new SpeechSynthesisUtterance(`Warning. ${issue} detected on ${tireNames[abnormalIndex]} tire. Contacting mechanic.`));
                        } catch(e) {}
                    }, 0);
                } else if (abnormalIndex === -1 && hasTireAlertRef.current) {
                    hasTireAlertRef.current = false;
                }
                return nextTires;
            });
            
            setEngineTemp(prevTemp => {
                const baseNext = prevTemp + ((90 + (next / 160) * 20) - prevTemp) * 0.1;
                const nextTemp = Math.random() < 0.005 ? 106 + Math.random() * 5 : baseNext;
                
                if (nextTemp > 105 && !hasEngineAlertRef.current) {
                    hasEngineAlertRef.current = true;
                    setTimeout(() => {
                        addLog('info', `DTC ALERT: P0128 - Coolant Thermostat`, `Engine temperature reached critical level (${nextTemp.toFixed(1)}°C).`);
                        addLog('upload', `[AI Agent] report_to_authorities(target="Mechanic") triggered`, `Alerting nearest certified mechanic for engine overheating.`);
                        try {
                            if (audioEnabledRef.current && !hasAccidentRef.current) window.speechSynthesis.speak(new SpeechSynthesisUtterance(`Warning. High engine temperature detected. Contacting mechanic.`));
                        } catch(e) {}
                    }, 0);
                } else if (nextTemp <= 105 && hasEngineAlertRef.current) {
                    hasEngineAlertRef.current = false;
                }
                return nextTemp;
            });

            setCenter(prevCenter => {
                const speedMetersPerSec = (next * 1000) / 3600;
                const degPerMeterLat = 1 / 111111;
                const latRad = prevCenter.lat * (Math.PI / 180);
                const degPerMeterLng = 1 / (111111 * Math.cos(latRad));
                
                const nextLat = prevCenter.lat + speedMetersPerSec * degPerMeterLat * 0.707;
                const nextLng = prevCenter.lng + speedMetersPerSec * degPerMeterLng * 0.707;
                
                const ctLat = nextLat + (Math.random() - 0.5) * 0.002;
                const ctLng = nextLng + (Math.random() - 0.5) * 0.002;
                setGpsVerified(Math.abs(nextLat - ctLat) < 0.005 && Math.abs(nextLng - ctLng) < 0.005);

                const distKm = speedMetersPerSec / 1000;
                setTripDistance(td => td + distKm);
                setOdometer(o => {
                    const nextO = o + distKm;
                    if (nextO >= 50000 && lastMaintenanceAlertOdometerRef.current < 50000) {
                        lastMaintenanceAlertOdometerRef.current = 50000;
                        setTimeout(() => {
                            addLog('info', 'MAINTENANCE ALERT: Scheduled Service Due', 'Odometer reached 50,000 km. Required: Engine Oil Change, Oil Filter, Tire Rotation, Brake Inspection.');
                            addLog('upload', '[AI Agent] notify_owner(target="Mobile App")', `Sent service reminder to owner's device.`);
                            try {
                                if (audioEnabledRef.current && !hasAccidentRef.current) window.speechSynthesis.speak(new SpeechSynthesisUtterance("Scheduled maintenance due. Odometer reached 50,000 kilometers. Please schedule a service appointment."));
                            } catch(e) {}
                        }, 0);
                    }
                    return nextO;
                });

                if (isAccident && !hasAccidentRef.current) {
                    setTimeout(() => {
                        setHasAccident(true);
                        hasAccidentRef.current = true;
                        setIsRashDriving(true);
                        setSafetyScore(0);
                        
                        const fineAccident = getFineAmount(currentState, 'ACCIDENT');
                        const timeAcc = new Date().toLocaleTimeString();
                        addLog('violation', `CRITICAL ACCIDENT DETECTED: Impact G-Force Drop (${newGForce.toFixed(2)}g)`, `Time: ${timeAcc} | Fine: ${fineAccident !== "Court Challan" ? "₹" : ""}${fineAccident} | Rule: Rash Driving (Accident) | Location: ${nextLat.toFixed(4)}, ${nextLng.toFixed(4)}`);
                            try {
                                if (audioEnabledRef.current) {
                                    window.speechSynthesis.cancel();
                                    const msg1 = new SpeechSynthesisUtterance("Severe accident detected. Impact over 4G. Activating SOS.");
                                    const msg2 = new SpeechSynthesisUtterance("Auto-dialing Apollo Trauma Center. Estimated arrival in 3 minutes.");
                                    const msg3 = new SpeechSynthesisUtterance("Alerting Highway Patrol Station 4. Location coordinates transmitted.");
                                    const msg4 = new SpeechSynthesisUtterance("Dispatching City Fire Department. Extraction team requested.");
                                    
                                    [msg1, msg2, msg3, msg4].forEach(u => {
                                        u.rate = 1.1;
                                        u.pitch = 1.2;
                                        window.speechSynthesis.speak(u);
                                    });
                                }
                            } catch(e) {}
                        
                        setTimeout(() => { addLog('info', `[AI Agent] Severe impact detected!`, `Evaluating GPS...`); }, 500);
                        setTimeout(() => {
                            addLog('upload', `[AI Agent] report_to_authorities(target="Emergency Services") triggered`, `Alerting EMS.`);
                            addLog('info', `[AI Agent] Auto-Dialing Apollo Trauma Center (1.2km)`, `ETA 3 mins. Vital metrics transmitted.`);
                            addLog('info', `[AI Agent] Auto-Dialing Highway Patrol Station 4 (3.5km)`, `ETA 5 mins. Location: ${nextLat.toFixed(4)}, ${nextLng.toFixed(4)} transmitted.`);
                            addLog('info', `[AI Agent] Auto-Dialing City Fire Dept (2.8km)`, `ETA 4 mins. Extraction team requested.`);
                            addLog('info', `[AI Agent] Calling Emergency Contact (+91 9959441499)`, `Initiating voice call...`);
                            
                            const callMessage = `Emergency Alert. This is an automated safety notification. A possible accident involving Yashwanth has been detected. Please try contacting them immediately. Their live GPS location has been shared with you through S M S. Their location is latitude ${nextLat.toFixed(4)} and longitude ${nextLng.toFixed(4)}. The situation is critical, please take an action.`;
                            
                            // Trigger physical phone call via backend
                            fetch('/api/makeCall', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    to: '+919959441499',
                                    message: callMessage
                                })
                            })
                            .then(async (res) => {
                                const data = await res.json();
                                if (!res.ok) {
                                    console.error("Twilio Call Error Data:", data);
                                    addLog('violation', 'Emergency Call Failed', String(data.error || 'Unknown server error'));
                                } else {
                                    addLog('info', 'Emergency Call Initiated successfully.', 'Call SID: ' + data.callSid);
                                }
                            })
                            .catch(err => {
                                console.error("Error making emergency call (fetch):", err);
                                addLog('violation', 'Emergency Request Failed', String(err));
                            });

                            // Send SMS via backend
                            const smsMessage = `Emergency Alert. A possible accident involving Yashwanth has been detected. Location: https://maps.google.com/?q=${nextLat},${nextLng}`;
                            fetch('/api/sendSms', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    to: '+919959441499',
                                    message: smsMessage
                                })
                            })
                            .then(async (res) => {
                                const data = await res.json();
                                if (!res.ok) {
                                    console.error("Twilio SMS Error Data:", data);
                                    addLog('violation', 'Emergency SMS Failed', String(data.error || 'Unknown server error'));
                                } else {
                                    addLog('info', 'Emergency SMS Sent successfully.', 'Message SID: ' + data.messageSid);
                                }
                            })
                            .catch(err => {
                                console.error("Error sending emergency SMS:", err);
                                addLog('violation', 'Emergency SMS Request Failed', String(err));
                            });

                            if (!vahanModalFiredRef.current) {
                                vahanModalFiredRef.current = true;
                                triggerVahanLookup("TS 09 EZ 1234");
                            }
                        }, 1500);
                        
                        setTimeout(() => { 
                            setIsRashDriving(false); 
                            setHasAccident(false); 
                            pendingAccidentRef.current = false; 
                            hasAccidentRef.current = false;
                        }, 10000); // 10s wait for accident clear
                    }, 0);
                } else if (isPothole && !hasAccidentRef.current) {
                    setTimeout(() => {
                        addLog('info', `INFRASTRUCTURE ALERT: Severe Pothole`, `Vertical impact anomaly (${newGForce.toFixed(2)}g). Loc: ${nextLat.toFixed(4)}, ${nextLng.toFixed(4)}`);
                        addLog('upload', `[AI Agent] report_road_condition(issue="Pothole Damage")`, `Auto-reporting geo-tagged infrastructure damage to PWD.`);
                        const now = Date.now();
                        if (audioEnabledRef.current && now - lastAudioPlayTimeRef.current > 15000) {
                            try {
                                window.speechSynthesis.speak(new SpeechSynthesisUtterance(`Pothole reported. Thank you for your contribution to road safety.`));
                                lastAudioPlayTimeRef.current = now;
                            } catch(e) {}
                        }
                    }, 0);
                }
                return { lat: nextLat, lng: nextLng };
            });

            // Calculate Safety Score based on speed and G-Force
            let targetScore = 100 - Math.max(0, next - limit) * 1.5 - (newGForce > 0.3 ? newGForce * 20 : 0);
            if (isAccident || hasAccidentRef.current) targetScore = 0;
            setSafetyScore(s => Math.max(0, Math.round(s * 0.9 + targetScore * 0.1)));

            if (isAccident) return 0;
            if (rash) {
                const fine = getFineAmount(currentState, 'RASH');
                const time = new Date().toLocaleTimeString();
                addLog('violation', `RASH DRIVING: G-Force > 0.8g (${newGForce.toFixed(2)}g)`, `Time: ${time} | Fine: ${fine !== "Court Challan" ? "₹" : ""}${fine} | Rule: Rash Driving | Generating Evidence...`);
                addLog('upload', `[AI Agent] report_to_authorities(target="Traffic Police") triggered`, `Violator reported for Rash Driving. Fine: ${fine !== "Court Challan" ? "₹" : ""}${fine}. Timestamp: ${time}. Evidence attached.`);
            }
            if (isSpeeding20) {
                violationTicksRef.current += 1;
                if (violationTicksRef.current >= 6) {
                    const fine = getFineAmount(currentState, 'SPEEDING');
                    const time = new Date().toLocaleTimeString();
                    addLog('violation', `SPEEDING VIOLATION: >20% limit.`, `Time: ${time} | Fine: ${fine !== "Court Challan" ? "₹" : ""}${fine} | Rule: Overspeeding | Speed: ${next.toFixed(1)}km/h`);
                    addLog('upload', `[AI Agent] report_to_authorities(target="Traffic Police") triggered`, `Violator reported for Speeding. Fine: ${fine !== "Court Challan" ? "₹" : ""}${fine}. Timestamp: ${time}. Evidence attached.`);
                    const now = Date.now();
                    if (audioEnabledRef.current && !hasAccidentRef.current && now - lastAudioPlayTimeRef.current > 10000) {
                        try {
                            window.speechSynthesis.speak(new SpeechSynthesisUtterance("Warning. You are exceeding the speed limit."));
                            lastAudioPlayTimeRef.current = now;
                        } catch(e) {}
                    }
                    violationTicksRef.current = 0;
                } else if (violationTicksRef.current === 1) {
                    addLog('info', `Speed > 20% over limit. Tracking... (${next.toFixed(0)} km/h)`);
                }
            } else {
                if (violationTicksRef.current > 0) violationTicksRef.current = 0;
            }
            return Math.round(next);
        });
    }, 1000);
    return () => clearInterval(interval);
  }, [currentState, addLog, triggerVahanLookup]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 text-gray-900 font-sans dark:bg-[#0B0F14] dark:text-white">
        {/* Header */}
        <header className="h-[60px] bg-white border-b border-gray-200 flex items-center px-4 gap-4 shrink-0 relative z-20 shadow-sm dark:bg-[#111827] dark:border-white/10">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm bg-purple-700/10 border border-purple-200 text-yellow-600">⚡</div>
            <div>
                <div className="text-[13px] font-bold tracking-widest uppercase text-gray-900 dark:text-white">AI Studio <span className="opacity-50">Auto Platform</span></div>
                <div className="text-[10px] text-yellow-600/80 font-mono tracking-widest uppercase">VISION CORE • v2.0</div>
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-2">
                <select 
                  onChange={(e) => {
                      if (e.target.value) {
                          const rule = e.target.value;
                          const fine = getFineAmount(currentState, rule);
                          const time = new Date().toLocaleTimeString();
                          addLog('violation', `VIOLATION DETECTED: ${rule}`, `Time: ${time} | Fine: ${fine !== "Court Challan" && fine !== "N/A" ? "₹" : ""}${fine} | Rule: ${rule} | Camera ID: CAM-${Math.floor(Math.random()*1000)}`);
                          addLog('upload', `[AI Agent] report_to_authorities(target="Traffic Police") triggered`, `Violator reported for ${rule}. Fine: ${fine !== "Court Challan" && fine !== "N/A" ? "₹" : ""}${fine}. Timestamp: ${time}.`);
                          e.target.value = "";
                      }
                  }}
                  className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-600 rounded-full pl-3 pr-2 py-1 text-[11px] font-bold hover:bg-yellow-500/20 appearance-none outline-none cursor-pointer max-w-[150px] truncate"
                >
                  <option value="">⚠️ Trigger Offense...</option>
                  <option value="Driving without licence">No Licence</option>
                  <option value="Driving without insurance">No Insurance</option>
                  <option value="Driving without valid RC">No Valid RC</option>
                  <option value="Driving without PUC certificate">No PUC</option>
                  <option value="Jumping red light / signal violation">Red Light Jump</option>
                  <option value="Disobeying lawful direction of traffic police">Disobeying Traffic Police</option>
                  <option value="Violation of stop line">Stop Line Violation</option>
                  <option value="Violation of stop sign">Stop Sign Violation</option>
                  <option value="Violation of one-way / mandatory signs">One-way Violation</option>
                  <option value="Driving without seat belt (driver)">No Seatbelt</option>
                  <option value="Triple riding on two-wheeler">Triple Riding</option>
                  <option value="Using mobile phone while driving">Mobile Phone Use</option>
                  <option value="Driving without helmet">No Helmet</option>
                  <option value="Driving without indicator">No Indicator</option>
                  <option value="Use of illegal / fancy number plate">Fancy Number Plate</option>
                  <option value="Drunk driving (DUI)">Drunk Driving</option>
                </select>
                <button 
                  onClick={() => setIsAIVisionModalOpen(true)}
                  className="bg-purple-700/10 border border-purple-200 text-yellow-600 rounded-full px-3 py-1 text-[11px] font-bold hover:bg-purple-700/20 flex items-center gap-1.5"
                >
                  <BrainCircuit className="w-3.5 h-3.5" /> AI Vision Arch
                </button>
                <button 
                  onClick={() => triggerVahanLookup("TS 09 EZ 1234")}
                  className="bg-blue-500/10 border border-blue-500/30 text-blue-500 rounded-full px-3 py-1 text-[11px] font-bold hover:bg-blue-500/20"
                >
                  🔍 Vahan Lookup
                </button>
                <button 
                  onClick={simulateAccident}
                  className="bg-red-500/10 border border-red-500/30 text-red-500 rounded-full px-3 py-1 text-[11px] font-bold hover:bg-red-500/20"
                >
                  ⚡ Simulate Crash
                </button>
                <div className="bg-white border border-gray-200 rounded-full px-3 py-1 text-[11px] flex items-center gap-1.5 dark:bg-[#111827] dark:border-white/10"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_#22c55e]" /> Edge</div>
                <div className="bg-white border border-gray-200 rounded-full px-3 py-1 text-[11px] flex items-center gap-1.5 dark:bg-[#111827] dark:border-white/10"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_#22c55e]" /> WS</div>
                <div className="bg-white border border-gray-200 rounded-full px-3 py-1 text-[11px] flex items-center gap-1.5 dark:bg-[#111827] dark:border-white/10"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_#22c55e]" /> Agent</div>
                <div className="bg-white border border-gray-200 rounded-full px-3 py-1 text-[11px] font-mono dark:bg-[#111827] dark:border-white/10">{new Date().toLocaleTimeString('en-US', { hour12: false })}</div>
                <button 
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="bg-white border border-gray-200 rounded-full p-1.5 hover:bg-gray-100 dark:bg-[#111827] dark:border-white/10 dark:hover:bg-white/5 transition-colors"
                  title="Toggle Theme"
                >
                  {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-yellow-500" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
                </button>
                <button 
                  onClick={toggleVoiceCommand}
                  className={cn("border rounded-full p-1.5 transition-colors", isListening ? "bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20" : "bg-white border-gray-200 hover:bg-gray-100 text-gray-600 dark:bg-[#111827] dark:border-white/10 dark:hover:bg-white/5 dark:text-slate-300")}
                  title="Voice Command"
                >
                  {isListening ? <Mic className="w-3.5 h-3.5 animate-pulse" /> : <MicOff className="w-3.5 h-3.5" />}
                </button>
                <button 
                  onClick={() => setAudioEnabled(!audioEnabled)}
                  className="bg-white border border-gray-200 rounded-full p-1.5 hover:bg-white/5 dark:bg-[#111827] dark:border-white/10"
                >
                  {audioEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3 text-gray-400 dark:text-slate-500" />}
                </button>
            </div>
        </header>

        {mediaError && (
          <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-2 relative z-10 flex items-center gap-3 shrink-0 shadow-sm dark:bg-red-900/20">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            <div className="flex-1">
                <p className="text-xs font-bold text-red-600 dark:text-red-400">{mediaError.message}</p>
                <p className="text-[10px] text-red-500/80 mt-0.5">{mediaError.subMessage}</p>
            </div>
            <button 
                onClick={() => setMediaError(null)}
                className="p-1 hover:bg-red-500/10 rounded-lg text-red-500 transition-colors"
                title="Dismiss"
            >
                &times;
            </button>
          </div>
        )}

        <div className="flex flex-1 overflow-hidden">
            <SidebarNav currentView={currentView} onViewChange={setCurrentView} />
            
            <main className="flex-1 overflow-y-auto p-6 bg-white relative dark:bg-[#111827]">
                {currentView === 'dashboard' && (
                    <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-4 h-full min-h-[600px]">
                            <HUD 
                                speed={speed} 
                                speedLimit={STATE_POLICIES[currentState].speed_limit_highway}
                                safetyScore={safetyScore}
                                isRashDriving={isRashDriving}
                                gForce={gForce}
                                fuelLevel={fuelLevel}
                                tirePressure={tirePressure}
                                engineTemp={engineTemp}
                                currentState={currentState}
                                center={center}
                            />
                        </div>
                        <div className="lg:col-span-8 h-full min-h-[600px] flex flex-col bg-white rounded-xl overflow-hidden shadow-2xl border border-gray-200 dark:bg-[#111827] dark:border-white/10">
                            <CenterDashboard 
                                logs={logs}
                                center={center}
                                speed={speed}
                                speedLimit={STATE_POLICIES[currentState].speed_limit_highway}
                                tirePressure={tirePressure}
                                engineTemp={engineTemp}
                                odometer={odometer}
                                tripDistance={tripDistance}
                                currentState={currentState}
                                isAccident={hasAccident}
                                fuelLevel={fuelLevel}
                                gForce={gForce}
                            />
                        </div>
                    </div>
                )}

                {currentView === 'policy' && (
                    <div className="max-w-4xl mx-auto h-full space-y-6">
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg dark:bg-[#111827] dark:border-white/10">
                            <div className="text-[13px] font-bold tracking-widest uppercase text-gray-500 mb-6 border-b border-gray-200 pb-4 dark:text-slate-400 dark:border-white/10">Traffic Rules Configuration</div>
                            <PolicySidebar 
                                currentState={currentState}
                                onStateChange={setCurrentState}
                            />
                        </div>
                    </div>
                )}

                {currentView === 'agent' && (
                    <div className="max-w-5xl mx-auto h-full flex flex-col gap-6">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-white/10">
                            <h2 className="text-xl font-bold text-gray-900 tracking-tight dark:text-white">AI Vision & Automation Engine</h2>
                            <button 
                                onClick={() => setIsAIVisionModalOpen(true)}
                                className="bg-purple-700/10 border border-purple-200 text-yellow-600 rounded-full px-4 py-2 text-sm font-bold hover:bg-purple-700/20 flex items-center gap-2 transition-colors"
                            >
                                <BrainCircuit className="w-4 h-4" /> Open Full AI Vision Architecture
                            </button>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl flex-1 flex flex-col min-h-[500px] shadow-lg dark:bg-[#111827] dark:border-white/10">
                            <div className="text-[11px] font-bold tracking-widest uppercase text-gray-500 p-6 pb-4 border-b border-gray-200 dark:text-slate-400 dark:border-white/10">Real-time AI Activity Feed</div>
                            <div className="flex-1 overflow-hidden p-4">
                                <Notifications logs={logs.filter(l => l.type === 'agent' || l.type === 'upload')} className="h-full border-0 bg-transparent rounded-none p-0 overflow-y-auto" />
                            </div>
                        </div>
                    </div>
                )}

                {currentView === 'system' && (
                    <div className="max-w-4xl mx-auto h-full space-y-6">
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg dark:bg-[#111827] dark:border-white/10">
                            <div className="text-[13px] font-bold tracking-widest uppercase text-gray-500 mb-6 border-b border-gray-200 pb-4 dark:text-slate-400 dark:border-white/10">Vehicle Telemetry & Diagnostics</div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between"><span className="text-sm font-bold text-gray-500 flex items-center gap-2 dark:text-slate-400"><Cpu className="w-4 h-4"/> OBD-II Link</span><span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded">CONNECTED</span></div>
                                    <div className="flex items-center justify-between"><span className="text-sm font-bold text-gray-500 flex items-center gap-2 dark:text-slate-400"><Satellite className="w-4 h-4"/> Satellite Link</span><span className="text-xs font-mono text-blue-400 font-bold bg-blue-500/10 px-2.5 py-1 rounded">12 SATS LOCK</span></div>
                                    <div className="flex items-center justify-between"><span className="text-sm font-bold text-gray-500 flex items-center gap-2 dark:text-slate-400"><MapPin className="w-4 h-4"/> GPS Precision</span><span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded">± 1.2m</span></div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between"><span className="text-sm font-bold text-gray-500 flex items-center gap-2 dark:text-slate-400"><Database className="w-4 h-4"/> S3 Evidence Upload</span><span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded">ONLINE</span></div>
                                    <div className="flex items-center justify-between"><span className="text-sm font-bold text-gray-500 flex items-center gap-2 dark:text-slate-400"><AlertTriangle className="w-4 h-4"/> Emergency SOS</span><span className="text-xs font-mono text-yellow-600 font-bold bg-yellow-500/10 px-2.5 py-1 rounded">ARMED</span></div>
                                    <div className="flex items-center justify-between"><span className="text-sm font-bold text-gray-500 flex items-center gap-2 dark:text-slate-400"><ShieldCheck className="w-4 h-4"/> Edge AI Node</span><span className="text-xs font-mono text-yellow-600 font-bold bg-purple-700/10 px-2.5 py-1 rounded">ACTIVE v2.0</span></div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg dark:bg-[#111827] dark:border-white/10">
                             <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-white/10">
                                 <div className="text-[13px] font-bold tracking-widest uppercase text-gray-500 dark:text-slate-400">Driver Monitoring System (DMS)</div>
                                 <span className="text-xs font-mono text-yellow-600 font-bold bg-purple-700/10 px-2 py-0.5 rounded border border-purple-200">CABIN CAMERA ONLINE</span>
                             </div>
                             <CabinCameraAgent 
                                currentState={currentState}
                                onViolation={(rule, msg) => {
                                    const fine = getFineAmount(currentState, rule);
                                    const time = new Date().toLocaleTimeString();
                                    addLog('violation', `DMS DETECTED: ${msg}`, `Time: ${time} | Fine: ${fine !== "Court Challan" && fine !== "N/A" ? "₹" : ""}${fine} | Rule: ${rule} | Source: Cabin Camera`);
                                    addLog('upload', `[AI Agent] notify_driver_and_authorities`, `DMS violation logged for ${rule}.`);
                                    
                                    if (audioEnabledRef.current) {
                                         try {
                                             const utterance = new SpeechSynthesisUtterance(`Warning. ${msg}`);
                                             window.speechSynthesis.speak(utterance);
                                         } catch(e) {}
                                    }
                                }}
                                onWarning={(msg) => {
                                    addLog('info', `DMS ALERT: ${msg}`, `Source: Cabin Camera`);
                                    if (audioEnabledRef.current) {
                                        try {
                                            const utterance = new SpeechSynthesisUtterance("Driver warning. " + msg);
                                            window.speechSynthesis.speak(utterance);
                                        } catch(e) {}
                                    }
                                }}
                            />
                        </div>
                    </div>
                )}
                
                {currentView === 'diagnostics' && (
                    <div className="max-w-5xl mx-auto h-full flex flex-col gap-6">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-white/10">
                            <h2 className="text-xl font-bold text-gray-900 tracking-tight dark:text-white">Vehicle Diagnostics & Telemetry</h2>
                            <button 
                                onClick={() => setIsObdScannerModalOpen(true)}
                                className="bg-yellow-600/10 border border-yellow-600/30 text-yellow-600 rounded-full px-4 py-2 text-sm font-bold hover:bg-yellow-600/20 flex items-center gap-2 transition-colors"
                            >
                                <Activity className="w-4 h-4" /> Run Deep Scan (OBD-II)
                            </button>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg dark:bg-[#111827] dark:border-white/10">
                                 <ObdScannerConsole tirePressure={tirePressure} engineTemp={engineTemp} />
                            </div>
                            <div className="space-y-6">
                                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg dark:bg-[#111827] dark:border-white/10">
                                    <div className="text-[13px] font-bold tracking-widest uppercase text-gray-500 mb-6 border-b border-gray-200 pb-4 dark:text-slate-400 dark:border-white/10">Live Sensor Data</div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-white/5">
                                            <span className="text-gray-500 dark:text-slate-400 text-sm font-medium flex items-center gap-2"><Gauge className="w-4 h-4" /> Fuel Level</span>
                                            <span className="text-gray-900 dark:text-white font-mono font-bold">{fuelLevel.toFixed(1)}%</span>
                                        </div>
                                        <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-white/5">
                                            <span className="text-gray-500 dark:text-slate-400 text-sm font-medium flex items-center gap-2"><Activity className="w-4 h-4" /> Odometer</span>
                                            <span className="text-gray-900 dark:text-white font-mono font-bold">{odometer.toFixed(1)} km</span>
                                        </div>
                                        <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-white/5">
                                            <span className="text-gray-500 dark:text-slate-400 text-sm font-medium flex items-center gap-2"><Database className="w-4 h-4" /> Trip Distance</span>
                                            <span className="text-gray-900 dark:text-white font-mono font-bold">{tripDistance.toFixed(1)} km</span>
                                        </div>
                                        <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-white/5">
                                            <span className="text-gray-500 dark:text-slate-400 text-sm font-medium flex items-center gap-2"><Cpu className="w-4 h-4" /> Engine RPM</span>
                                            <span className="text-gray-900 dark:text-white font-mono font-bold">{Math.round(speed * 25)} RPM</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {(currentView === 'analytics' || currentView === 'evidence') && (
                    <div className="flex h-full items-center justify-center text-gray-400 dark:text-slate-500">
                        <div className="text-center space-y-4">
                            <Activity className="w-12 h-12 mx-auto text-slate-600" />
                            <div className="text-lg font-bold tracking-widest uppercase">Module Inactive</div>
                            <p className="text-sm">This module is currently collecting historical data.</p>
                        </div>
                    </div>
                )}
            </main>
        </div>

        <VahanModal isOpen={isVahanModalOpen} onClose={() => setIsVahanModalOpen(false)} data={vahanData} isLoading={isVahanLoading} />
        <AIVisionModal 
          isOpen={isAIVisionModalOpen} 
          onClose={() => setIsAIVisionModalOpen(false)} 
          onViolationDetected={(rule) => {
              const fine = getFineAmount(currentState, rule);
              const time = new Date().toLocaleTimeString();
              addLog('violation', `AI VISION DETECTED: ${rule}`, `Time: ${time} | Fine: ${fine !== "Court Challan" && fine !== "N/A" ? "₹" : ""}${fine} | Rule: ${rule} | Camera ID: CAM-${Math.floor(Math.random()*1000)}`);
              addLog('upload', `[AI Agent] report_to_authorities(target="Traffic Police") triggered`, `Violator reported for ${rule} (Live Vision). Fine: ${fine !== "Court Challan" && fine !== "N/A" ? "₹" : ""}${fine}. Timestamp: ${time}.`);
          }}
        />
        <ObdScannerModal isOpen={isObdScannerModalOpen} onClose={() => setIsObdScannerModalOpen(false)} />
    </div>
  );
}

