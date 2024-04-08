import { View, Text, StyleSheet } from 'react-native'
import React, { useContext } from 'react';
import { StatusBar } from 'expo-status-bar';
import { UserContext } from '../contexts/UserContext';
import FarmProfileEditAccommodations from '../components/Farm/FarmProfileEditAccommodations';


export default function FarmProfileEditAccommodationsScreen() {
  const { loading } = useContext(UserContext);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.content}>
        <FarmProfileEditAccommodations />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
});