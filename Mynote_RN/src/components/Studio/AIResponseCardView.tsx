import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';

interface AIResponseCardViewProps {
    message: string;
    visible: boolean;
    onContinue: () => void;
}

const { width } = Dimensions.get('window');

export const AIResponseCardView: React.FC<AIResponseCardViewProps> = ({ message, visible, onContinue }) => {
    if (!visible) return null;

    return (
        <TouchableOpacity 
            style={styles.overlay} 
            activeOpacity={1} 
            onPress={onContinue}
        >
            <View style={styles.card}>
                <View style={styles.contentContainer}>
                    {/* Header Spacer - similar to iOS padding top */}
                    <View style={styles.headerSpacer} />

                    {/* Message Text */}
                    <Text style={styles.messageText}>
                        {message}
                    </Text>
                </View>

                {/* Bottom Decoration Image */}
                <View style={styles.bottomContainer}>
                    <Image 
                        source={require('../../assets/images/ChatBackBackgroundNote.png')} 
                        style={styles.decorationImage}
                        resizeMode="contain"
                    />
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 120,
    },
    card: {
        width: 260,
        height: 120,
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderRadius: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.1,
        shadowRadius: 30,
        elevation: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        // overflow: 'hidden', // Removed to allow image to extend beyond bounds
        marginTop: 120, // Move down by ~120px (from center)
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    headerSpacer: {
        height: 16,
    },
    messageText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#000',
        lineHeight: 24, // Adjusted line spacing
        textAlign: 'left',
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 60,
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        paddingRight: 0,
        paddingBottom: 0,
        zIndex: 10, // Ensure image is on top
    },
    decorationImage: {
        width: 60,
        height: 60,
        marginRight: -10,
        marginBottom: -20,
    }
});
