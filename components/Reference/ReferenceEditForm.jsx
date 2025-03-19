import React, { useState, useContext, useEffect, use } from 'react';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { Text, View, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { UserContext } from '../../contexts/UserContext';
import axios from 'axios';
import KeyboardAvoidingContainer from "../Containers/KeyboardAvoidingContainer";
import StyledTextInput from "../Inputs/StyledTextInput";
import StyledText from '../Texts/StyledText';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { baseUrl } from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ReferenceEditForm() {
  const [data, setData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    relationship: '',
  });

  const navigation = useNavigation();
  const { currentUser, setProfileRefresh, profileRefresh, setEditProfileRefresh, editProfileRefresh } = useContext(UserContext);

  const route = useRoute();
  const { referenceId } = route.params;

  const handleDeleteReference = async () => {
    try {
      const response = await axios.delete(`${baseUrl}/api/v1/users/${currentUser.id}/employees/references/${referenceId}`);
      // Clear the cache and wait for it to complete
      await AsyncStorage.removeItem('references');
      console.log('Cleared references data from cache');
      setProfileRefresh(true);
      setEditProfileRefresh(true);
    } catch (error) {
      console.error('There was an error deleting the reference:', error);
    }
  };

  const handleSubmit = async () => {
    if (!data.first_name || !data.last_name) {
      Alert.alert('Error', 'Please enter both first name and last name');
      return;
    }

    if (!data.phone && !data.email) {
      Alert.alert('Error', 'Please provide either phone number or email');
      return;
    }

    if (!data.relationship) {
      Alert.alert('Error', 'Please provide relationship to the reference');
      return;
    }

    try {
      const response = await axios.put(`${baseUrl}/api/v1/users/${currentUser.id}/employees/references/${referenceId}`, { reference: data });
      // Clear the cache and wait for it to complete
      await AsyncStorage.removeItem('references');
      console.log('Cleared references data from cache');
      setProfileRefresh(true);
      setEditProfileRefresh
    } catch (error) {
      console.error('There was an error creating the reference:', error);
    }
  };

  const fetchReferenceData = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/v1/users/${currentUser.id}/employees/references/${referenceId}`);
      console.log('Reference data:', response.data.data);
      setData({
        first_name: response.data.data.attributes.first_name,
        last_name: response.data.data.attributes.last_name,
        phone: response.data.data.attributes.phone,
        email: response.data.data.attributes.email,
        relationship: response.data.data.attributes.relationship,
      });
    } catch (error) {
      console.error('There was an error fetching the references:', error);
    }
  }

  useEffect(() => {
    console.log('referenceId:', referenceId);
    fetchReferenceData();
  }, []);

  useEffect(() => {
    if (profileRefresh || editProfileRefresh) {
      navigation.push('Edit Profile');
    }
  }, [profileRefresh, editProfileRefresh]);

  const formatPhoneNumber = (text) => {
    const cleaned = ('' + text).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return text;
  };

  return (
    <KeyboardAvoidingContainer style={{ paddingTop: 10, paddingBottom: 25, paddingHorizontal: 5 }}>
      <View style={styles.content}>
        <View style={styles.mb3}>
          <Animated.Text>
            <StyledText entering={FadeInUp.duration(1000).springify()} big style={[styles.text, styles.pb10]}>
              Fill in Reference Details:
            </StyledText>
          </Animated.Text>
        </View>
        <Animated.View entering={FadeInDown.duration(1000).springify()} style={styles.inputTopContainer}>
          <StyledTextInput
            placeholder="First Name"
            icon="account-outline"
            label="First Name:"
            value={data.first_name}
            maxLength={25}
            labelStyle={{ fontSize: 18, color: 'white' }} // Custom label style
            onChangeText={(text) => setData({ ...data, first_name: text })}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.duration(1000).springify()} style={styles.inputContainer}>
          <StyledTextInput
            placeholder="Last Name"
            icon="account-outline"
            label="Last Name:"
            value={data.last_name}
            maxLength={25}
            labelStyle={{ fontSize: 18, color: 'white' }} // Custom label style
            onChangeText={(text) => setData({ ...data, last_name: text })}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.duration(1000).springify()} style={styles.inputContainer}>
          <StyledTextInput
            placeholder="Phone Number"
            icon="phone"
            label="Phone Number:"
            keyboardType="numeric"
            value={data.phone}
            maxLength={14} // Adjust max length for formatted phone number
            labelStyle={{ fontSize: 18, color: 'white' }} // Custom label style
            onChangeText={(text) => setData({ ...data, phone: formatPhoneNumber(text) })}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.duration(1000).springify()} style={styles.inputContainer}>
          <StyledTextInput
            placeholder="Email"
            icon="email"
            label="Email:"
            value={data.email}
            labelStyle={{ fontSize: 18, color: 'white' }} // Custom label style
            onChangeText={(text) => setData({ ...data, email: text })}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.duration(1000).springify()} style={styles.inputContainer}>
          <StyledTextInput
            placeholder="Relationship"
            icon="human-greeting-variant"
            label="Relationship:"
            value={data.relationship}
            labelStyle={{ fontSize: 18, color: 'white' }} // Custom label style
            onChangeText={(text) => setData({ ...data, relationship: text })}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} style={styles.submitButtonContainer}>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>
              Save Changes
            </Text>
            <View style={styles.submitArrow}>
              <MaterialCommunityIcons name="arrow-right" size={24} color="white" />
            </View>
          </TouchableOpacity>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(1600).duration(1000).springify()} style={styles.deleteButtonContainer}>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteReference}>
            <Text style={styles.deleteButtonText}>Remove</Text>
            <View style={styles.deleteIcon}>
              <MaterialCommunityIcons name="trash-can-outline" size={24} color="white" />
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </KeyboardAvoidingContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 25,
    paddingHorizontal: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    textAlign: 'center',
  },
  pb10: {
    paddingBottom: 30,
  },
  mb3: {
    marginBottom: 3,
    marginTop: 25,
  },
  inputContainer: {
    minWidth: '100%',
  },
  inputTopContainer: {
    marginTop: 25,
    width: '100%',
  },
  submitButtonContainer: {
    minWidth: '100%',
  },
  submitButton: {
    backgroundColor: '#ffb900',
    borderRadius: 50,
    paddingVertical: 30,
    paddingHorizontal: 120,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    padding: 10,
  },
  deleteButtonContainer: {
    width: '100%',
    marginTop: 20,
  },
  deleteButton: {
    backgroundColor: '#FF3F3F',
    borderRadius: 50,
    paddingVertical: 30,
    paddingHorizontal: 100,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  deleteIcon: {
    backgroundColor: "#333",
    borderRadius: 30,
    padding: 15,
    position: "absolute",
    right: 15,
    top: 13,
  },
});