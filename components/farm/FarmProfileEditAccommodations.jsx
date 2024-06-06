import React, { useState, useContext, useEffect } from 'react'
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { Text, View, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../../contexts/UserContext';
import axios from 'axios';
import KeyboardAvoidingContainer from "../Containers/KeyboardAvoidingContainer";
import StyledText from '../Texts/StyledText';
import StyledSwitch from '../Inputs/StyledSwitch';
import { MaterialCommunityIcons } from '@expo/vector-icons';


export default function FarmProfileEditAccommodations() {
  const [data, setData] = useState({})

  const navigation = useNavigation();
  const { currentUser } = useContext(UserContext);

  const handleSubmit = () => {
    axios.put(`https://farmboard-be-a01a77990d21.herokuapp.com/api/v1/users/${currentUser.id}/farms/accommodation`, data )
    .then(response => {
      console.log(response.data);
      navigation.push('Edit Profile');
    })
    .catch(error => {
      console.log('Unable to register user', error);
    })
  }

  const fetchAccommodationData = async () => {
    axios.get(`https://farmboard-be-a01a77990d21.herokuapp.com/api/v1/users/${currentUser.id}/farms/accommodation`)
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

  const handleAccommodationsDelete = () => {
    axios.delete(`https://farmboard-be-a01a77990d21.herokuapp.com/api/v1/users/${currentUser.id}/farms/accommodation`)
    .then(response => {
      console.log(response.data);
      navigation.push('Edit Profile');
    })
    .catch(error => {
      console.log('Unable to register user', error);
    })
  };

  useEffect(() => {
    fetchAccommodationData()
  }, []);

  return (
    <KeyboardAvoidingContainer style={styles.container} behavior="padding">
      <View style={styles.content}>
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
        <Animated.View entering={FadeInDown.delay(600).duration(1000).springify()} style={styles.submitButtonContainer}>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Save Changes</Text>
            <View style={styles.submitArrow}>
              <MaterialCommunityIcons name="arrow-right" size={24} color="white" />
            </View>
          </TouchableOpacity>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(800).duration(1000).springify()} style={styles.deleteButtonContainer}>
          <TouchableOpacity style={styles.deleteButton} onPress={handleAccommodationsDelete}>
            <Text style={styles.deleteButtonText}>Remove Accommodations</Text>
            <View style={styles.deleteIcon}>
              <MaterialCommunityIcons name="trash-can-outline" size={24} color="white" />
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </KeyboardAvoidingContainer>
  )
};

const styles = StyleSheet.create({
  container: {
  },
  content: {
    marginTop: 35,
    flex: 1,
    minWidth: '90%',
  },
  mb3: {
    marginTop: 25,
  },
  submitButtonContainer: {
    width: '100%',
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
  deleteButtonContainer: {
    width: '100%',
    marginTop: 20,
  },
  deleteButton: {
    backgroundColor: '#FF3F3F',
    borderRadius: 50,
    paddingVertical: 30,
    paddingHorizontal: 60,
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

