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

const Stack = createNativeStackNavigator();

function App() {
  const { currentUser } = useContext(UserContext);

  return (
    <NavigationContainer>
        {currentUser ? (
          <Stack.Navigator initialRouteName='Home' screenOptions={{headerShown: false}}>
            <>
              <Stack.Screen name="Profile" component={ProfileScreen} />
              <Stack.Screen name="Setup" component={SetupScreen} />
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Feed" component={FeedScreen} />
              <Stack.Screen name="Profile Edit" component={ProfileEditScreen} />
              <Stack.Screen name="Farm Profile Edit Details" component={FarmProfileEditDetailsScreen} />
              <Stack.Screen name="Farm Profile Edit Accommodations" component={FarmProfileEditAccommodationsScreen} />
              <Stack.Screen name="Farm Profile Add Accommodations" component={FarmProfileAddAccommodationsScreen} />
              <Stack.Screen name="Farm Profile Add Postings" component={FarmProfileAddPostingsScreen} />
              <Stack.Screen name="Farm Profile Edit Postings" component={FarmProfileEditPostingsScreen} />
              <Stack.Screen name="Employee Profile Edit Details" component={EmployeeProfileEditDetailsScreen} />
              <Stack.Screen name="Employee Profile Add Experiences" component={EmployeeProfileAddExperiencesScreen} />
              <Stack.Screen name="Employee Profile Add References" component={EmployeeProfileAddReferencesScreen} />
            </>
          </Stack.Navigator>
        ) : (
          <Stack.Navigator initialRouteName='Login' screenOptions={{headerShown: false}}>
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="SignUp" component={SignupScreen} />
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
