import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, Image, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { coreApi, EmotionDayData } from '../services/api';

const { width, height } = Dimensions.get('window');

const CollectionScreen = () => {
    // State to simulate data status (Phase 3: No Data initially)
    const [days, setDays] = useState<EmotionDayData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await coreApi.getEmotionDays();
            if (Array.isArray(data)) {
                setDays(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const hasData = days.length > 0;

    return (
        <ImageBackground
            source={require('../assets/images/CollectionRoomViewBack.png')}
            style={styles.container}
            resizeMode="cover"
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Content Area - Simulating the vertical Timeline */}
                {/* Content Area - Simulating the vertical Timeline */}
                <View style={styles.timelineContainer}>
                    <View style={styles.timelineLine} />

                    {/* Render Days */}
                    {days.map((day, index) => (
                        <View key={day.date || index} style={styles.dayRow}>
                            <View style={styles.dayNode} />
                            <View style={styles.dayCard}>
                                <Text style={styles.dayDate}>{day.date}</Text>
                                <Text style={styles.dayMood}>{day.dailySummary?.overallMood || 'Recorded'}</Text>
                            </View>
                        </View>
                    ))}

                    {/* "Begin" Node Logic */}
                    <View style={styles.beginContainer}>
                        <Image
                            source={require('../assets/images/CollectionRoomViewBegin.png')}
                            style={styles.beginImage}
                            resizeMode="contain"
                        />
                    </View>
                </View>

                {/* No Data Popup Overlay */}
                {!hasData && (
                    <View style={styles.popupContainer}>
                        <Image
                            source={require('../assets/images/CollectionRoomView_NoDataPop.png')}
                            style={styles.popupImage}
                            resizeMode="contain"
                        />
                    </View>
                )}
            </ScrollView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        minHeight: height * 1.2, // Allow scrolling effect
        paddingBottom: 100,
    },
    timelineContainer: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 100,
    },
    timelineLine: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 2,
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    beginContainer: {
        marginTop: 50, // Space between items and Begin
        alignItems: 'center',
    },
    beginImage: {
        width: width * 0.25,
        height: width * 0.25,
    },
    dayRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 40,
        width: '100%',
        paddingHorizontal: 40,
    },
    dayNode: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#fff',
        position: 'absolute',
        left: (width / 2) - 8, // Center on the line
        zIndex: 1,
    },
    dayCard: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: 15,
        borderRadius: 12,
        marginLeft: (width / 2) + 20, // Offset to right
        minWidth: 120,
    },
    dayDate: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    dayMood: {
        color: '#eee',
        fontSize: 12,
        marginTop: 4,
    },
    popupContainer: {
        position: 'absolute',
        bottom: height * 0.15,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    popupImage: {
        width: width * 0.77,
        height: undefined,
        aspectRatio: 2.5, // Adjust based on actual image
    }
});

export default CollectionScreen;
