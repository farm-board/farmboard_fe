import { View, Text, Image } from 'react-native'
import React, { useContext, useState, useEffect } from 'react'
import { UserContext } from '../../contexts/UserContext'
import axios from 'axios'
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated'
import Avatar from '../Profile/Avatar'
import StyledText from '../Texts/StyledText'


export default function FarmProfile() {
  const {currentUser} = useContext(UserContext);
  const [farm, setFarm] = useState({});
  const [profilePhoto, setProfilePhoto] = useState(null);

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

  return (
    <View className="items-center">
      <Animated.View entering={FadeInDown.delay(1000).duration(1000).springify()} className="mb-3">
        <Avatar uri={profilePhoto} />
      </Animated.View>
      <Animated.Text entering={FadeInUp.duration(400).springify()} className="text-white tracking-wider pb-5">
          <StyledText big>
            {`${farm.name}`}
          </StyledText>
      </Animated.Text>
      <Animated.Text entering={FadeInUp.duration(600).springify()} className="text-white tracking-wider pb-5">
        <StyledText big>
          {`${farm.city}, ${farm.state} ${farm.zip_code}`}
        </StyledText>
      </Animated.Text>
      <Animated.Text entering={FadeInUp.duration(800).springify()} className="text-white font-bold tracking-wider text-1xl pb-10">
        <StyledText small>
          {`${farm.bio}`}
        </StyledText>
      </Animated.Text>
    </View>
  )
}

