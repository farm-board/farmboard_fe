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


const Stack = createNativeStackNavigator();

function App() {
  const { currentUser } = useContext(UserContext);

  return (
    <NavigationContainer>
        {currentUser ? (
          <Stack.Navigator initialRouteName='Home' screenOptions={{headerShown: false}}>
            <>
              <Stack.Screen name="Setup" component={SetupScreen} />
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
              
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
