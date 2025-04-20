// Uncomment this line to use CSS modules
// import styles from './app.module.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ServicesPanel from '../components/servicesPanel';
import QueueingPage from '../components/queueing';
// import BacktrackingPage from '../components/backtracking';
import ParkingPage from '../components/parking';
import FirePage from '../components/fire';
import FallPage from '../components/fall';
import { SocketProvider } from '../context/SocketContext';

export function App() {
  return (
    <SocketProvider>
      <Router>
        <div className="flex h-screen">
          <ServicesPanel />
          <div className="flex-1 overflow-auto">
            <Routes>
              <Route path="/queueing" element={<QueueingPage />} />
              {/* <Route path="/backtracking" element={<BacktrackingPage />} /> */}
              <Route path="/parking" element={<ParkingPage />} />
              <Route path="/fire" element={<FirePage />} />
              <Route path="/fall" element={<FallPage />} />
              <Route path="/" element={<QueueingPage />} />
            </Routes>
          </div>
        </div>
      </Router>
    </SocketProvider>
  );
}

export default App;
