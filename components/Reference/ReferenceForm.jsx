import React, { useState, useContext, useEffect } from 'react'
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { Text, View, TouchableOpacity, StyleSheet} from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../../contexts/UserContext';
import axios from 'axios';
import KeyboardAvoidingContainer from "../Containers/KeyboardAvoidingContainer";
import StyledTextInput from "../Inputs/StyledTextInput";
import StyledText from '../Texts/StyledText';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { baseUrl } from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ReferenceForm( { setReferences }) {
  const [data, setData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    relationship: '',
  })

  const navigation = useNavigation();
  const { currentUser, references, setProfileRefresh, profileRefresh, setEditProfileRefresh, editProfileRefresh } = useContext(UserContext); 

  const handleSubmit = async () => {

    if (!data.first_name || !data.last_name) {
      alert('Please enter both first name and last name');
      return;
    }
  
    if (!data.phone && !data.email) {
      alert('Please provide either phone number or email');
      return;
    }
  
    if (!data.relationship) {
      alert('Please provide relationship to the reference');
      return;
    }
  
    try {
      const response = await axios.post(`${baseUrl}/api/v1/users/${currentUser.id}/employees/references`, { reference: data });
      setReferences(prevReferences => [...prevReferences, response.data.data]);
      // Clear the cache and wait for it to complete
      await AsyncStorage.removeItem('references');
      console.log('Cleared references data from cache');
      setProfileRefresh(true);
      setEditProfileRefresh(true);
    } catch (error) {
      console.error('There was an error creating the reference:', error);
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
              Fill in Reference Details:
              </StyledText>
          </Animated.Text>
        </View>
        <Animated.View entering={FadeInDown.duration(1000).springify()}style={styles.inputTopContainer}>
            <StyledTextInput
              placeholder="First Name"
              icon="account-outline"
              label="First Name:"
              maxLength={25}
              labelStyle={{ fontSize: 18, color: 'white' }} // Custom label style
              onChangeText={(text) => setData({...data, first_name: text})}
            />
        </Animated.View>
        <Animated.View entering={FadeInDown.duration(1000).springify()}style={styles.inputContainer}>
            <StyledTextInput
              placeholder="Last Name"
              icon="account-outline"
              label="Last Name:"
              maxLength={25}
              labelStyle={{ fontSize: 18, color: 'white' }} // Custom label style
              onChangeText={(text) => setData({...data, last_name: text})}
            />
        </Animated.View>
        <Animated.View entering={FadeInDown.duration(1000).springify()}style={styles.inputContainer}>
            <StyledTextInput
              placeholder="Phone Number"
              icon="city-variant-outline"
              label="Phone Number:"
              keyboardType="numeric"
              labelStyle={{ fontSize: 18, color: 'white' }} // Custom label style
              onChangeText={(text) => setData({...data, phone: text})}
            />
        </Animated.View>
        <Animated.View entering={FadeInDown.duration(1000).springify()}style={styles.inputContainer}>
            <StyledTextInput
              placeholder="Email"
              icon="star-box-outline"
              label="Email:"
              labelStyle={{ fontSize: 18, color: 'white' }} // Custom label style
              onChangeText={(text) => setData({...data, email: text})}
            />
        </Animated.View>
        <Animated.View entering={FadeInDown.duration(1000).springify()}style={styles.inputContainer}>
            <StyledTextInput
              placeholder="Relationship"
              icon="star-box-outline"
              label="Relationship:"
              labelStyle={{ fontSize: 18, color: 'white' }} // Custom label style
              onChangeText={(text) => setData({...data, relationship: text})}
            />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} style={styles.submitButtonContainer}>
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>
                Add Reference
              </Text>
              <View style={styles.submitArrow}>
                <MaterialCommunityIcons name="arrow-right" size={24} color="white" />
            </View>
            </TouchableOpacity>
        </Animated.View>
    </View>
    </KeyboardAvoidingContainer>
  )
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
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 15,
  },
  submitButton: {
    backgroundColor: '#ffb900',
    borderRadius: 50,
    paddingVertical: 30,
    paddingHorizontal: 100,
    width: '100%',
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
});