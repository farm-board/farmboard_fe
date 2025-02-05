import React, { useState, useContext, useEffect } from 'react'
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { Text, View, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../../contexts/UserContext';
import axios from 'axios';
import KeyboardAvoidingContainer from "../Containers/KeyboardAvoidingContainer";
import StyledTextInput from "../Inputs/StyledTextInput";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { baseUrl } from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function EmployeeProfileEditMarketplaceContactInfo() {
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
    if (!isValidEmail(data.marketplace_email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    try { 
      await axios.put(`${baseUrl}/api/v1/users/${currentUser.id}/employees`, { employee: data })
      console.log('Updated employee data');
      // Clear the cache and wait for it to complete
      await AsyncStorage.removeItem('employee');
      console.log('Cleared employee data from cache');
      setProfileRefresh(true);
      setEditProfileRefresh(true);
      setUserName(data.name);
    } catch (error) {
      console.log('Unable to register user', error);
    }
  }

  const fetchProfileData = async () => {
    Promise.all([
      axios.get(`${baseUrl}/api/v1/users/${currentUser.id}/employees`),
    ])
    .then(([employeeResponse]) => {
      setData({
        ...data,
        marketplace_phone: employeeResponse.data.data.attributes.marketplace_phone,
        marketplace_email: employeeResponse.data.data.attributes.marketplace_email,
      })
    })
    .catch(error => {
      console.error('There was an error fetching the employee:', error);
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

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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
            onChangeText={(text) => {setData({ ...data, marketplace_email: text })}}
          />
        </Animated.View>
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
