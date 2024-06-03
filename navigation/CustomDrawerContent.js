import React, { useContext, useState, useEffect } from 'react';
import { View, StyleSheet, Text, Alert } from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { Avatar, Title } from 'react-native-paper';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { UserContext } from '../contexts/UserContext';
import axios from 'axios';

const DrawerLayout = ({ icon, label, navigateTo }) => {
  const navigation = useNavigation();
  return (
    <DrawerItem
      icon={({color, size}) => <Icon name={icon} color="white" size={size} />}
      labelStyle={{ color: "white", fontSize: 18}}
      label={label}
      onPress={() => {
        navigation.navigate(navigateTo);
      }}
    />
  );
};

const DrawerItems = ({ drawerList = [] }) => {
  return drawerList.map((el, i) => {
    return (
      <DrawerLayout
        key={i}
        icon={el.icon}
        label={el.label}
        navigateTo={el.navigateTo}
      />
    );
  });
};

function CustomDrawerContent(props) {
  const [userData, setUserData] = useState({});
  const [avatarImage, setAvatarImage] = useState('');
  const navigation = useNavigation();
  const { currentUser, logout, userName, setUserName, userAvatar, setUserAvatar, userFirstName, setUserFirstName, userLastName, setUserLastName } = useContext(UserContext);

  const DrawerList = currentUser.role_type === 'farm' ?
    [
      { icon: 'home-outline', label: 'Home', navigateTo: 'Home Stack' },
      { icon: 'account-multiple', label: 'Profile', navigateTo: 'Profile Stack' },
      { icon: 'clipboard-text-multiple-outline', label: 'Feed', navigateTo: 'Feed Stack' }
    ]
    : currentUser.role_type === 'employee' ?
      [
        { icon: 'account-multiple', label: 'Profile', navigateTo: 'Profile Stack' },
        { icon: 'clipboard-text-multiple-outline', label: 'Feed', navigateTo: 'Feed Stack' }
      ]
      : [];

  const handleLogout = () => {
    Alert.alert(
      'Log Out', "Are you sure you want to Log out?",
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel'
        },
        {
          text: 'Log Out',
          onPress: () => {
          logout(navigation);
        }
      }
    ],
    );
  };

  const fetchUserData = async () => {
    try {
      if (currentUser.role_type === 'farm') {
        const farmResponse = await axios.get(`http://localhost:4000/api/v1/users/${currentUser.id}/farms`);
        console.log('drawer farm data:', farmResponse.data);
        setUserData(farmResponse.data.data.attributes);
        setUserName(farmResponse.data.data.attributes.name);

        try {
          const imageResponse = await axios.get(`http://localhost:4000/api/v1/users/${currentUser.id}/farms/image`);
          console.log('drawer image data:', imageResponse.data);
          setAvatarImage(imageResponse.data.image_url);
          setUserAvatar(imageResponse.data.image_url);
        } catch (imageError) {
          console.log('Unable to fetch farm image', imageError);
        }
      } else if (currentUser.role_type === 'employee') {
        const employeeResponse = await axios.get(`http://localhost:4000/api/v1/users/${currentUser.id}/employees`);
        console.log('drawer employee data:', employeeResponse.data);
        setUserData(employeeResponse.data.data.attributes);
        setUserFirstName(employeeResponse.data.data.attributes.first_name);
        setUserLastName(employeeResponse.data.data.attributes.last_name);

        try {
          const imageResponse = await axios.get(`http://localhost:4000/api/v1/users/${currentUser.id}/employees/image`);
          console.log('drawer image data:', imageResponse.data);
          setAvatarImage(imageResponse.data.image_url);
          setUserAvatar(imageResponse.data.image_url);
        } catch (imageError) {
          console.log('Unable to fetch employee image', imageError);
        }
      }
    } catch (error) {
      console.log('Unable to fetch user data', error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [currentUser]);

  useFocusEffect(
    React.useCallback(() => {
      fetchUserData();
    }, [currentUser])
  );

  const getUserDisplayName = () => {
    if (currentUser.role_type === 'farm') {
      return `${userName}`;
    } else if (currentUser.role_type === 'employee') {
      return `${userFirstName} ${userLastName}`;
    }
    return '';
  };

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props}>
        <View style={styles.drawerContent}>
          <TouchableOpacity activeOpacity={0.8}>
            <View style={styles.userInfoSection}>
              <View style={{flexDirection: 'row', marginTop: 15}}>
              <Avatar.Image
                  source={userAvatar ? { uri: userAvatar } : require('../assets/images/FarmProfilePlaceholder.png')}
                  size={60}
                  style={{ justifyContent: 'center', alignSelf: 'center'}}
                />
                <View style={{ marginLeft: 10, flexDirection: 'column' }}>
                  <Title style={styles.title}>{getUserDisplayName()}</Title>
                  <Text style={styles.caption} numberOfLines={1}>
                    {currentUser.email}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
          <View style={styles.drawerSection}>
            <DrawerItems drawerList={DrawerList} />
          </View>
        </View>
      </DrawerContentScrollView>
      <View style={styles.bottomDrawerSection}>
        <DrawerItem
          icon={({color, size}) => (
            <Icon name="exit-to-app" color="white" size={size} />
          )}
          labelStyle={{ color: "white", fontSize: 18}}
          label="Sign Out"
          onPress={handleLogout}
        />
      </View>
    </View>
  );
}
export default CustomDrawerContent;

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
    backgroundColor: '#3A4D39',
    shadowRadius: 30,
    shadowColor: 'black',
    shadowOpacity: 0.4,
  },
  userInfoSection: {
    paddingLeft: 20,
    backgroundColor: '#3A4D39',
    borderTopColor: '#dedede',
    borderTopWidth: 1,
  },
  title: {
    fontSize: 18,
    marginTop: 3,
    marginRight: 45,
    fontWeight: 'bold',
    color: "white",
  },
  caption: {
    fontSize: 13,
    lineHeight: 14,
    color: "white",
    width: '100%',
  },
  row: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginRight: 15,
  },
  paragraph: {
    fontWeight: 'bold',
    marginRight: 3,
  },
  drawerSection: {
    marginTop: 15,
    borderBottomWidth: 0,
    borderBottomColor: '#dedede',
    borderTopColor: '#dedede',
    borderBottomWidth: 1,
    borderTopWidth: 1,
  },
  bottomDrawerSection: {
    marginBottom: 35,
    borderTopColor: '#dedede',
    borderTopWidth: 1,
    borderBottomColor: '#dedede',
    borderBottomWidth: 1,
    backgroundColor: '#3A4D39',
    shadowRadius: 30,
    shadowColor: 'black',
    shadowOpacity: 0.4,
  },
  preference: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
});
