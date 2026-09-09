import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';

import LoginScreen from './src/screens/LoginScreen';
import CardsScreen from './src/screens/CardsScreen';
import WriteCardScreen from './src/screens/WriteCardScreen';
import TagInspectorScreen from './src/screens/TagInspectorScreen';
import { Storage } from './src/services/storage';
import { APP_CONFIG } from './src/config/constants';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: APP_CONFIG.CARD_BG },
        headerTintColor: '#FFFFFF',
        tabBarStyle: {
          backgroundColor: APP_CONFIG.CARD_BG,
          borderTopColor: '#1E293B',
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: APP_CONFIG.BRAND_COLOR,
        tabBarInactiveTintColor: '#64748B',
      }}
    >
      <Tab.Screen
        name="CardsList"
        component={CardsScreen}
        options={{
          title: 'برمجة الكروت',
          tabBarLabel: 'الكروت والعملاء',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📇</Text>,
        }}
      />
      <Tab.Screen
        name="TagInspector"
        component={TagInspectorScreen}
        options={{
          title: 'فحص وتشخيص NFC',
          tabBarLabel: 'فاحص الكروت',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🔍</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [initialRoute, setInitialRoute] = useState<'Login' | 'MainTabs' | null>(null);

  useEffect(() => {
    Storage.getToken().then((token) => {
      setInitialRoute(token ? 'MainTabs' : 'Login');
    });
  }, []);

  if (!initialRoute) return null;

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerStyle: { backgroundColor: APP_CONFIG.CARD_BG },
          headerTintColor: '#FFFFFF',
          contentStyle: { backgroundColor: APP_CONFIG.DARK_BG },
        }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="WriteCard"
          component={WriteCardScreen}
          options={{
            title: 'برمجة وتأمين الكارت برقم سري',
            headerBackTitle: 'رجوع',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
