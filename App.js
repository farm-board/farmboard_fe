import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import SetupScreen from './screens/SetupScreen';
import HomeScreen from './screens/HomeScreen';
import { UserContext, UserProvider } from './contexts/UserContext';
import { useContext } from 'react';


const AuthStack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator();

function AuthNavigator() {
  return (
    <AuthStack.Navigator initialRouteName='Login' screenOptions={{headerShown: false}}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="SignUp" component={SignupScreen} />
    </AuthStack.Navigator>
  );
}

function MainNavigator() {
  return (
    <MainStack.Navigator initialRouteName='Home' screenOptions={{headerShown: false}}>
      <MainStack.Screen name="Setup" component={SetupScreen} />
      <MainStack.Screen name="Home" component={HomeScreen} />
    </MainStack.Navigator>
  );
}

function App() {
  const { currentUser } = useContext(UserContext);

  return (
    <NavigationContainer>
      {currentUser ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

export default () => (
  <UserProvider>
    <App />
  </UserProvider>
);
