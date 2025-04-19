import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSocket } from '../context/SocketContext';

const mockParkingSpots = [
  { id: 'A1', floor: 1, isAvailable: true },
  { id: 'A2', floor: 1, isAvailable: true },
  { id: 'B1', floor: 2, isAvailable: true },
  { id: 'B2', floor: 2, isAvailable: true },
  { id: 'C1', floor: 3, isAvailable: true },
  { id: 'C3', floor: 3, isAvailable: true },
  { id: 'A6', floor: 1, isAvailable: true },
  { id: 'D2', floor: 1, isAvailable: true },
  { id: 'A3', floor: 2, isAvailable: true },
  { id: 'C6', floor: 2, isAvailable: true },
  { id: 'D5', floor: 3, isAvailable: true },
  { id: 'C2', floor: 3, isAvailable: true },
  { id: 'A12', floor: 1, isAvailable: true },
];

const Parking = ({ route }) => {
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [availableSpots, setAvailableSpots] = useState([]);

  const { socket, connected } = useSocket();
  const { lotId } = route.params;

  useEffect(() => {
    if (connected) {
      setAvailableSpots(mockParkingSpots);
      setSelectedSpot(
        mockParkingSpots[Math.floor(Math.random() * mockParkingSpots.length)]
      );
      return;
    }

    const handleParkingSpots = (data) => {
      console.log('get_parking_spots_result', data);
      if (data.success) {
        const spots = data.result.rows;
        // setAvailableSpots(spots);

        if (spots.length > 0 && !selectedSpot) {
          // setSelectedSpot(spots[0]);
        }
      }
    };

    socket.on('get_parking_spots_result', handleParkingSpots);

    // if (connected) {
    //   socket.emit('get_parking_spots', lotId);
    // }

    return () => {
      socket.off('get_parking_spots_result', handleParkingSpots);
    };
  }, [socket, connected, lotId]);

  const handleRequestNewSpot = () => {
    if (availableSpots.length > 1) {
      const currentIndex = availableSpots.findIndex(
        (spot) => spot.id === selectedSpot?.id
      );
      const nextIndex = (currentIndex + 1) % availableSpots.length;
      setSelectedSpot(availableSpots[nextIndex]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Parking Spots</Text>

      <View style={styles.selectedSpotContainer}>
        <Text style={styles.selectedSpotTitle}>Empty Spot:</Text>
        {selectedSpot ? (
          <Text style={styles.selectedSpotText}>
            Floor {selectedSpot.floor} - Spot {selectedSpot.id}
          </Text>
        ) : (
          <Text style={styles.noSpotText}>No spots available</Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.newSpotButton}
        onPress={handleRequestNewSpot}
        disabled={availableSpots.length <= 1}
      >
        <Text style={styles.buttonText}>Request Different Spot</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  selectedSpotContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
  },
  selectedSpotTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  selectedSpotText: {
    fontSize: 16,
    color: '#333',
  },
  noSpotText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  spotsContainer: {
    flex: 1,
    marginBottom: 20,
  },
  spotItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  spotText: {
    fontSize: 16,
    color: '#333',
  },
  selectButton: {
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 5,
  },
  selectedButton: {
    backgroundColor: '#4CAF50',
  },
  newSpotButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Parking;
