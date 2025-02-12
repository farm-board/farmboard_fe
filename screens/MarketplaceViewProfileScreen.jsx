import React, { useContext, useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, FlatList, Modal, ScrollView, Button, Image, Linking, Alert} from 'react-native'
import { StatusBar } from 'expo-status-bar';
import KeyboardAvoidingContainer from '../components/Containers/KeyboardAvoidingContainer';
import { UserContext } from '../contexts/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import Avatar from '../components/Profile/Avatar'
import StyledText from '../components/Texts/StyledText'
import Gallery from '../components/Feed/Gallery';
import MarketplacePostingAvatar from '../components/Profile/MarketplacePostingAvatar';
import { baseUrl } from '../config';

export default function MarketplaceViewProfileScreen() {
  const {currentUser} = useContext(UserContext);
  const [profileInfo, setProfileInfo] = useState({});
  const [expandedMap, setExpandedMap] = useState({}); 
  const [marketplacePostings, setMarketplacePostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [galleryImages, setGalleryImages] = useState([]);
  const [postingProfilePhoto, setPostingProfilePhoto] = useState('');
  const [selectedPosting, setSelectedPosting] = useState({});
  const [modalPostingVisible, setModalPostingVisible] = useState(false);
  const [loadingNextPage, setLoadingNextPage] = useState(false);

  const screenWidth = Dimensions.get('window').width;
  const navigation = useNavigation();

  const route = useRoute();
  const { marketplacePostingId } = route.params;

  const fetchProfileData = async () => {
    setLoading(true);
  
    try {
      // Try to get the cached data
      const cachedData = await AsyncStorage.getItem(
        `marketplace_profile_info_${currentUser.id}_${marketplacePostingId}`
      );
      console.log('cachedData:', cachedData);
  
      if (cachedData !== null) {
        const parsedData = JSON.parse(cachedData);
  
        // Check if the cache has expired
        const currentTime = new Date().getTime(); // Current time in milliseconds
        if (currentTime - parsedData.timestamp < 15 * 60 * 1000) {
          console.log('Using cached data:', parsedData.profileInfo);
          setProfileInfo(parsedData.profileInfo);
          setMarketplacePostings(parsedData.marketplace_postings);
          setLoading(false);
          return;
        } else {
          console.log('Cached data has expired. Fetching fresh data...');
        }
      }
  
      // Fetch fresh data from the server if no cache or cache has expired
      const response = await axios.get(
        `${baseUrl}/api/v1/users/${currentUser.id}/marketplace_postings/${marketplacePostingId}/profile_info`
      );
      console.log('Fetching fresh profile data...');
      console.log('Fresh profile response:', response.data);
  
      const sortedPostings = response.data.marketplace_postings.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
  
      setProfileInfo(response.data.attributes);
      setMarketplacePostings(sortedPostings);
  
      // Cache the data with a timestamp
      const dataToCache = {
        profileInfo: response.data.attributes,
        marketplace_postings: sortedPostings,
        timestamp: new Date().getTime(), // Current time in milliseconds
      };
      await AsyncStorage.setItem(
        `marketplace_profile_info_${currentUser.id}_${marketplacePostingId}`,
        JSON.stringify(dataToCache)
      );
    } catch (error) {
      console.error('There was an error fetching the profile info:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchProfileData();
  }, [marketplacePostingId]);
  
  const toggleExpanded = (postingId) => {
    setExpandedMap(prevState => ({
      ...prevState,
      [postingId]: !prevState[postingId],
    }));
  };
  
  if (profileInfo === undefined) {
    return <Text>Loading...</Text>;
  }

  const fetchGalleryImages = (postingId, userId) => {
    console.log('Fetching gallery images for posting:', postingId);
    axios.get(`${baseUrl}/api/v1/users/${userId}/marketplace_postings/${postingId}/gallery_photos`)
      .then((response) => {
        console.log('Gallery Images:', response.data.gallery_photos);
        setGalleryImages(response.data.gallery_photos);
      })
      .catch(error => {
        console.error('There was an error fetching the gallery images:', error);
      });
  };

  const fetchPostingProfileImage = (postingId) => {
    console.log('Fetching posting profile photo for posting:', postingId);
    axios.get(`${baseUrl}/api/v1/users/${currentUser.id}/marketplace_postings/${postingId}/user_image`)
      .then((response) => {
        console.log('Posting profile photo:', response.data.image_url);
        setPostingProfilePhoto(response.data.image_url);
      })
      .catch(error => {
        console.error('There was an error fetching the posting profile photo:', error);
      });
  };

  
const handlePhoneCall = () => {
  Alert.alert(
    "Open Phone App",
    `You will be taken out of the app to call ${profileInfo.marketplace_phone}. Do you want to continue?`,
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Continue",
        onPress: () => {
          Linking.openURL(`tel:${profileInfo.marketplace_phone}`).catch((err) =>
            console.warn('Failed to open phone app:', err)
          );
        },
      },
    ]
  );
};

const handleEmail = () => {
  Alert.alert(
    "Open Email App",
    `You will be taken out of the app to send an email to ${profileInfo.marketplace_email}. Do you want to continue?`,
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Continue",
        onPress: () => {
          Linking.openURL(`mailto:${profileInfo.marketplace_email}`).catch((err) =>
            console.warn('Failed to open email app:', err)
          );
        },
      },
    ]
  );
};

  const renderPostingItem = ({ item }) => (
    <TouchableOpacity onPress={() => { 
      console.log('Selected Posting:', item);
      setSelectedPosting(item);
      setModalPostingVisible(true);
      fetchGalleryImages(item.id, item.user_id);
      fetchPostingProfileImage(item.id);
    }}>
      <View style={[styles.marketplacePostingItem, { width: (screenWidth / 2) - 20 }]}>
        <Image
          source={item.images ? { uri: item.images } : require('../assets/images/FarmProfilePlaceholder.png')}
          style={[
            { width: '100%', height: 150 },
          ]}
        />
        <View style={styles.titleAndPriceContainer}>
          <Text style={styles.postingSalary}>${item.price}</Text>
          <Text style={styles.postingTitle}>
            {item.title.length > 16
            ? item.title.substring(0, 16) + '...'
            : item.title}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderPostingModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalPostingVisible}
      onRequestClose={() => {
        setModalPostingVisible(!modalPostingVisible);
        setPostingProfilePhoto(null);
      }}
    > 
    <View style={styles.modalWrapper}>
      <View style={styles.closeButtonBar}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setModalPostingVisible(false)}
        >
          <MaterialCommunityIcons name="close" size={35} color="white" />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.modalContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.galleryContainer}>
          <Gallery
            width={screenWidth}
            galleryImages={galleryImages}
          />
        </View>
        <View style={styles.modalContentContainer}>
          <Text style={styles.modalTitle}>{selectedPosting?.title}</Text>
          <Text style={styles.modalSubTitle}>${selectedPosting?.price}</Text>
  
          <View style={styles.separatorLine} />
            <View style={styles.sellerInfoSectionContainer}>
              <View style={styles.rowContainer}>
                <Text style={styles.sectionTitle}>Seller Information</Text>
              </View>
                <View style={styles.posterInfoContainer}>
                  <MarketplacePostingAvatar uri={postingProfilePhoto}/>
                  <View style={styles.posterInfoTextContainer}>
                    {profileInfo.role_type === 'farm' ?
                    <View>
                      <Text style={styles.posterInfoTextName}>{profileInfo.name}</Text>
                      <Text style={styles.posterInfoTextLocation}>{profileInfo.city}, {profileInfo.state}</Text>
                    </View>
                    :
                    <View>
                      <Text style={styles.posterInfoTextName}>{profileInfo.first_name} {profileInfo.last_name}</Text>
                      <Text style={styles.posterInfoTextLocation}>{profileInfo.city}, {profileInfo.state}</Text>
                    </View>}
                  </View>
                </View>
                <View style={styles.sectionContainerContactInfo}>
                {profileInfo.marketplace_email ?
                    <TouchableOpacity onPress={handleEmail}>
                      <View style={styles.itemRow2}>
                        <MaterialCommunityIcons name={"email"} size={25} color={"white"} />
                        <StyledText bold style={styles.contactInfoText}>Email:</StyledText>
                        <StyledText style={styles.contactInfoText2}>{profileInfo.marketplace_email}</StyledText>
                      </View>
                    </TouchableOpacity>
                    :null}
                    {profileInfo.marketplace_phone ? 
                    <TouchableOpacity onPress={handlePhoneCall}>
                      <View style={styles.itemRow2}>
                        <MaterialCommunityIcons name={"phone"} size={25} color={"white"} />
                        <StyledText bold style={styles.contactInfoText}>Phone:</StyledText>
                        <StyledText style={styles.contactInfoText2}>{profileInfo.marketplace_phone}</StyledText>
                      </View>
                    </TouchableOpacity>
                    :null}
                  </View>
            </View>
          <View style={styles.separatorLine} />
  
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.sectionText}>{selectedPosting?.description}</Text>
            </View>

          <View style={styles.separatorLine} />

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Details</Text>
            <View style={styles.itemRow}>
              <StyledText style={styles.conditionText}>Condition</StyledText>
              <StyledText bold style={styles.conditionText}>{selectedPosting?.condition}</StyledText>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
    </Modal>
  );

  const renderStaticContent = () => (
    <>
      {/* Top Section */}
      <View style={styles.topSectionContainer}>
        <View style={styles.leftContent}>
          <View style={[styles.avatarContainer, styles.marginBottom3]}>
            <Avatar uri={profileInfo.image_url} />
          </View>
        </View>
        <View style={styles.rightContent}>
          <Text style={styles.farmName}>
            {profileInfo.role_type === 'farm' ? (
              <StyledText big bold>
                {`${profileInfo.name}`}
              </StyledText>
            ) : profileInfo.role_type === 'employee' ? (
              <StyledText big bold>
                {`${profileInfo.first_name} ${profileInfo.last_name}`}
              </StyledText>
            ) : null}
          </Text>
          <Text style={styles.farmAddress}>
            <StyledText>{`${profileInfo.city}, ${profileInfo.state}`}</StyledText>
          </Text>
        </View>
      </View>
      {/* Contact Info Section */}
      <View style={styles.farmBioContainer}>
        <StyledText big style={styles.farmBioTitle}>
          Contact Information
        </StyledText>
        <View style={styles.sectionContainerContactInfo}>
          {profileInfo.marketplace_email ?
            <TouchableOpacity onPress={handleEmail}>
              <View style={styles.itemRow2}>
                <MaterialCommunityIcons name={"email"} size={25} color={"white"} />
                <StyledText bold style={styles.contactInfoText}>Email:</StyledText>
                <StyledText style={styles.contactInfoText2}>{profileInfo.marketplace_email}</StyledText>
              </View>
            </TouchableOpacity>
          :null}
            {profileInfo.marketplace_phone ?
            <TouchableOpacity onPress={handlePhoneCall}>
              <View style={styles.itemRow2}>
                <MaterialCommunityIcons name={"phone"} size={25} color={"white"} />
                <StyledText bold style={styles.contactInfoText}>Phone:</StyledText>
                <StyledText style={styles.contactInfoText2}>{profileInfo.marketplace_phone}</StyledText>
              </View>
            </TouchableOpacity>
          :null}
        </View>
      </View>

      {/* Bio Section */}
      <View style={styles.farmBioContainer}>
        <StyledText big style={styles.farmBioTitle}>
          About
        </StyledText>
        {profileInfo.bio && profileInfo.bio.length !== 0 ? (
          <StyledText style={styles.farmBioText}>{`${profileInfo.bio}`}</StyledText>
        ) : (
          <StyledText style={styles.farmBioText}>No bio available for this User.</StyledText>
        )}
      </View>

      {/* Listing Title and Count */}
      <View style={styles.farmPostingTitleContatiner}>
        <StyledText bold style={styles.postingActiveTitle}>
          {profileInfo.role_type === 'farm'
            ? `${profileInfo.name}'s listings`
            : `${profileInfo.first_name} ${profileInfo.last_name}'s listings`}
        </StyledText>
        <StyledText bold style={styles.postingAmountText}>
          {marketplacePostings.length === 1
            ? `${marketplacePostings.length} active listing`
            : `${marketplacePostings.length} active listings`}
        </StyledText>
      </View>
    </>
  );

  const renderEmptyList = () => (
    <StyledText bold style={styles.postingsNotFoundText}>
      {profileInfo.role_type === 'farm'
        ? `${profileInfo.name} has no listings at this time.`
        : `${profileInfo.first_name} ${profileInfo.last_name} has no listings at this time.`}
    </StyledText>
  );

  const renderItem = ({ item }) => (
    <View style={styles.postingItemsContainer}>{renderPostingItem({ item })}</View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <FlatList
        data={marketplacePostings}
        keyExtractor={(item) => item.id.toString()} // Ensure unique keys
        numColumns={2} // Set grid layout with 2 columns
        columnWrapperStyle={{ justifyContent: 'space-between', backgroundColor: '#3A4D39', }} // Proper spacing for rows
        renderItem={({ item }) => (
          <View style={styles.postingItemContainer}>
            {renderPostingItem({ item })}
          </View>
        )}
        ListHeaderComponent={renderStaticContent} // Static content as header
        ListEmptyComponent={renderEmptyList} // Empty state
      />
      <View style={styles.containerBelowPostingList}></View>
      {renderPostingModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4F6F52',
  },
  container2: {
    alignItems: 'center',
  },
  content: {
    marign: 0,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
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
    marginStart: 20,
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
    paddingVertical: 10,
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
  postingsContainer: {
    letterSpacing: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#3A4D39',
    shadowRadius: 20,
    shadowColor: 'black',
    shadowOpacity: 0.1,
    minWidth: '100%',
  },
  postingItemsContainer: {
    flexDirection: 'row',
    letterSpacing: 1,
    marginBottom: 10,
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
    marginTop: 10,
    fontSize: 25,
  },
  postingAmountText: {
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
    fontSize: 16,
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
  marketplacePostingItem: {
    backgroundColor: 'white',
    marginBottom: 15,
    borderRadius: 8,
    overflow: 'hidden',
  },
  itemRow: {
    flexDirection: 'row',
  },
  itemRow2: {
    flexDirection: 'row',
    marginTop: 5,
    marginBottom: 10,
  },
  contactInfoText: {
    color: 'white',
    marginTop: 2,
    fontSize: 18,
    paddingRight: 10,
    paddingLeft: 10,
  },
  contactInfoText2: {
    color: 'white',
    marginTop: 2,
    marginRight: 90,
    fontSize: 18,
  },
  sectionText: {
    color: '#3A4D39',
  },
  modalLeftContent: {
    marginTop: 20,
  },
  modalRightContent: {
    flex: 1,
    marginTop: 20,
  },
  titleAndPriceContainer: {
    padding: 10,
  },
  postingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  postingSalary: {
    fontSize: 14,
    color: '#000',
  },
  separatorLine: {
    height: 1,
    backgroundColor: 'white',
    marginTop: 10,
    width: '100%',
  },
  modalContainer: {
    paddingHorizontal: 20,
    backgroundColor: '#3A4D39',
    minHeight: '100%',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  modalWrapper: {
    flex: 1,
    backgroundColor: '#3A4D39', // Modal background
  },
  closeButton: {
    position: 'absolute',
    borderRadius: 30,
    top: 60,
    right: 20,
    zIndex: 1,
  },
  closeButtonBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 105,
    backgroundColor: '#3A4D39', // Background for the close button bar
    justifyContent: 'center',
    alignItems: 'flex-end',
    zIndex: 10, // Ensure it stays above the ScrollView
    paddingHorizontal: 20,
  },
  galleryContainer: {
    marginTop: 110,
    justifyContent: 'center',
    maxWidth: '100%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
    marginTop: -60,
  },
  modalContentContainer: {
    width: '100%',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginBottom: 20,
  },
  modalSubTitle: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginBottom: 5,
  },
  sellerInfoSectionContainer: {
    marginTop: 15,
    marginBottom: -5,
    width: '100%',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  sectionContainer: {
    marginTop: 15,
    marginBottom: 10,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 15,
    letterSpacing: 1, 
    color: 'white',
  },
  sellerDetailsText: {
    fontSize: 16,
    color: '#8EF9F3',
  },
  posterInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  posterInfoTextContainer: {
    marginLeft: 10,
    marginBottom: 15,
  },
  posterInfoTextName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  posterInfoTextLocation: {
    fontSize: 15,
    color: 'white',
  },
  contactInfoButton: {
    paddingVertical: 10,
    marginBottom: 10,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  contactinfoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3A4D39',
    textAlign: 'center',
  },
  conditionText: {
    color: 'white',
    marginTop: 5,
    fontSize: 18,
    paddingRight: 30,
  },
  sectionContainerContactInfo: {
    marginTop: 5,
    width: '100%',
  },
  postingItemContainer: {
    flex: 1, // Ensure items take up equal width
    marginHorizontal: 10, // Adjust spacing between items
    backgroundColor: '#3A4D39',
    marginBottom: 10,
  },
  farmPostingTitleContatiner: {
    paddingHorizontal: 10,
    backgroundColor: '#3A4D39',
    shadowRadius: 20,
    shadowColor: 'black',
    shadowOpacity: 0.3,
    minWidth: '100%',
  },
});