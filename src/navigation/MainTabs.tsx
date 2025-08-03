import React from 'react';
import { Image, ImageSourcePropType } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/HomeScreen';
import ExploreScreen from '../screens/ExploreScreen';
import PlanScreen from '../screens/PlanScreen';
import MapScreen from '../screens/MapScreen';
import SettingsScreen from '../screens/SettingsScreen';

export type MainTabParamList = {
  Home: undefined;
  Explore: undefined;
  Plan: undefined;
  Map: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const BAR_BG = '#650006';
const ACTIVE = '#F6AE29';
const INACTIVE = '#FFFFFF';

function TabIcon({
  focused,
  src,
  width = 55,
  height = 42,
}: {
  focused: boolean;
  src: ImageSourcePropType;
  width?: number;
  height?: number;
}) {
  return (
    <Image
      source={src}
      style={{
        width,
        height,
        tintColor: focused ? ACTIVE : INACTIVE,
        resizeMode: 'contain',
      }}
    />
  );
}

export default function MainTabs(): React.JSX.Element {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,           
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: BAR_BG,
          borderTopWidth: 0,
          height: 90,               
          paddingTop: 10,                
          paddingBottom: 14,           
        },
        tabBarActiveTintColor: ACTIVE,
        tabBarInactiveTintColor: INACTIVE,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} src={require('../assets/home_icon.png')} />
          ),
        }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} src={require('../assets/explore_icon.png')} />
          ),
        }}
      />
      <Tab.Screen
        name="Plan"
        component={PlanScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} src={require('../assets/plan_icon.png')} />
          ),
        }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} src={require('../assets/map_icon.png')} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} src={require('../assets/settings_icon.png')} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
