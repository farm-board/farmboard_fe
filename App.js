import { createDrawerNavigator } from '@react-navigation/drawer';
import * as React from 'react';
import { TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createDrawerNavigator } from '@react-navigation/drawer';
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

const Stack = createNativeStackNavigator();

function HomeStackNav() {
  const navigation = useNavigation();
  return (
    <Stack.Navigator screenOptions={{
      drawerStyle: {
        backgroundColor: '#739072'
      },
      drawerLabelStyle: {  
        color: '#ECE3CE'
      },
      headerStyle: {
        backgroundColor: '#739072',
      },
      headerTintColor: '#ECE3CE',
      style: {
        backgroundColor: '#739072'
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
                  color="#ECE3CE"
                  style={{ marginLeft: 10 }}
                />
              </TouchableOpacity>
            );
          }
        }}/>
        <Stack.Screen name="Setup" component={SetupScreen} />
        <Stack.Screen name="Profile Edit" component={ProfileEditScreen} 
          options={{
            headerLeft: () => {
              return (
                <TouchableOpacity onPress={() => navigation.openDrawer()}>
                  <MaterialCommunityIcons
                    name="menu"
                    size={30}
                    color="#ECE3CE"
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
        backgroundColor: '#739072'
      },
      drawerLabelStyle: {  
        color: '#ECE3CE'
      },
      headerStyle: {
        backgroundColor: '#739072',
      },
      headerTintColor: '#ECE3CE',
      style: {
        backgroundColor: '#739072'
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
                  color="#ECE3CE"
                  style={{ marginLeft: 10 }}
                />
              </TouchableOpacity>
            );
          }
        }}/>
        <Stack.Screen name="Setup" component={SetupScreen} />
        <Stack.Screen name="Edit Profile" component={ProfileEditScreen} 
          options={{
            headerLeft: () => {
              return (
                <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                  <MaterialCommunityIcons
                    name="arrow-left"
                    size={30}
                    color="#ECE3CE"
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
                    color="#ECE3CE"
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
                    color="#ECE3CE"
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
                    color="#ECE3CE"
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
        backgroundColor: '#739072'
      },
      drawerLabelStyle: {  
        color: '#ECE3CE'
      },
      headerStyle: {
        backgroundColor: '#739072',
      },
      headerTintColor: '#ECE3CE',
      style: {
        backgroundColor: '#739072'
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
                  color="#ECE3CE"
                  style={{ marginLeft: 10 }}
                />
              </TouchableOpacity>
            );
          }
        }}/>
        <Stack.Screen name="Setup" component={SetupScreen} />
        <Stack.Screen name="Edit Profile" component={ProfileEditScreen} 
          options={{
            headerLeft: () => {
              return (
                <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                  <MaterialCommunityIcons
                    name="arrow-left"
                    size={30}
                    color="#ECE3CE"
                    style={{ marginLeft: 10 }}
                  />
                </TouchableOpacity>
              );
            }
          }}/>
        <Stack.Screen name="Employee Profile Edit Details" component={EmployeeProfileEditDetailsScreen} />
        <Stack.Screen name="Employee Profile Add Experiences" component={EmployeeProfileAddExperiencesScreen} />
        <Stack.Screen name="Employee Profile Add References" component={EmployeeProfileAddReferencesScreen} />
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
        backgroundColor: '#739072'
      },
      drawerLabelStyle: {  
        color: '#ECE3CE'
      },
      headerStyle: {
        backgroundColor: '#739072',
      },
      headerTintColor: '#ECE3CE',
      style: {
        backgroundColor: '#739072'
      },
      headerLeft: () => {
        return (
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <MaterialCommunityIcons
              name="menu"
              size={30}
              color="#ECE3CE"
              style={{ marginLeft: 10 }}
            />
          </TouchableOpacity>
        );
      }
      }}>
      <>
        <Stack.Screen name="Feed" component={FeedScreen} />
        <Stack.Screen name="Setup" component={SetupScreen} />
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
        <Stack.Screen name="Employee Profile View" component={EmployeeViewProfileScreen} />
      </>
    </Stack.Navigator>
  );
}


function DrawerNavigator() {
  const { currentUser } = useContext(UserContext);
  const Drawer = createDrawerNavigator();
  return (
    currentUser.role_type === 'farm' ?
    <Drawer.Navigator 
    drawerContent={props => <CustomDrawerContent {...props} />}
    screenOptions={{
      headerShown: false,
      drawerStyle: {
        backgroundColor: '#739072'
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
        backgroundColor: '#739072'
      },
    }}>
      <Drawer.Screen name="Home Stack" component={HomeStackNav} />
      <Drawer.Screen name="Profile Stack" component={EmployeeProfileStackNav} />
      <Drawer.Screen name="Feed Stack" component={FeedStackNav} />
    </Drawer.Navigator>
    : null
  );
}

function App() {
  const { currentUser } = useContext(UserContext);
  return (
    <NavigationContainer>
      {currentUser ? (
        <DrawerNavigator />
      ) : (
        <Stack.Navigator initialRouteName='Login' screenOptions={{ headerShown: false }}>
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignupScreen} />
            <Stack.Screen name="Forgot Password" component={ForgotPasswordScreen} />
            <Stack.Screen name="Reset Password" component={ResetPasswordScreen} />
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


