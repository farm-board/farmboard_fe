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
import FarmProfileEditMarketplaceContactInfoScreen from './screens/FarmProfileEditMarketplaceContactInfoScreen';
import FarmProfileEditAccommodationsScreen from './screens/FarmProfileEditAccommodationsScreen.jsx';
import FarmProfileAddAccommodationsScreen from './screens/FarmProfileAddAccommodationsScreen.jsx';
import FarmProfileAddPostingsScreen from './screens/FarmProfileAddPostingsScreen.jsx';
import FarmProfileEditPostingsScreen from './screens/FarmProfileEditPostingsScreen.jsx';
import EmployeeProfileEditDetailsScreen from './screens/EmployeeProfileEditDetailsScreen';
import EmployeeProfileAddExperiencesScreen from './screens/EmployeeProfileAddExperiencesScreen';
import EmployeeProfileAddReferencesScreen from './screens/EmployeeProfileAddReferencesScreen';
import EmployeeProfileEditMarketplaceContactInfoScreen from './screens/EmployeeProfileEditMarketplaceContactInfoScreen';
import FeedScreen from './screens/FeedScreen';
import MarketplaceFeedScreen from './screens/MarketplaceFeedScreen';
import MarketplaceManagePostingsScreen from './screens/MarketplaceManagePostingsScreen';
import MarketplaceAddPostingScreen from './screens/MarketplaceAddPostingScreen.jsx';
import MarketplaceEditPostingScreen from './screens/MarketplaceEditPostingScreen.jsx';
import EmployeeViewProfileScreen from './screens/EmployeeViewProfileScreen';
import FarmViewProfileScreen from './screens/FarmViewProfileScreen';
import MarketplaceViewProfileScreen from './screens/MarketplaceViewProfileScreen';
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
          title: 'Manage Postings',
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
            headerBackTitleVisible: false,
          }}
        />
        <Stack.Screen name="Farm Profile Edit Postings" component={FarmProfileEditPostingsScreen} 
           options={{ 
            title: 'Edit Job Posting',
            headerBackTitleVisible: false,
          }}
        />
        <Stack.Screen name="Employee Profile View" component={EmployeeViewProfileScreen} 
          options={{ 
            title: 'Applicant Profile',
            headerBackTitleVisible: false,
          }}
        />
      </>
    </Stack.Navigator>
  );
};

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
        <Stack.Screen name="Farm Profile Edit Marketplace Contact Info" component={FarmProfileEditMarketplaceContactInfoScreen} 
          options={{ 
            title: 'Edit Marketplace Contact Info',
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
            headerBackTitleVisible: false,
          }}
        />
      </>
    </Stack.Navigator>
  );
};

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
        <Stack.Screen name="Employee Profile Edit Marketplace Contact Info" component={EmployeeProfileEditMarketplaceContactInfoScreen} 
          options={{ 
            title: 'Edit Marketplace Contact Info',
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
};

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
        <Stack.Screen name="Jobs" component={FeedScreen} />
        <Stack.Screen name="Farm Profile Add Postings" component={FarmProfileAddPostingsScreen} 
          options={{ 
            title: 'Add Job Posting',
            headerBackTitleVisible: false,
          }}
        />
        <Stack.Screen name="Farm Profile Edit Postings" component={FarmProfileEditPostingsScreen} 
          options={{ 
            title: 'Edit Job Posting',
            headerBackTitleVisible: false,
          }}
        />
        <Stack.Screen name="Farm Profile View" component={FarmViewProfileScreen}
        options={{ 
          title: 'Farm Profile',
          headerLeft: () => {
            return (
              <TouchableOpacity onPress={() => navigation.navigate('Jobs')}>
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
};

function MarketplaceStackNav() {
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
        <Stack.Screen name="Marketplace" component={MarketplaceFeedScreen} />
        <Stack.Screen name="Manage Marketplace Postings" component={MarketplaceManagePostingsScreen} 
          options={{ 
            title: 'Manage Marketplace Postings',
            headerBackTitle: 'Marketplace',
            headerBackTitleStyle: { fontSize: 15 },
            headerLeft: () => {
              return (
                <TouchableOpacity onPress={() => navigation.navigate('Marketplace')}>
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
        <Stack.Screen name="Add Marketplace Posting" component={MarketplaceAddPostingScreen} 
          options={{ 
            title: 'Add Marketplace Posting',
            headerBackTitle: 'Marketplace',
            headerBackTitleStyle: { fontSize: 15 },
            headerLeft: () => {
              return (
                <TouchableOpacity onPress={() => navigation.navigate('Marketplace')}>
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
        <Stack.Screen name="Edit Marketplace Posting" component={MarketplaceEditPostingScreen} 
          options={{ 
            title: 'Edit This Marketplace Posting',
            headerBackTitle: 'Marketplace',
            headerBackTitleStyle: { fontSize: 15 },
            headerLeft: () => {
              return (
                <TouchableOpacity onPress={() => navigation.navigate('Marketplace')}>
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
        <Stack.Screen name="Farm Profile Edit Postings" component={FarmProfileEditPostingsScreen} 
          options={{ 
            title: 'Edit Job Posting',
            headerBackTitleVisible: false,
          }}
        />
        <Stack.Screen name="Marketplace Profile View" component={MarketplaceViewProfileScreen}
        options={{ 
          title: 'Seller Details',
          headerLeft: () => {
            return (
              <TouchableOpacity onPress={() => navigation.navigate('Marketplace')}>
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
};

const PublicDrawer = createDrawerNavigator();

function PublicDrawerNavigator() {
  return (
    <PublicDrawer.Navigator
      // Reuse the same custom drawer content
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: '#333', // same background as your logged-in drawers
        },
      }}
    >
      <PublicDrawer.Screen name="Feed Stack" component={FeedStackNav} />
      <PublicDrawer.Screen name="Marketplace Stack" component={MarketplaceStackNav} />
    </PublicDrawer.Navigator>
  );
};

function UnauthenticatedNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="PublicDrawer"
      screenOptions={{ headerShown: false }}
    >
      {/* This is the initial route for users who aren't logged in */}
      <Stack.Screen name="PublicDrawer" component={PublicDrawerNavigator} />

      {/* Your existing login-related screens */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignupScreen} />
      <Stack.Screen name="Setup" component={SetupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
};

function DrawerNavigator() {
  const { currentUser, setupComplete, loading } = useContext(UserContext);
  const Drawer = createDrawerNavigator();

    if (loading) {
      return null;
    }

    return (
      setupComplete ? (
        currentUser.role_type === 'farm' ? (
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
        <Drawer.Screen name="Marketplace Stack" component={MarketplaceStackNav} />
      </Drawer.Navigator>
      ) : currentUser.role_type === 'employee' ? (
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
        <Drawer.Screen name="Marketplace Stack" component={MarketplaceStackNav} />
      </Drawer.Navigator>
      ) : (
        // Fallback UI instead of null:
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Setup" component={SetupScreen} />
        </Stack.Navigator>
      )
    ) : (
      // Setup screen if not complete
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Setup" component={SetupScreen} />
      </Stack.Navigator>
    )
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
    prefixes: [
      'farmboard://', 
      'https://farmboard.farmspheredynamics.com'
    ],
    config: {
      screens: {
        ResetPassword: '--/password/edit',
      },
    },
  };


  return (
    <NavigationContainer>
      {currentUser ? (
        // Logged-in users get the main drawer that has "Home" or "Manage Postings" etc.
        <DrawerNavigator />
      ) : (
        // Not logged in? Go to UnauthenticatedNavigator
        <UnauthenticatedNavigator />
      )}
    </NavigationContainer>
  );
}
export default () => (
  <UserProvider>
    <App />
  </UserProvider>
);


