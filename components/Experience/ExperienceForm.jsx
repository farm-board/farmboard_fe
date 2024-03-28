import React, { useState, useContext, useEffect } from 'react'
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { Text, View, TextInput, TouchableOpacity, Image, ScrollView } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../../contexts/UserContext';
import axios from 'axios';
import KeyboardAvoidingContainer from "../Containers/KeyboardAvoidingContainer";
import StyledTextInput from "../Inputs/StyledTextInput";
import StyledText from '../Texts/StyledText';
import { MaterialIcons as Icon } from '@expo/vector-icons';

export default function ExperienceForm({ setExperiences }) {
  const [data, setData] = useState({
    company_name: '',
    started_at: '',
    ended_at: '',
    description: '',
  })

  const navigation = useNavigation();
  const { currentUser, experiences } = useContext(UserContext); // Removed setExperiences

  const handleSubmit = () => {
    axios.post(`http://localhost:4000/api/v1/users/${currentUser.id}/employees/experiences`, { experience: data }) // Changed experience to data
    .then(response => {
      setExperiences(prevExperiences => [...prevExperiences, response.data.data]); // Update the experiences state
    })
    .catch(error => {
      console.error('There was an error creating the experience:', error);
    });
    }

  return (
    <KeyboardAvoidingContainer style={{paddingTop: 10, paddingBottom: 25, paddingHorizontal: 5}}>
    <View className="flex items-center">
        <Animated.Text entering={FadeInUp.duration(1000).springify()} className="pb-10">
          <StyledText big className="text-center">
              Fill in your details for previous work experience:
          </StyledText>
        </Animated.Text>
        <Animated.View entering={FadeInDown.duration(1000).springify()} className="rounded-2xl w-full">
            <StyledTextInput
              placeholder="Company Name"
              icon="account-outline"
              label="Company Name:"
              onChangeText={(text) => setData({...data, company_name: text})}
            />
        </Animated.View>
        <Animated.View entering={FadeInDown.duration(1000).springify()} className="rounded-2xl w-full">
            <StyledTextInput
              placeholder="Date Started"
              icon="account-outline"
              label="Date Started:"
              onChangeText={(text) => setData({...data, started_at: text})}
            />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(200).duration(1000).springify()} className="rounded-2xl w-full">
            <StyledTextInput
              placeholder="Date Ended"
              icon="city-variant-outline"
              label="Date Ended:"
              onChangeText={(text) => setData({...data, ended_at: text})}
            />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} className="rounded-2xl w-full">
            <StyledTextInput
              placeholder="Description"
              icon="star-box-outline"
              multiline={true}
              label="Description:"
              onChangeText={(text) => setData({...data, description: text})}
            />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} className="w-full">
            <TouchableOpacity className="w-full bg-green-700 p-3 rounded-2xl mb-3" onPress={handleSubmit}>
              <Text className="text-xl font-bold text-white text-center">
                Submit
              </Text>
            </TouchableOpacity>
        </Animated.View>
    </View>
    </KeyboardAvoidingContainer>
  )
}