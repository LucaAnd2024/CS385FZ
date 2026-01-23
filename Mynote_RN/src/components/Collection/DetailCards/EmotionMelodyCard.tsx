import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

interface EmotionMelodyCardProps {
    data: { color: string; percent: number }[]; // Sorted by percent desc
    style?: ViewStyle;
}

// Rainbow Bridge Shape Logic
// The shape is essentially an arc with thickness.
// In RN SVG, path d commands:
// M = Move to
// A = Arc (rx ry x-axis-rotation large-arc-flag sweep-flag x y)
// L = Line to

const EmotionMelodyCard: React.FC<EmotionMelodyCardProps> = ({ data, style }) => {
    // Generate Gradient Colors based on emotion data
    // If empty, show gray?
    const gradientStops = data.map((d, i) => (
        <Stop key={i} offset={`${(i / Math.max(data.length - 1, 1)) * 100}%`} stopColor={d.color} />
    ));

    return (
        <View style={[styles.card, style]}>
            <Text style={styles.header}>Emotional melody</Text>

            {/* Rainbow Arc */}
            <View style={styles.arcContainer}>
                {data.length > 0 ? (
                    <Svg width={120} height={70} viewBox="0 0 120 70">
                        <Defs>
                            <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
                                {gradientStops}
                            </LinearGradient>
                        </Defs>
                        {/* 
                           Outer Arc: Center (60, 70), Radius 60
                           Inner Arc: Center (60, 70), Radius 42 (Thickness 18)
                           Path:
                           Move to (0, 70) [Left Bottom Outer]
                           Arc to (120, 70) [Right Bottom Outer] (Radius 60)
                           Line to (102, 70) [Right Bottom Inner] (120 - 18)
                           Arc to (18, 70) [Left Bottom Inner] (Radius 42, CounterClockwise)
                           Close
                        */}
                        <Path
                            d="M0,70 A60,60 0 0,1 120,70 L102,70 A42,42 0 0,0 18,70 Z"
                            fill="url(#grad)"
                        />
                    </Svg>
                ) : (
                    <Text style={{ color: 'gray', fontSize: 12, marginTop: 20 }}>暂无数据</Text>
                )}
            </View>

            {/* List */}
            <View style={styles.listContainer}>
                {data.slice(0, 4).map((item, index) => (
                    <View key={index} style={styles.listItem}>
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: item.color, marginRight: 6 }} />
                        {/* We don't have emotion name here in simplifed props, assume caller handles logic or pass objects */}
                        {/* Let's assume data has labels for now or just show dots? The design shows text. */}
                        {/* Quick fix: Update props to include label */}
                        <Text style={styles.percentText}>{item.percent}%</Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 12, // Tighter padding for half card
        shadowColor: '#93A5E3',
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        alignItems: 'center'
    },
    header: {
        fontSize: 12, fontWeight: '600', color: '#000', marginBottom: 8, alignSelf: 'center'
    },
    arcContainer: {
        height: 70,
        justifyContent: 'flex-end',
        marginBottom: 10
    },
    listContainer: {
        width: '100%',
        paddingHorizontal: 4
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4
    },
    percentText: {
        fontSize: 12, color: '#000'
    }
});

export default EmotionMelodyCard;
