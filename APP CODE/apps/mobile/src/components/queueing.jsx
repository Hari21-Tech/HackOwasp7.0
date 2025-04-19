import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Button,
  Platform,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { Picker } from '@react-native-picker/picker';
import * as Notifications from 'expo-notifications';
import { useQueue } from '../components/queueContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useSocket } from '../context/SocketContext';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// const shops = [
//   {
//     id: 1,
//     name: 'Burger Bite',
//     category: 'Food and Beverages',
//     image: 'https://source.unsplash.com/featured/?burger',
//   },
//   {
//     id: 2,
//     name: 'Salon Xpress',
//     category: 'Barbers',
//     image: 'https://source.unsplash.com/featured/?barber',
//   },
//   {
//     id: 3,
//     name: 'Glow Beauty',
//     category: 'Beauty Parlors',
//     image: 'https://source.unsplash.com/featured/?beauty',
//   },
//   {
//     id: 4,
//     name: 'ElectroMart',
//     category: 'Electronic Shops',
//     image: 'https://source.unsplash.com/featured/?electronics',
//   },
//   {
//     id: 5,
//     name: 'AutoFix Garage',
//     category: 'Automotive Garages',
//     image: 'https://source.unsplash.com/featured/?garage',
//   },
// ];

const categories = ['All', 'Food', 'Fashion', 'Electronics'];

export default function QueuePage({ navigation }) {
  const { socket, connected } = useSocket();
  const { joinedShopId, joinShop, leaveShop } = useQueue();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isUserSignedIn, setIsUserSignedIn] = useState(true);
  const [isSigninModalVisible, setIsSigninModalVisible] = useState(false);
  const [selectedShopForConfirmation, setSelectedShopForConfirmation] =
    useState(null);
  const [isConfirmationModalVisible, setIsConfirmationModalVisible] =
    useState(false);

  const [shopDetails, setShopDetails] = useState([]);

  const [joinedShop, setJoinedShop] = useState(null);
  const [expoPushToken, setExpoPushToken] = useState('');

  useEffect(() => {
    if (!socket) return;
    socket.on('get_shop_result', (data) => {
      if (!data.success) {
        return;
      }
      console.log(data.result.rows[0]);
      setShopDetails((prev) => [...prev, data.result.rows[0]]);
    });

    const fetchShopDetails = async () => {
      console.log('fuck');
      for (let i = 1; i <= 5; i++) {
        socket.emit('get_shop', i);
      }
    };

    console.log('fuck2');
    fetchShopDetails();
    console.log(shopDetails);

    // registerForPushNotificationsAsync().then((token) =>
    //   setExpoPushToken(token)
    // );

    // const notificationListener = Notifications.addNotificationReceivedListener(
    //   (notification) => {
    //     console.log('Notification received:', notification);
    //   }
    // );

    // const responseListener =
    //   Notifications.addNotificationResponseReceivedListener((response) => {
    //     console.log('Notification response:', response);
    //   });

    return () => {
      socket.off('get_shop_result');
      // Notifications.removeNotificationSubscription(notificationListener);
      // Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  async function registerForPushNotificationsAsync() {
    let token;
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    return token;
  }

  const scheduleNotification = async (eta) => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();

      const timeToLeave = Math.max(eta - 5, 1);
      console.log(
        'Scheduling notification for',
        timeToLeave,
        'minutes from now'
      );

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Time to leave!',
          body: `Your queue will be ready in ${timeToLeave} minutes. Time to head out!`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          seconds: timeToLeave * 60,
        },
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  };

  const handleJoinQueue = (shop) => {
    if (isUserSignedIn) {
      setSelectedShopForConfirmation(shop);
      setIsConfirmationModalVisible(true);
    } else {
      setIsSigninModalVisible(true);
    }
  };

  const handleLeaveQueue = async () => {
    leaveShop();
    setJoinedShop(null);
    // Cancel any scheduled notifications when leaving queue
    // await Notifications.cancelAllScheduledNotificationsAsync();
  };

  const closeSigninModal = () => {
    setIsSigninModalVisible(false);
  };

  const filteredShops =
    selectedCategory === 'All'
      ? shopDetails
      : shopDetails.filter((shop) => shop.category === selectedCategory);

  const renderShop = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.cardContent}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.category}>{item.category}</Text>

        {joinedShopId === item.id ? (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              key={`bruh${item.id}`}
              onPress={() => navigation.navigate('Shop', { shop: item })}
              style={[styles.button, styles.viewButton]}
            >
              <Text style={styles.buttonText}>View</Text>
            </TouchableOpacity>
            <TouchableOpacity
              key={`bruh2${item.id}`}
              onPress={handleLeaveQueue}
              style={[styles.button, styles.leaveButton]}
            >
              <Text style={styles.buttonText}>Leave Queue</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => handleJoinQueue(item)}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Join Queue</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* <View style={styles.cardContent}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.category}>{item.category}</Text>
        {joinedShopId === item.id ? (
          <Text style={styles.category}>ETA: 10 minutes</Text>
        ) : null}
        {joinedShopId === item.id ? (
          <TouchableOpacity
            onPress={handleLeaveQueue}
            style={[styles.button, styles.leaveButton]}
          >
            <Text style={styles.buttonText}>Leave Queue</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => handleJoinQueue(item)}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Join Queue</Text>
          </TouchableOpacity>
        )}
      </View> */}
    </View>
  );

  const ListHeader = () => (
    <View style={styles.pickerContainer}>
      <Text style={styles.pickerLabel}>Select Category:</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={selectedCategory}
          onValueChange={(itemValue) => setSelectedCategory(itemValue)}
          style={styles.picker}
          itemStyle={styles.pickerItem}
        >
          {categories.map((cat, index) => (
            <Picker.Item key={index} label={cat} value={cat} />
          ))}
        </Picker>
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={['#0F3460', '#3A5BA0', '#5C93D1']}
      style={styles.bgcontainer}
    >
      <View style={styles.innerContent}>
        <FlatList
          data={filteredShops}
          renderItem={renderShop}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={styles.list}
        />

        <Toast />

        <Modal
          transparent={true}
          visible={isSigninModalVisible}
          animationType="fade"
          onRequestClose={closeSigninModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={{ fontFamily: 'Inter_400Regular' }}>
                You need to sign in first.
              </Text>
              <Button
                title="Sign In"
                onPress={() => {
                  navigation.navigate('Shop');
                  setIsUserSignedIn(true);
                  closeSigninModal();
                }}
              />
              <View style={{ height: 10 }} />
              <Button title="Cancel" onPress={closeSigninModal} />
            </View>
          </View>
        </Modal>

        <Modal
          transparent={true}
          visible={isConfirmationModalVisible}
          animationType="fade"
          onRequestClose={() => setIsConfirmationModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalText}>
                Are you sure you want to join the queue for{' '}
                <Text
                  style={{ fontWeight: 'bold', fontFamily: 'Inter_400Regular' }}
                >
                  {selectedShopForConfirmation?.name}
                </Text>
                ?
              </Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={async () => {
                  setJoinedShop(selectedShopForConfirmation);
                  joinShop(selectedShopForConfirmation.id);
                  setIsConfirmationModalVisible(false);
                  navigation.navigate('Shop', {
                    shop: selectedShopForConfirmation,
                  });
                }}
              >
                <Text style={styles.modalButtonText}>Yes, Join Queue</Text>
              </TouchableOpacity>
              <View style={{ height: 10 }} />
              <TouchableOpacity
                style={styles.modalButtonOutline}
                onPress={() => setIsConfirmationModalVisible(false)}
              >
                <Text style={styles.modalButtonOutlineText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  pickerContainer: {
    padding: 16,
    paddingBottom: 10,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f9f9f9',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  pickerItem: {
    fontSize: 16,
  },
  card: {
    margin: 16,
    marginTop: 0,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
  },
  cardContent: {
    padding: 12,
  },
  innerContent: {
    width: '100%',
    maxWidth: '500',
    alignSelf: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#4f46e5',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  leaveButton: {
    backgroundColor: '#dc2626',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  list: {
    paddingBottom: 60,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalCard: {
    width: '80%',
    padding: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 16,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
    elevation: 2,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  modalButtonOutline: {
    borderWidth: 1,
    borderColor: '#4f46e5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonOutlineText: {
    color: '#4f46e5',
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  bgcontainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10, // or use marginRight on buttons if gap doesn't work
  },

  viewButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },

  leaveButton: {
    flex: 1,
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
});
