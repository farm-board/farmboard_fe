import React, { useContext, useState, useEffect } from 'react'
import {View, StyleSheet, Text} from 'react-native';
import {DrawerContentScrollView, DrawerItem} from '@react-navigation/drawer';
import {Avatar, Title} from 'react-native-paper';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { UserContext } from '../contexts/UserContext'
import axios from 'axios';


const DrawerLayout = ({icon, label, navigateTo}) => {
  const navigation = useNavigation();
  return (
    <DrawerItem
      icon={({color, size}) => <Icon name={icon} color="#ECE3CE" size={size} />}
      labelStyle={{ color: "#ECE3CE" }}
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
  const{currentUser, logout} = useContext(UserContext);

  const DrawerList = currentUser.role_type === 'farm' ?
  [
    {icon: 'home-outline', label: 'Home', navigateTo: 'Home Stack'},
    {icon: 'account-multiple', label: 'Profile', navigateTo: 'Profile Stack'},
    {icon: 'clipboard-text-multiple-outline', label: 'Feed', navigateTo: 'Feed Stack'}
  ]
  : currentUser.role_type === 'employee' ?
  [
    {icon: 'account-multiple', label: 'Profile', navigateTo: 'Profile Stack'},
    {icon: 'clipboard-text-multiple-outline', label: 'Feed', navigateTo: 'Feed Stack'}
  ]
  : [];

  handleLogout = () => { 
    logout(navigation);
  }

  useEffect(() => {
    console.log('drawer currentUser:', currentUser);
    currentUser.role_type === 'farm' ? 
      Promise.all([
        axios.get(`http://localhost:4000/api/v1/users/${currentUser.id}/farms`),
        axios.get(`http://localhost:4000/api/v1/users/${currentUser.id}/farms/image`)
      ])
      .then(([farmResponse, imageResponse]) => {
        console.log('drawer farm data:', farmResponse.data);
        console.log('drawer image data:', imageResponse.data);
        setUserData(farmResponse.data.data.attributes);
        setAvatarImage(imageResponse.data.image_url);
      })
      .catch(error => {
        console.log('Unable to fetch farm data', error);
      }) 
    : currentUser.role_type === 'employee' ?
    Promise.all([
      axios.get(`http://localhost:4000/api/v1/users/${currentUser.id}/employees`),
      axios.get(`http://localhost:4000/api/v1/users/${currentUser.id}/employees/image`)
      ])
      .then(([employeeResponse, imageResponse]) => {
        console.log('drawer employee data:', employeeResponse.data);
        console.log('drawer image data:', imageResponse.data);
        setUserData(employeeResponse.data.data.attributes);
        setAvatarImage(imageResponse.data.image_url);
      })
      .catch(error => {
        console.log('Unable to fetch farm data', error);
      }) 
    : null;
  }, [currentUser.id]);
  
  return (
    <View style={{flex: 1}}>
      <DrawerContentScrollView {...props}>
        <View style={styles.drawerContent}>
          <TouchableOpacity activeOpacity={0.8}>
            <View style={styles.userInfoSection}>
              <View style={{flexDirection: 'row', marginTop: 15}}>
                <Avatar.Image
                  source={{
                    uri: avatarImage,
                  }}
                  size={50}
                  style={{marginTop: 5}}
                />
                <View style={{marginLeft: 10, flexDirection: 'column'}}>
                  <Title style={styles.title}>{userData.name}</Title>
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
            <Icon name="exit-to-app" color="#ECE3CE" size={size} />
          )}
          labelStyle={{ color: "#ECE3CE" }}
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
    backgroundColor: '#4F6F52',
    shadowRadius: 30,
    shadowColor: 'black',
    shadowOpacity: 0.4,
  },
  userInfoSection: {
    paddingLeft: 20,
    backgroundColor: '#4F6F52',
    borderTopColor: '#dedede',
    borderTopWidth: 1,
  },
  title: {
    fontSize: 16,
    marginTop: 3,
    fontWeight: 'bold',
    color: "#ECE3CE",
  },
  caption: {
    fontSize: 13,
    lineHeight: 14,
    color: "#ECE3CE",
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
    backgroundColor: '#4F6F52',
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
