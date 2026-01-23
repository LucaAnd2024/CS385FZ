import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParamList, MainTabParamList, AuthStackParamList } from './types';
import { useAuth } from '../store/AuthContext';

// Screens
import LaunchScreen from '../screens/LaunchScreen';
import StartScreen from '../screens/StartScreen';
import AuthScreen from '../screens/AuthScreen';
import HomeScreen from '../screens/HomeScreen';
import StudioScreen from '../screens/StudioScreen';
import CollectionScreen from '../screens/CollectionScreen';
import CollectionDetailScreen from '../screens/CollectionDetailScreen';
import { SongDetailScreen } from '../screens/SongDetailScreen';

import StudioIconOff from '../assets/icons/StudioIcon_Off.svg';
import StudioIconOn from '../assets/icons/StudioIcon_On.svg';
import EmotionalSheetMusicIconOff from '../assets/icons/EmotionalSheetMusicIcon_Off.svg';
import EmotionalSheetMusicIconOn from '../assets/icons/EmotionalSheetMusicIcon_On.svg';
import CollectionRoomIconOff from '../assets/icons/CollectionRoomIcon_Off.svg';
import CollectionRoomIconOn from '../assets/icons/CollectionRoomIcon_On.svg';

const Tab = createBottomTabNavigator<MainTabParamList>();

const renderStudioTabIcon = ({ focused, size }: { focused: boolean; size: number }) => {
    const Icon = focused ? StudioIconOn : StudioIconOff;
    return <Icon width={size} height={size} />;
};

const renderHomeTabIcon = ({ focused, size }: { focused: boolean; size: number }) => {
    const Icon = focused ? EmotionalSheetMusicIconOn : EmotionalSheetMusicIconOff;
    return <Icon width={size} height={size} />;
};

const renderCollectionTabIcon = ({ focused, size }: { focused: boolean; size: number }) => {
    const Icon = focused ? CollectionRoomIconOn : CollectionRoomIconOff;
    return <Icon width={size} height={size} />;
};

const MainNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route: _route }) => ({
                headerShown: false,
                tabBarShowLabel: true,
                tabBarActiveTintColor: '#6F8CF0',
                tabBarInactiveTintColor: '#9AA0A6',
                tabBarLabelStyle: {
                    marginTop: 4,
                },

                tabBarStyle: {
                    position: 'absolute', // 1. 绝对定位，脱离文档流
                    bottom: 35,           // 2. 距离屏幕底部的距离（悬浮感来源）
                    left: 20,             // 3. 左边距（胶囊缩进）
                    right: 20,            // 4. 右边距（胶囊缩进）
                    elevation: 5,         // 5. 安卓的阴影层级
                    backgroundColor: '#ffffff', // 6. 背景纯白
                    borderRadius: 30,     // 7. 大圆角，形成胶囊形状
                    height: 60,           // 8. 定义高度，稍微高一点容纳图标和文字
                    borderTopWidth: 0,    // 9. 去除系统默认的顶部黑线

                    // iOS 专用阴影设置 (让它看起来有发光的弥散感)
                    shadowColor: '#7F5DF0',
                    shadowOffset: {
                        width: 0,
                        height: 10,
                    },
                    shadowOpacity: 0.025,
                    shadowRadius: 3.5,

                    // 内部布局调整
                    paddingBottom: 2, // 避免文字贴底
                    paddingTop: 5,
                    marginHorizontal: 60,
                    paddingHorizontal: 20,
                },
            })}
            initialRouteName="Home"
        >
            <Tab.Screen
                name="Studio"
                component={StudioScreen}
                options={{
                    title: 'Studio',
                    tabBarIcon: renderStudioTabIcon,
                }}
            />
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    title: 'Mood Disc',
                    tabBarIcon: renderHomeTabIcon,
                }}
            />
            <Tab.Screen
                name="Collection"
                component={CollectionScreen}
                options={{
                    title: 'Gallery',
                    tabBarIcon: renderCollectionTabIcon,
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
    const { user } = useAuth();

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {user ? (
                    <>
                        <Stack.Screen name="Main" component={MainNavigator} />
                        <Stack.Screen name="CollectionDetail" component={CollectionDetailScreen} />
                        <Stack.Screen name="SongDetail" component={SongDetailScreen} />
                    </>
                ) : (
                    <Stack.Screen name="Auth" component={AuthNavigator} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};
