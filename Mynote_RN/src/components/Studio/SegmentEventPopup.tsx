
import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, Dimensions } from 'react-native';
import { MusicSegmentInfo } from '../../services/api';

interface SegmentEventPopupProps {
    segment: MusicSegmentInfo;
    onClose: () => void;
    positionY: number; // The absolute Y position to render the popup
}

const { width } = Dimensions.get('window');

// Assets
const ASSETS = {
    popBack: require('../../assets/images/SongDetailViewPopBack.png'),
    decoration: require('../../assets/images/SongDetailViewPopDecoration.png'),
};

export const SegmentEventPopup: React.FC<SegmentEventPopupProps> = ({ segment, onClose, positionY }) => {

    // Format Time: "10:16 AM"
    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    const timeString = formatTime(segment.timeWindow.startTime);

    return (
        <View style={[styles.container, { top: positionY }]}>
            {/* 
                The popup should overlay on the right side mostly.
                The visual matches the iOS logic: ZStack with background image and text on top.
             */}

            {/* Click outside usually closes it, but here we can add a close button or just rely on parent handling */}

            <View style={styles.bubbleContainer}>
                <Image
                    source={ASSETS.popBack}
                    style={styles.backgroundImage}
                    resizeMode="stretch"
                />

                <View style={styles.contentContainer}>
                    <View style={styles.headerRow}>
                        <Image
                            source={ASSETS.decoration}
                            style={styles.decorationIcon}
                        />
                        <Text style={styles.timeText}>{timeString}</Text>
                    </View>

                    <Text style={styles.eventText} numberOfLines={3}>
                        {segment.eventText}
                    </Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        right: -4, // Anchor to right side
        zIndex: 1000,
        // The top is set dynamically via props
    },
    bubbleContainer: {
        maxWidth: 270, // Approximate width from iOS "maxWidth: 200"
        minHeight: 160,
        paddingHorizontal: 8,
        paddingVertical: 6,
    },
    backgroundImage: {
        ...StyleSheet.absoluteFillObject,
        width: '100%',
        height: '100%',
    },
    contentContainer: {
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    decorationIcon: {
        width: 16,
        height: 16,
        marginRight: 6,
        resizeMode: 'contain',

    },
    timeText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#AE8415', // Gold-ish

    },
    eventText: {
        fontSize: 14,
        color: '#000',
        lineHeight: 18,
        minWidth: 190,
        maxWidth: 200,
        textAlign: 'left',
        marginTop: -2,
        marginRight: 4,
    }
});
