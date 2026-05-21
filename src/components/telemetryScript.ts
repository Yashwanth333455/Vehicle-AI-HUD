export default `import obd
import time
import json
import hmac
import hashlib
import requests
import cv2

SECRET_KEY = b"STATE_POLICE_SECRET_V1"

# Connect to ELM327 Bluetooth/WiFi Adapter
# connection = obd.OBD() # Auto-connect to USB or Bluetooth

POLICY = {
    "Telangana": {"limit": 80, "fine": 1000},
    "Andhra Pradesh": {"limit": 80, "fine": 800},
    "Maharashtra": {"limit": 100, "fine": 1500}
}

def sign_data(payload):
    signature = hmac.new(SECRET_KEY, json.dumps(payload).encode(), hashlib.sha256).hexdigest()
    return signature

def capture_violation_evidence(speed, limit):
    # Capture frame from Pi Camera using OpenCV
    # cam = cv2.VideoCapture(0)
    # ret, frame = cam.read()
    
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    text = f"SPEED: {speed} km/h | LIMIT: {limit} km/h | TS: {timestamp}"
    
    # Overlay "Burned-in Timestamp"
    # cv2.putText(frame, text, (10, getattr(frame, 'shape', (50,))[0] - 20), 
    #             cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
    # cv2.imwrite("evidence.jpg", frame)
    
    print(f"[PI CAMERA] Captured evidence.jpg with watermark: {text}")

def get_telemetry():
    print("Initializing OBD Telemetry... [Simulated for UI Demo]")
    current_state = "Telangana"
    
    # Normally inside a while loop:
    # speed_cmd = obd.commands.SPEED
    # response = connection.query(speed_cmd)
    # speed = response.value.to("km/h").magnitude if response.value else 0
    
    # Simulated values
    speed = 95 
    limit = POLICY[current_state]["limit"]
    
    is_violation = speed > limit
    
    data = {
        "speed": speed,
        "limit": limit,
        "state": current_state,
        "timestamp": time.time(),
        "is_violation": is_violation
    }
    
    data["signature"] = sign_data(data)
    
    if is_violation:
        print(f"Violation Detected! {speed} km/h > {limit} km/h")
        capture_violation_evidence(speed, limit)
        
    print(json.dumps(data))
    
if __name__ == "__main__":
    get_telemetry()
`
