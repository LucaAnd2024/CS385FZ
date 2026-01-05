import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, FlatList, Dimensions, ImageBackground, ActivityIndicator, TouchableOpacity } from 'react-native';
import { coreApi, Score } from '../services/api';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
    const [activeTab, setActiveTab] = useState<'emotional' | 'healing'>('emotional');
    const [scores, setScores] = useState<Score[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await coreApi.getScores();
            if (Array.isArray(data)) {
                setScores(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // Helper to map score to UI assets (placeholder logic)
    const getCardProps = (score: Score, index: number) => {
        // Cycle through available images
        const images = [
            require('../assets/images/HomeViewSingSong11.png'),
            require('../assets/images/HomeViewSingSong12.png'),
            require('../assets/images/HomeViewSingSong13.png'),
            require('../assets/images/HomeViewSingSong21.png'),
            require('../assets/images/HomeViewSingSong22.png'),
            require('../assets/images/HomeViewSingSong23.png')
        ];

        // Try to get color from first note, or default
        let color = "#F197E1";
        if (score.staves && score.staves.length > 0 && score.staves[0].notes.length > 0) {
            color = score.staves[0].notes[0].colorHex;
        }

        return {
            imageName: images[index % images.length],
            color: color,
            date: score.createdAt ? new Date(score.createdAt).toLocaleDateString() : 'Just Now'
        };
    };

    return (
        <ImageBackground
            source={require('../assets/images/HomeViewBackground.png')}
            style={styles.container}
            resizeMode="cover"
        >
            <View style={styles.content}>
                {/* Header with Tab Selector */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => setActiveTab('emotional')}>
                        <Text style={[styles.tabTitle, activeTab === 'emotional' && styles.activeTabTitle]}>
                            情绪乐谱
                        </Text>
                        {activeTab === 'emotional' && <View style={styles.activeIndicator} />}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setActiveTab('healing')} style={{ marginLeft: 20 }}>
                        <Text style={[styles.tabTitle, activeTab === 'healing' && styles.activeTabTitle]}>
                            音乐疗愈
                        </Text>
                        {activeTab === 'healing' && <View style={styles.activeIndicator} />}
                    </TouchableOpacity>
                </View>

                {activeTab === 'emotional' ? (
                    loading ? (
                        <ActivityIndicator size="large" color="#6F8CF0" style={{ marginTop: 20 }} />
                    ) : (
                        <FlatList
                            data={scores}
                            keyExtractor={(item) => item.id || Math.random().toString()}
                            numColumns={2}
                            columnWrapperStyle={styles.row}
                            contentContainerStyle={styles.listContainer}
                            renderItem={({ item, index }) => {
                                const props = getCardProps(item, index);
                                return (
                                    <View style={styles.cardContainer}>
                                        <Image source={props.imageName} style={styles.cardImage} />
                                        <View style={[styles.cardTag, { backgroundColor: props.color }]}>
                                            <Text style={styles.cardTitle}>{item.title || 'Untitled'}</Text>
                                        </View>
                                        <Text style={styles.cardDate}>{props.date}</Text>
                                    </View>
                                );
                            }}
                        />
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
    listContainer: {
        paddingHorizontal: 20,
        paddingBottom: 100, // Space for Bottom Tab
    },
    row: {
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    cardContainer: {
        width: (width - 60) / 2, // 2 columns with spacing
        alignItems: 'center',
    },
    cardImage: {
        width: '100%',
        height: undefined,
        aspectRatio: 1, // Square images
        borderRadius: 20,
        marginBottom: 10,
    },
    cardTag: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 15,
        marginBottom: 5,
    },
    cardTitle: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14,
    },
    cardDate: {
        color: '#666',
        fontSize: 12,
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
