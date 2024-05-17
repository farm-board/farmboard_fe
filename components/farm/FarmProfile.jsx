import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Modal, ScrollView, Button } from 'react-native'
import React, { useContext, useState, useEffect } from 'react'
import { UserContext } from '../../contexts/UserContext'
import axios from 'axios'
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated'
import Avatar from '../Profile/Avatar'
import StyledText from '../Texts/StyledText'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { colors } from '../../config/theme'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import Gallery from '../Profile/Gallery';

export default function FarmProfile() {
  const {currentUser} = useContext(UserContext);
  const [farm, setFarm] = useState({});
  const [accommodations, setAccommodations] = useState(null);
  const [expandedMap, setExpandedMap] = useState({});
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [postings, setPostings] = useState([]);
  const [applicantsMap, setApplicantsMap] = useState({});
  const [applicants, setApplicants] = useState([]);
  const [visibleModal, setVisibleModal] = useState(false);
  const [currentPostingId, setCurrentPostingId] = useState(null);

  const width = Dimensions.get('window').width;
  const navigation = useNavigation();
  
  const fetchAccommodations = () => {
    axios.get(`http://localhost:4000/api/v1/users/${currentUser.id}/farms/accommodation`)
      .then((accommodationResponse) => {
        if (accommodationResponse.data && accommodationResponse.data.data && accommodationResponse.data.data.attributes) {
          console.log("accommodations:", accommodationResponse.data.data.attributes)
          setAccommodations(accommodationResponse.data.data.attributes);
        } else {
          setAccommodations(null);
          console.log('No accommodations found for this farm.', accommodations);
        }
      })
      .catch(error => {
        console.error('There was an error fetching the accommodations:', error);
      });
  };

  const fetchGalleryImages = () => {
    axios.get(`http://localhost:4000/api/v1/users/${currentUser.id}/farms/gallery_photos`)
    .then((galleryResponse) => {
      console.log('gallery images:', galleryResponse.data.gallery_photos);
      setGalleryImages(galleryResponse.data.gallery_photos);
    })
    .catch(error => {
      console.error('There was an error fetching the gallery images:', error);
    });
  };

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
        const [farmResponse, imageResponse] = await Promise.all([
          axios.get(`http://localhost:4000/api/v1/users/${currentUser.id}/farms`),
          axios.get(`http://localhost:4000/api/v1/users/${currentUser.id}/farms/image`),
        ]);
  
        console.log('current farm:', farmResponse.data.data.attributes);
        setFarm(farmResponse.data.data.attributes);
        setProfilePhoto(imageResponse.data.image_url);
  
        fetchGalleryImages();
        fetchAccommodations();
        const postingsResponse = await fetchPostings();
        if (postingsResponse) {
          console.log('Postings:', postingsResponse.data.data);
          setPostings(postingsResponse.data.data);
  
          // Fetch applicants for each posting
          await Promise.all(postingsResponse.data.data.map(async (posting) => {
            // Fetch applicants count for each posting
            await fetchApplicantsCount(posting.id);
          }));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  }, [currentUser.id]);

  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        try {
          const [farmResponse, imageResponse] = await Promise.all([
            axios.get(`http://localhost:4000/api/v1/users/${currentUser.id}/farms`),
            axios.get(`http://localhost:4000/api/v1/users/${currentUser.id}/farms/image`),
          ]);
    
          console.log('current farm:', farmResponse.data.data.attributes);
          setFarm(farmResponse.data.data.attributes);
          setProfilePhoto(imageResponse.data.image_url);
    
          fetchGalleryImages();
          fetchAccommodations();
          const postingsResponse = await fetchPostings();
          if (postingsResponse) {
            console.log('Postings:', postingsResponse.data.data);
            setPostings(postingsResponse.data.data);
    
            // Fetch applicants for each posting
            await Promise.all(postingsResponse.data.data.map(async (posting) => {
              // Fetch applicants count for each posting
              await fetchApplicantsCount(posting.id);
            }));
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
    
      fetchData();
    }, [currentUser.id]) // Only trigger on currentUser.id changes
  );
  
  if (farm === undefined) {
    return <Text>Loading...</Text>;
  }

  const calculateDaysAgo = (createdAt) => {
  
    const createdDate = new Date(createdAt);
    const currentDate = new Date();
    const differenceInTime = currentDate.getTime() - createdDate.getTime();
    const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));
    return `${differenceInDays} day(s) ago`;
  };

  const handlePostingCreate = () => {
    navigation.push('Farm Profile Add Postings', { sourceStack: 'Profile' });
  }
  
  const handlePostingEdit = (postingId) => {
    console.log('Posting ID:', postingId);
    navigation.push('Farm Profile Edit Postings', {postingId, sourceStack: 'Profile'}); // Pass postingId as a parameter
  }

  const handleEmployeeProfileView = (employeeId) => {
    navigation.navigate('Employee Profile View', { employeeId });
    setModalVisible(false);
  };

  const onEditButtonPress = () => {
    navigation.navigate('Edit Profile');
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
            color="#ECE3CE"
            onPress={() => setModalVisible(false)}
          />
        </TouchableOpacity>
          <Animated.Text entering={FadeInUp.duration(1000).springify()}>
            <StyledText bold tanColor>
              Applicants
            </StyledText>
          </Animated.Text>
        </View>
        {applicants.map((applicant) => (
          <View key={applicant.id} style={styles.modalSectionContainer}>
            <View style={styles.modalContentContainer}>
              <View style={styles.leftContent}>
                <View style={[styles.avatarContainer, styles.marginBottom3]}>
                  <Avatar uri={applicant.image_url}/>
                </View>
              </View>
              <View style={styles.rightContent}>
                <Text style={styles.farmName}>
                  <StyledText big bold tanColor>{applicant.first_name} {applicant.last_name}</StyledText>
                </Text>
                <Text style={styles.farmAddress}>
                  <StyledText>{applicant.city}, {applicant.state}</StyledText>
                </Text>
              </View>
            </View>
            <Text style={styles.postingPosted}>Applied {calculateDaysAgo(applicant.created_at)}</Text>
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
      <View style={styles.topSectionContainer}>
          <TouchableOpacity style={styles.editButton} onPress={onEditButtonPress}>
            <MaterialCommunityIcons
              name="pencil-outline"
              size={25}
              color={colors.highlight}
            />
          </TouchableOpacity>
        <View style={styles.leftContent}>
          <View style={[styles.avatarContainer, styles.marginBottom3]}>
            <Avatar uri={profilePhoto} />
          </View>
        </View>
        <View style={styles.rightContent}>
          <Text style={styles.farmName}>
            <StyledText big bold tanColor >
              {`${farm.name}`}
            </StyledText>
          </Text>
          <Text style={styles.farmAddress}>
            <StyledText tanColor >
              {`${farm.city}, ${farm.state}`}
            </StyledText>
          </Text>
        </View>
      </View>
      {Object.keys(galleryImages).length !== 0 ?
        <View style={styles.galleryContainer}>
          <Gallery
            width={width}
            galleryImages={galleryImages}
          />
        </View>
        : null }
      <View style={styles.farmBioContainer}>
        <StyledText big tanColor style={styles.farmBioTitle}>
          About
        </StyledText>
        <StyledText small tanColor style={styles.farmBioText}>
          {`${farm.bio}`}
        </StyledText>
      </View>
      {accommodations !== null ?
      <View style={styles.accommodationsContainer}>
        <Text style={styles.accommodationTitle}>
          <StyledText big bold tanColor style={styles.accommodationTitle}>
            Accommodations
          </StyledText>
        </Text>
        <Text style={styles.accommodationListItem}>
          <StyledText small tanColor>
          Offers Housing: {accommodations.housing === true ? "Yes" : "No"}
          </StyledText>
        </Text>
        <Text style={styles.accommodationListItem}>
          <StyledText small tanColor>
            Offers Meals: {accommodations.meals === true ? "Yes" : "No"}
          </StyledText>
        </Text>
        <Text style={styles.accommodationListItem}>
          <StyledText small tanColor>
            Offers Transporation: {accommodations.transportation === true ? "Yes" : "No"}
          </StyledText>
        </Text>
      </View>
      : null }
      <View style={styles.postingsContainer}>
        {postings.length === 0 ?
        <StyledText tanColor bold style={styles.postingsNotFoundText}>
          You do not currently have any active postings. Click on the button below to add a new job posting to your farm.
        </StyledText> 
        : null }
        <TouchableOpacity style={styles.addPostingButton} onPress={handlePostingCreate}>
          <Text style={styles.addPostingText}>Create New Posting</Text>
        </TouchableOpacity>
        {postings.length > 0 ?
        <>
          <StyledText tanColor bold big style={styles.postingActiveTitle}>
            Your Current Postings:
          </StyledText> 
          {postings.map((posting) => {
            return (
              <View style={styles.postingContainer} key={posting.id}>
                <TouchableOpacity 
                  style={styles.deletePostingButton} 
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
                    Age Requirement:
                  </StyledText>
                  <StyledText style={styles.postingItem}>
                    {posting.attributes.age_requirement}
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
                <StyledText style={styles.postingItem}>
                  {posting.attributes.description}
                </StyledText>
                  {applicantsMap[posting.id] > 0 ?
                  <View>
                  <StyledText style={styles.applicantNumber}>
                    {applicantsMap[posting.id] === 1 ? '1 person has applied for this posting.' : applicantsMap[posting.id] > 1 ? `${applicantsMap[posting.id]} people have applied for this posting.` : null }
                  </StyledText>
                  <TouchableOpacity 
                    style={styles.editPostingButton} 
                    onPress={() => setModalVisible(true, posting.id)}
                  >
                    <StyledText bold style={styles.editPostingText}>{applicantsMap[posting.id] === 1 ? 'View Applicant' : 'View Applicants'}</StyledText>
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
  topSectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 5,
    backgroundColor: '#4F6F52',
    maxWidth: '100%',
    shadowRadius: 20,
    shadowColor: 'black',
    shadowOpacity: 0.4,
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
  farmBioText: {
    letterSpacing: 1,
    fontSize: 13,
    marginVertical: 5,
  },
  farmBioTitle: {
    letterSpacing: 1,
    fontSize: 15,
  },
  farmBioContainer: {
    letterSpacing: 1,
    paddingHorizontal: 25,
    paddingVertical: 10,
    backgroundColor: '#4F6F52',
    marginVertical: 10,
    shadowRadius: 20,
    shadowColor: 'black',
    shadowOpacity: 0.3,
    minWidth: '100%',
  },
  accommodationsContainer: {
    letterSpacing: 1,
    paddingHorizontal: 25,
    paddingVertical: 10,
    backgroundColor: '#4F6F52',
    minWidth: '100%',
    shadowRadius: 20,
    shadowColor: 'black',
    shadowOpacity: 0.4,
  },
  gallery: {
    marginVertical: 10,
  },
  accommodationTitle: {
    letterSpacing: 1,
    fontSize: 15,
    paddingBottom: 5,
  },
  accommodationListItem: {
    letterSpacing: 1,
    marginVertical: 5,
    fontSize: 13,
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
    right: 15,
    top: 15,
  },
  galleryContainer: {
    flex: 1,
    justifyContent: 'space-between',
    maxWidth: '100%'
  },
  postingsContainer: {
    letterSpacing: 1,
    paddingHorizontal: 25,
    paddingVertical: 10,
    backgroundColor: '#4F6F52',
    marginVertical: 10,
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
  },
  addPostingButton: {
    backgroundColor: '#ECE3CE',
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
    backgroundColor: '#ECE3CE',
    padding: 10,
    borderRadius: 8,
    marginBottom: 25,
    shadowRadius: 20,
    shadowColor: 'black',
    shadowOpacity: 0.3,
  },
  postingTitle: {
    color: '#3A4D39',
    marginVertical: 10,
    marginRight: 40,
  },
  postingItem: {
    color: '#3A4D39',
    marginRight: 10,
    marginTop: 5,
  },
  postingPosted: {
    fontSize: 12,
    color: '#ECE3CE',
    textAlign: 'center',
    marginBottom: 10,
  },
  applicantNumber: {
    color: '#3A4D39',
    marginRight: 10,
    marginTop: 15,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  itemRow: {
    flexDirection: 'row',
  },
  deletePostingButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
  },
  skillsContainer: {
    marginRight: 40,
  },
  skillBubble: {
    backgroundColor: '#4F6F52',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 10,
    marginBottom: 10,
  },
  skillText: {
    color: '#ECE3CE',
    fontSize: 15,
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
    color: "#ECE3CE",
    fontSize: 16,
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
  modalContainer: {
    paddingTop: 60,
    alignItems: 'center',
    backgroundColor: '#739072',
    minHeight: '100%',
  },
  modalTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#ECE3CE',
  },
  modalDetails: {
    fontSize: 18,
    color: '#ECE3CE',
    marginBottom: 20,
  },
  modalSectionContainer: {
    backgroundColor: '#4F6F52',
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
    backgroundColor: '#4F6F52',
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
    backgroundColor: '#ECE3CE',
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

