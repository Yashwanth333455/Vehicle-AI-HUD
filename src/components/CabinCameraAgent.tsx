import React, { useEffect, useRef, useState, useCallback } from "react";
import { Camera, AlertCircle, EyeOff, NavigationOff } from "lucide-react";
import { getFineAmount, StateName } from "./PolicySidebar";

interface Props {
  currentState: StateName;
  onViolation: (rule: string, message: string) => void;
  onWarning: (message: string) => void;
}

export function CabinCameraAgent({
  currentState,
  onViolation,
  onWarning,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [hasCameraError, setHasCameraError] = useState(false);
  const [lastScan, setLastScan] = useState("Monitoring Driver...");

  const [sleepinessScore, setSleepinessScore] = useState(0);
  const scoreRef = useRef(0);
  const simulatedStateRef = useRef<"normal" | "drowsy" | "distracted">(
    "normal",
  );

  useEffect(() => {
    let stream: MediaStream | null = null;
    let baselineInterval: ReturnType<typeof setInterval>;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsActive(true);
        setHasCameraError(false);
      } catch (e) {
        console.error("Cabin camera failed:", e);
        setHasCameraError(true);
        setIsActive(false); // Can't be active if we have an error
        setLastScan("Camera Offline: Check Permissions");
      }

      baselineInterval = setInterval(() => {
        const prevScore = scoreRef.current;
        let newScore = prevScore - 5; // Passive decay by 5 per interval
        if (newScore < 0) newScore = 0;
        if (newScore > 100) newScore = 100;

        scoreRef.current = newScore;
        setSleepinessScore(newScore);

        if (newScore === 0 && lastScan === "Monitoring Driver...") {
          setLastScan("Driver profile normal. Yaw/Pitch/EAR nominal.");
        } else if (newScore === 0) {
          setLastScan("Driver profile normal. Yaw/Pitch/EAR nominal.");
        }
      }, 5000); // Decay every 5 seconds
    };

    startCamera();

    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
      clearInterval(baselineInterval);
    };
  }, []); // Removed onViolation/onWarning from deps to avoid triggering reinstantiation unnecessarily

  const triggerEvent = (type: "drowsy" | "distracted") => {
    simulatedStateRef.current = type;
    setTimeout(() => {
      if (simulatedStateRef.current === type)
        simulatedStateRef.current = "normal";
    }, 4000);

    if (type === "drowsy") {
      let newScore = scoreRef.current + 35;
      if (newScore > 100) newScore = 100;
      scoreRef.current = newScore;
      setSleepinessScore(newScore);

      if (newScore >= 70) {
        const msg =
          "CRITICAL FATIGUE: Micro-sleep detected. Pull over immediately.";
        setLastScan(msg);
        onWarning(msg);
        setTimeout(() => setLastScan("Monitoring Driver..."), 4000);
      } else {
        const msg = "Drowsiness Alert: Moderate blink rate increase.";
        setLastScan(msg);
        onWarning(msg);
        setTimeout(() => setLastScan("Monitoring Driver..."), 4000);
      }
    } else if (type === "distracted") {
      let newScore = scoreRef.current + 25;
      if (newScore > 100) newScore = 100;
      scoreRef.current = newScore;
      setSleepinessScore(newScore);

      if (newScore >= 70) {
        const msg = "Severe Distraction: Extreme head pose > 5s.";
        setLastScan(msg);
        onWarning(msg);
        setTimeout(() => setLastScan("Monitoring Driver..."), 4000);
      } else {
        const msg = "Fatigue Alert: Sustained head deviation.";
        setLastScan(msg);
        onWarning(msg);
        setTimeout(() => setLastScan("Monitoring Driver..."), 4000);
      }
    }
  };

  // Canvas processing for AI bounding boxes
  useEffect(() => {
    if (!isActive || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrame: number;

    const processFrame = () => {
      if (ctx) {
        const vWidth = video.videoWidth || 64;
        const vHeight = video.videoHeight || 64;

        if (canvas.width !== vWidth || canvas.height !== vHeight) {
          canvas.width = vWidth;
          canvas.height = vHeight;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw face tracking reticle
        const faceX = canvas.width / 2;
        const faceY = canvas.height / 2.5;
        const size = Math.min(canvas.width, canvas.height) * 0.4;

        const state = simulatedStateRef.current;

        ctx.strokeStyle =
          state === "drowsy" || state === "distracted" ? "#ef4444" : "#22c55e";
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 10]);
        ctx.strokeRect(faceX - size / 2, faceY - size / 2, size, size);

        ctx.setLineDash([]);

        const now = Date.now();
        if (now % 2000 < 100) {
          ctx.fillStyle =
            state === "normal"
              ? "rgba(34, 197, 94, 0.2)"
              : "rgba(239, 68, 68, 0.2)";
          ctx.fillRect(0, faceY - 2, canvas.width, 4);
        }

        // Metrics overlay on Canvas relative to width 64
        const scale = canvas.width / 64;
        ctx.fillStyle = state === "normal" ? "#22c55e" : "#ef4444";
        ctx.font = `bold ${Math.floor(6 * scale)}px monospace`;

        // Simulate jittery metrics
        let yaw = (Math.random() * 4 - 2).toFixed(1);
        let pitch = (Math.random() * 4 - 2).toFixed(1);
        let ear = (0.28 + Math.random() * 0.05).toFixed(2);
        let blinkRate = Math.floor(12 + Math.random() * 3);

        if (state === "drowsy") {
          ear = (0.15 + Math.random() * 0.03).toFixed(2); // eyes closed
          blinkRate = Math.floor(25 + Math.random() * 5); // high blink rate
        } else if (state === "distracted") {
          yaw = (35 + Math.random() * 10).toFixed(1); // head turned
        }

        ctx.fillText(`Y:${yaw}°`, 2 * scale, 8 * scale);
        ctx.fillText(`P:${pitch}°`, 2 * scale, 15 * scale);
        ctx.fillText(`E:${ear}`, canvas.width - 25 * scale, 8 * scale);
        ctx.fillText(`B:${blinkRate}`, canvas.width - 25 * scale, 15 * scale);
      }
      animationFrame = requestAnimationFrame(processFrame);
    };

    // Start processing immediately so it works even if video doesn't play
    animationFrame = requestAnimationFrame(processFrame);

    video.addEventListener("play", () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(processFrame);
    });

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [isActive]);

  return (
    <div className="absolute bottom-4 left-4 z-40 group flex flex-col gap-2">
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 duration-300 px-1 pointer-events-none group-hover:pointer-events-auto">
        <button
          onClick={() => triggerEvent("drowsy")}
          className="bg-white/90 backdrop-blur border border-gray-200 p-2 rounded-lg hover:bg-white/10 text-gray-900 shadow-lg transition-colors dark:border-white/10 dark:text-white"
          title="Simulate Drowsiness"
        >
          <EyeOff className="w-4 h-4 text-yellow-600" />
        </button>
        <button
          onClick={() => triggerEvent("distracted")}
          className="bg-white/90 backdrop-blur border border-gray-200 p-2 rounded-lg hover:bg-white/10 text-gray-900 shadow-lg transition-colors dark:border-white/10 dark:text-white"
          title="Simulate Distraction"
        >
          <NavigationOff className="w-4 h-4 text-purple-400" />
        </button>
      </div>
      <div className="bg-white/80 backdrop-blur-md rounded-xl border border-gray-200 p-2 flex items-center gap-3 shadow-2xl transition-all w-72 dark:bg-[#111827]/90 dark:border-white/10 relative overflow-hidden">
        {hasCameraError && (
            <div className="absolute inset-0 bg-red-500/10 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-2 border border-red-500/30">
                <AlertCircle className="w-5 h-5 text-red-500 mb-1" />
                <p className="text-[10px] font-bold text-red-600 dark:text-red-400">Camera Unavailable</p>
                <p className="text-[8px] text-red-500/80 leading-tight px-2 mt-0.5">Please allow browser permissions or connect a camera to use DMS tracking.</p>
            </div>
        )}
        <div className="relative w-16 h-16 rounded overflow-hidden shadow-inner border border-gray-200 bg-black flex-shrink-0 dark:border-white/10">
          {!isActive && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Camera className="w-5 h-5 text-slate-600" />
            </div>
          )}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none object-cover opacity-70 group-hover:opacity-100 transition-opacity"
          />
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1.5 text-[10px] uppercase tracking-wider text-emerald-400 font-bold mb-1">
            <div className="flex items-center gap-1.5">
              {isActive ? (
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_5px_#10b981]" />
              ) : (
                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full" />
              )}
              DMS Active
            </div>
            {isActive && (
              <span
                className={
                  sleepinessScore > 70
                    ? "text-red-400"
                    : sleepinessScore > 40
                      ? "text-yellow-600"
                      : "text-emerald-400"
                }
              >
                Fatigue: {Math.round(sleepinessScore)}%
              </span>
            )}
          </div>

          {isActive && (
            <div className="flex items-center gap-2 mb-1.5">
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden dark:bg-slate-800">
                <div
                  className={`h-full transition-all duration-1000 ${sleepinessScore > 70 ? "bg-red-500" : sleepinessScore > 40 ? "bg-yellow-500" : "bg-emerald-500"}`}
                  style={{ width: `${sleepinessScore}%` }}
                />
              </div>
            </div>
          )}
          <span
            className="text-[10px] text-gray-700 truncate dark:text-slate-200"
            title={lastScan}
          >
            {lastScan}
          </span>
        </div>
      </div>
    </div>
  );
}
