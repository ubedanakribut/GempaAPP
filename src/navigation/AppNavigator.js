// src/navigation/AppNavigator.js
// Alur: Auth gate → jika sudah login tampilkan MainApp (tab navigator)

import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, Text } from 'react-native';

import HomeScreen     from '../screens/HomeScreen';
import ListScreen     from '../screens/ListScreen';
import BookmarkScreen from '../screens/BookmarkScreen';
import DetailScreen   from '../screens/DetailScreen';
import AuthScreen     from '../screens/AuthScreen';
import { onAuthChange } from '../services/firebaseService';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack untuk tab Riwayat (list → detail)
function ListStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#fff' },
        headerShadowVisible: false,
        headerTintColor: '#185FA5',
      }}
    >
      <Stack.Screen name="Daftar Gempa" component={ListScreen} />
      <Stack.Screen
        name="Detail"
        component={DetailScreen}
        options={{ title: 'Detail Gempa' }}
      />
    </Stack.Navigator>
  );
}

// Tab navigator utama — hanya tampil setelah login
function MainApp() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ size }) => {
          const icons = { Terbaru: '🌊', Riwayat: '📋', Bookmark: '🔖' };
          return <Text style={{ fontSize: size - 4 }}>{icons[route.name]}</Text>;
        },
        tabBarActiveTintColor:   '#185FA5',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          borderTopWidth: 0.5,
          borderTopColor: '#E5E5E5',
          backgroundColor: '#fff',
        },
        headerStyle: { backgroundColor: '#fff' },
        headerShadowVisible: false,
        headerTintColor: '#185FA5',
      })}
    >
      <Tab.Screen
        name="Terbaru"
        component={HomeScreen}
        options={{ title: 'Gempa Terbaru' }}
      />
      <Tab.Screen
        name="Riwayat"
        component={ListStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Bookmark"
        component={BookmarkScreen}
        options={{ title: 'Bookmark Saya' }}
      />
    </Tab.Navigator>
  );
}

// Root navigator: cek status login Firebase dulu
export default function AppNavigator() {
  // undefined = sedang cek, null = belum login, object = sudah login
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    // Listener Firebase Auth — otomatis update saat login/logout
    const unsubscribe = onAuthChange((u) => setUser(u));
    return unsubscribe;
  }, []);

  // Tampilkan loading spinner selagi Firebase mengecek sesi
  if (user === undefined) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F4F8' }}>
        <Text style={{ fontSize: 40, marginBottom: 16 }}>🌊</Text>
        <ActivityIndicator size="large" color="#185FA5" />
        <Text style={{ marginTop: 12, color: '#888', fontSize: 13 }}>Memuat GempaApp…</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user
          ? <Stack.Screen name="MainApp" component={MainApp} />
          : <Stack.Screen name="Auth"    component={AuthScreen} />
        }
      </Stack.Navigator>
    </NavigationContainer>
  );
}
