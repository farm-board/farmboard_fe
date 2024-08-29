import { createDrawerNavigator } from '@react-navigation/drawer';
import * as React from 'react';
import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import SetupScreen from './screens/SetupScreen';
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import { UserContext, UserProvider } from './contexts/UserContext';
import { useContext } from 'react';
import ProfileEditScreen from './screens/ProfileEditScreen';
import FarmProfileEditDetailsScreen from './screens/FarmProfileEditDetailsScreen';
import FarmProfileEditAccommodationsScreen from './screens/FarmProfileEditAccommodationsScreen.jsx';
import FarmProfileAddAccommodationsScreen from './screens/FarmProfileAddAccommodationsScreen.jsx';
import FarmProfileAddPostingsScreen from './screens/FarmProfileAddPostingsScreen.jsx';
import FarmProfileEditPostingsScreen from './screens/FarmProfileEditPostingsScreen.jsx';
import EmployeeProfileEditDetailsScreen from './screens/EmployeeProfileEditDetailsScreen';
import EmployeeProfileAddExperiencesScreen from './screens/EmployeeProfileAddExperiencesScreen';
import EmployeeProfileAddReferencesScreen from './screens/EmployeeProfileAddReferencesScreen';
import FeedScreen from './screens/FeedScreen';
import EmployeeViewProfileScreen from './screens/EmployeeViewProfileScreen';
import FarmViewProfileScreen from './screens/FarmViewProfileScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen.jsx';
import ResetPasswordScreen from './screens/ResetPasswordScreen.jsx';
import CustomDrawerContent from './navigation/CustomDrawerContent';
import mobileAds, { TestIds } from 'react-native-google-mobile-ads';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';

const Stack = createNativeStackNavigator();

function HomeStackNav() {
  const navigation = useNavigation();
  return (
    <Stack.Navigator screenOptions={{
      drawerStyle: {
        backgroundColor: '#4F6F52'
      },
      drawerLabelStyle: {  
        color: 'white'
      },
      headerStyle: {
        backgroundColor: '#4F6F52',
      },
      headerTintColor: 'white',
      style: {
        backgroundColor: '#4F6F52'
      }
      }}>
      <>
        <Stack.Screen name="Home" component={HomeScreen} 
        options={{
          headerLeft: () => {
            return (
              <TouchableOpacity onPress={() => navigation.openDrawer()}>
                <MaterialCommunityIcons
                  name="menu"
                  size={30}
                  color="white"
                  style={{ marginLeft: 10 }}
                />
              </TouchableOpacity>
            );
          }
        }}/>
        <Stack.Screen name="Profile Edit" component={ProfileEditScreen} 
          options={{
            headerLeft: () => {
              return (
                <TouchableOpacity onPress={() => navigation.openDrawer()}>
                  <MaterialCommunityIcons
                    name="menu"
                    size={30}
                    color="white"
                    style={{ marginLeft: 10 }}
                  />
                </TouchableOpacity>
              );
            }
          }}
        />
        <Stack.Screen name="Farm Profile Add Postings" component={FarmProfileAddPostingsScreen} 
           options={{ 
            title: 'Add Job Posting',
            headerBackTitle: 'Home',
            headerBackTitleStyle: { fontSize: 15 },
          }}
        />
        <Stack.Screen name="Farm Profile Edit Postings" component={FarmProfileEditPostingsScreen} 
           options={{ 
            title: 'Edit Job Posting',
            headerBackTitle: 'Home',
            headerBackTitleStyle: { fontSize: 15 },
          }}
        />
        <Stack.Screen name="Employee Profile View" component={EmployeeViewProfileScreen} 
          options={{ 
            title: 'Applicant Profile',
            headerBackTitle: 'Home',
            headerBackTitleStyle: { fontSize: 15 },
          }}
        />
      </>
    </Stack.Navigator>
  );
}
function FarmProfileStackNav() {
  const navigation = useNavigation();
  return (
    <Stack.Navigator screenOptions={{
      drawerStyle: {
        backgroundColor: '#4F6F52'
      },
      drawerLabelStyle: {  
        color: 'white'
      },
      headerStyle: {
        backgroundColor: '#4F6F52',
      },
      headerTintColor: 'white',
      style: {
        backgroundColor: '#4F6F52'
      }
      }}>
      <>
        <Stack.Screen name="Profile" component={ProfileScreen} 
        options={{
          headerLeft: () => {
            return (
              <TouchableOpacity onPress={() => navigation.openDrawer()}>
                <MaterialCommunityIcons
                  name="menu"
                  size={30}
                  color="white"
                  style={{ marginLeft: 10 }}
                />
              </TouchableOpacity>
            );
          }
        }}/>
        <Stack.Screen name="Edit Profile" component={ProfileEditScreen} 
          options={{
            headerLeft: () => {
              return (
                <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                  <MaterialCommunityIcons
                    name="arrow-left"
                    size={30}
                    color="white"
                    style={{ marginLeft: 10 }}
                  />
                </TouchableOpacity>
              );
            }
          }}/>
        <Stack.Screen name="Farm Profile Edit Details" component={FarmProfileEditDetailsScreen} 
          options={{ 
            title: 'Edit Display Info',
            headerLeft: () => {
              return (
                <TouchableOpacity onPress={() => navigation.navigate('Edit Profile')}>
                  <MaterialCommunityIcons
                    name="arrow-left"
                    size={30}
                    color="white"
                    style={{ marginLeft: 10 }}
                  />
                </TouchableOpacity>
              );
            }
          }}/>
        <Stack.Screen name="Farm Profile Edit Accommodations" component={FarmProfileEditAccommodationsScreen}
          options={{ 
            title: 'Edit Accommodation Info',
            headerLeft: () => {
              return (
                <TouchableOpacity onPress={() => navigation.navigate('Edit Profile')}>
                  <MaterialCommunityIcons
                    name="arrow-left"
                    size={30}
                    color="white"
                    style={{ marginLeft: 10 }}
                  />
                </TouchableOpacity>
              );
            }
          }}
        />
        <Stack.Screen name="Farm Profile Add Accommodations" component={FarmProfileAddAccommodationsScreen} 
          options={{ 
            title: 'Add Accommodation Info',
            headerLeft: () => {
              return (
                <TouchableOpacity onPress={() => navigation.navigate('Edit Profile')}>
                  <MaterialCommunityIcons
                    name="arrow-left"
                    size={30}
                    color="white"
                    style={{ marginLeft: 10 }}
                  />
                </TouchableOpacity>
              );
            }
          }}
        />
        <Stack.Screen name="Farm Profile Add Postings" component={FarmProfileAddPostingsScreen} 
          options={{ 
            title: 'Add Job Posting',
            headerBackTitle: 'Profile',
            headerBackTitleStyle: { fontSize: 15 },
          }}
        />
        <Stack.Screen name="Farm Profile Edit Postings" component={FarmProfileEditPostingsScreen} 
          options={{ 
            title: 'Edit Job Posting',
            headerBackTitle: 'Profile',
            headerBackTitleStyle: { fontSize: 15 },
          }}
        />
        <Stack.Screen name="Employee Profile View" component={EmployeeViewProfileScreen} 
          options={{ 
            title: 'Applicant Profile',
            headerBackTitle: '',
            headerBackTitleStyle: { fontSize: 15 },
          }}
        />
      </>
    </Stack.Navigator>
  );
}

function EmployeeProfileStackNav() {
  const navigation = useNavigation();
  return (
    <Stack.Navigator screenOptions={{
      drawerStyle: {
        backgroundColor: '#4F6F52'
      },
      drawerLabelStyle: {  
        color: 'white'
      },
      headerStyle: {
        backgroundColor: '#4F6F52',
      },
      headerTintColor: 'white',
      style: {
        backgroundColor: '#4F6F52'
      }
      }}>
      <>
        <Stack.Screen name="Profile" component={ProfileScreen} 
        options={{
          headerLeft: () => {
            return (
              <TouchableOpacity onPress={() => navigation.openDrawer()}>
                <MaterialCommunityIcons
                  name="menu"
                  size={30}
                  color="white"
                  style={{ marginLeft: 10 }}
                />
              </TouchableOpacity>
            );
          }
        }}/>
        <Stack.Screen name="Edit Profile" component={ProfileEditScreen} 
          options={{
            headerLeft: () => {
              return (
                <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                  <MaterialCommunityIcons
                    name="arrow-left"
                    size={30}
                    color="white"
                    style={{ marginLeft: 10 }}
                  />
                </TouchableOpacity>
              );
            }
          }}/>
        <Stack.Screen name="Employee Profile Edit Details" component={EmployeeProfileEditDetailsScreen}
          options={{ 
            title: 'Edit Display Info',
            headerLeft: () => {
              return (
                <TouchableOpacity onPress={() => navigation.navigate('Edit Profile')}>
                  <MaterialCommunityIcons
                    name="arrow-left"
                    size={30}
                    color="white"
                    style={{ marginLeft: 10 }}
                  />
                </TouchableOpacity>
              );
            }
          }} 
        />
        <Stack.Screen name="Employee Profile Add Experiences" component={EmployeeProfileAddExperiencesScreen}
          options={{ 
            title: 'Add Experience',
            headerLeft: () => {
              return (
                <TouchableOpacity onPress={() => navigation.navigate('Edit Profile')}>
                  <MaterialCommunityIcons
                    name="arrow-left"
                    size={30}
                    color="white"
                    style={{ marginLeft: 10 }}
                  />
                </TouchableOpacity>
              );
            }
          }} 
         />
        <Stack.Screen name="Employee Profile Add References" component={EmployeeProfileAddReferencesScreen}
          options={{ 
            title: 'Add Reference',
            headerLeft: () => {
              return (
                <TouchableOpacity onPress={() => navigation.navigate('Edit Profile')}>
                  <MaterialCommunityIcons
                    name="arrow-left"
                    size={30}
                    color="white"
                    style={{ marginLeft: 10 }}
                  />
                </TouchableOpacity>
              );
            }
          }} 
       />
        <Stack.Screen name="Employee Profile View" component={EmployeeViewProfileScreen} />
      </>
    </Stack.Navigator>
  );
}

function FeedStackNav() {
  const navigation = useNavigation();
  return (
    <Stack.Navigator screenOptions={{
      drawerStyle: {
        backgroundColor: '#4F6F52'
      },
      drawerLabelStyle: {  
        color: 'white'
      },
      headerStyle: {
        backgroundColor: '#4F6F52',
      },
      headerTintColor: 'white',
      style: {
        backgroundColor: '#4F6F52'
      },
      headerLeft: () => {
        return (
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <MaterialCommunityIcons
              name="menu"
              size={30}
              color="white"
              style={{ marginLeft: 10 }}
            />
          </TouchableOpacity>
        );
      }
      }}>
      <>
        <Stack.Screen name="Feed" component={FeedScreen} />
        <Stack.Screen name="Farm Profile Add Postings" component={FarmProfileAddPostingsScreen} 
          options={{ 
            title: 'Add Job Posting',
            headerBackTitle: 'Home',
            headerBackTitleStyle: { fontSize: 15 },
          }}
        />
        <Stack.Screen name="Farm Profile Edit Postings" component={FarmProfileEditPostingsScreen} 
          options={{ 
            title: 'Edit Job Posting',
            headerBackTitle: 'Home',
            headerBackTitleStyle: { fontSize: 15 },
          }}
        />
        <Stack.Screen name="Farm Profile View" component={FarmViewProfileScreen}
        options={{ 
          title: 'Farm Profile',
          headerLeft: () => {
            return (
              <TouchableOpacity onPress={() => navigation.navigate('Feed')}>
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={30}
                  color="white"
                  style={{ marginLeft: 10 }}
                />
              </TouchableOpacity>
            );
          }
        }}
         />
      </>
    </Stack.Navigator>
  );
}


function DrawerNavigator() {
  const { currentUser, setupComplete, loading } = useContext(UserContext);
  const Drawer = createDrawerNavigator();

    if (loading) {
      return null;
    }

    return (
      setupComplete ? (
        currentUser.role_type === 'farm' ?
      <Drawer.Navigator 
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: '#333'
        },
      }}>
        <Drawer.Screen name="Home Stack" component={HomeStackNav} />
        <Drawer.Screen name="Profile Stack" component={FarmProfileStackNav} />
        <Drawer.Screen name="Feed Stack" component={FeedStackNav} />
      </Drawer.Navigator>
      : currentUser.role_type === 'employee' ?
      <Drawer.Navigator 
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: '#333'
        },
      }}>
        <Drawer.Screen name="Feed Stack" component={FeedStackNav} />
        <Drawer.Screen name="Profile Stack" component={EmployeeProfileStackNav} />
      </Drawer.Navigator>
      : null
    ) :
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Setup" component={SetupScreen} />
      </Stack.Navigator>
    );
};


function App() {
  const { currentUser, setDeviceId } = useContext(UserContext);

  useEffect(() => {
    const initializeAds = async () => {
      console.log('Starting useEffect');
  
      try {
        // Step 1: Request tracking permissions
        const { status: trackingStatus } = await requestTrackingPermissionsAsync();
        console.log('Tracking status:', trackingStatus);
  
        if (trackingStatus !== 'granted') {
          console.log('Tracking permissions not granted');
        }
  
        // Step 2: Initialize mobile ads
        await mobileAds().initialize();
        console.log('Ads initialized');
        
      } catch (error) {
        console.log('Error in initializing ads:', error);
      }
    };
  
    initializeAds();
  }, []);
  
  const linking = {
    prefixes: ['exp://10.0.0.15:8081/'], // Add your production URL here
    config: {
      screens: {
        ResetPassword: '--/password/edit',
      },
    },
  };


  return (
    <NavigationContainer linking={linking}>
      {currentUser ? (
        <DrawerNavigator />
      ) : (
        <Stack.Navigator initialRouteName='Login' screenOptions={{ headerShown: false }}>
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignupScreen} />
            <Stack.Screen name="Setup" component={SetupScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          </>
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
export default () => (
  <UserProvider>
    <App />
  </UserProvider>
);


