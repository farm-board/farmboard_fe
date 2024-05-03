import { createDrawerNavigator } from '@react-navigation/drawer';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
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

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function DrawerNavigator() {
  return (
    <Drawer.Navigator initialRouteName='Feed'>
      <Drawer.Screen name="Profile" component={ProfileScreen} />
      <Drawer.Screen name="Feed" component={FeedScreen} />
      <Drawer.Screen name="FarmBoard" options={{ drawerLabel: () => null }}>
        {() => (
          <OtherScreensNavigator />
        )}
      </Drawer.Screen>
    </Drawer.Navigator>
  );
}
function OtherScreensNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <>
        <Stack.Screen name="Profile Edit" component={ProfileEditScreen} />
        <Stack.Screen name="Farm Profile Edit Details" component={FarmProfileEditDetailsScreen} />
        <Stack.Screen name="Farm Profile Edit Accommodations" component={FarmProfileEditAccommodationsScreen} />
        <Stack.Screen name="Farm Profile Add Accommodations" component={FarmProfileAddAccommodationsScreen} />
        <Stack.Screen name="Farm Profile Add Postings" component={FarmProfileAddPostingsScreen} />
        <Stack.Screen name="Farm Profile Edit Postings" component={FarmProfileEditPostingsScreen} />
        <Stack.Screen name="Employee Profile Edit Details" component={EmployeeProfileEditDetailsScreen} />
        <Stack.Screen name="Employee Profile Add Experiences" component={EmployeeProfileAddExperiencesScreen} />
        <Stack.Screen name="Employee Profile Add References" component={EmployeeProfileAddReferencesScreen} />
        <Stack.Screen name="Employee Profile View" component={EmployeeViewProfileScreen} />
        <Stack.Screen name="Farm Profile View" component={FarmViewProfileScreen} />
      </>
    </Stack.Navigator>
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