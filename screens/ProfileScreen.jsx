import React, { useContext } from 'react'
import { Text, View, Image, TouchableOpacity, StyleSheet } from 'react-native'
import { UserContext } from '../contexts/UserContext';
import FarmProfile from '../components/Farm/FarmProfile';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import EmployeeForm from '../components/employee/EmployeeForm';
import EmployeeProfile from '../components/employee/EmployeeProfile';
import StyledText from '../components/Texts/StyledText';
import KeyboardAvoidingContainer from '../components/Containers/KeyboardAvoidingContainer';

export default function ProfileScreen() {

  const{currentUser, logout} = useContext(UserContext);

  const navigation = useNavigation();

  const handleLogout = () => {
    logout(navigation);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.content}>
          <Animated.Text entering={FadeInUp.duration(1000).springify()} className="pt-10">
            <StyledText bold className="text-center">
              Profile
            </StyledText>
          </Animated.Text>
            { currentUser.role_type === "farm" ?
            <View>
              <FarmProfile/>
            </View>
            : 
            currentUser.role_type === "employee" ?
            <View>
              <EmployeeProfile/>
            </View>
            : null }
        </View>
        <Animated.View entering={FadeInDown.delay(1400).duration(1000).springify()} className="flex items-center mx-4 space-y-4 pt-10">
          <TouchableOpacity
              className="w-full bg-green-700 p-3 rounded-2xl mb-20" onPress={handleEdit}>
              <Text className="text-xl font-bold text-white text-center">
                  Edit Profile
              </Text>
          </TouchableOpacity>
          <TouchableOpacity
              className="w-full bg-red-800 p-3 rounded-2xl mb-20" onPress={handleLogout}>
              <Text className="text-xl font-bold text-white text-center">
                  Log Out
              </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#739072',
  },
  content: {
    marign: 0,
    height: '80%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pt10: {
    marginTop: 10,
    paddingTop: 130,
    paddingBottom: 10,
  },
  textCenter: {
    textAlign: 'center',
  },
  buttonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greenButton: {
    width: '80%',
    backgroundColor: '#3EA143',
    padding: 10,
    borderRadius: 20,
    marginBottom: 20,
  },
  redButton: {
    width: '80%',
    backgroundColor: '#A32E2E',
    padding: 10,
    borderRadius: 20,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
});

