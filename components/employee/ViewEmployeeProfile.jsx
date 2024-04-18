import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { UserContext } from '../../contexts/UserContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import Avatar from '../Profile/Avatar';
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { colors } from '../../config/theme'
import StyledText from '../Texts/StyledText'

export default function ViewEmployeeProfile() {
  const navigation = useNavigation();
  const { currentUser } = useContext(UserContext);
  const [employee, setEmployee] = useState({});
  const [experiences, setExperiences] = useState([]);
  const [references, setReferences] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [expanded, setExpanded] = useState(false); 

  const route = useRoute();
  const { employeeId } = route.params;

  useEffect(() => {
    setLoading(true); 
      axios.get(`http://localhost:4000/api/v1/users/${currentUser.id}/employees/${employeeId}/profile_info`)
    .then((employeeResponse) => {
      setEmployee(employeeResponse.data.attributes);
      setExperiences(employeeResponse.data.experiences); 
      setReferences(employeeResponse.data.references); 
      setLoading(false); 
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
    <View style={styles.container}>
      <View style={styles.topSectionContainer}>
        <View style={styles.leftContent}>
          <View style={[styles.avatarContainer, styles.marginBottom3]}>
              <Avatar uri={employee.image_url} />
          </View>
        </View>
        <View style={styles.rightContent}>
          <Text style={styles.name}>
            <StyledText big bold tanColor >
              {`${employee.first_name} ${employee.last_name}`}
            </StyledText>
          </Text>
          <Text style={styles.location}>
            <StyledText tanColor >
              {`${employee.city}, ${employee.state} ${employee.zip_code}`}
            </StyledText>
          </Text>
        </View>
      </View>
      <View style={styles.subContentContainer}>
        <StyledText big tanColor style={styles.sectionTitle}>Skills</StyledText>
        <View style={styles.skillContainer}>
          {employee.skills && employee.skills.slice(0, expanded ? employee.skills.length : 5).map((skill, index) => (
            <View key={index} style={styles.skillBubble}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
        {employee.skills && employee.skills.length > 5 && (
          <TouchableOpacity onPress={() => setExpanded(!expanded)} style={styles.showMoreButton}>
            <Text style={styles.showMoreButtonText}>{expanded ? 'Show less' : 'Show more'}</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.subContentContainer}>
        <StyledText big tanColor style={styles.sectionTitle}>About</StyledText>
        <StyledText small tanColor style={styles.sectionText}>{employee.bio}</StyledText>
      </View>
      <View style={styles.subContentContainer}>
          <StyledText big tanColor style={styles.sectionTitle}>Experience</StyledText>
          <View style={styles.experienceWrapper}>
            {experiences
              .sort((a, b) => new Date(b.ended_at) - new Date(a.ended_at)) // Sort by end date in descending order
              .slice(0, 3) // Slice the first three experiences
              .map((experience, index) => (
                <View key={index} style={[styles.experienceContainer, styles.experienceBox]}>
                  <Text style={styles.label}>Company Name:</Text>
                  <Text style={styles.experienceCompany}>{experience.company_name}</Text>
                  
                  <Text style={styles.label}>Employment:</Text>
                  <Text style={styles.experienceCompany}>
                  <Text>{`${experience.started_at} to ${experience.ended_at}`}</Text>
                  </Text>
                  <Text style={styles.label}>Description:</Text>
                  <Text style={styles.experienceCompany}>
                  <Text>{experience.description}
                  </Text>
                  </Text>
                </View>
              ))}
          </View>
        </View>
        <View style={styles.subContentContainer}>
          <StyledText big tanColor style={styles.sectionTitle}>References</StyledText>
          <View style={styles.experienceWrapper}>
            {references
              .slice(0, 3) // Slice the first three references
              .map((reference, index) => (
                <View key={index} style={[styles.experienceContainer, styles.experienceBox]}>
                  <Text style={styles.label}>Name:</Text>
                  <Text style={styles.experienceCompany}>{`${reference.first_name} ${reference.last_name}`}</Text>

                  <Text style={styles.label}>Contact:</Text>
                  <Text style={styles.experienceCompany}>{`${reference.phone}  ${reference.email}`}</Text>

                  <Text style={styles.label}>Relationship:</Text>
                  <Text style={styles.experienceCompany}>{reference.relationship}</Text>
                  
                </View>
              ))}
          </View>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minWidth: '100%',
    height: '100%',
  },
  topSectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F6F52',
    minWidth: '100%',
    shadowRadius: 20,
    shadowColor: 'black',
    shadowOpacity: 0.4,
    paddingBottom: 5,
    paddingHorizontal: 20,
    paddingVertical: 5,
  },
  rightContent: {
    flex: 3,
    marginLeft: 15,
  },
  avatarContainer: {
    paddingTop: 20,
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
  subContentContainer: {
    alignItems: 'right',
    backgroundColor: '#4F6F52',
    minWidth: '100%',
    shadowRadius: 20,
    shadowColor: 'black',
    shadowOpacity: 0.4,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 10,
  },
  skillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  location: {
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    paddingTop: 10,
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
  skillBubble: {
    backgroundColor: '#ECE3CE',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    marginBottom: 10,
  },
  skillText: {
    color: '#3A4D39',
  },
  showMoreButton: {
    backgroundColor: '#ECE3CE',
    paddingVertical: 5,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  showMoreButtonText: {
    color: '#3A4D39',
    fontSize: 16,
  },
  experienceWrapper: {
    justifyContent: 'space-between',
  },
  experienceContainer: {
    minWidth: '100%',
    padding: 10,
    backgroundColor: '#ECE3CE', 
    borderRadius: 10,
  },
  experienceBox: {
    padding: 10,
    marginBottom: 10,
  },
  label: {
    fontWeight: 'bold',
    color: '#3A4D39',
    fontSize: 14,
    paddingBottom: 2,
    paddingTop: 2,
  },
  editButton: {
    backgroundColor: "#739072",
    borderRadius: 24,
    padding: 8,
    position: "absolute",
    right: 15,
    top: 15,
  },
  experienceCompany: {
    color: '#3A4D39',
  },
  feedButton: {
    backgroundColor: colors.highlight,
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  feedButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});