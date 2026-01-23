import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';

interface ChatBubbleProps {
    message: string;
    visible: boolean;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, visible }) => {
    if (!visible) return null;

    return (
        <View style={styles.container}>
            <View style={styles.bubble}>
                <Text style={styles.text}>{message}</Text>
            </View>
            <Image 
                source={require('../../assets/images/DoDo.png')} 
                style={styles.avatar}
                resizeMode="contain"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 100, // Adjust based on layout
        left: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 10,
    },
    bubble: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        padding: 16,
        borderRadius: 20,
        borderBottomRightRadius: 4,
        maxWidth: '70%',
        marginRight: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    text: {
        fontSize: 16,
        color: '#333',
        lineHeight: 24,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
    }
});
