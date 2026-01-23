import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { StaffAssets } from '../../../utils/StaffAssets';

interface EmotionNotesCardProps {
    data: {
        iconName: string;
        color: string;
        percent: number
    }[];
    style?: ViewStyle;
}

const EmotionNotesCard: React.FC<EmotionNotesCardProps> = ({ data, style }) => {
    return (
        <View style={[styles.card, style]}>
            <Text style={styles.header}>Emotional notes</Text>

            {data.length === 0 ? (
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <Text style={{ color: 'gray', fontSize: 10 }}>暂无数据</Text>
                </View>
            ) : (
                <View style={styles.chartContainer}>
                    {data.slice(0, 4).map((item, index) => {
                        const Icon = StaffAssets[item.iconName];
                        const barHeight = Math.max(20, item.percent * 1.5); // Random scaling factor

                        return (
                            <View key={index} style={styles.barColumn}>
                                {/* Icon */}
                                <View style={styles.iconWrapper}>
                                    {Icon && <Icon width={24} height={24} />}
                                </View>

                                {/* Bar */}
                                <View style={[styles.bar, { backgroundColor: item.color, height: barHeight }]} />
                            </View>
                        );
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
        padding: 12,
        shadowColor: '#93A5E3',
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        alignItems: 'center'
    },
    header: {
        fontSize: 14, fontWeight: '600', color: '#000', marginBottom: 12
    },
    chartContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-around',
        width: '100%',
        paddingBottom: 4
    },
    barColumn: {
        alignItems: 'center',
        paddingHorizontal: 2
    },
    iconWrapper: {
        marginBottom: 4,
        width: 30, height: 30,
        justifyContent: 'center', alignItems: 'center'
    },
    bar: {
        width: 10,
        borderRadius: 4
    }
});

export default EmotionNotesCard;
