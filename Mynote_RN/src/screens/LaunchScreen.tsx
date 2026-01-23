import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../navigation/types';

type LaunchScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Launch'>;

const LaunchScreen = () => {
    const navigation = useNavigation<LaunchScreenNavigationProp>();

    return (
        <ImageBackground
            source={require('../assets/images/LaunchViewBackground.png')}
            style={styles.background}
            resizeMode="cover"
        >
            <View style={styles.contentContainer}>
                {/* TODO: Add ellipses and staff lines here */}

                <View style={styles.logoContainer}>
                    {/* Fallback to text if logo image is missing/SVG */}
                    <Text style={styles.logoText}></Text>
                    {/* <Image source={require('../assets/images/mynote_logo.png')} /> */}
                </View>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('Start')}
                >
                    <Text style={styles.buttonText}>Starting with MyNote</Text>
                </TouchableOpacity>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 70,
    },
    logoContainer: {
        position: 'absolute',
        top: '40%',
        alignItems: 'center',
    },
    logoText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#333',
    },
    button: {
        backgroundColor: 'rgba(147, 165, 227, 1.0)', // Color(red: 0.58, green: 0.65, blue: 0.89) approx
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

export default LaunchScreen;
