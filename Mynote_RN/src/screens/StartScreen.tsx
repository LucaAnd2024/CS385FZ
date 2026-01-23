import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../navigation/types';

type StartScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Launch'>; // 'Launch' type works for general AuthStack nav

const { width, height: screenHeight } = Dimensions.get('window');

const StartScreen = () => {
    const navigation = useNavigation<StartScreenNavigationProp>();
    const [imageHeight, setImageHeight] = useState(screenHeight);

    useEffect(() => {
        // 获取图片的实际尺寸
        Image.getSize(
            Image.resolveAssetSource(require('../assets/images/StartViewBackground.png')).uri,
            (imgWidth, imgHeight) => {
                // 根据屏幕宽度计算应该显示的高度
                const scaledHeight = (width / imgWidth) * imgHeight;
                setImageHeight(scaledHeight);
            },
            (error) => {
                console.log('Failed to get image size:', error);
            }
        );
    }, []);

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
                <Image
                    source={require('../assets/images/StartViewBackground.jpg')}
                    style={[styles.backgroundImage, { height: imageHeight }]}
                    resizeMode="cover"
                />

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.buttonText}>Starting with MyNote</Text>
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
        // 高度将通过动态计算设置
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
