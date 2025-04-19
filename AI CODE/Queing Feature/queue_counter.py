import cv2
import time
import socketio
import os
from ultralytics import YOLO

class QueueCounter:
    def __init__(self, model_path, class_index=0, resolution=(416, 416), fps=1, backend_url=None):
        self.cap = cv2.VideoCapture(0)
        self.cap.set(3, resolution[0])
        self.cap.set(4, resolution[1])

        self.model_path = model_path
        self.model = self.load_openvino_model(model_path)
        self.class_index = class_index
        self.fps = fps
        self.last_time = 0
        self.previous_count = None  # Track previous detection count

        self.socket_enabled = backend_url is not None
        if self.socket_enabled:
            self.sio = socketio.Client()
            self.connect_socket(backend_url)

    def load_openvino_model(self, model_path):
        openvino_dir = f"yolov9c_openvino_model"
        if not os.path.exists(openvino_dir):
            print("[Model] Exporting model to OpenVINO format...")
            model = YOLO(model_path)
            model.export(format='openvino')
        else:
            print("[Model] OpenVINO model already exists.")
        return YOLO(openvino_dir)

    def connect_socket(self, url):
        try:
            self.sio.connect(url)
            print("[Socket.IO] Connected to backend.")
        except Exception as e:
            print(f"[Socket.IO] Connection failed: {e}")

    def detect(self, frame):
        results = self.model.predict(frame, show=False, classes=[self.class_index], conf=0.25)
        count = 0
        for r in results:
            for box in r.boxes:
                cls = int(box.cls[0])
                if cls == self.class_index:
                    count += 1
        return count

    def send_data(self, count):
        # Status is True only if the count has changed since the last detection
        status = count != self.previous_count
        payload = {"status": status, "people": count}
        try:
            self.sio.emit("queue_update", payload)
            print(f"[Socket.IO] Sent: {payload}")
        except Exception as e:
            print(f"[Socket.IO] Emit error: {e}")
        self.previous_count = count  # Update previous count

    def run(self, test_mode=False):
        print("[System] Starting detection loop...")
        while True:
            current_time = time.time()
            if current_time - self.last_time < 1 / self.fps:
                continue

            self.last_time = current_time
            success, frame = self.cap.read()
            if not success:
                print("[Camera] Frame capture failed.")
                continue

            count = self.detect(frame)

            if test_mode or not self.socket_enabled:
                print(f"[Test] People detected: {count} | Changed: {count != self.previous_count}")
            else:
                self.send_data(count)

    def __del__(self):
        self.cap.release()
        cv2.destroyAllWindows()
        print("[System] Camera released and cleanup complete.")
