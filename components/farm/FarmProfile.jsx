import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Modal, ScrollView, Button } from 'react-native'
import React, { useContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserContext } from '../../contexts/UserContext'
import axios from 'axios'
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated'
import Avatar from '../Profile/Avatar'
import StyledText from '../Texts/StyledText'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { colors } from '../../config/theme'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import Gallery from '../Profile/Gallery';
import { baseUrl } from '../../config';

export default function FarmProfile() {
  const {currentUser, setUserAvatar, profileRefresh, setProfileRefresh} = useContext(UserContext);
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
  
  const fetchAccommodations = async (refresh) => {
    try {
      const cachedAccommodations = await AsyncStorage.getItem('accommodations');
      const hasFetchedBefore = await AsyncStorage.getItem('hasFetchedAccommodations');
  
      if (cachedAccommodations !== null && !refresh && hasFetchedBefore === 'true') {
        console.log('Loaded accommodations from cache');
        setAccommodations(JSON.parse(cachedAccommodations));
        return;
      }
  
      const accommodationResponse = await axios.get(`${baseUrl}/api/v1/users/${currentUser.id}/farms/accommodation`);
      if (accommodationResponse.data && accommodationResponse.data.data && accommodationResponse.data.data.attributes) {
        console.log("Fetched accommodations from API:", accommodationResponse.data.data.attributes);
        setAccommodations(accommodationResponse.data.data.attributes);
        await AsyncStorage.setItem('accommodations', JSON.stringify(accommodationResponse.data.data.attributes));
      } else {
        setAccommodations(null);
        console.log('No accommodations found for this farm.');
      }
  
      // Set the flag to indicate that a fetch has been attempted
      await AsyncStorage.setItem('hasFetchedAccommodations', 'true');
    } catch (error) {
      console.error('Error fetching accommodations:', error);
    }
  };
  
  const fetchGalleryImages = async (refresh) => {
    try {
      const cachedGalleryImages = await AsyncStorage.getItem('gallery_images');
      if (cachedGalleryImages !== null && !refresh) {
        console.log('Loaded gallery images from cache');
        setGalleryImages(JSON.parse(cachedGalleryImages));
        return;
      }
  
      const galleryResponse = await axios.get(`${baseUrl}/api/v1/users/${currentUser.id}/farms/gallery_photos`);
      console.log('Fetched gallery images from API:', galleryResponse.data.gallery_photos);
      setGalleryImages(galleryResponse.data.gallery_photos);
      await AsyncStorage.setItem('gallery_images', JSON.stringify(galleryResponse.data.gallery_photos));
    } catch (error) {
      console.error('Error fetching gallery images:', error);
    }
  };
  
  const fetchPostings = async (refresh) => {
    try {
      // Skip the cache check when refresh is true
      if (!refresh) {
        const cachedPostings = await AsyncStorage.getItem('postings');
        if (cachedPostings !== null) {
          return JSON.parse(cachedPostings);
        }
      }
  
      const postingsResponse = await axios.get(`${baseUrl}/api/v1/users/${currentUser.id}/farms/postings`);
      const sortedPostings = postingsResponse.data.data.sort((a, b) => new Date(b.attributes.created_at) - new Date(a.attributes.created_at));
      const postingsData = { ...postingsResponse, data: { ...postingsResponse.data, data: sortedPostings } };
  
      await AsyncStorage.setItem('postings', JSON.stringify(postingsData));
  
      return postingsData;
    } catch (error) {
      console.error("There was an error fetching the farm's postings:", error);
    }
  };
  
  const fetchApplicantsCount = async (postingId) => {
    try {
      const applicantsResponse = await axios.get(`${baseUrl}/api/v1/users/${currentUser.id}/farms/postings/${postingId}/applicants`);
      console.log('Applicants:', applicantsResponse.data);
  
      setApplicants(applicantsResponse.data);
      setApplicantsMap(prevMap => ({
        ...prevMap,
        [postingId]: applicantsResponse.data.length,
      }));
    } catch (error) {
      console.error(`Error fetching applicants for posting ${postingId}:`, error);
    }
  };
  
  const fetchData = async (refresh) => {
    try {
      if (!refresh) {
        const cachedFarm = await AsyncStorage.getItem('farm');
        if (cachedFarm !== null) {
          console.log('Loaded farm data from cache');
          setFarm(JSON.parse(cachedFarm));
        } else {
          const farmResponse = await axios.get(`${baseUrl}/api/v1/users/${currentUser.id}/farms`);
          console.log('Fetched farm data from API:', farmResponse.data.data);
          setFarm(farmResponse.data.data.attributes);
          await AsyncStorage.setItem('farm', JSON.stringify(farmResponse.data.data.attributes));
        }
      } else {
        const farmResponse = await axios.get(`${baseUrl}/api/v1/users/${currentUser.id}/farms`);
        console.log('Refreshed farm data from API:', farmResponse.data.data);
        setFarm(farmResponse.data.data.attributes);
        await AsyncStorage.setItem('farm', JSON.stringify(farmResponse.data.data.attributes));
      }
  
      const cachedProfilePhoto = await AsyncStorage.getItem('profile_photo');
      const hasFetchedProfilePhotoBefore = await AsyncStorage.getItem('hasFetchedProfilePhoto');

      if (cachedProfilePhoto !== null && !refresh && hasFetchedProfilePhotoBefore === 'true') {
        console.log('Loaded profile photo from cache', cachedProfilePhoto);
        setProfilePhoto(cachedProfilePhoto);
        setUserAvatar(cachedProfilePhoto);
      } else {
        try {
          const imageResponse = await axios.get(`${baseUrl}/api/v1/users/${currentUser.id}/farms/image`);
          console.log('Fetched profile photo from API:', imageResponse.data.image_url);
          setProfilePhoto(imageResponse.data.image_url);
          setUserAvatar(imageResponse.data.image_url);
          await AsyncStorage.setItem('profile_photo', imageResponse.data.image_url);
        } catch (error) {
          console.log('Error fetching profile photo:', error);
          setProfilePhoto(null);
          setUserAvatar(null);
          await AsyncStorage.setItem('hasFetchedProfilePhoto', 'false'); // Set to 'false' on error
        }
        await AsyncStorage.setItem('hasFetchedProfilePhoto', 'true'); // Set to 'true' once at the end
      }
  
      await fetchGalleryImages(refresh);
      await fetchAccommodations(refresh);
  
      const postingsResponse = await fetchPostings(refresh);
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

  useEffect(() => {
    if (profileRefresh) {
      fetchData(profileRefresh);
      setProfileRefresh(false);
    }
  }, [profileRefresh]); // Trigger on refresh changes
  
  useFocusEffect(
    React.useCallback(() => {
      console.log('Profile screen focus, profileRefresh:', profileRefresh);
      fetchData(profileRefresh);
      if (profileRefresh) {
        setProfileRefresh(false);
        console.log('Profile data fetched and profileRefresh reset to false');
      }
    }, [profileRefresh])
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
            color="white"
            onPress={() => setModalVisible(false)}
          />
        </TouchableOpacity>
          <Animated.Text entering={FadeInUp.duration(1000).springify()}>
            <StyledText bold big>
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
                  <StyledText big bold>{applicant.first_name} {applicant.last_name}</StyledText>
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
                <StyledText bold style={styles.ViewApplicantButtonText}>View Applicant Profile</StyledText>
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
              color="white"
            />
          </TouchableOpacity>
        <View style={styles.leftContent}>
          <View style={[styles.avatarContainer, styles.marginBottom3]}>
            <Avatar uri={profilePhoto} />
          </View>
        </View>
        <View style={styles.rightContent}>
          <Text style={styles.farmName}>
            <StyledText big bold >
              {`${farm.name}`}
            </StyledText>
          </Text>
          <Text style={styles.farmAddress}>
            <StyledText >
              {`${farm.city}, ${farm.state}`}
            </StyledText>
          </Text>
        </View>
      </View>
      { accommodations === null && Object.keys(galleryImages).length === 0 ?
      <View style={styles.infoMessage}>
        <StyledText bold style={styles.infoMessageTitle}>Complete Your Profile for Better Visibility!</StyledText>
        <StyledText style={styles.infoMessageText}>Add your farm's accommodations and gallery images to attract more applicants and showcase what makes your farm unique. Tap on the pencil icon above your farm's name to get started.</StyledText>
      </View>
      : accommodations === null ? 
      <View style={styles.infoMessage}>
        <StyledText bold style={styles.infoMessageTitle}>Add Accommodations to Your Profile!</StyledText>
        <StyledText style={styles.infoMessageText}>Add your farm's accommodations to provide them within your job postings. Tap on the pencil icon above your farm's name to get started.</StyledText>
      </View>
      : Object.keys(galleryImages).length === 0 ?
      <View style={styles.infoMessage}>
        <StyledText bold style={styles.infoMessageTitle}>Add Gallery Images to Your Profile!</StyledText>
        <StyledText style={styles.infoMessageText}>Add gallery images to attract more applicants and showcase what makes your farm unique. Tap on the pencil icon above your farm's name to get started.</StyledText>
      </View>
      : null }
      {Object.keys(galleryImages).length !== 0 ?
        <View style={styles.galleryContainer}>
          <Gallery
            width={width}
            galleryImages={galleryImages}
          />
        </View>
        : null }
      <View style={styles.farmBioContainer}>
        <StyledText bold style={styles.farmBioTitle}>
          About
        </StyledText>
        {farm.bio && farm.bio.length !== 0 ? 
          <StyledText style={styles.farmBioText}>
            {`${farm.bio}`}
          </StyledText>
          :
          <StyledText style={styles.farmBioText}>No bio available. Visit The Edit Profile Screen by tapping the pencil in the top right corner to add one!</StyledText> 
        }
      </View>
      {accommodations !== null ?
      <View style={styles.accommodationsContainer}>
        <Text style={styles.accommodationTitle}>
          <StyledText big bold style={styles.accommodationTitle}>
            Accommodations
          </StyledText>
        </Text>
        <Text style={styles.accommodationListItem}>
          <StyledText>
          Offers Housing: {accommodations.housing === true ? "Yes" : "No"}
          </StyledText>
        </Text>
        <Text style={styles.accommodationListItem}>
          <StyledText>
            Offers Meals: {accommodations.meals === true ? "Yes" : "No"}
          </StyledText>
        </Text>
        <Text style={styles.accommodationListItem}>
          <StyledText>
            Offers Transporation: {accommodations.transportation === true ? "Yes" : "No"}
          </StyledText>
        </Text>
      </View>
      : null }
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
                    onPress={() => setModalVisible(true, posting.id)}
                  >
                    <StyledText bold style={styles.ViewApplicantPostingButtonText}>{applicantsMap[posting.id] === 1 ? 'View Applicant' : 'View Applicants'}</StyledText>
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
  },
  topSectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 5,
    marginBottom: 10,
    backgroundColor: '#3A4D39',
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
    marginTop: 20,
    marginEnd: 20,
    marginStart: 20,
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
    fontSize: 15,
    marginVertical: 5,
  },
  farmBioTitle: {
    letterSpacing: 1,
    fontSize: 20,
  },
  farmBioContainer: {
    letterSpacing: 1,
    paddingHorizontal: 25,
    paddingVertical: 10,
    backgroundColor: '#3A4D39',
    marginBottom: 10,
    shadowRadius: 20,
    shadowColor: 'black',
    shadowOpacity: 0.3,
    minWidth: '100%',
  },
  accommodationsContainer: {
    letterSpacing: 1,
    paddingHorizontal: 25,
    paddingBottom: 10,
    marginBottom: 10,
    backgroundColor: '#3A4D39',
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
    fontSize: 20,
    paddingBottom: 5,
  },
  accommodationListItem: {
    letterSpacing: 1,
    marginVertical: 5,
    fontSize: 15,
  },
  paddingBottom5: {
    paddingBottom: 5,
  },
  paddingBottom10: {
    paddingBottom: 10,
  },
  editButton: {
    backgroundColor: "#4F6F52",
    borderRadius: 24,
    padding: 8,
    position: "absolute",
    right: 15,
    top: 15,
  },
  galleryContainer: {
    flex: 1,
    justifyContent: 'space-between',
    maxWidth: '100%',
    marginBottom: 10,
    shadowRadius: 20,
    shadowColor: 'black',
    shadowOpacity: 0.4,
  },
  postingsContainer: {
    letterSpacing: 1,
    paddingHorizontal: 25,
    paddingBottom: 30,
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
    paddingTop: 20,
    fontSize: 18,
  },
  addPostingButton: {
    backgroundColor: 'white',
    alignSelf: 'center',
    padding: 10,
    borderRadius: 8,
    marginTop: 30,
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
    color: "white",
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
  infoMessage: {
    backgroundColor: '#333',
    padding: 10,
    marginBottom: 10,
    width: '100%',
  },
});

