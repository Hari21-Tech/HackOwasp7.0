# core/tracker.py
import cv2, csv, os, threading
import face_recognition
import numpy as np
from datetime import datetime
from core.facial import FacialRecognition
from core.yolo_detector import ObjectDetector

class MultiCamTracker:
    def __init__(self, sources=[0], log_file="data/track_log.csv"):
        self.sources = sources
        self.facial = FacialRecognition()
        self.object_detector = ObjectDetector()
        self.log_file = log_file
        self.cams = [cv2.VideoCapture(src) for src in sources]
        
        # Initialize tracking state
        os.makedirs(os.path.dirname(log_file), exist_ok=True)
        self.current_state = {}  # {camera_id: {"person": person_id, "objects": set(), "abandoned": set()}}
        
        # Enhanced history tracking
        self.object_timeline = {}  # {object_label: [{"timestamp": time, "event": event_type, "person": person_id, "camera": cam_id}]}
        
        # Parameters for tracking
        self.proximity_threshold = 200
        self.abandon_timeout = 30  # seconds
        
        if not os.path.exists(log_file):
            with open(log_file, 'w', newline='') as f:
                writer = csv.writer(f)
                writer.writerow(["timestamp", "camera", "event_type", "details"])

    def log_change(self, camera_id, event_type, details):
        """Log only significant changes and update object timeline"""
        timestamp = datetime.now()
        timestamp_str = timestamp.strftime("%d-%m-%Y %H:%M:%S.%f")
        
        # Update object timeline based on event type
        if event_type == "objects_with_person":
            person_id, objects_str = details.split(": ", 1)
            objects = objects_str.split(", ")
            for obj in objects:
                if obj not in self.object_timeline:
                    self.object_timeline[obj] = []
                self.object_timeline[obj].append({
                    "timestamp": timestamp,
                    "event": "picked_up",
                    "person": person_id,
                    "camera": camera_id
                })
        
        elif event_type == "objects_removed":
            person_id, objects_str = details.split(": ", 1)
            objects = objects_str.split(", ")
            for obj in objects:
                if obj not in self.object_timeline:
                    self.object_timeline[obj] = []
                self.object_timeline[obj].append({
                    "timestamp": timestamp,
                    "event": "removed_from_person",
                    "person": person_id,
                    "camera": camera_id
                })
        
        elif event_type == "objects_abandoned":
            objects = details.split(", ")
            for obj in objects:
                if obj not in self.object_timeline:
                    self.object_timeline[obj] = []
                self.object_timeline[obj].append({
                    "timestamp": timestamp,
                    "event": "abandoned",
                    "person": None,
                    "camera": camera_id
                })
        
        elif event_type == "abandoned_objects_picked":
            objects = details.split(", ")
            for obj in objects:
                if obj not in self.object_timeline:
                    self.object_timeline[obj] = []
                self.object_timeline[obj].append({
                    "timestamp": timestamp,
                    "event": "picked_from_abandoned",
                    "person": None,  # Will be updated when associated with person
                    "camera": camera_id
                })
        
        # Write to log file
        with open(self.log_file, 'a', newline='') as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow([timestamp_str, camera_id, event_type, details])

    def get_object_history(self, object_label):
        """Get complete history of an object including its last known person"""
        if object_label not in self.object_timeline:
            return None
        
        history = self.object_timeline[object_label]
        if not history:
            return None
            
        # Get last person who had the object
        last_person = None
        last_camera = None
        for event in reversed(history):
            if event["person"] is not None:
                last_person = event["person"]
                break
        
        # Get current status
        current_status = history[-1]["event"]
        current_camera = history[-1]["camera"]
        
        # Format timeline
        formatted_timeline = []
        for event in history:
            event_time = event["timestamp"].strftime("%d-%m-%Y %H:%M:%S")
            if event["person"]:
                formatted_timeline.append(f"{event_time}: {event['event']} by {event['person']} on camera {event['camera']}")
            else:
                formatted_timeline.append(f"{event_time}: {event['event']} on camera {event['camera']}")
        
        return {
            "object": object_label,
            "last_person": last_person,
            "current_status": current_status,
            "current_camera": current_camera,
            "timeline": formatted_timeline
        }

    def start(self):
        print("🟢 Multi-camera tracking started. Press 'q' to quit.")
        threads = []
        for i, cam in enumerate(self.cams):
            thread = threading.Thread(target=self.process_camera, args=(i, cam))
            thread.start()
            threads.append(thread)

        try:
            while True:
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    break
        finally:
            for cam in self.cams:
                cam.release()
            cv2.destroyAllWindows()

    def process_camera(self, camera_id, cap):
        # Initialize camera state if not exists
        if camera_id not in self.current_state:
            self.current_state[camera_id] = {
                "person": None,
                "objects": set(),
                "abandoned": set()
            }

        while True:
            ret, frame = cap.read()
            if not ret or frame is None:
                print(f"Failed to read frame from camera {camera_id}")
                continue

            # Detect faces and objects
            face_locations = face_recognition.face_locations(frame)
            objects = self.object_detector.detect(frame)
            
            # Get current objects and person
            current_objects = set(obj['label'] for obj in objects)
            current_person = None
            current_person_objects = set()
            
            # Process faces and associate nearby objects
            for face_location in face_locations:
                try:
                    encoding = face_recognition.face_encodings(frame, [face_location])[0]
                    person_id = self.facial.recognize_or_register(encoding, frame, face_location)
                    
                    if person_id is None:
                        continue
                    
                    current_person = person_id
                    # Check each object's proximity to the current person
                    for obj in objects:
                        if self.is_near(face_location, obj["bbox"]):
                            current_person_objects.add(obj['label'])
                            
                except Exception as e:
                    print(f"Error processing face in camera {camera_id}: {str(e)}")
                    continue

            # Get abandoned objects (objects not with person)
            current_abandoned = current_objects - current_person_objects

            # Check for changes and log them
            prev_state = self.current_state[camera_id]
            
            # Person changes
            if current_person != prev_state["person"]:
                if current_person is None:
                    self.log_change(camera_id, "person_left", prev_state["person"])
                else:
                    self.log_change(camera_id, "person_detected", current_person)

            # Object changes with person
            new_objects = current_person_objects - prev_state["objects"]
            removed_objects = prev_state["objects"] - current_person_objects
            if new_objects:
                self.log_change(camera_id, "objects_with_person", f"{current_person}: {', '.join(new_objects)}")
            if removed_objects:
                self.log_change(camera_id, "objects_removed", f"{current_person}: {', '.join(removed_objects)}")

            # Abandoned object changes
            new_abandoned = current_abandoned - prev_state["abandoned"]
            picked_up_abandoned = prev_state["abandoned"] - current_abandoned
            if new_abandoned:
                self.log_change(camera_id, "objects_abandoned", ', '.join(new_abandoned))
                # Print history for newly abandoned objects
                for obj in new_abandoned:
                    history = self.get_object_history(obj)
                    if history and history["last_person"]:
                        print(f"\n🚨 Alert: {obj} abandoned!")
                        print(f"Last seen with: {history['last_person']}")
                        print("Timeline:")
                        for event in history["timeline"]:
                            print(f"  {event}")
                        print()
                        
            if picked_up_abandoned:
                self.log_change(camera_id, "abandoned_objects_picked", ', '.join(picked_up_abandoned))

            # Update state
            self.current_state[camera_id].update({
                "person": current_person,
                "objects": current_person_objects,
                "abandoned": current_abandoned
            })

            # Update frame with detections and history
            frame = self.draw_detections(frame, face_locations, objects)
            
            # Draw abandoned object indicators with history
            for obj in objects:
                if obj['label'] in current_abandoned:
                    x1, y1, x2, y2 = obj["bbox"]
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 2)
                    history = self.get_object_history(obj['label'])
                    if history and history["last_person"]:
                        text = f"ABANDONED (Last: {history['last_person']})"
                    else:
                        text = "ABANDONED"
                    cv2.putText(frame, text, (x1, y1 - 10),
                              cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)

            cv2.imshow(f"Camera {camera_id}", frame)

            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

        cap.release()
        cv2.destroyWindow(f"Camera {camera_id}")

    def is_near(self, face_box, object_box, threshold=None):
        if threshold is None:
            threshold = self.proximity_threshold
            
        ft, fr, fb, fl = face_box
        ox1, oy1, ox2, oy2 = object_box
        
        # Calculate centers
        face_center = ((fl + fr) // 2, (ft + fb) // 2)
        object_center = ((ox1 + ox2) // 2, (oy1 + oy2) // 2)
        
        # Calculate distance
        distance = ((face_center[0] - object_center[0])**2 + (face_center[1] - object_center[1])**2) ** 0.5
        
        # Also check if object is within expanded face region
        face_width = fr - fl
        face_height = fb - ft
        expanded_face = (
            ft - face_height,  # top
            fr + face_width,   # right
            fb + face_height,  # bottom
            fl - face_width    # left
        )
        
        # Check if object center is within expanded face region
        in_region = (
            object_center[0] >= expanded_face[3] and
            object_center[0] <= expanded_face[1] and
            object_center[1] >= expanded_face[0] and
            object_center[1] <= expanded_face[2]
        )
        
        return distance < threshold or in_region

    def draw_detections(self, frame, face_locations, objects):
        for (top, right, bottom, left) in face_locations:
            cv2.rectangle(frame, (left, top), (right, bottom), (0, 255, 0), 2)
        for obj in objects:
            x1, y1, x2, y2 = obj["bbox"]
            label = obj["label"]
            cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 0, 0), 2)
            cv2.putText(frame, label, (x1, y1 - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        return frame

    def backtrack_object(self, object_label=None):
        """
        Backtrack an object's history. If no object_label is provided, 
        shows all tracked objects and prompts for selection.
        """
        if not object_label:
            # Show all available objects
            print("\nTracked objects:")
            for i, obj in enumerate(self.object_timeline.keys(), 1):
                print(f"{i}. {obj}")
            try:
                choice = int(input("\nEnter the number of the object to backtrack (0 to cancel): "))
                if choice == 0:
                    return
                if 1 <= choice <= len(self.object_timeline):
                    object_label = list(self.object_timeline.keys())[choice - 1]
                else:
                    print("Invalid choice")
                    return
            except ValueError:
                print("Invalid input")
                return

        history = self.get_object_history(object_label)
        if not history:
            print(f"\nNo history found for {object_label}")
            return

        print(f"\n📋 History for {object_label}:")
        print(f"Current status: {history['current_status']}")
        print(f"Current camera: Camera {history['current_camera']}")
        if history['last_person']:
            print(f"Last person who had it: {history['last_person']}")
        print("\nTimeline:")
        for event in history['timeline']:
            print(f"  {event}")
