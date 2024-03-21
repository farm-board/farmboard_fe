import React, { useContext } from 'react'
import { Text, View, Image, TouchableOpacity } from 'react-native'
import { UserContext } from '../contexts/UserContext';
import FarmProfile from '../components/Farm/FarmProfile';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {

  const{currentUser, logout} = useContext(UserContext);

  const navigation = useNavigation();

  const handleLogout = () => {
    logout(navigation);
  };

  return (
    <View className="bg-white h-full w-full">
      <StatusBar style="light" />
      <Image className="h-full w-full absolute" source={require('../assets/images/backgroundFullColor.png')} />
      <View className='h-full w-full flex justify-around'>
        <View className="flex items-center mx-4 space-y-4 pb-5">
            { currentUser.role_type === "farm" ?
            <View>
              <FarmProfile/>
            </View>
            : 
            currentUser.role_type === "employee" ?
            <View>
              <Text>Employee Profile</Text>
            </View>
            : null }
        </View>
        <Animated.View entering={FadeInDown.delay(1400).duration(1000).springify()} className="flex items-center mx-4 space-y-4 pt-10">
          <TouchableOpacity
              className="w-full bg-red-800 p-3 rounded-2xl mb-20" onPress={handleLogout}>
              <Text className="text-xl font-bold text-white text-center">
                  Log Out
              </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  )
}
