import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSocket } from '../context/SocketContext';

const Parking = () => {
  const navigation = useNavigation();
  const { socket } = useSocket();
  const [searchQuery, setSearchQuery] = useState('');
  const [parkingLots, setParkingLots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!socket) return;

    socket.on('get_all_parking_result', (data) => {
      // console.log('get_all_parking_result', data);
      if (data.success) {
        setParkingLots(data.result.rows);
      }
      setLoading(false);
    });

    const fetchParkingLots = () => {
      socket.emit('get_all_parking');
    };

    // socket.on('get_parking_spots_result', (data) => {
    //   if (data.success) {
    //     setParkingLots(data.result.rows);
    //   }
    //   setLoading(false);
    // });

    fetchParkingLots();

    return () => {
      socket.off('get_all_parking_result');
    };
  }, [socket]);

  const filteredLots = parkingLots.filter((lot) =>
    lot.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.lotItem}
      onPress={() => navigation.navigate('Parking Helper', { lotId: item.id })}
    >
      <Text style={styles.lotName}>{item.name}</Text>
      <Text style={styles.lotSpots}>
        Total Spots: {item.maximum_number_of_spots}
      </Text>
      <Text style={styles.lotSpots}>
        Vacant Spots:{' '}
        {item.maximum_number_of_spots - item.number_of_empty_spots}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search parking lots..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <FlatList
        data={filteredLots}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  list: {
    flex: 1,
  },
  lotItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  lotName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  lotSpots: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});

export default Parking;
