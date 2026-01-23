import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';

interface AIPopupViewProps {
    message: string;
    visible: boolean;
    healthDataText?: string;
}

const { width } = Dimensions.get('window');

export const AIPopupView: React.FC<AIPopupViewProps> = ({ message, visible, healthDataText = "Sleep Time: 4.7 hours" }) => {
    if (!visible) return null;

    // Use passed prop or default
    // const healthDataText = "Sleep Time: 4.7 hours"; // Removed hardcoded variable

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                {/* Header Row */}
                <View style={styles.headerRow}>
                    {/* Heart Icon (Using a simple view circle as placeholder if no icon, or text heart) */}
                    <Text style={styles.heartIcon}>♥</Text>
                    <Text style={styles.healthText}>{healthDataText}</Text>
                </View>

                {/* Message Body */}
                <Text style={styles.messageText}>
                    {message}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 310, // Adjust based on screen layout
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 100,
    },
    card: {
        backgroundColor: 'rgba(255,255,255,0.7)', // Slightly transparent white
        borderRadius: 24,
        paddingVertical: 20,
        paddingHorizontal: 20,
        width: Math.min(width - 100, 300), // Max width constraint
        shadowColor: "#93A5E3",
        shadowOffset: { width: 15, height: 15 },
        shadowOpacity: 0.19,
        shadowRadius: 18.9,
        elevation: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)', // Subtle border
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    heartIcon: {
        fontSize: 16,
        color: '#FF3B30', // Red color
        marginRight: 8,
    },
    healthText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000',
    },
    messageText: {
        fontSize: 18,
        fontWeight: '500',
        color: '#000',
        lineHeight: 28, // Increased line height for better readability
        textAlign: 'left',
        paddingHorizontal: 4,
    }
});
