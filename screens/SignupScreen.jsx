import { View, Text, Image, TextInput, TouchableOpacity, Alert } from 'react-native'
import React, { useState, useContext } from 'react'
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeIn, FadeInUp, FadeOut, FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { UserContext } from '../contexts/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SignupScreen() {
    const [data, setData] = useState({
        email: '',
        password: '',
        password_confirmation: '',
    })
    
    const navigation = useNavigation();

    const { currentUser, setCurrentUser } = useContext(UserContext);

    const handleSubmit = () => {
        if (data.password !== data.password_confirmation) {
            Alert.alert(
                "Password Error", // Title of the popup
                "Passwords do not match!", // Message in the popup
                [
                    { text: "OK", onPress: () => console.log("OK Pressed") }
                ]
            );
            return;
        }

        const user = {
            user: {
              email: data.email,
              password: data.password,
              password_confirmation: data.password_confirmation
            }
        };

        axios.post('http://localhost:4000/', user)
        .then(response => {
            setCurrentUser(response.data.data);
            AsyncStorage.setItem('token', response.headers.authorization);
            if (response.data.data.role_type === "no_role") {
                navigation.push('Setup');
            }
            else {
                navigation.push('Profile');
            }
        })
        .catch(error => {
            console.log(error);
            console.log(error.message);
        })
    }
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
        <View className='h-full w-full flex justify-around pt-48'>
            {/* title */}
            <View className="flex items-center">
                <Animated.Text entering={FadeInUp.duration(1000).springify()} className="text-white font-bold tracking-wider text-5xl">
                    Sign Up
                </Animated.Text>
            </View>

            {/* form */}
            <View className="flex items-center mx-4 space-y-4">
                <Animated.View entering={FadeInDown.duration(1000).springify()} className="bg-black/5 p-5 rounded-2xl w-full">
                    <TextInput 
                        placeholder='Email' 
                        placeholderTextColor={'gray'}
                        onChangeText={text => setData({ ...data, email: text })} 
                    />
                </Animated.View>
                <Animated.View entering={FadeInDown.delay(200).duration(1000).springify()} className="bg-black/5 p-5 rounded-2xl w-full">
                    <TextInput 
                        placeholder='Password' 
                        placeholderTextColor={'gray'} 
                        secureTextEntry
                        onChangeText={text => setData({ ...data, password: text })} 
                    />
                </Animated.View>
                <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} className="bg-black/5 p-5 rounded-2xl w-full mb-3">
                    <TextInput 
                        placeholder='Password Confirmation' 
                        placeholderTextColor={'gray'} 
                        secureTextEntry
                        onChangeText={text => setData({ ...data, password_confirmation: text })}
                    />
                </Animated.View>
                <Animated.View entering={FadeInDown.delay(600).duration(1000).springify()} className="w-full">
                    <TouchableOpacity
                       className="w-full bg-green-800 p-3 rounded-2xl mb-3" onPress={handleSubmit}>
                        <Text className="text-xl font-bold text-white text-center">
                            Sign Up
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
                <Animated.View entering={FadeInDown.delay(800).duration(1000).springify()} className="flex-row justify-center">
                    <Text>Already have an account?</Text>
                    <TouchableOpacity onPress={()=> navigation.push('Login')}>
                        <Text className="text-sky-600"> Login</Text>
                    </TouchableOpacity>
                        
                </Animated.View>
            </View>
        </View>
    </View>
  )
}