import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Modal, ScrollView, Button } from 'react-native'
import React, { useContext, useState, useEffect } from 'react'
import { UserContext } from '../../contexts/UserContext'
import axios from 'axios'
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated'
import Avatar from '../Profile/Avatar'
import StyledText from '../Texts/StyledText'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useNavigation, useFocusEffect } from '@react-navigation/native'

export default function FarmHome() {
  const {currentUser} = useContext(UserContext);
  const [farm, setFarm] = useState({});
  const [expandedMap, setExpandedMap] = useState({});
  const [postings, setPostings] = useState([]);
  const [applicantsMap, setApplicantsMap] = useState({});
  const [applicants, setApplicants] = useState([]);
  const [visibleModal, setVisibleModal] = useState(false);
  const [currentPostingId, setCurrentPostingId] = useState(null);

  const width = Dimensions.get('window').width;
  const navigation = useNavigation();

  const fetchPostings = async () => {
    try {
      const postingsResponse = await axios.get(`http://localhost:4000/api/v1/users/${currentUser.id}/farms/postings`);
      return postingsResponse;
    } catch (error) {
      console.error("There was an error fetching the farm's postings:", error);
    }
  };
  
  const fetchApplicantsCount = async (postingId) => {
    try {
      const applicantsResponse = await axios.get(`http://localhost:4000/api/v1/users/${currentUser.id}/farms/postings/${postingId}/applicants`);
      console.log('Applicants:', applicantsResponse.data);
  
      // Set applicants only for the current posting being viewed
      setApplicants(applicantsResponse.data);
  
      // Set applicantsMap for the current posting
      setApplicantsMap(prevMap => ({
        ...prevMap,
        [postingId]: applicantsResponse.data.length,
      }));
    } catch (error) {
      console.error(`Error fetching applicants for posting ${postingId}:`, error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const farmResponse = await axios.get(`http://localhost:4000/api/v1/users/${currentUser.id}/farms`);
        console.log('current farm:', farmResponse.data.data.attributes);
        setFarm(farmResponse.data.data.attributes);
  
        const postingsResponse = await fetchPostings();
        if (postingsResponse) {
          console.log('Postings:', postingsResponse.data.data);
          setPostings(postingsResponse.data.data);
  
          // Fetch applicants for each posting
          await Promise.all(postingsResponse.data.data.map(posting => fetchApplicantsCount(posting.id)));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  }, [currentUser.id]); // Only trigger on currentUser.id changes
  
  if (farm === undefined) {
    return <Text>Loading...</Text>;
  }

  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        try {
          const farmResponse = await axios.get(`http://localhost:4000/api/v1/users/${currentUser.id}/farms`);
          console.log('current farm:', farmResponse.data.data.attributes);
          setFarm(farmResponse.data.data.attributes);
    
          const postingsResponse = await fetchPostings();
          if (postingsResponse) {
            console.log('Postings:', postingsResponse.data.data);
            setPostings(postingsResponse.data.data);
    
            // Fetch applicants for each posting
            await Promise.all(postingsResponse.data.data.map(posting => fetchApplicantsCount(posting.id)));
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
    
      fetchData();
    }, [currentUser.id]) // Only trigger on currentUser.id changes
  );

  const calculateDaysAgo = (createdAt) => {
  
    const createdDate = new Date(createdAt);
    const currentDate = new Date();
    const differenceInTime = currentDate.getTime() - createdDate.getTime();
    const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));
    return `${differenceInDays} day(s) ago`;
  };

  const handlePostingCreate = () => {
    navigation.navigate('Farm Profile Add Postings', {sourceStack: 'Home'});
  }
  
  const handlePostingEdit = (postingId) => {
    console.log('Posting ID:', postingId);
    navigation.navigate('Farm Profile Edit Postings', {postingId, sourceStack: 'Home'}); // Pass postingId as a parameter
  }

  const handleEmployeeProfileView = (employeeId) => {
    navigation.navigate('Employee Profile View', { employeeId });
    setModalVisible(false);
  };

  const setModalVisible = async (visible, postingId) => {
    setCurrentPostingId(postingId);
    if (visible) {
      await fetchApplicantsCount(postingId);
    }
    setVisibleModal(visible);
  };

  const clearApplicantsAndModal = () => {
    setApplicants([]);
    setVisibleModal(false);
  };


  const toggleExpanded = (postingId) => {
  setExpandedMap(prevState => ({
    ...prevState,
    [postingId]: !prevState[postingId],
  }));
};

  const renderModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visibleModal}
      onRequestClose={clearApplicantsAndModal}
    >
      <ScrollView contentContainerStyle={styles.modalContainer}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={30}
            color="white"
            onPress={() => setModalVisible(false)}
          />
        </TouchableOpacity>
          <Animated.Text entering={FadeInUp.duration(1000).springify()}>
            <StyledText bold big >
              Applicants
            </StyledText>
          </Animated.Text>
        </View>
        {applicants.map((applicant) => (
          console.log('Applicant ID:', applicant.id),
          <View key={applicant.id} style={styles.modalSectionContainer}>
            <View style={styles.modalContentContainer}>
              <View style={styles.leftContent}>
                <View style={[styles.avatarContainer, styles.marginBottom3]}>
                  <Avatar uri={applicant.image_url}/>
                </View>
              </View>
              <View style={styles.rightContent}>
                <Text style={styles.farmName}>
                  <StyledText big bold >{applicant.first_name} {applicant.last_name}</StyledText>
                </Text>
                <Text style={styles.farmAddress}>
                  <StyledText>{applicant.city}, {applicant.state}</StyledText>
                </Text>
              </View>
            </View>
              <Text style={styles.postingPosted}>
                <StyledText bold >Applied {calculateDaysAgo(applicant.created_at)} </StyledText>
              </Text>
            <View>
              <TouchableOpacity style={styles.ViewApplicantButton} 
                onPress={() => handleEmployeeProfileView(applicant.id)}  
              >
                <StyledText bold style={styles.ViewApplicantButtonText}>View Applicant Proflie</StyledText>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.postingsContainer}>
        {postings.length === 0 ?
        <StyledText bold style={styles.postingsNotFoundText}>
          You do not currently have any active postings. Click on the button below to add a new job posting to your farm.
        </StyledText> 
        : null }
        <TouchableOpacity style={styles.addPostingButton} onPress={handlePostingCreate}>
          <Text style={styles.addPostingText}>Create New Posting</Text>
        </TouchableOpacity>
        {postings.length > 0 ?
        <>
          <StyledText bold big style={styles.postingActiveTitle}>
            Your Current Postings:
          </StyledText> 
          {postings.map((posting) => {
            return (
              <View style={styles.postingContainer} key={posting.id}>
                <TouchableOpacity 
                  style={styles.editPostingPencil} 
                  onPress={() => handlePostingEdit(posting.id)}
                >
                  <MaterialCommunityIcons name="pencil-outline" size={24} color='#3A4D39' />
                </TouchableOpacity>
                <StyledText bold style={styles.postingTitle}>
                  {posting.attributes.title}
                </StyledText>
                <View style={styles.divider}></View>
                <View style={styles.itemRow}>
                  <StyledText bold style={styles.postingItem}>
                    Compensation:
                  </StyledText>
                  <StyledText style={styles.postingItem}>
                    ${posting.attributes.salary} / {posting.attributes.payment_type}
                  </StyledText>
                </View>
                <View style={styles.itemRow}>
                  <StyledText bold style={styles.postingItem}>
                    Duration:
                  </StyledText>
                  <StyledText style={styles.postingItem}>
                    {posting.attributes.duration}
                  </StyledText>
                </View>
                <View style={styles.itemRow}>
                  <StyledText bold style={styles.postingItem}>
                    Offers Accommodations:
                  </StyledText>
                  <StyledText style={styles.postingItem}>
                    {posting.attributes.offers_lodging === true ? "Yes" : "No"}
                  </StyledText>
                </View>
                <View style={styles.midModalContainer}>
                  {expandedMap[posting.id] && (
                  <StyledText bold style={styles.postingItem}>Required Skills:</StyledText>
                  )}
                {expandedMap[posting.id] && (
                  <View style={styles.skillContainer}>
                    {posting?.attributes.skill_requirements && posting?.attributes.skill_requirements.map((skill, index) => (
                      <View key={index} style={styles.skillBubble}>
                        <Text style={styles.skillText}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                )}
                {posting?.attributes.skill_requirements && posting?.attributes.skill_requirements.length > 0 && (
                  <TouchableOpacity onPress={() => toggleExpanded(posting.id)} style={styles.showMoreButton}>
                    <StyledText bold style={styles.showMoreButtonText}>
                      {expandedMap[posting.id] ? 'Hide Skills' : 'Show Skills'}
                    </StyledText>
                  </TouchableOpacity>
                )}
              </View>
                <StyledText bold style={styles.postingItem}>
                  Description:
                </StyledText>
                <StyledText style={styles.postingItemDescription}>
                  {posting.attributes.description}
                </StyledText>
                <View style={styles.divider}></View>
                  {applicantsMap[posting.id] > 0 ?
                  <View>
                  <StyledText style={styles.applicantNumber}>
                    {applicantsMap[posting.id] === 1 ? '1 person has applied for this posting.' : applicantsMap[posting.id] > 1 ? `${applicantsMap[posting.id]} people have applied for this posting.` : null }
                  </StyledText>
                  <TouchableOpacity 
                    style={styles.editPostingButton} 
                    onPress={() => setModalVisible(true, posting.id)} // Pass posting ID to setModalVisible
                  >
                    <StyledText bold style={styles.ViewApplicantPostingButtonText}>
                      {applicantsMap[posting.id] === 1 ? 'View Applicant' : 'View Applicants'}
                    </StyledText>
                  </TouchableOpacity>
                  </View>
                  : 
                  <StyledText style={styles.applicantNumber}>
                    No one has applied for this posting yet.
                  </StyledText>
                  }
              </View>
            );
          })}
        </>
        : null }
      </View>
      {renderModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 40,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 10,
  },
  leftContent: {
    marginTop: 20,
  },
  rightContent: {
    flex: 1,
    marginTop: 20,
  },
  farmName: {
    textAlign: 'right',
    marginEnd: 20,
    letterSpacing: 1,
    paddingBottom: 5,
  },
  farmAddress: {
    textAlign: 'right',
    marginEnd: 20,
    letterSpacing: 1,
    marginBottom: 20,
  },
  paddingBottom5: {
    paddingBottom: 5,
  },
  paddingBottom10: {
    paddingBottom: 10,
  },
  editButton: {
    backgroundColor: "#739072",
    borderRadius: 24,
    padding: 8,
    position: "absolute",
    right: 20,
    top: 20,
  },
  postingsContainer: {
    letterSpacing: 1,
    paddingHorizontal: 25,
    paddingVertical: 10,
    paddingBottom: 20,
    backgroundColor: '#3A4D39',
    shadowRadius: 20,
    shadowColor: 'black',
    shadowOpacity: 0.1,
    minWidth: '100%',
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#3A4D39',
    marginBottom: 5,
  },
  postingsNotFoundText: {
    textAlign: 'center',
    fontSize: 18,
    marginBottom: 20,
    marginTop: 20,
  },
  addPostingButton: {
    backgroundColor: 'white',
    alignSelf: 'center',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 20,
    minWidth: '100%',
  },
  addPostingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3A4D39',
    textAlign: 'center',
  },
  postingActiveTitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  postingContainer: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    marginBottom: 25,
    shadowRadius: 20,
    shadowColor: 'black',
    shadowOpacity: 0.3,
  },
  postingTitle: {
    color: '#3A4D39',
    fontSize: 20,
    marginVertical: 10,
    marginRight: 40,
  },
  postingItem: {
    color: '#3A4D39',
    marginTop: 5,
    fontSize: 18,
    paddingHorizontal: 5,
  },
  postingItemDescription: {
    color: '#3A4D39',
    letterSpacing: 1,
    marginTop: 5,
    fontSize: 16,
    paddingHorizontal: 5,
    marginBottom: 10,
  },
  postingPosted: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  applicantNumber: {
    color: '#3A4D39',
    marginRight: 10,
    marginTop: 10,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  itemRow: {
    flexDirection: 'row',
  },
  editPostingPencil: {
    position: 'absolute',
    top: 15,
    right: 15,
    padding: 5,
  },
  skillsContainer: {
    marginRight: 40,
  },
  skillBubble: {
    backgroundColor: '#4F6F52',
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 10,
    marginBottom: 10,
  },
  skillText: {
    color: 'white',
    fontSize: 16,
  },
  skillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  sectionText: {
    color: '#3A4D39',
  },
  showMoreButton: {
    backgroundColor: '#4F6F52',
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 5,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '100%',
  },
  showMoreButtonText: {
    color: "white",
    fontSize: 18,
  },
  editPostingButton: {
    backgroundColor: '#4F6F52',
    alignSelf: 'center',
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
    minWidth: '100%',
  },
  editPostingText: {
    fontSize: 16,
    color: "#ECE3CE",
    textAlign: 'center',
  },
  ViewApplicantPostingButtonText: {
    fontSize: 18,
    color: "white",
    textAlign: 'center',
  },
  modalContainer: {
    paddingTop: 60,
    alignItems: 'center',
    backgroundColor: '#4F6F52',
    minHeight: '100%',
  },
  modalTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: 'white',
  },
  modalDetails: {
    fontSize: 18,
    color: 'white',
    marginBottom: 20,
  },
  modalSectionContainer: {
    backgroundColor: '#3A4D39',
    marginBottom: 10,
    shadowRadius: 20,
    shadowColor: 'black',
    shadowOpacity: 0.3,
  },
  modalContentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 5,
    paddingBottom: 10,
    backgroundColor: '#3A4D39',
    minWidth: '100%',
  },
  modalLeftContent: {
    marginTop: 20,
  },
  modalRightContent: {
    flex: 1,
    marginTop: 20,
  },
  ViewApplicantButton: {
    alignSelf: 'center',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    width: '90%',
  },
  ViewApplicantButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3A4D39',
    textAlign: 'center',
  },
});

