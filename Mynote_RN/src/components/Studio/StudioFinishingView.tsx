import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

interface StudioFinishingViewProps {
    onFinish: () => void;
}

export const StudioFinishingView: React.FC<StudioFinishingViewProps> = ({ onFinish }) => {

    useEffect(() => {
        // Simulate music generation time (e.g., 3 seconds)
        const timer = setTimeout(() => {
            onFinish();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onFinish]);

    return (
        <View style={styles.container}>
            <Image
                source={require('../../assets/images/StudioFinishingView.png')}
                style={styles.background}
                resizeMode="cover"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    background: {
        width: width,
        height: height,
    },
});
