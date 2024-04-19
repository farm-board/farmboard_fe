import React, { useContext } from 'react'
import { Text, View, Image, TouchableOpacity, StyleSheet } from 'react-native'
import { UserContext } from '../contexts/UserContext';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import StyledText from '../components/Texts/StyledText';
import KeyboardAvoidingContainer from '../components/Containers/KeyboardAvoidingContainer';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ViewFarmProfile from '../components/Farm/ViewFarmProfile';

export default function FarmViewProfileScreen() {


  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={30}
            color="#ECE3CE"
            onPress={() => navigation.goBack()}
          />
        </TouchableOpacity>
          <Animated.Text entering={FadeInUp.duration(1000).springify()}>
            <StyledText bold tanColor style={[styles.text, styles.pb10]}>
              Farm Profile
            </StyledText>
          </Animated.Text>
        </View>
      <View style={styles.content}>
        <KeyboardAvoidingContainer>
          <ViewFarmProfile />
        </KeyboardAvoidingContainer>
      </View>
    </View>
  );
};

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
