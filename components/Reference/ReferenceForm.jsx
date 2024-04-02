import React, { useState, useContext, useEffect } from 'react'
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { Text, View, TextInput, TouchableOpacity, Image, ScrollView } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../../contexts/UserContext';
import axios from 'axios';
import KeyboardAvoidingContainer from "../Containers/KeyboardAvoidingContainer";
import StyledTextInput from "../Inputs/StyledTextInput";
import StyledText from '../Texts/StyledText';
import { Alert } from 'react-native';

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
    axios.post(`http://localhost:4000/api/v1/users/${currentUser.id}/employees/references`, { reference: data })
      .then(response => {
        setReferences(prevReferences => [...prevReferences, response.data.data]);
    
        Alert.alert(
          'Reference Added',
          'Your reference has been successfully added.',
          [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
        );
      })
      .catch(error => {
        console.error('There was an error creating the reference:', error);
      });
  }

  return (
    <KeyboardAvoidingContainer style={{paddingTop: 10, paddingBottom: 25, paddingHorizontal: 5}}>
    <View className="flex items-center">
        <Animated.Text entering={FadeInUp.duration(1000).springify()} className="pb-10">
          <StyledText big className="text-center">
              Fill in your details for Reference:
          </StyledText>
        </Animated.Text>
        <Animated.View entering={FadeInDown.duration(1000).springify()} className="rounded-2xl w-full">
            <StyledTextInput
              placeholder="First Name"
              icon="account-outline"
              label="First Name:"
              onChangeText={(text) => setData({...data, first_name: text})}
            />
        </Animated.View>
        <Animated.View entering={FadeInDown.duration(1000).springify()} className="rounded-2xl w-full">
            <StyledTextInput
              placeholder="Last Name"
              icon="account-outline"
              label="Last Name:"
              onChangeText={(text) => setData({...data, last_name: text})}
            />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(200).duration(1000).springify()} className="rounded-2xl w-full">
            <StyledTextInput
              placeholder="Phone Number"
              icon="city-variant-outline"
              label="Phone Number:"
              onChangeText={(text) => setData({...data, phone: text})}
            />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} className="rounded-2xl w-full">
            <StyledTextInput
              placeholder="Email"
              icon="star-box-outline"
              label="Email:"
              onChangeText={(text) => setData({...data, email: text})}
            />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} className="rounded-2xl w-full">
            <StyledTextInput
              placeholder="Relationship"
              icon="star-box-outline"
              label="Relationship:"
              onChangeText={(text) => setData({...data, relationship: text})}
            />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} className="w-full">
            <TouchableOpacity className="w-full bg-green-700 p-3 rounded-2xl mb-3" onPress={handleSubmit}>
              <Text className="text-xl font-bold text-white text-center">
                Add Reference
              </Text>
            </TouchableOpacity>
        </Animated.View>
    </View>
    </KeyboardAvoidingContainer>
  )
}