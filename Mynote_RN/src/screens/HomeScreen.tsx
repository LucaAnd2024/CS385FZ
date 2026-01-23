import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, FlatList, Dimensions, ImageBackground, ActivityIndicator, TouchableOpacity } from 'react-native';
import { coreApi, Score } from '../services/api';

import { enrichScore } from '../utils/ScoreUtils';
import { CollectionDataUtils } from '../utils/CollectionDataUtils';



const { width } = Dimensions.get('window');

type EmotionKey = 'joy' | 'sadness' | 'anger' | 'fear' | 'surprise' | 'digest';

type HomeCard = Score & {
    emotion?: EmotionKey;
    createdAt?: string;
};

const EMOTION_COLOR_MAP: Record<EmotionKey, string> = {
    joy: '#F9CE5C',
    sadness: '#87B5FF',
    anger: '#FF9790',
    fear: '#E4C0FF',
    surprise: '#FFAFF1',
    digest: '#459D93',
};

const EMOTION_IMAGE_MAP: Record<EmotionKey, any> = {
    joy: require('../assets/images/MoodMapView_Joy.png'),
    sadness: require('../assets/images/MoodMapView_Sadness.png'),
    anger: require('../assets/images/MoodMapView_Anger.png'),
    fear: require('../assets/images/MoodMapView_Fear .png'),
    surprise: require('../assets/images/MoodMapView_Surprise.png'),
    digest: require('../assets/images/MoodMapView_Digest.png'),
};

const EMOTION_ELLIPSE_MAP: Record<EmotionKey, any> = {
    joy: require('../assets/images/MoodMapView_Joy_Ellipse.png'),
    sadness: require('../assets/images/MoodMapView_Sadness_Ellipse.png'),
    anger: require('../assets/images/MoodMapView_Anger_Ellipse.png'),
    fear: require('../assets/images/MoodMapView_Fear _Ellipse.png'),
    surprise: require('../assets/images/MoodMapView_Surprise_Ellipse.png'),
    digest: require('../assets/images/MoodMapView_Digest_Ellipse.png'),
};

const MOCK_CARDS: HomeCard[] = [
    { id: 'mock-1', title: 'C4: Impetuous', createdAt: '2026.01.22', emotion: 'anger', staves: [] },
    { id: 'mock-2', title: 'Joy of success', createdAt: '2026.01.21', emotion: 'joy', staves: [] },
    { id: 'mock-3', title: 'Silly statistics', createdAt: '2026.01.20', emotion: 'surprise', staves: [] },
    { id: 'mock-4', title: 'Song of joy', createdAt: '2026.01.19', emotion: 'joy', staves: [] },
    { id: 'mock-5', title: 'Tired & sleepy', createdAt: '2026.01.18', emotion: 'digest', staves: [] },
    { id: 'mock-6', title: 'Sleepy & tired', createdAt: '2026.01.17', emotion: 'digest', staves: [] },
];

import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
    const navigation = useNavigation();
    const [activeTab, _setActiveTab] = useState<'emotional' | 'healing'>('emotional');
    const [scores, setScores] = useState<HomeCard[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const response = await coreApi.getScores();
            const data = response?.data;
            if (Array.isArray(data)) {
                const filtered = data.filter((item) => item.title !== 'First Test Score');
                const merged = [...filtered, ...CollectionDataUtils.generateSevenDaysScores()];
                const seen = new Set<string>();
                const deduped = merged.filter((item, index) => {
                    const key = item.id ?? `idx-${index}`;
                    if (seen.has(key)) {
                        return false;
                    }
                    seen.add(key);
                    return true;
                });
                setScores(deduped);
            } else {
                setScores(CollectionDataUtils.generateSevenDaysScores());
            }
        } catch (e) {
            console.error(e);
            setScores(CollectionDataUtils.generateSevenDaysScores());

        } finally {
            setLoading(false);
        }
    };

    // Helper to map score to UI assets (placeholder logic)
    const getCardProps = (score: HomeCard) => {
        const emotion = score.emotion;
        const imageName = emotion ? EMOTION_IMAGE_MAP[emotion] : EMOTION_IMAGE_MAP.joy;
        const ellipseImage = emotion ? EMOTION_ELLIPSE_MAP[emotion] : EMOTION_ELLIPSE_MAP.joy;

        let color = '#F9CE5C';
        if (emotion) {
            color = EMOTION_COLOR_MAP[emotion];
        } else if (score.staves?.[0]?.notes?.[0]?.colorHex) {
            color = score.staves[0].notes[0].colorHex;
        }

        return {
            imageName,
            ellipseImage,
            color,
            date: score.createdAt ? score.createdAt : 'Just Now',
        };
    };

    return (
        <ImageBackground
            source={require('../assets/images/HomeViewBackground.jpg')}
            style={styles.container}
            resizeMode="cover"
        >
            <View style={styles.content}>


                {activeTab === 'emotional' ? (
                    loading ? (
                        <ActivityIndicator size="large" color="#6F8CF0" style={styles.loadingIndicator} />
                    ) : (
                        <View style={styles.listWrapper}>
                            <FlatList
                                data={scores.slice(0, 6)}
                                keyExtractor={(item) => item.id || Math.random().toString()}
                                numColumns={3}
                                columnWrapperStyle={styles.row}
                                contentContainerStyle={styles.listContainer}
                                renderItem={({ item }) => {
                                    const props = getCardProps(item);
                                    return (
                                        <View style={styles.cardContainer}>
                                            <TouchableOpacity
                                                style={styles.cardTouchable}
                                                onPress={() => {
                                                    const enriched = enrichScore(item);
                                                    // 如有情感字段，修正封面图
                                                    if (item.emotion) {
                                                        const cap = item.emotion.charAt(0).toUpperCase() + item.emotion.slice(1);
                                                        enriched.coverImageName = `MoodMapView_${cap}`;
                                                    }
                                                    (navigation as any).navigate('SongDetail', { score: enriched });
                                                }}
                                                activeOpacity={0.7}
                                            >
                                                <Image source={props.imageName} style={styles.cardImage} />
                                            </TouchableOpacity>
                                            <View style={styles.cardMeta}>
                                                <Image source={props.ellipseImage} style={styles.ellipseImage} />
                                                <Text style={styles.cardTitle}>{item.title || 'Untitled'}</Text>
                                                <Text style={styles.cardDate}>{props.date}</Text>
                                            </View>
                                        </View>
                                    );
                                }}
                            />
                        </View>
                    )
                ) : (
                    <View style={styles.placeholderContainer}>
                        <Text style={styles.placeholderText}>Music Therapy Feature Coming Soon</Text>
                    </View>
                )}
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingTop: 60, // Safe Area top
    },
    loadingIndicator: {
        marginTop: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    tabTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#999',
    },
    activeTabTitle: {
        color: '#333',
    },
    activeIndicator: {
        height: 3,
        backgroundColor: '#6F8CF0',
        borderRadius: 1.5,
        marginTop: 4,
        width: 30, // Small indicator under the active text
    },
    listWrapper: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: '70%',
    },
    listContainer: {
        paddingHorizontal: 18,
        paddingBottom: 12,
    },
    row: {
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    cardContainer: {
        width: (width - 60) / 3, // 3 columns with spacing
        alignItems: 'center',
    },
    cardTouchable: {
        width: '100%',
        alignItems: 'center',
    },
    cardImage: {
        width: '100%',
        height: undefined,
        aspectRatio: 1, // Square images
        borderRadius: 20,
        marginTop: 20,
        marginBottom: 1,
        transform: [{ scale: 1.3 }],
    },
    cardMeta: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 0,
    },
    ellipseImage: {
        position: 'absolute',
        width: 360,
        height: 144,
        resizeMode: 'contain',
        opacity: 0.9,
        transform: [{ translateY: -6 }],
    },
    cardTitle: {
        color: '#000',
        fontWeight: '600',
        fontSize: 10,
        marginTop: 1,
    },
    cardDate: {
        color: '#666',
        fontSize: 10,
    },
    placeholderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    placeholderText: {
        fontSize: 18,
        color: '#999',
    }
});

export default HomeScreen;
