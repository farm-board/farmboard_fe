import { View, Text, Image, TextInput, TouchableOpacity } from 'react-native'
import Animated, { FadeIn, FadeInUp, FadeOut, FadeInDown } from 'react-native-reanimated';
import React, { useContext } from 'react';
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../contexts/UserContext';

export default function HomeScreen() {

  const navigation = useNavigation();
  const { setCurrentUser, currentUser, logout, loading } = useContext(UserContext);

  const handleLogout = () => {
    logout(navigation);
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View className="bg-white h-full w-full">
      <Image className="h-full w-full absolute" source={require('../assets/images/background.png')} />
      <View className='h-full w-full flex justify-around pt-40 pb-20'>
      <Animated.Text entering={FadeInUp.delay(200).duration(1000).springify()} className="text-white font-bold tracking-wider text-3xl">
          Home you are currently logged in as: {currentUser.email }
      </Animated.Text>
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
