
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    Dimensions,
    ScrollView,
    TouchableOpacity,
    Animated,
    Easing,
    SafeAreaView,
    StatusBar,
    Alert,
    Pressable
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/RootNavigator';

import { StaffView } from '../components/Studio/StaffView';
import { Score, MusicSegmentInfo } from '../services/api';
import { StaffScoreToolkit } from '../utils/StaffScoreToolkit';
import { SegmentEventPopup } from '../components/Studio/SegmentEventPopup';
import { RouteProp, useRoute } from '@react-navigation/native';
import Sound from 'react-native-sound';
import { MockCreationData } from '../utils/MockCreationData';

// Configure Sound
Sound.setCategory('Playback');

const { width, height } = Dimensions.get('window');

// --- Assets ---
// Assuming these assets exist based on Plan.md and conversation
// User needs to ensure filenames match exactly or update them.
// Map string keys to require assets
const ASSET_MAP: Record<string, any> = {
    'MoodMapView_Joy': require('../assets/images/MoodMapView_Joy.png'),
    'MoodMapView_Sadness': require('../assets/images/MoodMapView_Sadness.png'),
    'MoodMapView_Anger': require('../assets/images/MoodMapView_Anger.png'),
    'MoodMapView_Fear': require('../assets/images/MoodMapView_Fear .png'),
    'MoodMapView_Surprise': require('../assets/images/MoodMapView_Surprise.png'),
    'MoodMapView_Digest': require('../assets/images/MoodMapView_Digest.png'),
};

const AUDIO_MAP: Record<string, string> = {
    'Joy': 'Joy.mp3',
    'Happy': 'Happy.mp3',
    'Sadness': 'Joy.mp3',
    'Anger': 'Angry.mp3',
    'Surprise': 'Surprise.mp3',
    'Fear': 'Joy.mp3',
    'Digest': 'Joy.mp3',
};


const ASSETS = {
    background: require('../assets/images/SongDetailViewBack.png'),
    recordFore: require('../assets/images/vp_musicBox_fore.png'),
    stylus: require('../assets/images/vp_musicBox_con.png'),
    phoneIcon: require('../assets/images/HomeSongDetailPhoneMusic.png'),
    vpIcon: require('../assets/images/HomeSongDetailVP.png'),
    playIcon: require('../assets/images/HomeSongDetailCircle.png'),
    backIcon: require('../assets/images/DoDo.png'),
};


type SongDetailScreenRouteProp = RouteProp<RootStackParamList, 'SongDetail'>;
type SongDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SongDetail'>;

export const SongDetailScreen: React.FC = () => {
    const navigation = useNavigation<SongDetailScreenNavigationProp>();
    const route = useRoute<SongDetailScreenRouteProp>();

    // Get data passed from Home
    const { score } = route.params || {};

    // --- Data Preparation Strategy ---
    const rawData = score || MockCreationData;

    // Enrich with Audio if needed
    const musicSegments = (rawData.musicSegments || []).map((seg: MusicSegmentInfo) => {
        if (seg.audioFilePath) return seg; // Already has audio, keep it

        let audioFile = 'Joy.mp3'; // Default
        const categories = ['Joy', 'Happy', 'Sadness', 'Anger', 'Surprise', 'Fear', 'Digest'];
        for (const cat of categories) {
            if (seg.emotions && seg.emotions.includes(cat as any)) {
                audioFile = AUDIO_MAP[cat];
                break;
            }
        }

        return {
            ...seg,
            audioFilePath: audioFile
        };
    });

    // Use enriched data for display
    const creation = {
        ...rawData,
        musicSegments: musicSegments
    };

    const staffScore = creation.staffScore || rawData.staffScore;
    const coverImage = (creation.coverImageName && ASSET_MAP[creation.coverImageName])
        ? ASSET_MAP[creation.coverImageName]
        : ASSET_MAP['MoodMapView_Joy'];

    // State
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0); // 0.0 to 1.0
    const [currentSegmentIndex, setCurrentSegmentIndex] = useState<number>(-1);

    // Popup State
    const [popupVisible, setPopupVisible] = useState(false);
    const [popupSegment, setPopupSegment] = useState<MusicSegmentInfo | null>(null);
    const [popupY, setPopupY] = useState(0);

    // Animation Refs
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const stylusAnim = useRef(new Animated.Value(0)).current; // 0: up (42deg), 1: down (0deg)

    // Derived Constants
    // Derived Constants
    const TOTAL_DURATION = musicSegments.reduce((sum, seg) => sum + seg.duration, 0) || 1; // Prevent div by 0


    // Sound Logic
    const soundRef = useRef<Sound | null>(null);

    // --- Animation Logic ---
    useEffect(() => {
        let animationLoop: Animated.CompositeAnimation;

        if (isPlaying) {
            // Start Rotation
            animationLoop = Animated.loop(
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 3000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            );
            animationLoop.start();

            // Move Stylus Down
            Animated.timing(stylusAnim, {
                toValue: 1,
                duration: 700,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            }).start();
        } else {
            // Stop Rotation
            rotateAnim.stopAnimation();

            // Move Stylus Up
            Animated.timing(stylusAnim, {
                toValue: 0,
                duration: 700,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            }).start();
        }

        return () => {
            if (animationLoop) animationLoop.stop();
        };
    }, [isPlaying]);

    // Cleanup sound on unmount
    useEffect(() => {
        return () => {
            if (soundRef.current) {
                soundRef.current.stop();
                soundRef.current.release();
            }
        };
    }, []);

    // --- Playback Controller ---

    const playSound = (segmentIndex: number) => {
        // Stop previous
        if (soundRef.current) {
            soundRef.current.stop();
            soundRef.current.release();
            soundRef.current = null;
        }

        const segment = musicSegments[segmentIndex];
        if (!segment || !segment.audioFilePath) return;

        // Load new sound
        const s = new Sound(segment.audioFilePath, Sound.MAIN_BUNDLE, (error) => {
            if (error) {
                console.log('failed to load the sound', error);
                Alert.alert("Error", "Could not load audio file: " + segment.audioFilePath);
                setIsPlaying(false);
                return;
            }

            // Loaded successfully
            setCurrentSegmentIndex(segmentIndex);

            // Calculate progress base (start of this segment)
            // But we might just want to show progress of THIS segment or global?
            // Global progress logic is complex with separated files. 
            // For now, let's just highlight the staff.

            s.play((success) => {
                if (success) {
                    console.log('successfully finished playing');
                    // Auto play next?
                    const nextIndex = segmentIndex + 1;
                    if (nextIndex < musicSegments.length) {
                        playSound(nextIndex);
                    } else {
                        setIsPlaying(false);
                        setProgress(1);
                    }
                } else {
                    console.log('playback failed due to audio decoding errors');
                    setIsPlaying(false);
                }
            });
        });

        soundRef.current = s;
        setIsPlaying(true);
    };

    const stopPlayback = () => {
        if (soundRef.current) {
            soundRef.current.stop();
        }
        setIsPlaying(false);
    };

    // --- Actions ---
    const handleTogglePlay = () => {
        if (isPlaying) {
            stopPlayback();
        } else {
            // Start from beginning or resume? 
            // Resume is hard with multiple files, let's start from current segment or 0
            const indexToPlay = currentSegmentIndex >= 0 ? currentSegmentIndex : 0;
            playSound(indexToPlay);
        }
    };

    const handleStaffTap = (index: number, event: any) => {
        // Calculate start time of this segment just for progress bar visual (optional)
        // ...

        // Play this segment
        playSound(index);

        // Popup Logic
        const segment = musicSegments[index];
        if (segment) {
            const tapY = event.nativeEvent.pageY;
            setPopupY(tapY - 150);
            setPopupSegment(segment);
            setPopupVisible(true);
        }
    };

    const closePopup = () => {
        setPopupVisible(false);
    };

    // Interpolations
    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });

    const stylusRotate = stylusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['42deg', '0deg']
    });

    // Formatting
    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Background Layer */}
            <Image
                source={ASSETS.background}
                style={styles.background}
                resizeMode="cover"
            />

            {/* Content Layer */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* 1. Back Button Area */}
                <SafeAreaView style={styles.headerArea}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <View style={styles.backButtonCircle}>
                            <Text style={styles.backButtonText}>‹</Text>
                        </View>
                    </TouchableOpacity>
                </SafeAreaView>

                {/* 2. Record Player Area - Copied from StudioFinishedView */}
                <View style={styles.recordPlayerArea}>
                    <View style={styles.recordContainer}>
                        {/* Record Base (Rotating) */}
                        <Animated.Image
                            source={coverImage}
                            style={[styles.recordImage, { transform: [{ rotate: spin }] }]}
                        />

                        {/* Foreground Plate */}
                        <Image
                            source={ASSETS.recordFore}
                            style={styles.recordFore}
                            blurRadius={0}
                        />

                        <View style={styles.songInfoOverlay}>
                            <Text style={styles.songTitle}>{creation.title}</Text>
                            <View>
                                <View style={styles.songMetaRow}>
                                    <Text style={styles.songMetaLabel}>Created by: </Text>
                                    <Text style={styles.songMetaValue}>{creation.composerText}</Text>
                                </View>
                                <View style={styles.songMetaRow}>
                                    <Text style={styles.songMetaLabel}>Arranged: </Text>
                                    <Text style={styles.songMetaValue}>{creation.arrangerText}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Stylus (Animated) */}
                        <Animated.Image
                            source={ASSETS.stylus}
                            style={[
                                styles.stylusImage,
                                {
                                    transform: [
                                        { translateX: -170 }, { translateY: 20 }, // Adjust pivot matches StudioFinishedView
                                        { rotate: stylusRotate },
                                        { translateX: 25 }, { translateY: 25 }
                                    ]
                                }
                            ]}
                        />
                    </View>

                    {/* Controls - Adapted from StudioFinishedView */}
                    <View style={styles.controlsRow}>
                        <TouchableOpacity onPress={handleTogglePlay}>
                            <Text style={styles.playIcon}>{isPlaying ? "❚❚" : "▶"}</Text>
                        </TouchableOpacity>

                        {/* Slider */}
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                        </View>

                        <TouchableOpacity>
                            <Image
                                source={ASSETS.playIcon}
                                style={styles.detailIcon}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Extra Info Row (Date) */}
                    <View style={styles.dateRow}>
                        {/* <Text style={styles.infoDate}>{score.createdAt ? score.createdAt : 'Just Now'}</Text> */}
                    </View>
                </View>

                {/* 3. Staff List Section - Adapted with Interaction */}
                <View style={styles.staffArea}>
                    {staffScore?.staves.map((staff, index) => (
                        <TouchableOpacity
                            key={staff.id}
                            style={[
                                styles.staffWrapper,
                                currentSegmentIndex === index && styles.activeStaffRow
                            ]}
                            onPress={(e) => handleStaffTap(index, e)}
                            activeOpacity={0.8}
                        >
                            <StaffView notes={staff.notes} />
                            {/* Overlay to indicate playing state slightly? */}
                            {currentSegmentIndex === index && (
                                <View style={styles.activeOverlay} />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* 4. Bottom Buttons - Kept specific to SongDetailScreen */}
                <View style={styles.bottomButtonsSection}>
                    <TouchableOpacity style={styles.bottomButton}>
                        <Image source={ASSETS.phoneIcon} style={styles.bottomButtonIcon} resizeMode="contain" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.bottomButton}>
                        <Image source={ASSETS.vpIcon} style={styles.bottomButtonIcon} resizeMode="contain" />
                    </TouchableOpacity>
                </View>

                <View style={{ height: 50 }} />

            </ScrollView>

            {/* Popup Overlay */}
            {popupVisible && popupSegment && (
                <Pressable style={StyleSheet.absoluteFill} onPress={closePopup}>
                    <SegmentEventPopup
                        segment={popupSegment}
                        positionY={popupY}
                        onClose={closePopup}
                    />
                </Pressable>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    background: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: width,
        height: height
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        alignItems: 'center', // Center content like StudioFinishedView
        paddingBottom: 40
    },
    headerArea: {
        width: '100%',
        alignItems: 'flex-start',
        paddingHorizontal: 20,
        marginTop: 10,
        zIndex: 10,
    },
    backButton: {
        paddingTop: 10,
    },
    backButtonCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButtonText: {
        fontSize: 28,
        color: '#000',
        lineHeight: 30,
        paddingBottom: 4
    },

    // --- Record Section (Copied & Adapted) ---
    recordPlayerArea: {
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
        width: '100%',
    },
    recordContainer: {
        width: 240,
        height: 240,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: -30,
        marginTop: -40,
    },
    recordImage: {
        width: 220,
        height: 220,
        position: 'absolute',
        top: -20,
    },
    recordFore: {
        width: '70%',
        height: '70%',
        position: 'absolute',
        opacity: 0.9,
        resizeMode: 'contain',
        top: 60,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 0,
        elevation: 10,
    },
    songInfoOverlay: {
        position: 'absolute',
        top: 110,
        alignItems: 'center',
    },
    songTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 4,
    },
    songMetaRow: {
        flexDirection: 'row',
    },
    songMetaLabel: {
        fontSize: 10,
        color: '#333',
    },
    songMetaValue: {
        fontSize: 10,
        color: '#333',
    },
    stylusImage: {
        width: 60,
        height: 80,
        position: 'absolute',
        top: -50,
        right: 20,
        resizeMode: 'contain',
    },

    // --- Controls ---
    controlsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '50%', // Slightly wider than StudioFinishedView's 40%
        justifyContent: 'space-between',
        marginTop: -20,
    },
    playIcon: {
        fontSize: 20,
        color: '#000',
        width: 20,
        height: 20,
        textAlign: 'center',
        bottom: 3,
    },
    progressBar: {
        flex: 1,
        height: 4,
        backgroundColor: '#ddd',
        borderRadius: 2,
        marginHorizontal: 15,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#6F8CF0',
        borderRadius: 2,
    },
    detailIcon: {
        width: 20,
        height: 20,
    },
    dateRow: {
        marginTop: 10,
        alignSelf: 'flex-end',
        marginRight: 40
    },
    infoDate: {
        fontSize: 14,
        color: '#6F8CF0',
        fontWeight: '500'
    },

    // --- Staff List ---
    staffArea: {
        paddingHorizontal: 0,
        marginBottom: 20,
        width: '100%', // Matches roughly
    },
    staffWrapper: {
        marginBottom: 10,
    },
    activeStaffRow: {

    },
    activeOverlay: {
    },

    // --- Bottom Buttons ---
    bottomButtonsSection: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 40,
        marginTop: 10,
        paddingBottom: 40
    },
    bottomButton: {
    },
    bottomButtonIcon: {
        width: 72,
        height: 72
    }
});
