import { create } from 'zustand';
import { ViewMode } from '../components/SidebarNav';
import { NotificationLog } from '../components/Notifications';
import { VahanData } from '../components/VahanModal';
import { StateName } from '../components/PolicySidebar';

interface AppState {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  
  mediaError: { message: string; subMessage: string } | null;
  setMediaError: (error: { message: string; subMessage: string } | null) => void;
  
  isListening: boolean;
  setIsListening: (isListening: boolean) => void;
  
  currentView: ViewMode;
  setCurrentView: (view: ViewMode) => void;
  
  speed: number;
  setSpeed: (speed: number | ((prev: number) => number)) => void;
  
  gForce: number;
  setGForce: (gForce: number) => void;
  
  accelX: number;
  setAccelX: (accelX: number) => void;
  
  accelY: number;
  setAccelY: (accelY: number) => void;
  
  currentState: StateName;
  setCurrentState: (state: StateName) => void;
  
  safetyScore: number;
  setSafetyScore: (score: number | ((prev: number) => number)) => void;
  
  logs: NotificationLog[];
  addLog: (type: NotificationLog['type'], message: string, metadata?: string, imageUrl?: string) => void;
  setLogs: (logs: NotificationLog[]) => void;
  
  center: { lat: number; lng: number };
  setCenter: (center: { lat: number; lng: number } | ((prev: { lat: number; lng: number }) => { lat: number; lng: number })) => void;
  
  isRashDriving: boolean;
  setIsRashDriving: (isRashDriving: boolean) => void;
  
  audioEnabled: boolean;
  setAudioEnabled: (audioEnabled: boolean) => void;
  
  gpsVerified: boolean;
  setGpsVerified: (verified: boolean) => void;
  
  fuelLevel: number;
  setFuelLevel: (level: number | ((prev: number) => number)) => void;
  
  tirePressure: [number, number, number, number];
  setTirePressure: (pressure: [number, number, number, number] | ((prev: [number, number, number, number]) => [number, number, number, number])) => void;
  
  engineTemp: number;
  setEngineTemp: (temp: number | ((prev: number) => number)) => void;
  
  hasAccident: boolean;
  setHasAccident: (hasAccident: boolean) => void;
  
  odometer: number;
  setOdometer: (odometer: number | ((prev: number) => number)) => void;
  
  tripDistance: number;
  setTripDistance: (distance: number | ((prev: number) => number)) => void;
  
  isVahanModalOpen: boolean;
  setIsVahanModalOpen: (isOpen: boolean) => void;
  
  isVahanLoading: boolean;
  setIsVahanLoading: (isLoading: boolean) => void;
  
  vahanData: VahanData | null;
  setVahanData: (data: VahanData | null) => void;
  
  isAIVisionModalOpen: boolean;
  setIsAIVisionModalOpen: (isOpen: boolean) => void;
  
  isObdScannerModalOpen: boolean;
  setIsObdScannerModalOpen: (isOpen: boolean) => void;
}

const uid = () => Math.random().toString(36).substr(2, 9);

export const useAppStore = create<AppState>((set) => ({
  theme: typeof window !== 'undefined' ? ((localStorage.getItem('theme') as 'light' | 'dark') || 'light') : 'light',
  setTheme: (theme) => {
    if (typeof window !== 'undefined') localStorage.setItem('theme', theme);
    set({ theme });
  },
  
  mediaError: null,
  setMediaError: (mediaError) => set({ mediaError }),
  
  isListening: false,
  setIsListening: (isListening) => set({ isListening }),
  
  currentView: 'dashboard',
  setCurrentView: (currentView) => set({ currentView }),
  
  speed: 70,
  setSpeed: (speed) => set((state) => ({ speed: typeof speed === 'function' ? speed(state.speed) : speed })),
  
  gForce: 0.18,
  setGForce: (gForce) => set({ gForce }),
  
  accelX: 0,
  setAccelX: (accelX) => set({ accelX }),
  
  accelY: 0,
  setAccelY: (accelY) => set({ accelY }),
  
  currentState: 'Telangana',
  setCurrentState: (currentState) => set({ currentState }),
  
  safetyScore: 88,
  setSafetyScore: (safetyScore) => set((state) => ({ safetyScore: typeof safetyScore === 'function' ? safetyScore(state.safetyScore) : safetyScore })),
  
  logs: [],
  addLog: (type, message, metadata, imageUrl) => set((state) => ({ logs: [...state.logs.slice(-49), { id: uid(), timestamp: Date.now(), type, message, metadata, imageUrl }] })),
  setLogs: (logs) => set({ logs }),
  
  center: { lat: 17.3850, lng: 78.4867 },
  setCenter: (center) => set((state) => ({ center: typeof center === 'function' ? center(state.center) : center })),
  
  isRashDriving: false,
  setIsRashDriving: (isRashDriving) => set({ isRashDriving }),
  
  audioEnabled: true,
  setAudioEnabled: (audioEnabled) => set({ audioEnabled }),
  
  gpsVerified: true,
  setGpsVerified: (gpsVerified) => set({ gpsVerified }),
  
  fuelLevel: 85,
  setFuelLevel: (fuelLevel) => set((state) => ({ fuelLevel: typeof fuelLevel === 'function' ? fuelLevel(state.fuelLevel) : fuelLevel })),
  
  tirePressure: [32, 32, 32, 32],
  setTirePressure: (tirePressure) => set((state) => ({ tirePressure: typeof tirePressure === 'function' ? tirePressure(state.tirePressure) : tirePressure })),
  
  engineTemp: 90,
  setEngineTemp: (engineTemp) => set((state) => ({ engineTemp: typeof engineTemp === 'function' ? engineTemp(state.engineTemp) : engineTemp })),
  
  hasAccident: false,
  setHasAccident: (hasAccident) => set({ hasAccident }),
  
  odometer: 49999.8,
  setOdometer: (odometer) => set((state) => ({ odometer: typeof odometer === 'function' ? odometer(state.odometer) : odometer })),
  
  tripDistance: 0.0,
  setTripDistance: (tripDistance) => set((state) => ({ tripDistance: typeof tripDistance === 'function' ? tripDistance(state.tripDistance) : tripDistance })),
  
  isVahanModalOpen: false,
  setIsVahanModalOpen: (isVahanModalOpen) => set({ isVahanModalOpen }),
  
  isVahanLoading: false,
  setIsVahanLoading: (isVahanLoading) => set({ isVahanLoading }),
  
  vahanData: null,
  setVahanData: (vahanData) => set({ vahanData }),
  
  isAIVisionModalOpen: false,
  setIsAIVisionModalOpen: (isAIVisionModalOpen) => set({ isAIVisionModalOpen }),
  
  isObdScannerModalOpen: false,
  setIsObdScannerModalOpen: (isObdScannerModalOpen) => set({ isObdScannerModalOpen })
}));
