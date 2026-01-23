import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, ScrollView, Dimensions, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCollectionData } from '../hooks/useCollectionData';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Score } from '../services/api';
import { StaffEmotionCategory, getEmotionColor } from '../utils/StaffScoreToolkit';

// Sub Components
import MusicDetailCard from '../components/Collection/DetailCards/MusicDetailCard';
import EmotionRhythmCard from '../components/Collection/DetailCards/EmotionRhythmCard';
import EmotionMelodyCard from '../components/Collection/DetailCards/EmotionMelodyCard';
import EmotionNotesCard from '../components/Collection/DetailCards/EmotionNotesCard';

// Assets
const BG_IMAGE = require('../assets/images/CollectionRoomViewBackground.jpg');
const TODAY_RHYTHM_IMG = require('../assets/images/TodayRhythm.png');
const TODAY_MELODY_IMG = require('../assets/images/TodayEmotionalMelody.png');
const TODAY_NOTES_IMG = require('../assets/images/TodayEmotionalNotes.png');

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type TabType = 'today' | 'weekly' | 'all';

const CollectionDetailScreen = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { scores, dayGroups } = useCollectionData(); // Mock data loaded here
    const [selectedTab, setSelectedTab] = useState<TabType>('today');

    // --- Data Logic ---

    // 1. Get Target Data based on Tab
    // Today: Find score created today (or Group 4)
    // Weekly: Aggregate Group 1-4
    // All: Aggregate all scores

    // For MOCK purposes:
    // "Today" -> The latest score (Index 6 in mock generation)
    // "Weekly" -> All 7 days scores
    // "All" -> All scores
    const currentData = useMemo(() => {
        let title = "";
        let composer = "Joy";
        let dateStr = "";
        let rhythmTitle = "";
        let targetScores: Score[] = [];

        if (selectedTab === 'today') {
            // Find today's score
            // In our mock logic, scores are reverse sorted (newest first)
            // So scores[0] is today.
            const todayScore = scores[0];
            if (todayScore) {
                targetScores = [todayScore];
                title = todayScore.title || "Daily Creation";
                composer = todayScore.composerText || "Joy";
                dateStr = `- ${todayScore.createdAt} -`;
                rhythmTitle = "Today's rhythm";
            }
        } else {
            // Weekly or All (Same for now as we only have 7 days mock)
            targetScores = scores;
            title = "Weekly Collection";
            composer = "Joy";
            const start = scores[scores.length - 1]?.createdAt || "";
            const end = scores[0]?.createdAt || "";
            dateStr = `- ${start} to ${end} -`;
            rhythmTitle = selectedTab === 'weekly' ? "Weekly rhythm" : "All-time rhythm";
        }

        // 2. Process Data for Cards
        // A. Rhythm (Staff)
        // Collect all segments, take first 4 representative ones
        const allSegments = targetScores.flatMap(s => s.musicSegments || []);
        const rhythmData = allSegments.slice(0, 4).map(seg => ({
            iconName: `Staff_${capitalize(seg.emotions[0] || 'Joy')}_1`,
            text: seg.eventText
        }));

        // B. Melody (Rainbow) & Notes (Bar)
        // Aggregate emotion counts
        const distribution: Record<string, number> = {};
        allSegments.forEach(seg => {
            seg.emotions.forEach(e => {
                distribution[e] = (distribution[e] || 0) + 1;
            });
        });

        const total = Object.values(distribution).reduce((a, b) => a + b, 0);

        const emotionStats = Object.keys(distribution).map(key => {
            const count = distribution[key];
            const percent = total > 0 ? parseFloat((count / total).toFixed(2)) : 0;
            const emo = key as StaffEmotionCategory;
            return {
                name: key,
                color: getEmotionColor(emo),
                percent: percent * 100, // display as 0-100 number
                iconName: `Staff_${capitalize(emo)}_1`
            };
        }).sort((a, b) => b.percent - a.percent); // Descending

        return {
            musicTitle: title,
            composer: composer,
            date: dateStr,
            rhythmTitle: rhythmTitle,
            rhythmData,
            emotionStats,
            originalScores: targetScores
        };

    }, [selectedTab, scores]);

    return (
        <View style={styles.container}>
            <ImageBackground
                source={BG_IMAGE}
                style={[styles.bgImage, { paddingTop: insets.top }]}
                resizeMode="cover"
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <View style={styles.chevron} />
                    </TouchableOpacity>

                    <View style={styles.titleContainer}>
                        <View style={styles.titleRow}>
                            <TitleText text="Your   " color="black" />
                            <TitleText text="Musical" color="black" />
                        </View>
                        <View style={styles.titleRow}>
                            <TitleText text="M" color="#FFB3E6" />
                            <TitleText text="o" color="#F9CE5C" />
                            <TitleText text="o" color="#459D93" />
                            <TitleText text="d  " color="#93A5E3" />
                            <TitleText text="data" color="black" />
                        </View>
                    </View>
                </View>

                {/* Tab Selector */}
                <View style={styles.tabContainer}>
                    <TabButton title=" Today" active={selectedTab === 'today'} onPress={() => setSelectedTab('today')} />
                    <TabButton title="Weekly" active={selectedTab === 'weekly'} onPress={() => setSelectedTab('weekly')} />
                    <TabButton title="All" active={selectedTab === 'all'} onPress={() => setSelectedTab('all')} />
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Card 1: Music Detail */}
                    <MusicDetailCard
                        title={currentData.musicTitle}
                        composer={currentData.composer}
                        date={currentData.date}
                        isPlaying={false}
                        progress={0.0}
                    />

                    {/* Card 2: Rhythm */}
                    {/* Card 2: Rhythm */}
                    {selectedTab === 'today' ? (
                        // Special case: Use image for Today's rhythm
                        <Image
                            source={TODAY_RHYTHM_IMG}
                            style={{ width: SCREEN_WIDTH, height: 195, alignSelf: 'center', marginBottom: 0 }}
                            resizeMode="contain"
                        />
                    ) : (
                        <EmotionRhythmCard
                            title={currentData.rhythmTitle}
                            data={currentData.rhythmData}
                            style={{ marginBottom: 16 }}
                        />
                    )}

                    {/* Row: Melody & Notes */}
                    <View style={styles.row}>
                        {selectedTab === 'today' ? (
                            <Image
                                source={TODAY_MELODY_IMG}
                                style={[styles.halfCard, { flex: 1, marginRight: 6, transform: [{ scale: 1.2 }] }]}
                                resizeMode="contain"
                            />
                        ) : (
                            <EmotionMelodyCard
                                data={currentData.emotionStats.map(s => ({ color: s.color, percent: s.percent }))}
                                style={styles.halfCard}
                            />
                        )}

                        {selectedTab === 'today' ? (
                            <Image
                                source={TODAY_NOTES_IMG}
                                style={[styles.halfCard, { flex: 1, marginLeft: 6, transform: [{ scale: 1.2 }] }]}
                                resizeMode="contain"
                            />
                        ) : (
                            <EmotionNotesCard
                                data={currentData.emotionStats.slice(0, 4).map(s => ({
                                    iconName: s.iconName,
                                    color: s.color,
                                    percent: s.percent
                                }))}
                                style={styles.halfCard}
                            />
                        )}
                    </View>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </ImageBackground>
        </View>
    );
};

// --- Helpers ---
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

// --- Sub Components ---
const TitleText = ({ text, color }: { text: string; color: string }) => (
    <Text style={[styles.titleText, { color }]}>{text}</Text>
);

const TabButton = ({ title, active, onPress }: { title: string; active: boolean; onPress: () => void }) => (
    <TouchableOpacity
        style={[styles.tabBtn, active && styles.tabBtnActive]}
        onPress={onPress}
    >
        <Text style={[styles.tabText, active && styles.tabTextActive]}>{title}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    bgImage: { flex: 1, width: '100%' },
    header: { paddingHorizontal: 20, marginBottom: 10 },
    backButton: { marginBottom: 0, width: 40, height: 40, justifyContent: 'center' },
    chevron: { width: 12, height: 12, borderLeftWidth: 3, borderBottomWidth: 3, borderColor: 'black', transform: [{ rotate: '45deg' }], marginLeft: 5 },
    titleContainer: {},
    titleRow: { flexDirection: 'row', marginHorizontal: 10 },
    titleText: { fontSize: 22, fontWeight: 'bold', lineHeight: 30 },
    tabContainer: { height: 30, flexDirection: 'row', marginHorizontal: 100, backgroundColor: 'rgba(255, 255, 255, 1)', borderRadius: 8, padding: 0, marginBottom: 10 },
    tabBtn: { flex: 1, fontSize: 12, paddingVertical: 6, alignItems: 'center', borderRadius: 10 },
    tabBtnActive: { backgroundColor: '#93A5E3' },
    tabText: { fontSize: 12, fontWeight: '600', color: '#000' },
    tabTextActive: { color: '#fff' },
    scrollContent: { paddingHorizontal: 30, paddingBottom: 50 },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    halfCard: { width: (SCREEN_WIDTH - 60 - 6) / 2, height: 240 },
});

export default CollectionDetailScreen;
