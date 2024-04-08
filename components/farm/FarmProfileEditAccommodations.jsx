import React, { useState, useContext, useEffect } from 'react'
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { Text, View, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../../contexts/UserContext';
import axios from 'axios';
import KeyboardAvoidingContainer from "../Containers/KeyboardAvoidingContainer";
import StyledText from '../Texts/StyledText';
import StyledSwitch from '../Inputs/StyledSwitch';


export default function FarmProfileEditAccommodations() {
  const [data, setData] = useState({})

  const navigation = useNavigation();
  const { currentUser } = useContext(UserContext);

  const handleSubmit = () => {
    axios.put(`http://localhost:4000/api/v1/users/${currentUser.id}/farms/accommodation`, data )
    .then(response => {
      console.log(response.data);
      navigation.push('Profile');
    })
    .catch(error => {
      console.log('Unable to register user', error);
    })
  }

  const fetchAccommodationData = async () => {
    axios.get(`http://localhost:4000/api/v1/users/${currentUser.id}/farms/accommodation`)
    .then((accommodationResponse) => {
      console.log('current accommodations:', accommodationResponse.data);
      setData({
        ...data,
        housing: accommodationResponse.data.data.attributes.housing,
        transportation: accommodationResponse.data.data.attributes.transportation,
        meals: accommodationResponse.data.data.attributes.meals,
      })
    })
    .catch(error => {
      console.error('There was an error fetching the farm accommodations:', error);
    });
  };

  useEffect(() => {
    fetchAccommodationData()
  }, []);

  return (
    <KeyboardAvoidingContainer style={styles.container} behavior="padding">
      <View style={styles.content}>
        <Animated.Text >
          <View style={styles.titleTextBox}>
            <StyledText entering={FadeInUp.duration(1000).springify()} big style={styles.text}>
              Edit Accommodation Info:
            </StyledText>
          </View>
        </Animated.Text>
        <Animated.View entering={FadeInDown.duration(1000).springify()}style={styles.inputContainer}>
          <StyledSwitch
            placeholder="Housing"
            icon="home-outline"
            label="Housing:"
            value={data.housing}
            onValueChange={(newValue) => setData({ ...data, housing: newValue })}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(200).duration(1000).springify()} style={styles.inputContainer}>
          <StyledSwitch
            placeholder="Meals"
            icon="food-apple-outline"
            label="Meals:"
            value={data.meals}
            onValueChange={(newValue) => setData({ ...data, meals: newValue })}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} style={styles.inputContainer}>
          <StyledSwitch
            placeholder="Transportation"
            icon="car-outline"
            label="Transportation:"
            value={data.transportation}
            onValueChange={(newValue) => setData({ ...data, transportation: newValue })}
          />
        </Animated.View>
        {/* Submit button */}
        <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} style={styles.submitButtonContainer}>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </KeyboardAvoidingContainer>
  )
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 25,
    paddingHorizontal: 25,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: '100%',
  },
  titleTextBox: {
    padding: 10,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonContainer: {
    width: '100%',
    marginBottom: 3,
  },
  submitButton: {
    backgroundColor: '#ECE3CE',
    padding: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  submitButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3A4D39',
    textAlign: 'center',
  },
});

