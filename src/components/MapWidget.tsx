import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Camera } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { cn } from '../lib/utils';

// Fix for default leaflet marker icon not loading
// @ts-ignore
import iconUrl from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
// @ts-ignore
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

// Component to recenter map when center prop changes
function MapRecenter({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([center.lat, center.lng], map.getZoom());
  }, [center, map]);
  return null;
}

interface MapWidgetProps {
  className?: string;
  center: { lat: number; lng: number };
  speed?: number;
  speedLimit?: number;
  onCaptureEvidence?: (url: string) => void;
  disableControls?: boolean;
  markers?: {lat: number, lng: number, title?: string}[];
}

export function MapWidget({ className, center, speed = 0, speedLimit = 0, onCaptureEvidence, disableControls = false, markers = [] }: MapWidgetProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const centerRef = useRef(center);
  useEffect(() => {
    centerRef.current = center;
  }, [center]);

  const fetchRoute = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  }, []);

  const captureEvidence = useCallback(async () => {
    try {
      setIsCapturing(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).catch(() => null);
      
      let videoWidth = 1280;
      let videoHeight = 720;
      let videoImage: HTMLVideoElement | null = null;
      
      if (stream) {
          const video = document.createElement('video');
          video.srcObject = stream;
          await video.play().catch(() => {});
          
          await new Promise(res => { video.onplaying = res; setTimeout(res, 500); });
          if (video.videoWidth) {
              videoWidth = video.videoWidth;
              videoHeight = video.videoHeight;
          }
          videoImage = video;
      }

      const canvas = document.createElement('canvas');
      canvas.width = videoWidth;
      canvas.height = videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
          if (videoImage && videoImage.readyState >= 2) {
              ctx.drawImage(videoImage, 0, 0, canvas.width, canvas.height);
          } else {
              // Fallback simulated camera feed
              ctx.fillStyle = '#1e293b';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.fillStyle = '#0f172a';
              ctx.fillRect(0, canvas.height / 2, canvas.width, canvas.height / 2); // road
              
              // drawing a simulated view
              ctx.strokeStyle = '#475569';
              ctx.lineWidth = 4;
              ctx.beginPath();
              ctx.moveTo(canvas.width / 2, canvas.height / 2);
              ctx.lineTo(0, canvas.height);
              ctx.moveTo(canvas.width / 2, canvas.height / 2);
              ctx.lineTo(canvas.width, canvas.height);
              ctx.stroke();
          }
          
          // Burn timestamp & location
          ctx.fillStyle = 'white';
          ctx.font = 'bold 36px monospace';
          ctx.shadowColor = 'black';
          ctx.shadowBlur = 6;
          ctx.fillText(`TIMESTAMP: ${new Date().toISOString()}`, 30, canvas.height - 100);
          ctx.fillText(`LOCATION:  ${centerRef.current.lat.toFixed(6)}, ${centerRef.current.lng.toFixed(6)}`, 30, canvas.height - 50);
          
          // Set actual image data
          setTimeout(() => {
              const dataUrl = canvas.toDataURL('image/jpeg', 0.6); // Compression to prevent huge lists
              if (onCaptureEvidence) {
                  onCaptureEvidence(dataUrl);
              }
              setIsCapturing(false);
          }, 1200);
      }
      
      if (stream) {
          stream.getTracks().forEach(t => t.stop());
      }
    } catch(err) {
        console.error(err);
        setIsCapturing(false);
    }
  }, [onCaptureEvidence]);

  return (
    <div className={cn("relative overflow-hidden bg-slate-900 border border-gray-200 rounded-2xl flex flex-col p-0 min-h-[400px] z-0", className)}>
        {/* Real-time Map Background */}
        <MapContainer 
            center={[center.lat, center.lng]} 
            zoom={15} 
            scrollWheelZoom={false} 
            style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 0 }}
            zoomControl={false}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                className="map-tiles"
            />
            <MapRecenter center={center} />
            <Marker position={[center.lat, center.lng]} />
            
            {markers.map((m, i) => (
                <Marker key={i} position={[m.lat, m.lng]} title={m.title} />
            ))}
        </MapContainer>

        {/* Speed Limit Indicator */}
        {!disableControls && speedLimit > 0 && (
          <div className={cn(
            "absolute bottom-6 right-6 z-10 w-16 h-16 bg-white rounded-full flex flex-col items-center justify-center border-4 border-red-600 shadow-xl transition-all duration-300",
            speed > speedLimit ? "animate-pulse shadow-[0_0_20px_rgba(220,38,38,0.8)] scale-110" : "shadow-black/50"
          )}>
            <span className="text-[10px] font-bold text-black uppercase leading-none mt-1">Limit</span>
            <span className="text-xl font-bold text-black leading-none">{speedLimit}</span>
          </div>
        )}

        {/* Capture Buttons */}
        {!disableControls && (
          <button 
              onClick={captureEvidence}
              disabled={isCapturing}
              className="absolute bottom-6 left-6 z-10 bg-rose-600 text-gray-900 rounded-full p-4 shadow-[0_0_20px_rgba(225,29,72,0.6)] hover:bg-rose-500 hover:scale-105 transition-all text-xs font-bold uppercase tracking-wider flex items-center space-x-2 border border-rose-400 dark:text-white"
          >
              {isCapturing ? (
                  <div className="w-5 h-5 border-2 rounded-full border-t-transparent animate-spin border-white" />
              ) : (
                  <Camera className="w-5 h-5" />
              )}
              <span>{isCapturing ? 'Uploading...' : 'Capture Evidence'}</span>
          </button>
        )}

        {!disableControls && (
          <button 
              onClick={fetchRoute}
              disabled={isRefreshing}
              className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md border border-gray-200 px-4 py-2 rounded-lg text-xs font-medium text-gray-900 shadow-lg hover:bg-gray-100 transition-colors flex items-center space-x-2 z-10 dark:border-white/10 dark:text-white dark:hover:bg-slate-800"
          >
              <div className={cn("w-2 h-2 rounded-full", isRefreshing ? "bg-yellow-400 animate-pulse" : "bg-emerald-400")} />
              <span>{isRefreshing ? 'Updating Traffic...' : 'Live Traffic'}</span>
          </button>
        )}

        <style>
          {`
            .map-tiles {
              filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
            }
          `}
        </style>
    </div>
  );
}
