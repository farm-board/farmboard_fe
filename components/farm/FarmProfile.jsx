import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React, { useContext, useState, useEffect } from 'react'
import { UserContext } from '../../contexts/UserContext'
import axios from 'axios'
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated'
import Avatar from '../Profile/Avatar'
import StyledText from '../Texts/StyledText'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { colors } from '../../config/theme'
import { useNavigation } from '@react-navigation/native'

export default function FarmProfile() {
  const {currentUser} = useContext(UserContext);
  const [farm, setFarm] = useState({});
  const [profilePhoto, setProfilePhoto] = useState(null);

  const navigation = useNavigation();

  useEffect(() => {
    Promise.all([
      axios.get(`http://localhost:4000/api/v1/users/${currentUser.id}/farms`),
      axios.get(`http://localhost:4000/api/v1/users/${currentUser.id}/farms/image`)
    ])
    .then(([farmResponse, imageResponse]) => {
      console.log('current farm:', farmResponse.data.data.attributes);
      setFarm(farmResponse.data.data.attributes);
      setProfilePhoto(imageResponse.data.image_url);
    })
    .catch(error => {
      console.error('There was an error fetching the farm:', error);
    });
  }, [currentUser.id]);

  if (farm === undefined) {
    return <Text>Loading...</Text>;
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
      <View style={styles.farmBioContainer}>
        <StyledText big tanColor style={styles.farmBioTitle}>
          About
        </StyledText>
        <StyledText small tanColor style={styles.farmBioText}>
          {`${farm.bio}`}
        </StyledText>
      </View>
      <View style={styles.accommodationsContainer}>
        <Text style={styles.accommodationTitle}>
          <StyledText big bold tanColor style={styles.accommodationTitle}>
            Accommodations
          </StyledText>
        </Text>
        <Text style={styles.accommodationListItem}>
          <StyledText small tanColor>
            Offers Housing: Yes
          </StyledText>
        </Text>
        <Text style={styles.accommodationListItem}>
          <StyledText small tanColor>
            Offers Meals: Yes
          </StyledText>
        </Text>
        <Text style={styles.accommodationListItem}>
          <StyledText small tanColor>
            Offers Transporation: Yes
          </StyledText>
        </Text>
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
    paddingVertical: 25,
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
});

