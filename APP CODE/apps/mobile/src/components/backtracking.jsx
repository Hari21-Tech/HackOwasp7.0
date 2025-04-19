import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const Backtracking = () => {
  const [objectName, setObjectName] = useState('');
  const [objectColor, setObjectColor] = useState('');
  const [userImage, setUserImage] = useState(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Permission needed',
        'Please grant camera roll permissions to upload an image'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setUserImage(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    if (!objectName || !objectColor || !userImage) {
      Alert.alert('Error', 'Please fill in all fields and upload an image');
      return;
    }

    // useEffect(() => {
    //   console.log(objectName, objectColor, userImage);
    // }, [objectName, objectColor, userImage]);

    // Here you would typically send this data to your backend
    Alert.alert(
      'Success',
      'Your lost object details have been submitted. We will help you find it!'
    );

    // Reset form
    setObjectName('');
    setObjectColor('');
    setUserImage(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lost Object Details</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Object Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Wallet, Phone, Keys"
          value={objectName}
          onChangeText={setObjectName}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Object Color</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Black, Red, Blue"
          value={objectColor}
          onChangeText={setObjectColor}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Upload Your Photo</Text>
        <TouchableOpacity style={styles.imageUploadButton} onPress={pickImage}>
          <Text style={styles.buttonText}>
            {userImage ? 'Change Photo' : 'Select Photo'}
          </Text>
        </TouchableOpacity>
        {userImage && (
          <Image source={{ uri: userImage }} style={styles.previewImage} />
        )}
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit Details</Text>
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
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  imageUploadButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 10,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Backtracking;
