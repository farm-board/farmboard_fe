import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { UserContext } from '../contexts/UserContext';
import ExperienceForm from '../components/Experience/ExperienceForm';

export default function EmployeeProfileAddExperiencesScreen() {
  const {loading } = useContext(UserContext);
  const [experiences, setExperiences] = useState([]);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.content}>
        <ExperienceForm setExperiences={setExperiences}/>
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