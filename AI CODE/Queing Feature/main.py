from queue_counter import QueueCounter

if __name__ == "__main__":
    backend_url = "http://192.168.10.70:5000"

    counter = QueueCounter(
        model_path="yolov9c.pt",
        class_index=0,
        resolution=(416, 416),
        fps=1,
        backend_url=backend_url  # Now using socket on port 5000
    )
    counter.run(test_mode=False)
