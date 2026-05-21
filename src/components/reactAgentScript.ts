export default `import time
import requests

class ReActAgent:
    def __init__(self):
        self.state = "Telangana"
        self.violation_timer = 0
        self.warning_threshold_sec = 6  # 60s in real life, 6s for demo
        self.g_force_limit = 0.8
        
    def get_vehicle_telemetry(self):
        # In reality, this queries the OBD pipeline and Accelerometer (e.g. MPU6050)
        return {
            "speed": 105, # > 20% over 80 limit
            "g_force": 0.2,
            "state": self.state,
            "gps": {"lat": 17.3850, "lng": 78.4867},
            "plate": "TS 09 EZ 1234",
            "owner": "Y****** REDDY",
            "has_accident": False
        }
        
    def check_state_laws(self, state):
        laws = {
            "Telangana": {"speed_limit_highway": 80},
            "Andhra Pradesh": {"speed_limit_highway": 80},
            "Maharashtra": {"speed_limit_highway": 100}
        }
        return laws.get(state, {"speed_limit_highway": 80})
        
    def query_nearby_hospitals(self, gps):
        print(f"[ACTION] Querying map APIs for hospitals near {gps}...")
        return {"name": "City General Hospital", "distance": "1.2km"}
        
    def report_to_authorities(self, data, reason, target="Police"):
        if target == "Hospital":
            print(f"[ACTION] Alerting Nearest Hospital. Reason: {reason}")
            print(f"[ACTION] Payload: {{")
            print(f"            'vehicle': '{data.get('plate')}',")
            print(f"            'owner_name': '{data.get('owner')} (via Vahan API)',")
            print(f"            'severity': '{data.get('g_force')}g',")
            print(f"            'location': {data.get('gps')}")
            print(f"         }}")
        else:
            print(f"[ACTION] Triggering API Setu (Vahan API) lookup for vehicle plates...")
            print(f"[ACTION] Uploading Evidentiary Timestamped Image to AWS S3...")
            print(f"[ACTION] Reporting to Gov Webhook. Target: {target}, Reason: {reason}")
        
    def generate_audio_warning(self):
        print("[TTS] 'Warning. You are exceeding the speed limit. Please slow down.'")
        
    def run_cycle(self):
        telemetry = self.get_vehicle_telemetry()
        laws = self.check_state_laws(telemetry["state"])
        limit = laws["speed_limit_highway"]
        
        speed = telemetry["speed"]
        g_force = telemetry["g_force"]
        
        # Reasoning Step 1: Check for Major Accidents (e.g., impact drop, high g spike)
        if telemetry.get("has_accident", False) or g_force > 4.0:
            print("[THOUGHT] Severe impact detected! Accident confirmed. Initiating Hospital protocol.")
            self.report_to_authorities(telemetry, f"Severe accident detected with {g_force}g impact", target="Emergency Services")
            
            hospital = self.query_nearby_hospitals(telemetry["gps"])
            print(f"[THOUGHT] Nearest facility: {hospital['name']} ({hospital['distance']})")
            self.report_to_authorities(telemetry, f"Severe accident detected with {g_force}g impact", target="Hospital")
            return

        # Reasoning Step 2: Check G-Force (Rash Driving)
        if g_force > self.g_force_limit:
            print("[THOUGHT] High G-Force detected. Swerving/Rash Driving evident.")
            self.report_to_authorities(telemetry, "Rash Driving: G-Force > 0.8g", target="Traffic Police")
            return
            
        # Reasoning Step 3: Over speed limit > 20%
        if speed > (limit * 1.2):
            print(f"[THOUGHT] Speed {speed} is >20% over limit {limit}. Tracking duration...")
            self.violation_timer += 1
            
            if self.violation_timer >= self.warning_threshold_sec:
                print("[THOUGHT] Threshold exceeded! Action required.")
                self.report_to_authorities(telemetry, "Speeding >20% for prolonged duration", target="Traffic Police")
                self.generate_audio_warning()
        else:
            self.violation_timer = 0
            
if __name__ == "__main__":
    agent = ReActAgent()
    while True:
        agent.run_cycle()
        time.sleep(1)
`
