import React from 'react'
import { View, StyleSheet } from 'react-native'
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import KeyboardAvoidingContainer from '../components/Containers/KeyboardAvoidingContainer';
import ViewFarmProfile from '../components/Farm/ViewFarmProfile';

export default function FarmViewProfileScreen() {

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
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
    backgroundColor: '#4F6F52',
    marginBottom: -35,
  },
  content: {
    marign: 0,
    height: '100%',
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
