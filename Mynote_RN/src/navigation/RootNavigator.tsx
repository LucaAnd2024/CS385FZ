import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParamList, AuthStackParamList, MainTabParamList } from './types';

// Screens
import LaunchScreen from '../screens/LaunchScreen';
import StartScreen from '../screens/StartScreen';
import AuthScreen from '../screens/AuthScreen';
import HomeScreen from '../screens/HomeScreen';
import StudioScreen from '../screens/StudioScreen';
import CollectionScreen from '../screens/CollectionScreen';

// SVG Icons (Requires react-native-svg-transformer or manual Svg wrapping)
// For simplicity without transformer config, we can load SVGs using react-native-svg SvgXml or standard Svg components
// But standard import requires metro config. 
// Fallback: Using images or text if transformer not set given complexity. 
// Actually, let's use a Custom Icon component that renders SVGs from file or string.
// For now, simple TabBarIcon placeholder.
import { Svg, Path, Image as SvgImage } from 'react-native-svg';

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarShowLabel: true,
                tabBarActiveTintColor: '#6F8CF0',
                tabBarInactiveTintColor: 'gray',
                tabBarStyle: {
                    height: 80,
                    paddingBottom: 20,
                    paddingTop: 10,
                    backgroundColor: 'white',
                    borderTopWidth: 0,
                    elevation: 10,
                    shadowColor: '#000',
                    shadowOpacity: 0.1,
                    shadowOffset: { width: 0, height: -2 },
                    shadowRadius: 10,
                },
            })}
            initialRouteName="Home"
        >
            <Tab.Screen
                name="Studio"
                component={StudioScreen}
                options={{
                    title: '工作室',
                    tabBarIcon: ({ color, size }) => (
                        <View style={{ width: size, height: size, backgroundColor: color, borderRadius: 10, opacity: 0.2 }} />
                    ),
                }}
            />
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    title: '情绪乐谱',
                    tabBarIcon: ({ color, size }) => (
                        <View style={{ width: size, height: size, backgroundColor: color, borderRadius: 10, opacity: 0.2 }} />
                    ),
                }}
            />
            <Tab.Screen
                name="Collection"
                component={CollectionScreen}
                options={{
                    title: '收藏室',
                    tabBarIcon: ({ color, size }) => (
                        <View style={{ width: size, height: size, backgroundColor: color, borderRadius: 10, opacity: 0.2 }} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

const Stack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();

const AuthNavigator = () => (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
        <AuthStack.Screen name="Launch" component={LaunchScreen} />
        <AuthStack.Screen name="Start" component={StartScreen} />
        <AuthStack.Screen name="Login" component={AuthScreen} />
    </AuthStack.Navigator>
);

export const RootNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Auth" screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Auth" component={AuthNavigator} />
                <Stack.Screen name="Main" component={MainNavigator} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};
