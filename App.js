import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import HomeScreen from './src/screens/HomeScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import TasksScreen from './src/screens/TasksScreen';
import LifeScreen from './src/screens/LifeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import FinanceScreen from './src/screens/life/FinanceScreen';
import WorkScreen from './src/screens/life/WorkScreen';
import UniversityScreen from './src/screens/life/UniversityScreen';
import GymScreen from './src/screens/life/GymScreen';
import DietScreen from './src/screens/life/DietScreen';
import TransactionFormScreen from './src/screens/life/TransactionFormScreen';
import FinanceListScreen from './src/screens/life/FinanceListScreen';
import HomeManageScreen from './src/screens/life/HomeManageScreen';
import VehicleScreen from './src/screens/life/VehicleScreen';
import TravelScreen from './src/screens/life/TravelScreen';
import VaultScreen from './src/screens/life/VaultScreen';
import GoalsScreen from './src/screens/life/GoalsScreen';
import HealthScreen from './src/screens/life/HealthScreen';
import EntertainmentScreen from './src/screens/life/EntertainmentScreen';
import ShoppingScreen from './src/screens/life/ShoppingScreen';
import EventsScreen from './src/screens/life/EventsScreen';
import NotesScreen from './src/screens/life/NotesScreen';
import FocusModeScreen from './src/screens/life/FocusModeScreen';

import { TaskProvider } from './src/context/TaskContext';
import { CalendarProvider } from './src/context/CalendarContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const RootStack = createNativeStackNavigator();

function LifeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LifeMain" component={LifeScreen} />
      <Stack.Screen name="Finance" component={FinanceScreen} />
      <Stack.Screen name="Work" component={WorkScreen} />
      <Stack.Screen name="University" component={UniversityScreen} />
      <Stack.Screen name="Gym" component={GymScreen} />
      <Stack.Screen name="Diet" component={DietScreen} />
      <Stack.Screen name="HomeManage" component={HomeManageScreen} />
      <Stack.Screen name="Vehicle" component={VehicleScreen} />
      <Stack.Screen name="Travel" component={TravelScreen} />
      <Stack.Screen name="Vault" component={VaultScreen} />
      <Stack.Screen name="Goals" component={GoalsScreen} />
      <Stack.Screen name="Health" component={HealthScreen} />
      <Stack.Screen name="Entertainment" component={EntertainmentScreen} />
      <Stack.Screen name="Shopping" component={ShoppingScreen} />
      <Stack.Screen name="Events" component={EventsScreen} />
      <Stack.Screen name="Notes" component={NotesScreen} />
      <Stack.Screen 
        name="TransactionForm" 
        component={TransactionFormScreen} 
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen name="FinanceList" component={FinanceListScreen} />
    </Stack.Navigator>
  );
}

function MainTabNavigator() {
  return (
    <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Inicio') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Calendario') {
              iconName = focused ? 'calendar' : 'calendar-outline';
            } else if (route.name === 'Tareas') {
              iconName = focused ? 'checkmark-done-circle' : 'checkmark-done-circle-outline';
            } else if (route.name === 'Vida') {
              iconName = focused ? 'apps' : 'apps-outline';
            } else if (route.name === 'Perfil') {
              iconName = focused ? 'person' : 'person-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: 'tomato',
          tabBarInactiveTintColor: 'gray',
          headerShown: true,
        })}
      >
        <Tab.Screen name="Inicio" component={HomeScreen} />
        <Tab.Screen name="Calendario" component={CalendarScreen} />
        <Tab.Screen name="Tareas" component={TasksScreen} />
        <Tab.Screen 
          name="Vida" 
          component={LifeStackNavigator} 
          options={{ headerShown: false }}
        />
        <Tab.Screen name="Perfil" component={ProfileScreen} />
      </Tab.Navigator>
  );
}

import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TaskProvider>
        <CalendarProvider>
          <NavigationContainer>
            <StatusBar style="auto" />
            <RootStack.Navigator screenOptions={{ headerShown: false }}>
              <RootStack.Screen name="MainTabs" component={MainTabNavigator} />
              <RootStack.Screen 
                name="FocusMode" 
                component={FocusModeScreen} 
                options={{ presentation: 'fullScreenModal', headerShown: false }}
              />
            </RootStack.Navigator>
          </NavigationContainer>
        </CalendarProvider>
      </TaskProvider>
    </GestureHandlerRootView>
  );
}
