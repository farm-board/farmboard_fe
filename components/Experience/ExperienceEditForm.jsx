import React, { useState, useContext, useEffect } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import KeyboardAvoidingContainer from "../Containers/KeyboardAvoidingContainer";
import StyledTextInput from "../Inputs/StyledTextInput";
import StyledText from '../Texts/StyledText';
import { UserContext } from '../../contexts/UserContext';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { baseUrl } from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ExperienceEditForm() {
  const [data, setData] = useState({
    company_name: '',
    started_at: '',
    ended_at: '',
    description: '',
  });

  const navigation = useNavigation();
  const { currentUser, setProfileRefresh, setEditProfileRefresh, editProfileRefresh, profileRefresh } = useContext(UserContext);

  const route = useRoute();
  const { experienceId } = route.params;

  const handleDeleteExperience = async () => {
    try {
      const response = await axios.delete(`${baseUrl}/api/v1/users/${currentUser.id}/employees/experiences/${experienceId}`);
      // Clear the cache and wait for it to complete
      await AsyncStorage.removeItem('experiences');
      console.log('Cleared experiences data from cache');
      setProfileRefresh(true);
      setEditProfileRefresh(true);
    } catch (error) {
      console.error('There was an error deleting the experience:', error);
    }
  }

  const handleSubmit = async () => {
    try {
      const response = await axios.put(
        `${baseUrl}/api/v1/users/${currentUser.id}/employees/experiences/${experienceId}`,
        { experience: data }       // keep Rails’ expected nesting
      );
  
      // ---- success ----
      await AsyncStorage.removeItem('experiences');
      console.log('Cleared experiences data from cache');
      setProfileRefresh(true);
      setEditProfileRefresh(true);
  
    } catch (error) {
      // ---- validation / profanity errors ----
      const errors = error.response?.data?.errors;               // array or string
  
      if (error.response?.status === 422 && errors) {
        const messages = Array.isArray(errors) ? errors : [errors];
        const containsProfanity = messages.some(m =>
          String(m).toLowerCase().includes('prohibited word')
        );
  
        Alert.alert(
          containsProfanity ? 'Prohibited Language' : 'Validation Error',
          messages[0] 
        );
      } else {
        console.error('There was an error updating the experience:', error);
        Alert.alert('Error', 'Unable to update experience. Please try again.');
      }
    }
  };

  const fetchExperienceData = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/v1/users/${currentUser.id}/employees/experiences/${experienceId}`);
      console.log('Experience data:', response.data.data);
      setData({
        company_name: response.data.data.attributes.company_name,
        started_at: response.data.data.attributes.started_at,
        ended_at: response.data.data.attributes.ended_at,
        description: response.data.data.attributes.description
      })
    } catch (error) {
      console.error('There was an error fetching the experiences:', error);
    }
  }

  useEffect(() => {
    console.log('experienceId:', experienceId);
    fetchExperienceData();
  }
  , []);

  useEffect(() => {
    if (profileRefresh || editProfileRefresh) {
      navigation.push('Edit Profile');
    }
  }, [profileRefresh, editProfileRefresh]);

  const formatDate = (text) => {
    const cleaned = ('' + text).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2})(\d{2})(\d{4})$/);
    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    } else if (cleaned.length <= 2) {
      return cleaned;
    } else if (cleaned.length <= 4) {
      return `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;
    } else if (cleaned.length <= 8) {
      return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 4)}-${cleaned.slice(4)}`;
    }
    return text;
  };

  return (
    <KeyboardAvoidingContainer style={{ paddingTop: 10, paddingBottom: 25, paddingHorizontal: 5 }}>
      <View style={styles.content}>
        <View style={styles.mb3}>
          <Animated.Text >
            <StyledText entering={FadeInUp.delay(200).duration(1000).springify()} big style={[styles.text, styles.pb10]}>
              Fill in Previous Experience Details:
            </StyledText>
          </Animated.Text>
        </View>
        <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} style={styles.inputTopContainer}>
          <StyledTextInput
            placeholder="Company Name"
            icon="account-outline"
            label="Company Name:"
            value={data.company_name}
            maxLength={35}
            labelStyle={{ fontSize: 18, color: 'white' }} 
            onChangeText={(text) => setData({ ...data, company_name: text })}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(600).duration(1000).springify()} style={styles.inputContainer}>
          <StyledTextInput
            placeholder="MM-DD-YYYY"
            icon="calendar"
            label="Date Started:"
            maxLength={10}
            labelStyle={{ fontSize: 18, color: 'white' }}
            keyboardType="numeric"
            value={data.started_at}
            onChangeText={(text) => setData({ ...data, started_at: formatDate(text) })}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(800).duration(1000).springify()} style={styles.inputContainer}>
          <StyledTextInput
            placeholder="MM-DD-YYYY"
            icon="calendar"
            label="Date Ended:"
            maxLength={10}
            labelStyle={{ fontSize: 18, color: 'white' }} 
            keyboardType="numeric"
            value={data.ended_at}
            onChangeText={(text) => setData({ ...data, ended_at: formatDate(text) })}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(1000).duration(1000).springify()} style={styles.inputContainer}>
          <StyledTextInput
            placeholder="Describe what you did here..."
            icon="star-box-outline"
            multiline={true}
            label="Description:"
            maxLength={255}
            value={data.description}
            labelStyle={{ fontSize: 18, color: 'white' }}
            onChangeText={(text) => setData({ ...data, description: text })}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(1200).duration(1000).springify()} style={styles.submitButtonContainer}>
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
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteExperience}>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    padding: 10,
  },
  submitButtonContainer: {
    width: '100%',
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