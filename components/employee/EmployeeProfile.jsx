import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { UserContext } from '../../contexts/UserContext';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import Animated from 'react-native-reanimated'; // Only importing Animated from react-native-reanimated
import ExperienceForm from '../Experience/ExperienceForm';
import KeyboardAvoidingContainer from '../Containers/KeyboardAvoidingContainer';
import Avatar from '../Profile/Avatar';

export default function EmployeeProfile() {
  const navigation = useNavigation();
  const { currentUser } = useContext(UserContext);
  const [employee, setEmployee] = useState({});
  const [experiences, setExperiences] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [loading, setLoading] = useState(true); // Introducing a loading state

  useEffect(() => {
    setLoading(true); // Set loading state to true before making requests
    Promise.all([
      axios.get(`http://localhost:4000/api/v1/users/${currentUser.id}/employees`),
      axios.get(`http://localhost:4000/api/v1/users/${currentUser.id}/employees/experiences`),
      axios.get(`http://localhost:4000/api/v1/users/${currentUser.id}/employees/image`)
    ])
    .then(([employeeResponse, experiencesResponse, imageResponse]) => {
      setEmployee(employeeResponse.data.data.attributes);
      setExperiences(experiencesResponse.data); // Assuming experiencesResponse.data is an array
      setProfilePhoto(imageResponse.data.image_url);
      setLoading(false); // Set loading state to false after receiving responses
    })
    .catch(error => {
      console.error('There was an error fetching the employee or experiences:', error);
      setLoading(false); // Set loading state to false in case of error
    });
  }, [currentUser.id]);

  if (loading) {
    return <Text>Loading...</Text>; // Render loading indicator
  }

  return (
    <KeyboardAvoidingContainer style={styles.container} behavior="padding">
      <Animated.View style={styles.avatarContainer}>
        <Avatar uri={profilePhoto} />
      </Animated.View>
      <Text style={styles.name}>{`${employee.first_name} ${employee.last_name}`}</Text>
      <View style={styles.contentContainer}>
        <Text style={styles.location}>{`${employee.city}, ${employee.state} ${employee.zip_code}`}</Text>
        <View style={styles.line} />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Bio:</Text>
        <Text style={styles.sectionText}>{employee.bio}</Text>
        <View style={styles.line} />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Skills:</Text>
        {employee.skills && employee.skills.map((skill, index) => (
          <Text key={index} style={styles.sectionText}>{skill}</Text>
        ))}
        <View style={styles.line} />
      </View>
      <Text style={styles.sectionTitle}>Experience:</Text>
    </KeyboardAvoidingContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    minWidth: '100%',
    height: '100%',
  },
  avatarContainer: {
    marginBottom: 5,
    alignItems: 'center',
  },
  name: {
    fontSize: 35,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  contentContainer: {
    marginBottom: 15,
    alignItems: 'center',
  },
  location: {
    textAlign: 'center',
  },
  line: {
    borderBottomWidth: 1,
    borderBottomColor: 'white',
    marginVertical: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  sectionText: {
    fontSize: 14,
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

