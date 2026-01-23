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
    Alert
} from 'react-native';
import { StaffScore } from '../../utils/StaffScoreToolkit';
import { StaffView } from './StaffView';
import { Score } from '../../services/api';


const { width, height } = Dimensions.get('window');

interface StudioFinishedViewProps {
    score: Score | null;
    onClose: () => void;

    onSave: (title: string) => void;
}

export const StudioFinishedView: React.FC<StudioFinishedViewProps> = ({ score, onClose, onSave }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);

    // Fallback if score is null (shouldn't happen in flow)
    const displayTitle = score?.title || "MySong";
    const displayComposer = score?.composerText || "Joy";
    const displayArranger = score?.arrangerText || "AI Partner";
    const displayStaves = score?.staves || [];


    // Animations
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const stylusAnim = useRef(new Animated.Value(0)).current; // 0: up, 1: down

    // Rotation Loop
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

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });

    const stylusRotate = stylusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['30deg', '0deg']
    });

    const handleSave = () => {
        Alert.prompt(
            "Name Your Song",
            "Give your new creation a name!",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Save", onPress: (text) => onSave(text || "Untitled") }
            ],
            "plain-text",
            "My Song"
        );
    };

    return (
        <View style={styles.container}>
            {/* Background Layer */}
            <Image
                source={require('../../assets/images/StudioFinishedViewBack.png')}
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
                <View style={styles.headerArea}>
                    <TouchableOpacity onPress={onClose} style={styles.backButton}>
                        <Text style={styles.backButtonText}>‹</Text>
                    </TouchableOpacity>
                </View>

                {/* 2. Record Player Area */}
                <View style={styles.recordPlayerArea}>
                    <View style={styles.recordContainer}>
                        {/* Record Base (Rotating) */}
                        <Animated.Image
                            source={require('../../assets/images/MoodMapView_Joy.png')}
                            style={[styles.recordImage, { transform: [{ rotate: spin }] }]}
                        />

                        {/* Foreground Plate */}
                        <Image
                            source={require('../../assets/images/vp_musicBox_fore.png')}
                            style={styles.recordFore}
                            blurRadius={0}
                        />

                        {/* Song Info (Overlaid) */}
                        <View style={styles.songInfoOverlay}>
                            <Text style={styles.songTitle}>{displayTitle}</Text>
                            <View>

                                <View style={styles.songMetaRow}>
                                    <Text style={styles.songMetaLabel}>Created by: </Text>
                                    <Text style={styles.songMetaValue}>{displayComposer}</Text>
                                </View>
                                <View style={styles.songMetaRow}>
                                    <Text style={styles.songMetaLabel}>Arranged: </Text>
                                    <Text style={styles.songMetaValue}>{displayArranger}</Text>
                                </View>
                                {/* Extra info if needed */}
                                {/* <Text style={styles.songMetaValue}>{score?.createdAt}</Text> */}
                            </View>
                        </View>


                        {/* Stylus (Animated) */}
                        <Animated.Image
                            source={require('../../assets/images/vp_musicBox_con.png')}
                            style={[
                                styles.stylusImage,
                                {
                                    transform: [
                                        { translateX: -170 }, { translateY: 20 }, // Adjust pivot
                                        { rotate: stylusRotate },
                                        { translateX: 25 }, { translateY: 25 }
                                    ]
                                }
                            ]}
                        />

                        {/* Control Knob */}
                        {/* <Image
                            source={require('../../assets/images/vp_musicBox_con1.png')}
                            style={styles.controlKnob}
                        /> */}
                    </View>

                    {/* Controls */}
                    <View style={styles.controlsRow}>
                        <TouchableOpacity onPress={() => setIsPlaying(!isPlaying)}>
                            <Text style={styles.playIcon}>{isPlaying ? "❚❚" : "▶"}</Text>
                        </TouchableOpacity>

                        {/* Mock Slider */}
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: '20%' }]} />
                        </View>

                        <TouchableOpacity>
                            <Image
                                source={require('../../assets/images/HomeSongDetailCircle.png')}
                                style={styles.detailIcon}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 3. Staff Area */}
                <View style={styles.staffArea}>
                    {/* <Image
                        source={require('../../assets/images/StudioFinishedViewMusicalScore.png')}
                        style={styles.scoreIcon}
                    /> */}
                    {displayStaves.map((staff, index) => (
                        <View key={staff.id || index} style={styles.staffWrapper}>
                            <StaffView notes={staff.notes} />

                        </View>
                    ))}
                </View>

                {/* 4. DoDo & Buttons */}
                <View style={styles.bottomArea}>
                    <Image
                        source={require('../../assets/images/DoDo.png')}
                        style={styles.dodoImage}
                    />

                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.actionButton} onPress={onClose}>
                            <Text style={styles.actionButtonText}>Remix</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
                            <Text style={styles.actionButtonText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </ScrollView>
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
        height: height, // Or more if scrollable background is needed
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 0,
    },
    headerArea: {
        height: 60,
        justifyContent: 'center',
        paddingHorizontal: 20,
        marginTop: 40,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    backButtonText: {
        fontSize: 30,
        color: '#000',
    },
    recordPlayerArea: {
        alignItems: 'center',
        marginTop: 0,
        marginBottom: 20,
    },
    recordContainer: {
        width: 240,
        height: 240,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: -30,

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
        // color: '#F9CE5C',
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
    controlKnob: {
        width: 16,
        height: 16,
        position: 'absolute',
        top: -90,
        left: 20,
    },
    controlsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '40%',
        justifyContent: 'space-between',
    },
    playIcon: {
        fontSize: 20,
        color: '#000',
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
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
    staffArea: {
        paddingHorizontal: 0,
        marginBottom: 20,
        width: '80%',

    },
    scoreIcon: {
        width: 24,
        height: 24,
        marginBottom: 10,
    },
    staffWrapper: {
        marginBottom: 10,
    },
    bottomArea: {
        alignItems: 'center',
    },
    dodoImage: {
        width: 140,
        height: 140,
        resizeMode: 'contain',
        marginBottom: 20,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 15,
    },
    actionButton: {
        width: 140,
        height: 48,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
});
