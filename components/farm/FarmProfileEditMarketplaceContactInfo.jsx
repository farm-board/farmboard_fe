import React, { useState, useContext, useEffect } from 'react'
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { Text, View, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../../contexts/UserContext';
import axios from 'axios';
import KeyboardAvoidingContainer from "../Containers/KeyboardAvoidingContainer";
import StyledTextInput from "../Inputs/StyledTextInput";
import UploadModal from '../Profile/UploadModal';
import StyledText from '../Texts/StyledText';
import StyledSelectDropdown from '../Inputs/StyledSelectDropdown';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { baseUrl } from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function FarmProfileEditMarketplaceContactInfo() {
  const [data, setData] = useState({
    marketplace_phone: '',
    marketplace_email: '',
  })

  const navigation = useNavigation();
  const { currentUser, setUserName, setProfileRefresh, setEditProfileRefresh, editProfileRefresh, profileRefresh } = useContext(UserContext);


  const handleSubmit = async () => {
    if (!data.marketplace_phone && !data.marketplace_email) {
      Alert.alert('Contact Info Required', 'Please provide a phone number or email address.');
      return;
    }
    try { 
      await axios.put(`${baseUrl}/api/v1/users/${currentUser.id}/farms`, { farm: data })
      console.log('Updated farm data');
      // Clear the cache and wait for it to complete
      await AsyncStorage.removeItem('farm');
      console.log('Cleared farm data from cache');
      setProfileRefresh(true);
      setEditProfileRefresh(true);
      setUserName(data.name);
    } catch (error) {
      console.log('Unable to register user', error);
    }
  }

  const fetchProfileData = async () => {
    Promise.all([
      axios.get(`${baseUrl}/api/v1/users/${currentUser.id}/farms`),
    ])
    .then(([farmResponse]) => {
      setData({
        ...data,
        marketplace_phone: farmResponse.data.data.attributes.marketplace_phone,
        marketplace_email: farmResponse.data.data.attributes.marketplace_email,
      })
    })
    .catch(error => {
      console.error('There was an error fetching the farm:', error);
    });
  };

  useEffect(() => {
    if (profileRefresh || editProfileRefresh) {
      navigation.push('Edit Profile');
    }
  }, [profileRefresh, editProfileRefresh]);

  useEffect(() => {
    fetchProfileData()
  }, []);

  const formatPhoneNumber = (text) => {
    const cleaned = ('' + text).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return text;
  };

  return (
    <KeyboardAvoidingContainer style={styles.container} behavior="padding">
      <View style={styles.content}>
        <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} style={styles.inputContainer}>
          <StyledTextInput
            placeholder="Phone"
            icon="phone"
            label="Phone:"
            maxLength={14} // Adjust max length for formatted phone number
            labelStyle={{ fontSize: 18, color: 'white' }} // Custom label style
            keyboardType="numeric"
            value={data.marketplace_phone}
            onChangeText={(text) => setData({ ...data, marketplace_phone: formatPhoneNumber(text) })}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(600).duration(1000).springify()} style={styles.inputContainer}>
          <StyledTextInput
            placeholder="Email"
            icon="email"
            label="Email:"
            value={data.marketplace_email}
            labelStyle={{ fontSize: 18, color: 'white' }} // Custom label style
            onChangeText={(text) => setData({ ...data, marketplace_email: text })}
          />
        </Animated.View>
        {/* Submit button */}
        <Animated.View entering={FadeInDown.delay(800).duration(1000).springify()} style={styles.submitButtonContainer}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Save Changes</Text>
            <View style={styles.submitArrow}>
              <MaterialCommunityIcons name="arrow-right" size={24} color="white" />
            </View>
        </TouchableOpacity>
        </Animated.View>
      </View>
    </KeyboardAvoidingContainer>
  )
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 25,
  },
  content: {
    flex: 1,
    marginTop: 25,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: '100%',
  },
  titleTextBox: {
  },
  text: {
    textAlign: 'center',
  },
  mb3: {
    marginTop: 25,
  },
  avatarEdit: {
    // Styles for AvatarEdit component
  },
  inputContainer: {
    width: '100%',
  },
  submitButtonContainer: {
    width: '100%',
    marginTop: 15,
    marginBottom: 3,
  },
  submitButton: {
    backgroundColor: '#ffb900',
    borderRadius: 50,
    paddingVertical: 30,
    paddingHorizontal: 100,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  submitArrow: {
    backgroundColor: "#333",
    borderRadius: 30,
    padding: 15,
    position: "absolute",
    right: 15,
    top: 13,
  },
});
