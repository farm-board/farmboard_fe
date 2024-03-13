import { View, Text, Image, TextInput, TouchableOpacity } from 'react-native'
import Animated, { FadeIn, FadeInUp, FadeOut, FadeInDown } from 'react-native-reanimated';
import React, { useContext } from 'react';
import { StatusBar } from 'expo-status-bar';
import { UserContext } from '../contexts/UserContext';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';


export default function SetupScreen() {
  const roleTypes = { 0: "no_role", 1: "farmer", 2: "employee" };
  const navigation = useNavigation();
  const { setCurrentUser, currentUser, logout, loading } = useContext(UserContext);

  const handleLogout = () => {
    logout(navigation);
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  const handleRoleChange = async (role) => {
    // Get the token from AsyncStorage
    const token = await AsyncStorage.getItem('token');

    axios.patch('http://localhost:4000/current_user/update', {
      user: {
          role_type: role
      }
    },
    {
      headers: {
          Authorization: token
      }
    }
    )
    .then(response => {
        console.log(currentUser.role_type);
        console.log('User role updated successfully:', response.data);
        setCurrentUser({
          ...currentUser,
          role_type: roleTypes[role]
        });
    })
    .catch(error => {
        console.error('There was an error updating the user role:', error);
    });
}

  return (
    <View className="bg-white h-full w-full">
      <StatusBar style="light" />
      <Image className="h-full w-full absolute" source={require('../assets/images/background.png')} />
      <View className='h-full w-full flex justify-around pt-40 pb-20'>
        <View className="flex items-center mx-4 space-y-4 pb-10">
            <Animated.Text entering={FadeInUp.delay(200).duration(1000).springify()} className="text-white font-bold tracking-wider text-3xl">
                you are currently logged in as: {currentUser.email }
            </Animated.Text>
            <View className="h-full w-full flex items-center pt-60">
              <Animated.Text entering={FadeInUp.duration(1000).springify()} className="text-black font-bold tracking-wider text-3xl pb-10">
                  Please Select your role:
              </Animated.Text>
              <TouchableOpacity entering={FadeInDown.delay(400).duration(1000).springify()}
                className="w-full bg-green-700 p-3 rounded-2xl mb-3" onPress={() => handleRoleChange(1)}>
                <Text className="text-xl font-bold text-white text-center">
                    Farmer
                </Text>
            </TouchableOpacity>
            <TouchableOpacity entering={FadeInDown.delay(600).duration(1000).springify()}
                className="w-full bg-green-700 p-3 rounded-2xl mb-3" onPress={() => handleRoleChange(2)}>
                <Text className="text-xl font-bold text-white text-center">
                    Employee
                </Text>
            </TouchableOpacity>
          </View>
        </View>
        <Animated.View entering={FadeInDown.delay(800).duration(1000).springify()} className="flex items-center mx-4 space-y-4 pb-10">
          <TouchableOpacity
              className="w-full bg-green-700 p-3 rounded-2xl mb-3" onPress={handleLogout}>
              <Text className="text-xl font-bold text-white text-center">
                  Log Out
              </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  )
}
