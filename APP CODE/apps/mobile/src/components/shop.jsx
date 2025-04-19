import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import * as Location from 'expo-location';

import { LinearGradient } from 'expo-linear-gradient';

import { useQueue } from './queueContext';
import { useSocket } from '../context/SocketContext';

const ETA_PER_PERSON = 2; // 2 minutes

export default function ShopDetail({ route, navigation }) {
  const { socket, connected } = useSocket();
  const { shop } = route.params;
  const [location, setLocation] = useState(null);
  const [distance, setDistance] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [queueCount, setQueueCount] = useState(0);
  const [currentOccupancy, setCurrentOccupancy] = useState(0);

  const [eta, setEta] = useState(0);

  useEffect(() => {
    if (!socket) return;
    socket.on('get_shop_queue_result', (data) => {
      setQueueCount(data.result.rows.length);
      console.log(currentOccupancy, queueCount)
    });
    socket.on('queue_update', (data) => {
      console.log('Queue update received:', data);
      setCurrentOccupancy(data);
      setEta(data * ETA_PER_PERSON);
    });

    if (connected) {
      socket.emit('get_shop_queue', shop.id);
    }

    getUserLocation();

    return () => {
      socket.off('get_shop_queue_result');
      socket.off('queue_update');
    };
  }, []);

  const getUserLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('permission denied');
      return;
    }
    let location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;
    console.log(latitude, longitude);

    setLocation({ latitude, longitude });
    setDistance(
      setDistanceFromLatLonInKm(
        location.latitude,
        location.longitude,
        shop.latitude,
        shop.longitude
      )
    );
  };

  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const deg2rad = (deg) => deg * (Math.PI / 180);

  // setDistance(
  //   getDistanceFromLatLonInKm(
  //     latitude,
  //     longitude,
  //     shop.latitude,
  //     shop.longitude
  //   )
  // );
  console.log(distance);

  // if (currentOccupancy + queueCount <= shop.total_occupancy) {
  //   setEta(0);
  // } else {
  // set distnace factor here

  const { leaveShop } = useQueue();
  return (
    <LinearGradient
      colors={['#0F3460', '#3A5BA0', '#5C93D1']}
      style={styles.bgcontainer}
    >
      <View style={styles.innerContent}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.content}>
            <Text style={styles.name}>{shop.name}</Text>
            <Text style={styles.category}>{shop.category}</Text>

            <View style={styles.infoSection}>
              {/* <Text style={styles.sectionTitle}>Description</Text> */}
              <Text style={styles.description}>{shop.description}</Text>
            </View>

            <View>
              <Text>Current Occupancy : {currentOccupancy}</Text>
              <Text>Total Capacity : {shop.total_occupancy}</Text>
              {location && <Text>ETA : {eta} minutes</Text>}
            </View>
          </View>
        </ScrollView>

        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>
                Are you sure you want to leave the queue?
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.leaveButton}
                  onPress={() => {
                    setModalVisible(false);
                    leaveShop();
                    navigation.goBack();
                  }}
                >
                  <Text style={styles.buttonText}>Yes, Leave</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <TouchableOpacity
          style={styles.leaveQueueFixedButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.buttonText}>Leave Queue</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   scrollContainer: {
//     paddingBottom: 100,
//   },
//   content: {
//     padding: 16,
//   },
//   name: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 4,
//   },
//   category: {
//     fontSize: 16,
//     color: '#666',
//     marginBottom: 16,
//   },
//   infoSection: {
//     marginBottom: 24,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 8,
//     color: '#333',
//   },
//   description: {
//     fontSize: 16,
//     lineHeight: 24,
//     color: '#444',
//   },
//   leaveQueueFixedButton: {
//     backgroundColor: '#FF0000',
//     paddingVertical: 14,
//     borderRadius: 8,
//     alignItems: 'center',
//     margin: 16,
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//   },

//   innerContent: {
//     width: '100%',
//     maxWidth: '500',
//     alignSelf: 'center',
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContent: {
//     backgroundColor: '#fff',
//     padding: 24,
//     borderRadius: 10,
//     width: '80%',
//   },
//   modalText: {
//     fontSize: 18,
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   modalButtons: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//   },
//   cancelButton: {
//     backgroundColor: '#aaa',
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 8,
//   },
//   leaveButton: {
//     backgroundColor: '#FF0000',
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 8,
//   },
//   bgcontainer: {
//     flex: 1,
//     padding: 24,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
// });

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 120,
  },
  content: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
  },
  category: {
    fontSize: 18,
    color: '#d0d0d0',
    marginBottom: 20,
  },
  infoSection: {
    marginBottom: 24,
    // backgroundColor: 'rgba(255,255,255,0.1)',
    // padding: 16,
    // borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
    color: '#fff',
  },
  description: {
    fontSize: 16,
    lineHeight: 22,
    color: '#f1f1f1',
  },
  leaveQueueFixedButton: {
    backgroundColor: '#FF4C4C',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 24,
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
  },
  innerContent: {
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 28,
    borderRadius: 16,
    width: '85%',
    elevation: 10,
  },
  modalText: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 24,
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: '#999',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  leaveButton: {
    backgroundColor: '#FF4C4C',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  bgcontainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
