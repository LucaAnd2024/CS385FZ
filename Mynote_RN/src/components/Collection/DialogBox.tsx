import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface DialogBoxProps {
    text: string;
    position: { x: number; y: number };
    containerWidth: number;
    containerHeight: number;
    alignment: 'left' | 'right';
}

const DialogBox: React.FC<DialogBoxProps> = ({ text, position, containerWidth, containerHeight, alignment }) => {
    return (
        <View
            style={[
                styles.container,
                {
                    left: containerWidth * position.x,
                    top: containerHeight * position.y,
                    transform: [{ translateX: -40 }]
                }
            ]}
        >
            <Text style={styles.text}>{text}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: 12,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        maxWidth: 160,
        zIndex: 100,
    },
    text: {
        fontSize: 11,
        color: 'rgba(0, 0, 0, 0.85)',
        lineHeight: 15,
    },
});

export default DialogBox;
