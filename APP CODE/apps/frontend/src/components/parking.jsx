import { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';

const ParkingPage = () => {
  const { socket, connected } = useSocket();
  const [vacantSpots, setVacantSpots] = useState([]);
  const [totalSpots, setTotalSpots] = useState(100);

  const [noOfVacantSpots, setNoOfVacantSpots] = useState(0);

  useEffect(() => {
    if (!socket) return;

    socket.on('get_parking_result', (data) => {
      console.log('get_parking_result', data);
      setTotalSpots(data.result.rows[0].maximum_number_of_spots);
    });
    socket.on('get_parking_spots_result', (data) => {
      console.log('get_parking_spots_result', data);
      const spots = data.result.rows.map(
        (spot) => `${spot.floor}-${spot.spot}`
      );
      setVacantSpots(spots);
      setNoOfVacantSpots(spots.length);
    });

    if (connected) {
      socket.emit('get_parking', 1);
      socket.emit('get_parking_spots', 1);
    }

    return () => {
      socket.off('get_parking_result');
      socket.off('get_parking_spots_result');
    };
  }, [socket, connected]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-blue-600">Parking Helper</h1>
      <div className="flex gap-4 mb-6">
        <div className="bg-blue-500 text-white p-4 rounded-lg">
          <h2 className="text-xl font-semibold">Total Spaces</h2>
          <p className="text-3xl font-bold">{totalSpots}</p>
        </div>
        <div className="bg-green-500 text-white p-4 rounded-lg">
          <h2 className="text-xl font-semibold">Vacant Spaces</h2>
          <p className="text-3xl font-bold">{noOfVacantSpots}</p>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-2 mb-6">
        {vacantSpots.map((spot, index) => (
          <div
            key={index}
            className={`h-16 rounded-lg flex items-center bg-red-400 justify-center text-black font-bold`}
          >
            {spot}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParkingPage;
