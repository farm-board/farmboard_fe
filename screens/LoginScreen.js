import { View, Text, Image, TextInput, TouchableOpacity } from 'react-native'
import React from 'react'
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeIn, FadeInUp, FadeOut, FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
    const navigation = useNavigation();
  return (
    <View className="bg-white h-full w-full">
        <StatusBar style="light" />
        <Image className="h-full w-full absolute" source={require('../assets/images/background.png')} />

        {/* floating things */}
        <View className="flex-row justify-around w-full absolute">
            <Animated.Image entering={FadeInUp.delay(200).duration(1000).springify()} className="h-[225] w-[90]" source={require('../assets/images/longwheat.png')} />
            {/* <View style={{ marginTop: 65 }}>
            <Image className="h-[225] w-[225]" source={require('../assets/images/farmer.png')} />
            </View> */}
            <Animated.Image entering={FadeInUp.delay(400).duration(1000).springify()} className="h-[160] w-[65]" source={require('../assets/images/longwheat.png')} />
        </View>

        {/* title and form */}
        <View className='h-full w-full flex justify-around pt-40 pb-10'>
            {/* title */}
            <View className="flex items-center">
                <Animated.Text entering={FadeInUp.duration(1000).springify()} className="text-white font-bold tracking-wider text-5xl">
                    Login
                </Animated.Text>
            </View>

            {/* form */}
            <View className="flex items-center mx-4 space-y-4">
                <Animated.View entering={FadeInDown.duration(1000).springify()} className="bg-black/5 p-5 rounded-2xl w-full">
                    <TextInput placeholder='Email' placeholderTextColor={'gray'} />
                </Animated.View>
                <Animated.View entering={FadeInDown.delay(200).duration(1000).springify()} className="bg-black/5 p-5 rounded-2xl w-full mb-3">
                    <TextInput placeholder='Password' placeholderTextColor={'gray'} secureTextEntry />
                </Animated.View>
                <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} className="w-full">
                    <TouchableOpacity
                       className="w-full bg-green-700 p-3 rounded-2xl mb-3">
                        <Text className="text-xl font-bold text-white text-center">
                            Login
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
                <Animated.View entering={FadeInDown.delay(600).duration(1000).springify()} className="flex-row justify-center">
                    <Text>Don't have an account?</Text>
                    <TouchableOpacity onPress={()=> navigation.push('SignUp')}>
                        <Text className="text-sky-600"> Sign Up</Text>
                    </TouchableOpacity>
                        
                </Animated.View>
            </View>
        </View>
    </View>
  )
}