import React, { useContext } from 'react'
import { Text, View, Image, TouchableOpacity, StyleSheet } from 'react-native'
import { UserContext } from '../contexts/UserContext';
import FarmProfile from '../components/Farm/FarmProfile';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
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
        {currentUser.role_type === "farm" ?
          <KeyboardAvoidingContainer>
            <FarmProfile />
          </KeyboardAvoidingContainer>
          :
          currentUser.role_type === "employee" ?
          <KeyboardAvoidingContainer>
              <EmployeeProfile />
          </KeyboardAvoidingContainer>
            : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: -35,
    flex: 1,
    backgroundColor: '#4F6F52',
  },
  content: {
    marign: 0,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
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

