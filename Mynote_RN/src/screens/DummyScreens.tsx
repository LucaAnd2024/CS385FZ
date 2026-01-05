import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const LaunchScreen = () => (
    <View style={styles.container}>
        <Text>Launch Screen</Text>
    </View>
);

export const LoginScreen = () => (
    <View style={styles.container}>
        <Text>Login Screen</Text>
    </View>
);

export const HomeScreen = () => (
    <View style={styles.container}>
        <Text>Home Screen</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
