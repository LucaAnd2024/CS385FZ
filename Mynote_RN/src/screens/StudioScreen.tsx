import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, SafeAreaView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Modal, TouchableOpacity, Image, ScrollView } from 'react-native';
import { StaffScoreToolkit, StaffScore } from '../utils/StaffScoreToolkit';
import { createScoreFromStudio } from '../utils/ScoreUtils';
import { Score } from '../services/api';

import { StaffView } from '../components/Studio/StaffView';
import { StudioBottomBar } from '../components/Studio/StudioBottomBar';
import { AIPopupView } from '../components/Studio/AIPopupView';
import { AIResponseCardView } from '../components/Studio/AIResponseCardView';
import { StudioView } from '../components/Studio/StudioView';
import { StudioInstrumentSelectView } from '../components/Studio/StudioInstrumentSelectView';
import { StudioFinishingView } from '../components/Studio/StudioFinishingView';
import { StudioFinishedView } from '../components/Studio/StudioFinishedView';
import { useStudioInputMode } from '../hooks/useStudioInputMode';
import { useStudioChat } from '../hooks/useStudioChat';

type StudioViewState = 'intro' | 'chat' | 'finishing' | 'finished';

const StudioScreen = () => {
    // Stage Control
    const [viewState, setViewState] = useState<StudioViewState>('intro');
    const [showInstrumentSheet, setShowInstrumentSheet] = useState(false);

    // Modal Visibility Control (derived from viewState for cleaner logic)
    const showModal = viewState !== 'intro';

    const [scores, setScores] = useState<StaffScore[]>([]);
    const [finishedScore, setFinishedScore] = useState<Score | null>(null);


    const {
        inputMode,
        inputText,
        setInputText,
        enterTextInput,
        enterVoiceOff,
        startVoiceOn,
        cancelVoiceOn,
        endConversation,
    } = useStudioInputMode();

    const {
        showAIChat,
        showAIResponse,
        isProcessing,
        aiQuestion,
        aiResponseText,
        startConversation,
        processUserInput,
        nextRound,
        generateDailyMusic,
        conversationEnded,

        chatHistory,
        aiHealthDataText,
    } = useStudioChat();


    // Watch for conversation end (Manual trigger from hook if any, though we disabled auto-end)
    useEffect(() => {
        if (conversationEnded) {
            handleEndConversation();
        }
    }, [conversationEnded]);

    // 1. Enter Studio Intro
    const handleEnterIntro = () => {
        setScores([]); // Reset scores
        setViewState('chat');
        // Delay to show instrument sheet
        setTimeout(() => {
            setShowInstrumentSheet(true);
        }, 300);
    };

    // 2. Instrument Selected
    const handleInstrumentSelect = () => {
        setShowInstrumentSheet(false);
        // Start conversation flow
        startConversation();
        // Switch to input mode
        enterTextInput();
    };

    const handleSendText = async () => {
        if (!inputText.trim()) return;

        const userInput = inputText;
        setInputText('');

        // Process AI
        const result = await processUserInput(userInput);

        // Generate Staff
        const newScore = StaffScoreToolkit.generateStaffForEvent(result.emotions);
        setScores(prev => [...prev, newScore]);
    };

    const handleSendVoice = async () => {
        cancelVoiceOn();
        const mockVoiceText = "今天天气真好，心情很舒畅！";

        const result = await processUserInput(mockVoiceText);
        const newScore = StaffScoreToolkit.generateStaffForEvent(result.emotions);
        setScores(prev => [...prev, newScore]);
    };

    // 3. Trigger Finishing Flow
    const handleEndConversation = () => {
        endConversation(); // Reset hook state
        setViewState('finishing');
    };

    // 4. Finishing Animation Done -> Show Finished View
    const handleFinishingDone = () => {
        // Generate final score from tracking data
        if (scores.length > 0) {
            const finalScore = createScoreFromStudio(scores, chatHistory);
            setFinishedScore(finalScore);
            console.log("Generated Score:", finalScore.id, finalScore.title);
        }
        setViewState('finished');
    };


    // 5. Close / Remix
    const handleClose = () => {
        setViewState('intro');
    };

    // 6. Save
    const handleSave = (title: string) => {
        Alert.alert("Saved", `Song "${title}" has been saved!`);
        handleClose();
    };

    return (
        <ImageBackground
            source={require('../assets/images/StudioViewBack.png')}
            style={styles.container}
            resizeMode="cover"
        >
            {/* 1. Static Entry View */}
            {viewState === 'intro' && (
                <StudioView onTap={handleEnterIntro} />
            )}

            {/* 2. Full Screen Modal Flow */}
            <Modal
                visible={showModal}
                animationType="slide"
                presentationStyle="fullScreen"
                onRequestClose={handleClose}
            >
                {/* A. Chat View */}
                {viewState === 'chat' && (
                    <ImageBackground
                        source={require('../assets/images/StudioViewBackGround.jpg')}
                        style={styles.container}
                        resizeMode="cover"
                    >
                        <SafeAreaView style={styles.safeArea}>
                            {/* Top Bar */}
                            <View style={styles.topBar}>
                                <TouchableOpacity onPress={handleClose} style={styles.backButton}>
                                    <Text style={{ fontSize: 28 }}>‹</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Content Layer */}
                            <View style={styles.contentLayer}>
                                <View style={styles.headerText}>
                                    <Text style={styles.title}>Hi, Joy</Text>
                                    <Text style={styles.title}>How are you today?</Text>
                                    <Text style={styles.subtitle}>Don't worry, no matter what happens, {'\n'}you are the conductor of your life's song</Text>
                                </View>

                                {/* Staff Area - Fixed height for 2 staves (140 * 2 = 280) + padding */}
                                <View style={styles.staffContainer}>
                                    <ScrollView
                                        style={styles.staffScroll}
                                        contentContainerStyle={styles.staffScrollContent}
                                        showsVerticalScrollIndicator={true}
                                    >
                                        {scores.length > 0 ? (
                                            scores.map((score) => (
                                                <StaffView key={score.id} notes={score.notes} />
                                            ))
                                        ) : (
                                            <View style={{ height: 140 }} />
                                        )}
                                        {isProcessing && <ActivityIndicator size="large" color="#6F8CF0" style={{ marginTop: 20 }} />}
                                    </ScrollView>
                                </View>

                                {/* DoDo Image */}
                                <Image
                                    source={require('../assets/images/DoDo.png')}
                                    style={styles.dodoImage}
                                    resizeMode="contain"
                                />
                            </View>

                            {/* Popup Layer (Z-Index handled by order) */}
                            <AIPopupView
                                message={aiQuestion}
                                visible={showAIChat}
                                healthDataText={aiHealthDataText}
                            />
                            <AIResponseCardView
                                message={aiResponseText || ""}
                                visible={showAIResponse}
                                onContinue={nextRound}
                            />

                            {/* Bottom Bar */}
                            <KeyboardAvoidingView
                                behavior={Platform.OS === "ios" ? "padding" : "height"}
                                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
                                style={styles.bottomContainer}
                            >
                                <StudioBottomBar
                                    inputMode={inputMode}
                                    inputText={inputText}
                                    onChangeText={setInputText}
                                    onEnterTextInput={enterTextInput}
                                    onEnterVoiceOff={enterVoiceOff}
                                    onStartVoiceOn={startVoiceOn}
                                    onCancelVoiceOn={cancelVoiceOn}
                                    onSendText={handleSendText}
                                    onSendVoice={handleSendVoice}
                                    onEndConversation={handleEndConversation}
                                />
                            </KeyboardAvoidingView>

                            {/* Instrument Sheet */}
                            <StudioInstrumentSelectView
                                visible={showInstrumentSheet}
                                onSelect={handleInstrumentSelect}
                            />
                        </SafeAreaView>
                    </ImageBackground>
                )}

                {/* B. Finishing View */}
                {viewState === 'finishing' && (
                    <StudioFinishingView onFinish={handleFinishingDone} />
                )}

                {/* C. Finished View */}
                {viewState === 'finished' && (
                    <StudioFinishedView
                        score={finishedScore}
                        onClose={handleClose}
                        onSave={handleSave}
                    />
                )}
            </Modal>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    topBar: {
        paddingHorizontal: 20,
        paddingTop: 10,
        zIndex: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentLayer: {
        flex: 1,
        zIndex: 1,
    },
    contentContainer: {
        flexGrow: 1,
        paddingBottom: 100, // Space for bottom bar
    },
    headerText: {
        paddingHorizontal: 30,
        marginTop: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        lineHeight: 40,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginTop: 10,
        lineHeight: 24,
    },
    staffContainer: {
        marginTop: 20,
        height: 280, // Fixed height for approx 2 staves
        width: '100%',
    },
    staffScroll: {
        flex: 1,
    },
    staffScrollContent: {
        alignItems: 'center',
        paddingBottom: 20,
    },
    staffArea: {
        // Deprecated, replaced by staffContainer
        marginTop: 30,
        alignItems: 'center',
        minHeight: 150,
    },
    dodoImage: {
        width: 160,
        height: 160,
        alignSelf: 'center',
        marginTop: 'auto', // Push to bottom
        marginBottom: 80, // Space for bottom bar
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: 40,
        alignItems: 'center',
        zIndex: 200, // Highest
    }
});

export default StudioScreen;
