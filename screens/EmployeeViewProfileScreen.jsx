import React, { useContext } from 'react'
import { Text, View, Image, TouchableOpacity, StyleSheet } from 'react-native'
import { UserContext } from '../contexts/UserContext';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import ViewEmployeeProfile from '../components/employee/ViewEmployeeProfile';
import StyledText from '../components/Texts/StyledText';
import KeyboardAvoidingContainer from '../components/Containers/KeyboardAvoidingContainer';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function EmployeeViewProfileScreen() {


  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.content}>
        <KeyboardAvoidingContainer>
          <ViewEmployeeProfile />
        </KeyboardAvoidingContainer>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: -10,
    flex: 1,
    backgroundColor: '#4F6F52',
  },
  content: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pt10: {
    marginTop: 10,
    paddingTop: 130,
  },
  textCenter: {
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    padding: 10,
  },
});
