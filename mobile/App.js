import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from './src/contexts/AuthContext';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import VerifyTokenScreen from './src/screens/auth/VerifyTokenScreen';
import HomeScreen from './src/screens/home/HomeScreen';
import ProfileScreen from './src/screens/profile/ProfileScreen';
import AccessHistoryScreen from './src/screens/access/AccessHistoryScreen';
import CameraScreen from './src/screens/camera/CameraScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        cardStyle: { backgroundColor: 'white' }
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen}
        options={{ 
          title: 'Cadastro de Residente',
          headerBackTitle: 'Voltar'
        }}
      />
      <Stack.Screen 
        name="VerifyToken" 
        component={VerifyTokenScreen}
        options={{ 
          title: 'Validar Convite',
          headerBackTitle: 'Voltar'
        }}
      />
    </Stack.Navigator>
  );
}

function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen 
        name="HomeScreen" 
        component={HomeScreen}
        options={{ 
          title: 'Dashboard',
          headerShown: false
        }}
      />
    </Stack.Navigator>
  );
}

function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#9ca3af',
        headerShown: true,
        tabBarStyle: {
          backgroundColor: '#f9fafb',
          borderTopColor: '#e5e7eb',
          paddingBottom: 5,
          height: 60
        }
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack}
        options={{
          title: 'Início',
          headerShown: false,
          tabBarLabel: 'Início'
        }}
      />
      <Tab.Screen 
        name="AccessHistory" 
        component={AccessHistoryScreen}
        options={{
          title: 'Histórico de Acessos',
          tabBarLabel: 'Acessos'
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: 'Meu Perfil',
          tabBarLabel: 'Perfil'
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const { state } = React.useContext(AuthContext);

  return (
    <NavigationContainer>
      {state.isLoading ? null : state.userToken == null ? (
        <AuthStack />
      ) : (
        <AppTabs />
      )}
    </NavigationContainer>
  );
}
