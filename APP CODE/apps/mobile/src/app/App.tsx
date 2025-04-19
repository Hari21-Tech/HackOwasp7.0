import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from '../components/home';
import Queuing from '../components/queueing';
import Parking from '../components/parking';
import ParkingLot from '../components/parkingLot';
// import SignIn from '../components/signin';
import Backtracking from '../components/backtracking';
import ShopDetails from '../components/shop';
import { StyleSheet } from 'react-native';
import { QueueProvider } from '../components/queueContext';

import {
  useFonts,
  Inter_400Regular,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
// import AppLoading from 'expo-app-loading';
import * as SplashScreen from 'expo-splash-screen';
import { SocketProvider } from '../context/SocketContext';

if (SplashScreen.preventAutoHideAsync) {
  SplashScreen.preventAutoHideAsync();
}
if (SplashScreen.hideAsync) {
  SplashScreen.hideAsync();
}

const Stack = createNativeStackNavigator();

export const App = () => {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
  });

  // if (!fontsLoaded) {
  //   return <AppLoading />;
  // }

  return (
    <SocketProvider>
      <QueueProvider>
        <NavigationContainer>
          {/* <LinearGradient
          colors={['#0F3460', '#3A5BA0', '#5C93D1']}
          style={styles.container}
        > */}
          <Stack.Navigator>
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="Backtracking" component={Backtracking} />
            <Stack.Screen name="Queuing" component={Queuing} />
            {<Stack.Screen name="Parking Helper" component={Parking} />}
            <Stack.Screen name="ParkingLots" component={ParkingLot} />
            {/* <Stack.Screen name="SignIn" component={SignIn} /> */}
            <Stack.Screen name="Shop" component={ShopDetails} />
          </Stack.Navigator>
          {/* </LinearGradient> */}
        </NavigationContainer>
      </QueueProvider>
    </SocketProvider>
  );
};

export default App;
