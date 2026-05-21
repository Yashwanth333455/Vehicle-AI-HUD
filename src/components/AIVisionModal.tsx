import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X, Cpu, Camera, Focus, ScanLine, Network, Webcam } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onViolationDetected?: (rule: string) => void;
}

export function AIVisionModal({ isOpen, onClose, onViolationDetected }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasCameraError, setHasCameraError] = useState(false);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (isOpen) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(mediaStream => {
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
          setHasCameraError(false);
        })
        .catch(err => {
          console.error("Camera error:", err);
          // Fallback to any camera if environment camera fails
          navigator.mediaDevices.getUserMedia({ video: true })
            .then(mediaStream => {
              setStream(mediaStream);
              if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
              }
              setHasCameraError(false);
            })
            .catch(fallbackErr => {
               console.error("Fallback camera error:", fallbackErr);
               setHasCameraError(true);
            });
        });
    } else {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Simulated Edge AI Processing
  useEffect(() => {
    if (!isOpen || hasCameraError || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    let ctx = canvas.getContext('2d');
    
    let lastScanTime = 0;
    
    const possibleViolations = [
      "Driving without helmet",
      "Using mobile phone while driving",
      "Triple riding on two-wheeler",
      "Driving without seat belt (driver)",
    ];

    const processFrame = (time: number) => {
      if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
        // Match canvas dimensions to video
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Every 3 seconds, simulate a targeted analysis
        if (time - lastScanTime > 3000) {
           lastScanTime = time;
           // 30% chance to detect a violation
           if (Math.random() < 0.3 && onViolationDetected) {
               const violation = possibleViolations[Math.floor(Math.random() * possibleViolations.length)];
               onViolationDetected(violation);
               
               // Draw a red bounding box for the violation
               const boxWidth = canvas.width * 0.4;
               const boxHeight = canvas.height * 0.4;
               const boxX = (canvas.width - boxWidth) * Math.random();
               const boxY = (canvas.height - boxHeight) * Math.random();
               
               ctx.strokeStyle = '#ef4444'; // red-500
               ctx.lineWidth = 4;
               ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
               
               ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
               ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
               
               ctx.fillStyle = '#ef4444';
               ctx.font = 'bold 24px monospace';
               ctx.fillText(`VIOLATION: ${violation}`, boxX, boxY > 30 ? boxY - 10 : boxY + boxHeight + 25);
               ctx.fillText(`CONF: ${(0.85 + Math.random() * 0.14).toFixed(2)}`, boxX, boxY > 30 ? boxY - 35 : boxY + boxHeight + 50);
               
               // Hold the bounding box for 1 second by not clearing immediately
               const holdTime = time;
               const holdFrame = (t: number) => {
                  if (t - holdTime < 1500) {
                      animationRef.current = requestAnimationFrame(holdFrame);
                  } else {
                      animationRef.current = requestAnimationFrame(processFrame);
                  }
               };
               animationRef.current = requestAnimationFrame(holdFrame);
               return;
           }
        }

        // Draw generic scanning boxes occasionally
        if (Math.random() < 0.05) {
            const boxWidth = canvas.width * (0.1 + Math.random() * 0.3);
            const boxHeight = canvas.height * (0.1 + Math.random() * 0.3);
            const boxX = (canvas.width - boxWidth) * Math.random();
            const boxY = (canvas.height - boxHeight) * Math.random();
            
            ctx.strokeStyle = '#22d3ee'; // cyan-400
            ctx.lineWidth = 2;
            ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
            
            ctx.fillStyle = '#22d3ee';
            ctx.font = '16px monospace';
            ctx.fillText(`OBJ DETECTED`, boxX, boxY > 20 ? boxY - 5 : boxY + boxHeight + 20);
        }
      }
      animationRef.current = requestAnimationFrame(processFrame);
    };

    video.addEventListener('play', () => {
       animationRef.current = requestAnimationFrame(processFrame);
    });

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isOpen, hasCameraError, onViolationDetected]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col dark:bg-[#111827] dark:border-white/10">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-[#0B0F14]">
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-yellow-600" />
            <h2 className="text-gray-900 font-medium dark:text-white">Agentic AI Vision Dashboard</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg text-gray-500 transition-colors dark:text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[85vh] space-y-6 text-gray-700 text-sm dark:text-slate-200">
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Live Camera Feed */}
            <div className="w-full lg:w-1/2 flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-yellow-600">
                  <Webcam className="w-4 h-4" />
                  <span className="font-semibold uppercase tracking-wider text-[11px]">Live ATCS Camera Feed</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] font-bold animate-pulse">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> REC
                </div>
              </div>
              
              <div className="relative bg-black rounded-lg border border-gray-200 overflow-hidden aspect-video flex-shrink-0 dark:border-white/10">
                {hasCameraError ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-4 text-center dark:text-slate-500">
                    <Camera className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-xs">Camera access denied or unavailable.</p>
                    <p className="text-[10px] mt-1 opacity-70">Please allow camera permissions to view the live dashboard.</p>
                  </div>
                ) : (
                  <>
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      muted 
                      className="w-full h-full object-cover"
                    />
                    <canvas 
                      ref={canvasRef} 
                      className="absolute inset-0 w-full h-full pointer-events-none object-cover"
                    />
                    {/* Simulated Overlays */}
                    <div className="absolute inset-0 pointer-events-none border-[rgba(0,255,255,0.1)] border">
                      <div className="absolute top-2 left-2 text-[9px] font-mono text-yellow-600 bg-black/50 px-1 rounded">
                        FPS: 29.97 | RES: 1080p
                      </div>
                      <div className="absolute bottom-2 right-2 text-[9px] font-mono text-yellow-600 bg-black/50 px-1 rounded">
                        MODEL: YOLOv8-TRAFFIC
                      </div>
                      
                      {/* Scanning Line */}
                      <div className="absolute top-0 left-0 w-full h-[1px] bg-cyan-400/50 shadow-[0_0_8px_rgba(0,255,255,0.8)] animate-[scan_2s_ease-in-out_infinite]" />
                      
                      {/* Target Reticle */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-purple-200 flex items-center justify-center opacity-70">
                         <div className="w-2 h-2 border-t border-l border-cyan-400 absolute top-0 left-0" />
                         <div className="w-2 h-2 border-t border-r border-cyan-400 absolute top-0 right-0" />
                         <div className="w-2 h-2 border-b border-l border-cyan-400 absolute bottom-0 left-0" />
                         <div className="w-2 h-2 border-b border-r border-cyan-400 absolute bottom-0 right-0" />
                      </div>
                    </div>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-500 leading-relaxed dark:text-slate-400">
                The visual sensor streams real-time frames to the edge node. Objects inside the frame are continuously analyzed.
              </p>
            </div>

            {/* Explanations */}
            <div className="w-full lg:w-1/2 flex flex-col space-y-4">
              <p className="text-gray-500 leading-relaxed text-xs dark:text-slate-400">
                Traffic violations like <strong>No Helmet</strong>, <strong>Mobile Phone Use</strong>, <strong>Triple Riding</strong>, and <strong>Fancy Number Plates</strong> cannot be detected by OBD telemetry or GPS alone. The Agentic AI relies on a sophisticated <strong>Computer Vision & Edge AI Infrastructure</strong>.
              </p>

              <div className="bg-gray-50 p-3 border border-gray-200 rounded-xl space-y-1.5 dark:bg-[#0B0F14] dark:border-white/10">
                  <div className="flex items-center gap-2 text-blue-400 mb-1">
                      <ScanLine className="w-3.5 h-3.5" />
                      <span className="font-semibold uppercase tracking-wider text-[10px]">Edge AI (YOLO/CNN Models)</span>
                  </div>
                  <div className="text-[11px] text-gray-500 leading-relaxed dark:text-slate-400">
                      Deep learning object detection models run simultaneously on edge servers. They draw bounding boxes to detect:
                      <ul className="list-disc list-inside mt-1 ml-1 space-y-0.5">
                          <li><strong>Triple Riding:</strong> Counting passenger bounds on a two-wheeler.</li>
                          <li><strong>No Helmet:</strong> Intersecting "head" and "helmet" bounds.</li>
                          <li><strong>Mobile Use:</strong> Device proximity to the face.</li>
                      </ul>
                  </div>
              </div>

              <div className="bg-gray-50 p-3 border border-gray-200 rounded-xl space-y-1.5 dark:bg-[#0B0F14] dark:border-white/10">
                  <div className="flex items-center gap-2 text-emerald-400 mb-1">
                      <Focus className="w-3.5 h-3.5" />
                      <span className="font-semibold uppercase tracking-wider text-[10px]">ANPR & Anomaly Detection</span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed dark:text-slate-400">
                      <strong>Automatic Number Plate Recognition (ANPR)</strong> isolates rules out fonts and formats <strong>"Fancy Plates"</strong> by comparing standard RTO dimensions and contrast ratios.
                  </p>
              </div>

              <div className="bg-gray-50 p-3 border border-gray-200 rounded-xl space-y-1.5 dark:bg-[#0B0F14] dark:border-white/10">
                  <div className="flex items-center gap-2 text-yellow-600 mb-1">
                      <Network className="w-3.5 h-3.5" />
                      <span className="font-semibold uppercase tracking-wider text-[10px]">Agentic Verification</span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed dark:text-slate-400">
                      Once a high-confidence vision anomaly is detected, the AI Agent activates. It queries the <strong>Vahan DB</strong>, applies the <strong>State Policy</strong>, and generates an e-Challan.
                  </p>
              </div>
            </div>
            
          </div>
          
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mt-2">
              <h3 className="text-blue-400 font-semibold text-[11px] tracking-wider uppercase mb-2">The AI Agent's Multi-Modal Workflow</h3>
              <ol className="list-decimal list-inside text-xs space-y-1 text-blue-200/80">
                  <li><strong>Visual Signal:</strong> Smart Camera captures a 4K snapshot of the violation.</li>
                  <li><strong>Inference:</strong> Edge AI classifies the image: <code>{"{"} "violation": "No Helmet", "confidence": 0.96 {"}"}</code>.</li>
                  <li><strong>Context Fetching:</strong> Agent queries Vahan (Vehicle Details) and the active jurisdiction rules.</li>
                  <li><strong>Enforcement Action:</strong> Agent constructs the e-Challan, logs the evidence, and dispatches the alert via the system notification feed.</li>
              </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
