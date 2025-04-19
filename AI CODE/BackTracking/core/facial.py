# core/facial.py
import face_recognition
import json, os
import cv2
from datetime import datetime
import threading
import numpy as np

class FacialRecognition:
    def __init__(self, embeddings_file='data/embeddings.json', faces_dir='data/faces', threshold=0.7):
        self.embeddings_file = embeddings_file
        self.faces_dir = faces_dir
        self.threshold = threshold
        self.lock = threading.Lock()

        os.makedirs(os.path.dirname(self.embeddings_file), exist_ok=True)
        os.makedirs(self.faces_dir, exist_ok=True)

        if not os.path.exists(self.embeddings_file):
            with open(self.embeddings_file, "w") as f:
                json.dump([], f)

    def load_embeddings(self):
        with open(self.embeddings_file, "r") as f:
            return json.load(f)

    def save_embeddings(self, data):
        with open(self.embeddings_file, "w") as f:
            json.dump(data, f, indent=2)

    def save_face_image(self, frame, face_location, person_id):
        person_dir = os.path.join(self.faces_dir, person_id)
        os.makedirs(person_dir, exist_ok=True)
        existing_images = [f for f in os.listdir(person_dir) if f.endswith('.jpg')]
        if existing_images:
            return os.path.join(person_dir, existing_images[0])
        top, right, bottom, left = face_location
        margin = 20
        top = max(0, top - margin)
        left = max(0, left - margin)
        bottom += margin
        right += margin
        face_img = frame[top:bottom, left:right]
        image_path = os.path.join(person_dir, "face.jpg")
        cv2.imwrite(image_path, face_img)
        return image_path

    def recognize_or_register(self, encoding, frame=None, face_location=None):
        try:
            with self.lock:
                data = self.load_embeddings()

                if not data:
                    person_id = "Person_001"
                    data.append({
                        'id': person_id,
                        'embedding': encoding.tolist(),
                        'registered_at': datetime.now().isoformat()
                    })
                    self.save_embeddings(data)
                    if frame is not None and face_location is not None:
                        self.save_face_image(frame, face_location, person_id)
                    return person_id

                known_encodings = np.array([d['embedding'] for d in data])
                current_encoding = np.array(encoding)
                
                face_distances = face_recognition.face_distance(known_encodings, current_encoding)
                best_match_idx = np.argmin(face_distances)
                
                if face_distances[best_match_idx] <= self.threshold:
                    person_id = data[best_match_idx]['id']
                    if frame is not None and face_location is not None:
                        self.save_face_image(frame, face_location, person_id)
                    return person_id

                person_id = f"Person_{len(data) + 1:03d}"
                data.append({
                    'id': person_id,
                    'embedding': encoding.tolist(),
                    'registered_at': datetime.now().isoformat()
                })
                self.save_embeddings(data)
                if frame is not None and face_location is not None:
                    self.save_face_image(frame, face_location, person_id)
                return person_id
        except Exception as e:
            print(f"Error in recognize_or_register: {str(e)}")
            return None
