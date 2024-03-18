import React, { useState, useContext } from 'react'
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { Text, View, TextInput, TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../../contexts/UserContext';
import axios from 'axios';


export default function FarmForm({ textConfig}) {
  const [data, setData] = useState({
    name: '',
    state: '',
    city: '',
    zip_code: '',
    bio: ''
  })

  const navigation = useNavigation();

  const { currentUser } = useContext(UserContext);

  const handleSubmit = () => {
    axios.put(`http://localhost:4000/api/v1/users/${currentUser.id}/farms`, { farm: data})
    .then(response => {
      console.log(response.data);
      navigation.push('Home');
    })
    .catch(error => {
      console.log('Unable to register user', error);
    })
  }


  return (
    <View className="flex items-center">
        <Animated.Text entering={FadeInUp.duration(1000).springify()} className="text-white font-bold tracking-wider text-3xl pb-10">
            Fill in your details to get started with your farm profile:
        </Animated.Text>
        <Animated.View entering={FadeInDown.duration(1000).springify()} className="rounded-2xl w-full mb-3">
          <TextInput 
            placeholder="Name"
            placeholderTextColor="gray"
            className="w-full bg-gray-200 p-3 rounded-2xl mb-3"
            onChangeText={(text) => setData({...data, name: text})}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(200).duration(1000).springify()} className="rounded-2xl w-full mb-3">
          <TextInput 
            placeholder="City"
            placeholderTextColor="gray"
            className="w-full bg-gray-200 p-3 rounded-2xl mb-3"
            onChangeText={(text) => setData({...data, city: text})}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} className="rounded-2xl w-full mb-3">
          <TextInput 
            placeholder="State"
            placeholderTextColor="gray"
            className="w-full bg-gray-200 p-3 rounded-2xl mb-3"
            onChangeText={(text) => setData({...data, state: text})}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(600).duration(1000).springify()} className="rounded-2xl w-full mb-3">
          <TextInput 
            placeholder="Zip Code"
            placeholderTextColor="gray"
            className="w-full bg-gray-200 p-3 rounded-2xl mb-3"
            onChangeText={(text) => setData({...data,  zip_code: text})}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(800).duration(1000).springify()} className="rounded-2xl w-full mb-3">
          <TextInput 
            placeholder="Bio" 
            placeholderTextColor="gray"
            className="w-full bg-gray-200 p-3 rounded-2xl mb-3" 
            multiline
            numberOfLines={4}
            onChangeText={(text) => setData({...data, bio: text})} 
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(1000).duration(1000).springify()} className="rounded-2xl w-full mb-3">
          <TextInput 
            placeholder="Image"
            placeholderTextColor="gray"
            className="w-full bg-gray-200 p-3 rounded-2xl mb-3"
            onChangeText={(text) => setData({...data, image: text})}
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
  )
}

