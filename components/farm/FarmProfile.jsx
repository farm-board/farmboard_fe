import { View, Text } from 'react-native'
import React, { useContext, useState, useEffect } from 'react'
import { UserContext } from '../../contexts/UserContext'
import axios from 'axios'
import Animated, { FadeInUp } from 'react-native-reanimated'


export default function FarmProfile() {
  const {currentUser} = useContext(UserContext);
  const [farm, setFarm] = useState({});

  useEffect(() => {
    Promise.all([
      axios.get(`http://localhost:4000/api/v1/users/${currentUser.id}/farms`)
    ])
    .then(([farmResponse]) => {
      console.log('current farm:', farmResponse.data.data.attributes);
      setFarm(farmResponse.data.data.attributes);
    })
    .catch(error => {
      console.error('There was an error fetching the farm:', error);
    });
  }, [currentUser.id]);

  if (farm === undefined) {
    return <Text>Loading...</Text>;
  }

  return (
    <View className="flex items-center">
      <Animated.Text entering={FadeInUp.duration(400).springify()} className="text-white font-bold tracking-wider text-3xl pb-5">
          {`${farm.name}`}
      </Animated.Text>
      <Animated.Text entering={FadeInUp.duration(600).springify()} className="text-white font-bold tracking-wider text-2xl pb-10">
          {`${farm.city}, ${farm.state} ${farm.zip_code}`}
      </Animated.Text>
      <Animated.Text entering={FadeInUp.duration(800).springify()} className="text-white font-bold tracking-wider text-1xl pb-10">
          {`${farm.bio}`}
      </Animated.Text>
    </View>
  )
}
