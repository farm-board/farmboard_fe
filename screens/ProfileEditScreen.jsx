import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React, { useContext } from 'react';
import { StatusBar } from 'expo-status-bar';
import { UserContext } from '../contexts/UserContext';
import { useNavigation } from '@react-navigation/native';
import FarmProfileEdit from '../components/Farm/FarmProfileEdit';
import EmployeeProfileEdit from '../components/employee/EmployeeProfileEdit';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import StyledText from '../components/Texts/StyledText';


export default function ProfileEditScreen() {
  const { currentUser, logout, loading } = useContext(UserContext);
  const navigation = useNavigation();

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.content}>
        {currentUser.role_type === 'farm' ? (
          <FarmProfileEdit />
        ) : currentUser.role_type === 'employee' ? (
          <EmployeeProfileEdit />
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: -35,
    flex: 1,
    backgroundColor: '#4F6F52',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    resizeMode: 'cover',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 60,
    marginBottom: 10,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    padding: 10,
  },
});