import React, { useState, useContext } from 'react'
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { Text, View, TextInput, TouchableOpacity, ScrollView } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../../contexts/UserContext';
import axios from 'axios';
import SectionedMultiSelect from 'react-native-sectioned-multi-select';
import { MaterialIcons as Icon } from '@expo/vector-icons';

const skills = [
  { name: 'Crop Management', id: 1 },
  { name: 'Soil Health Management', id: 2 },
  { name: 'Equipment Operation', id: 3 },
  { name: 'Equipment Maintenance', id: 4 },
  { name: 'Weed Management', id: 5 },
  { name: 'Weather and Climate Awareness', id: 6 },
  { name: 'Grafting and Propagation', id: 7 },
  { name: 'Heavy Equipment Operation', id: 8 },
  { name: 'CLD', id: 9 },
  { name: 'Mechanical and Welding Skills', id: 10 }
]



export default function EmployeeForm() {
  const [data, setData] = useState({
    first_name: '',
    last_name: '',
    city: '',
    state: '',
    zip_code: '',
    skills: [],
    bio: '',
    age: ''
  })

  const [selectedItems, setSelectedItems] = useState([]);

  const onSelectedItemsChange = (selectedItems) => {
    setSelectedItems(selectedItems);
    setData({...data, skills: selectedItems});
  }

  const navigation = useNavigation();

  const { currentUser } = useContext(UserContext);

  const handleSubmit = () => {
    axios.put(`http://localhost:4000/api/v1/users/${currentUser.id}/employees`, { employee: data})
    .then(response => {
      console.log(response.data);
      navigation.push('Home');
    })
    .catch(error => {
      console.log('Unable to register user', error);
    })
  }


  return (
    <ScrollView>
    <View className="flex items-center">
        <Animated.Text entering={FadeInUp.duration(1000).springify()} className="text-white font-bold tracking-wider text-3xl pb-10">
            Fill in your details to get started with your profile:
        </Animated.Text>
        <Animated.View entering={FadeInDown.duration(1000).springify()} className="rounded-2xl w-full mb-3">
          <TextInput 
            placeholder="First Name"
            placeholderTextColor="gray"
            className="w-full bg-gray-200 p-3 rounded-2xl mb-3"
            onChangeText={(text) => setData({...data, first_name: text})}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(200).duration(1000).springify()} className="rounded-2xl w-full mb-3">
          <TextInput 
            placeholder="Last Name"
            placeholderTextColor="gray"
            className="w-full bg-gray-200 p-3 rounded-2xl mb-3"
            onChangeText={(text) => setData({...data, last_name: text})}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} className="rounded-2xl w-full mb-3">
          <TextInput 
            placeholder="City"
            placeholderTextColor="gray"
            className="w-full bg-gray-200 p-3 rounded-2xl mb-3"
            onChangeText={(text) => setData({...data, city: text})}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(600).duration(1000).springify()} className="rounded-2xl w-full mb-3">
          <TextInput 
            placeholder="State"
            placeholderTextColor="gray"
            className="w-full bg-gray-200 p-3 rounded-2xl mb-3"
            onChangeText={(text) => setData({...data,  state: text})}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(800).duration(1000).springify()} className="rounded-2xl w-full mb-3">
          <TextInput 
            placeholder="Zip Code" 
            placeholderTextColor="gray"
            className="w-full bg-gray-200 p-3 rounded-2xl mb-3" 
            multiline
            numberOfLines={4}
            onChangeText={(text) => setData({...data, zip_code: text})} 
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(1000).duration(1000).springify()} className="rounded-2xl w-full mb-3 bg-gray-200">
        <SectionedMultiSelect
        items={skills}
        IconRenderer={Icon}
        uniqueKey="id"
        onSelectedItemsChange={onSelectedItemsChange}
        selectedItems={selectedItems}
        />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(1000).duration(1000).springify()} className="rounded-2xl w-full mb-3">
          <TextInput 
            placeholder="Bio"
            placeholderTextColor="gray"
            className="w-full bg-gray-200 p-3 rounded-2xl mb-3"
            onChangeText={(text) => setData({...data, bio: text})}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(1000).duration(1000).springify()} className="rounded-2xl w-full mb-3">
          <TextInput 
            placeholder="Age"
            placeholderTextColor="gray"
            className="w-full bg-gray-200 p-3 rounded-2xl mb-3"
            onChangeText={(text) => setData({...data, age: text})}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} className="w-full">
          <TouchableOpacity className="w-full bg-green-700 p-3 rounded-2xl mb-20" onPress={handleSubmit}>
            <Text className="text-xl font-bold text-white text-center">
              Submit
            </Text>
          </TouchableOpacity>
        </Animated.View>
    </View>
    </ScrollView>
  )
}