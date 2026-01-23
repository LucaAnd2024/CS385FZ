import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg'; // Standard icons or image assets

interface MusicDetailCardProps {
    title: string;
    composer: string;
    date: string;
    isPlaying?: boolean;
    progress?: number; // 0.0 - 1.0
    onPlayPause?: () => void;
    onSeek?: (val: number) => void;
    style?: ViewStyle;
}

const MusicDetailCard: React.FC<MusicDetailCardProps> = ({
    title, composer, date, isPlaying = false, progress = 0.3, onPlayPause, style
}) => {
    return (
        <View style={[styles.card, style]}>
            <Text style={styles.title}>{title}</Text>

            {/* Player Controls (Mock) */}
            <View style={styles.playerContainer}>
                <TouchableOpacity onPress={onPlayPause} style={styles.playBtn}>
                    {/* Play/Pause Icon Placeholder - Simple Triangle or Bars */}
                    <Svg width={16} height={16} viewBox="0 0 24 24" fill="black">
                        {isPlaying ? (
                            <Path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                        ) : (
                            <Path d="M8 5v14l11-7z" />
                        )}
                    </Svg>
                </TouchableOpacity>

                {/* Progress Bar */}
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                    <View style={[styles.progressKnob, { left: `${progress * 100}%` }]} />
                </View>

                {/* Loop Icon Placeholder */}
                <TouchableOpacity style={styles.loopBtn}>
                    <Svg width={16} height={16} viewBox="0 0 24 24" fill="#93A5E3">
                        <Path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" />
                    </Svg>
                </TouchableOpacity>
            </View>

            <Text style={styles.subText}>{composer}</Text>
            <Text style={styles.subText}>- {date} -</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#93A5E3',
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        alignItems: 'center',
        marginBottom: 8
    },
    title: {
        fontSize: 14, fontWeight: '600', color: '#93A5E3', marginBottom: 16
    },
    playerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: 12
    },
    playBtn: {
        padding: 4
    },
    progressBar: {
        flex: 1,
        height: 4,
        backgroundColor: '#E0E0E0',
        borderRadius: 2,
        marginHorizontal: 12,
        justifyContent: 'center'
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#93A5E3',
        borderRadius: 2
    },
    progressKnob: {
        position: 'absolute',
        width: 10, height: 10,
        borderRadius: 5,
        backgroundColor: 'white',
        borderWidth: 2,
        borderColor: '#93A5E3',
        marginLeft: -5
    },
    loopBtn: {
        padding: 4
    },
    subText: {
        fontSize: 12, color: '#8F8F8F', marginTop: 4
    }
});

export default MusicDetailCard;
