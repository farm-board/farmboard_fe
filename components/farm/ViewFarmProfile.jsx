import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Modal, ScrollView, Button } from 'react-native'
import React, { useContext, useState, useEffect } from 'react'
import { UserContext } from '../../contexts/UserContext'
import axios from 'axios'
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated'
import Avatar from '../Profile/Avatar'
import StyledText from '../Texts/StyledText'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { colors } from '../../config/theme'
import { useNavigation, useRoute } from '@react-navigation/native'
import Gallery from '../Profile/Gallery';

export default function ViewFarmProfile() {
  const {currentUser} = useContext(UserContext);
  const [farm, setFarm] = useState({});
  const [accommodations, setAccommodations] = useState(null);
  const [expanded, setExpanded] = useState(false); 
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [postings, setPostings] = useState([]);
  const [loading, setLoading] = useState(true);


  const width = Dimensions.get('window').width;
  const navigation = useNavigation();

  const route = useRoute();
  const { farmId } = route.params;
  

  useEffect(() => {
    setLoading(true); 
      axios.get(`http://localhost:4000/api/v1/users/${currentUser.id}/farms/${farmId}/profile_info`)
    .then((farmResponse) => {
      setFarm(farmResponse.data.attributes);
      setAccommodations(farmResponse.data.accommodations); 
      setPostings(farmResponse.data.postings); 
      setGalleryImages(farmResponse.data.gallery_photos);
      setLoading(false); 
    })
    .catch(error => {
      console.error('There was an error fetching the farm:', error);
      setLoading(false); // Set loading state to false in case of error
    });
  }, [currentUser.id]);
  
  if (farm === undefined) {
    return <Text>Loading...</Text>;
  }
 
  return (
    <View style={styles.container}>
      <View style={styles.topSectionContainer}>
        <View style={styles.leftContent}>
          <View style={[styles.avatarContainer, styles.marginBottom3]}>
            <Avatar uri={farm.image_url} />
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
          This Farm has no postings at this time.
        </StyledText> 
        : null }
        {postings.length > 0 ?
        <>
          <StyledText tanColor bold big style={styles.postingActiveTitle}>
            This Farms Postings:
          </StyledText> 
          {postings.map((posting) => {
            return (
              <View style={styles.postingContainer} key={posting.id}>
                <StyledText bold style={styles.postingTitle}>
                  {posting.title}
                </StyledText>
                <View style={styles.divider}></View>
                <View style={styles.itemRow}>
                  <StyledText bold style={styles.postingItem}>
                    Compensation:
                  </StyledText>
                  <StyledText style={styles.postingItem}>
                    ${posting.salary} / {posting.payment_type}
                  </StyledText>
                </View>
                <View style={styles.itemRow}>
                  <StyledText bold style={styles.postingItem}>
                    Duration:
                  </StyledText>
                  <StyledText style={styles.postingItem}>
                    {posting.duration}
                  </StyledText>
                </View>
                <View style={styles.itemRow}>
                  <StyledText bold style={styles.postingItem}>
                    Age Requirement:
                  </StyledText>
                  <StyledText style={styles.postingItem}>
                    {posting.age_requirement}
                  </StyledText>
                </View>
                <View style={styles.itemRow}>
                  <StyledText bold style={styles.postingItem}>
                    Offers Accommodations:
                  </StyledText>
                  <StyledText style={styles.postingItem}>
                    {posting.offers_lodging === true ? "Yes" : "No"}
                  </StyledText>
                </View>
                <View style={styles.midModalContainer}>
                {expanded && <StyledText bold style={styles.postingItem}>Required Skills:</StyledText>}
                <View style={styles.skillContainer}>
                  {posting?.skill_requirements && posting?.skill_requirements.slice(0, expanded ? posting?.skill_requirements.length : 0).map((skill, index) => (
                    <View key={index} style={styles.skillBubble}>
                      <Text style={styles.skillText}>{skill}</Text>
                    </View>
                  ))}
                </View>
                {posting?.skill_requirements && posting?.skill_requirements.length > 0 && (
                  <TouchableOpacity onPress={() => setExpanded(!expanded)} style={styles.showMoreButton}>
                    <StyledText bold style={styles.showMoreButtonText}>{expanded ? 'Hide Skills' : 'Show Skills'}</StyledText>
                  </TouchableOpacity>
                )}
              </View>
                <StyledText bold style={styles.postingItem}>
                  Description:
                </StyledText>
                <StyledText style={styles.postingItem}>
                  {posting.description}
                </StyledText>
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
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    marginBottom: 10,
  },
  skillText: {
    color: '#ECE3CE',
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

