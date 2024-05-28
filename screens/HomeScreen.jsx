import React, { useContext } from 'react'
import { Text, View, Image, TouchableOpacity, StyleSheet } from 'react-native'
import { UserContext } from '../contexts/UserContext';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar'
import StyledText from '../components/Texts/StyledText';
import KeyboardAvoidingContainer from '../components/Containers/KeyboardAvoidingContainer';
import FarmHome from '../components/Farm/FarmHome';

export default function HomeScreen({ navigation }) {

  const handleLogout = () => {
    logout(navigation);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.content}>
          <KeyboardAvoidingContainer>
            <FarmHome />
          </KeyboardAvoidingContainer>
      </View>
      <Animated.View entering={FadeInDown.delay(1400).duration(1000).springify()} style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.redButton}
          onPress={handleLogout}>
          <Text style={styles.buttonText}>
            Log Out
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4F6F52',
  },
  content: {
    minHeight: '110%',
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
    marginTop: 60,
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