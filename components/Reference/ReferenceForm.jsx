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

export default function ReferenceForm( { setReferences }) {
  const [data, setData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    relationship: '',
  })

  const navigation = useNavigation();
  const { currentUser, references } = useContext(UserContext); 

  const handleSubmit = () => {

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
  
    axios.post(`http://localhost:4000/api/v1/users/${currentUser.id}/employees/references`, { reference: data })
      .then(response => {
        setReferences(prevReferences => [...prevReferences, response.data.data]);
        navigation.navigate('Profile');
      })
      .catch(error => {
        console.error('There was an error creating the reference:', error);
      });
  }

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
              onChangeText={(text) => setData({...data, first_name: text})}
            />
        </Animated.View>
        <Animated.View entering={FadeInDown.duration(1000).springify()}style={styles.inputContainer}>
            <StyledTextInput
              placeholder="Last Name"
              icon="account-outline"
              label="Last Name:"
              onChangeText={(text) => setData({...data, last_name: text})}
            />
        </Animated.View>
        <Animated.View entering={FadeInDown.duration(1000).springify()}style={styles.inputContainer}>
            <StyledTextInput
              placeholder="Phone Number"
              icon="city-variant-outline"
              label="Phone Number:"
              onChangeText={(text) => setData({...data, phone: text})}
            />
        </Animated.View>
        <Animated.View entering={FadeInDown.duration(1000).springify()}style={styles.inputContainer}>
            <StyledTextInput
              placeholder="Email"
              icon="star-box-outline"
              label="Email:"
              onChangeText={(text) => setData({...data, email: text})}
            />
        </Animated.View>
        <Animated.View entering={FadeInDown.duration(1000).springify()}style={styles.inputContainer}>
            <StyledTextInput
              placeholder="Relationship"
              icon="star-box-outline"
              label="Relationship:"
              onChangeText={(text) => setData({...data, relationship: text})}
            />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} style={styles.submitButtonContainer}>
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>
                Add Reference
              </Text>
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
    width: '100%',
    marginBottom: 3,
  },
  submitButton: {
    backgroundColor: '#ECE3CE',
    padding: 10,
    borderRadius: 8,
  },
  submitButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3A4D39',
    textAlign: 'center',
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