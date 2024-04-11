import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, Alert } from 'react-native'
import React, { useContext, useState, useEffect } from 'react'
import { UserContext } from '../../contexts/UserContext'
import axios from 'axios'
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated'
import Avatar from '../Profile/Avatar'
import StyledText from '../Texts/StyledText'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { colors } from '../../config/theme'
import { useNavigation } from '@react-navigation/native'
import Gallery from '../Profile/Gallery';

export default function FarmProfile() {
  const {currentUser} = useContext(UserContext);
  const [farm, setFarm] = useState({});
  const [accommodations, setAccommodations] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [postings, setPostings] = useState([]);

  const width = Dimensions.get('window').width;
  const navigation = useNavigation();
  
  const fetchAccommodations = () => {
    axios.get(`http://localhost:4000/api/v1/users/${currentUser.id}/farms/accommodation`)
      .then((accommodationResponse) => {
        if (accommodationResponse.data && accommodationResponse.data.data && accommodationResponse.data.data.attributes) {
          setAccommodations(accommodationResponse.data.data.attributes);
        } else {
          console.log('No accommodations found for this farm.');
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

  const fetchPostings = () => {
    axios.get(`http://localhost:4000/api/v1/users/${currentUser.id}/farms/postings`)
    .then((postingsResponse) => {
      console.log('Postings:', postingsResponse.data.data);
      setPostings(postingsResponse.data.data);
    })
    .catch(error => {
      console.error("There was an error fetching the farm's postings:", error);
    });
  };

  useEffect(() => {
    Promise.all([
      axios.get(`http://localhost:4000/api/v1/users/${currentUser.id}/farms`),
      axios.get(`http://localhost:4000/api/v1/users/${currentUser.id}/farms/image`),
    ])
    .then(([farmResponse, imageResponse]) => {
      console.log('current farm:', farmResponse.data.data.attributes);
      setFarm(farmResponse.data.data.attributes);
      setProfilePhoto(imageResponse.data.image_url);
    })
    .catch(error => {
      console.error('There was an error fetching the farm:', error);
    });
    fetchGalleryImages();
    fetchAccommodations();
    fetchPostings();
  }, [currentUser.id]);

  if (farm === undefined) {
    return <Text>Loading...</Text>;
  }

  const handlePostingCreate = () => {
    navigation.push('Farm Profile Add Postings');
  }
  
  const handlePostingEdit = (postingId) => {
    console.log('Posting ID:', postingId);
    navigation.push('Farm Profile Edit Postings', {postingId}); // Pass postingId as a parameter
  }

  const handleDeletePosting = (postingId) => {
    Alert.alert(
      'Delete Posting', "Are you sure you want to delete this posting?",
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel'
        },
        {
          text: 'Delete',
          onPress: () => {
            axios.delete(`http://localhost:4000/api/v1/users/${currentUser.id}/farms/postings/${postingId}`)
            .then(response => {
              console.log('Posting deleted:', postingId);
              Alert.alert('Posting deleted');
              fetchPostings();
            })
            .catch(error => {
              console.log('Unable to delete posting', error);
            });
          }
        }
      ]
    );
  }

  const onEditButtonPress = () => {
    navigation.push('Profile Edit');
  }

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
                  onPress={() => handleDeletePosting(posting.id)}
                >
                  <MaterialCommunityIcons name="trash-can" size={24} color="red" />
                </TouchableOpacity>
                <StyledText tanColor bold style={styles.postingTitle}>
                  {posting.attributes.title}
                </StyledText>
                <View style={styles.skillsContainer}>
                  <Text style={styles.postingItem}>Required Skills:</Text>
                  {posting.attributes.skill_requirements.map((skill, index) => (
                    <Text key={index} style={styles.sectionText}>{skill}</Text>
                  ))}
                  <View style={styles.line} />
                </View>
                <StyledText tanColor bold style={styles.postingItem}>
                  Amount: {posting.attributes.salary}
                </StyledText>
                <StyledText tanColor bold style={styles.postingItem}>
                  Payment Type: {posting.attributes.payment_type}
                </StyledText>
                <StyledText tanColor bold style={styles.postingItem}>
                  Duration: {posting.attributes.duration}
                </StyledText>
                <StyledText tanColor bold style={styles.postingItem}>
                  Age Requirement: {posting.attributes.age_requirement}
                </StyledText>
                <StyledText tanColor bold style={styles.postingItem}>
                  Offers Accommodations: {posting.attributes.offers_lodging === true ? "Yes" : "No"}
                </StyledText>
                <StyledText tanColor bold style={styles.postingItem}>
                  Description: {posting.attributes.description}
                </StyledText>
                <TouchableOpacity 
                  style={styles.editPostingButton} 
                  onPress={() => handlePostingEdit(posting.id)}
                >
                  <Text style={styles.editPostingText}>Edit This Posting</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </>
        : null }
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  avatarContainer: {
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
    shadowOpacity: 0.3,
    minWidth: '100%',
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
    marginBottom: 10,
  },
  postingContainer: {
    backgroundColor: '#ECE3CE',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  postingTitle: {
    color: '#3A4D39',
    marginRight: 40,
  },
  postingItem: {
    color: '#3A4D39',
    marginRight: 40,
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
  editPostingButton: {
    backgroundColor: '#4F6F52',
    alignSelf: 'center',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    minWidth: '100%',
  },
  editPostingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: "#ECE3CE",
    textAlign: 'center',
  },
});

