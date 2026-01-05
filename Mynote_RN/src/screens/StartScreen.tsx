import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../navigation/types';

type StartScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Launch'>; // 'Launch' type works for general AuthStack nav

const { width } = Dimensions.get('window');

const StartScreen = () => {
    const navigation = useNavigation<StartScreenNavigationProp>();

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
                <Image
                    source={require('../assets/images/StartViewBackground.png')}
                    style={styles.backgroundImage}
                    resizeMode="cover" // iOS used 'fill', cover is close enough or 'stretch' if aspect ratio matches
                />

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.buttonText}>治愈之音，从 MyNote 开始</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 0,
    },
    backgroundImage: {
        width: width,
        height: width * 3, // Assuming long image, need to adjust based on actual aspect ratio or use AutoHeightImage
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 130,
        width: '100%',
        alignItems: 'center',
    },
    button: {
        backgroundColor: 'rgba(147, 165, 227, 1.0)',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 20,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default StartScreen;
