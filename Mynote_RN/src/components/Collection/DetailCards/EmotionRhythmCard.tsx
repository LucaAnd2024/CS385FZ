import React from 'react';
import { View, Text, StyleSheet, Image, ViewStyle } from 'react-native';
// import { StaffScore } from '../../../services/api'; // Not strictly needed if we define simpler props
import { StaffAssets } from '../../../utils/StaffAssets';

// Placeholder for Staff Background
// Ideally this should be require('../../../assets/images/StaffWave.png')
// If unavailable, we can use StudioStaff.png or draw lines with View/SVG.
const STAFF_BG = require('../../../assets/images/StudioStaff.png');

interface EmotionNoteData {
    iconName: string; // e.g. "Staff_Joy_1"
    text: string;     // e.g. "Meeting friends"
}

interface EmotionRhythmCardProps {
    title: string;
    data: EmotionNoteData[];
    style?: ViewStyle;
}

// iOS layout coordinates
// (x: 0.125, iconY: 0.5, textY: 0.75, textOnTop: false)
// (x: 0.375, iconY: 0.4, textY: 0.05, textOnTop: true)
// (x: 0.665, iconY: 0.65, textY: 0.95, textOnTop: false)
// (x: 0.88, iconY: 0.55, textY: 0.25, textOnTop: true)
const POSITION_CONFIGS = [
    { x: 0.125, iconY: 0.5, textY: 0.75 },
    { x: 0.375, iconY: 0.4, textY: 0.05 },
    { x: 0.665, iconY: 0.65, textY: 0.95 },
    { x: 0.88, iconY: 0.55, textY: 0.25 },
];

const EmotionRhythmCard: React.FC<EmotionRhythmCardProps> = ({ title, data, style }) => {
    return (
        <View style={[styles.card, style]}>
            <Text style={styles.header}>{title}</Text>

            {data.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>还没有数据</Text>
                </View>
            ) : (
                <View style={styles.staffContainer}>
                    {/* 1. Background Staff Image */}
                    <Image
                        source={STAFF_BG}
                        style={styles.staffBg}
                        resizeMode="contain"
                    />

                    {/* 2. Notes Overlay */}
                    {data.slice(0, 4).map((item, index) => {
                        const config = POSITION_CONFIGS[index];
                        const IconComp = StaffAssets[item.iconName];

                        if (!IconComp) return null;

                        return (
                            <View
                                key={index}
                                style={[styles.noteWrapper, {
                                    left: `${config.x * 100}%`,
                                    // wrapper generally covers full height, we position children relative to it?
                                    // Actually better to absolute position the children based on parent height
                                    position: 'absolute',
                                    top: 0, bottom: 0, width: 60, // Fixed width wrapper
                                    marginLeft: -30 // Center wrapper on x
                                }]}
                            >
                                {/* Icon */}
                                <View style={{
                                    position: 'absolute',
                                    top: `${config.iconY * 100}%`, // This is percentage of container height
                                    left: 0, right: 0,
                                    height: 50,
                                    marginTop: -25, // Center icon vertically on anchor
                                    alignItems: 'center'
                                }}>
                                    <IconComp width={50} height={50} />
                                </View>

                                {/* Text */}
                                <Text
                                    numberOfLines={1}
                                    style={[styles.noteText, {
                                        position: 'absolute',
                                        top: `${config.textY * 100}%`,
                                        width: 80, marginLeft: -10, // Allow text to be wider than wrapper
                                        textAlign: 'center'
                                    }]}
                                >
                                    {item.text}
                                </Text>
                            </View>
                        )
                    })}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#93A5E3',
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        alignItems: 'center'
    },
    header: {
        fontSize: 14, fontWeight: '600', color: '#000', marginBottom: 12,
        alignSelf: 'center'
    },
    staffContainer: {
        width: '100%',
        height: 120, // Fixed height for staff area
        position: 'relative',
        // backgroundColor: '#f9f9f9' // Debug
    },
    staffBg: {
        width: '100%',
        height: '100%',
        opacity: 0.6
    },
    emptyContainer: {
        height: 120,
        justifyContent: 'center',
        alignItems: 'center'
    },
    emptyText: {
        color: 'gray', fontSize: 12
    },
    noteWrapper: {
        // defined inline
    },
    noteText: {
        fontSize: 10, color: 'rgba(0,0,0,0.7)'
    }
});

export default EmotionRhythmCard;
