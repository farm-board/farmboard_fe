import React, { useState, useContext, useEffect } from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import KeyboardAvoidingContainer from "../Containers/KeyboardAvoidingContainer";
import StyledTextInput from "../Inputs/StyledTextInput";
import StyledText from '../Texts/StyledText';
import { UserContext } from '../../contexts/UserContext';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { baseUrl } from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ExperienceForm({ setExperiences }) {
  const [data, setData] = useState({
    company_name: '',
    started_at: '',
    ended_at: '',
    description: '',
  });

  const navigation = useNavigation();
  const { currentUser, setProfileRefresh, setEditProfileRefresh, editProfileRefresh, profileRefresh } = useContext(UserContext);

  const handleSubmit = async () => {
    try {
      const response = await axios.post(`${baseUrl}/api/v1/users/${currentUser.id}/employees/experiences`, { experience: data });
      setExperiences(prevExperiences => [...prevExperiences, response.data.data]);
      // Clear the cache and wait for it to complete
      await AsyncStorage.removeItem('experiences');
      console.log('Cleared experiences data from cache');
      setProfileRefresh(true);
      setEditProfileRefresh(true);
    } catch (error) {
      console.error('There was an error creating the experience:', error);
    }
  }

  useEffect(() => {
    if (profileRefresh || editProfileRefresh) {
      navigation.push('Edit Profile');
    }
  }, [profileRefresh, editProfileRefresh]);

  return (
    <KeyboardAvoidingContainer style={{paddingTop: 10, paddingBottom: 25, paddingHorizontal: 5}}>
      <View style={styles.content}>
        <View style={styles.mb3}>
          <Animated.Text >
            <StyledText entering={FadeInUp.duration(1000).springify()} big style={[styles.text, styles.pb10]}>
              Fill in Previous Experience Details:
            </StyledText>
          </Animated.Text>
        </View>
        <Animated.View entering={FadeInDown.duration(1000).springify()}style={styles.inputTopContainer}>
          <StyledTextInput
            placeholder="Company Name"
            icon="account-outline"
            label="Company Name:"
            maxLength={35}
            labelStyle={{ fontSize: 18, color: 'white' }} // Custom label style
            onChangeText={(text) => setData({...data, company_name: text})}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.duration(1000).springify()}style={styles.inputContainer}>
          <StyledTextInput
            placeholder="DD-MM-YYYY"
            icon="calendar"
            label="Date Started:"
            maxLength={10}
            labelStyle={{ fontSize: 18, color: 'white' }} // Custom label style
            onChangeText={(text) => setData({...data, started_at: text})}
            keyboardType="numeric"
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.duration(1000).springify()}style={styles.inputContainer}>
          <StyledTextInput
            placeholder="DD-MM-YYYY"
            icon="calendar"
            label="Date Ended:"
            maxLength={10}
            labelStyle={{ fontSize: 18, color: 'white' }} // Custom label style
            onChangeText={(text) => setData({...data, ended_at: text})}
            keyboardType="numeric"
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(800).duration(1000).springify()} style={styles.inputContainer}>
          <StyledTextInput
            placeholder="Description"
            icon="star-box-outline"
            multiline={true}
            label="Description:"
            maxLength={255}
            labelStyle={{ fontSize: 18, color: 'white' }} // Custom label style
            onChangeText={(text) => setData({...data, description: text})}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} style={styles.submitButtonContainer}>
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>
                Add Experience
              </Text>
              <View style={styles.submitArrow}>
                <MaterialCommunityIcons name="arrow-right" size={24} color="white" />
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
  submitButtonContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 15,
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