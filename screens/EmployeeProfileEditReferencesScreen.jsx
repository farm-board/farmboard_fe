import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { UserContext } from '../contexts/UserContext';
import ReferenceEditForm from '../components/Reference/ReferenceEditForm';

export default function EmployeeProfileAddReferencesScreen({ route }) {
  const {loading } = useContext(UserContext);
  const { referenceId } = route.params;

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.content}>
        <ReferenceEditForm referenceId={referenceId} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3A4D39',
    marginBottom: -35,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
});