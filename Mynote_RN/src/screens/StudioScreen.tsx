import React, { useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { musicApi, DailyMusicRequest } from '../services/api';

const { width } = Dimensions.get('window');

const StudioScreen = () => {
    const [generating, setGenerating] = useState(false);
    const [musicUrl, setMusicUrl] = useState<string | null>(null);

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            // Mock Data for Phase 4 Test
            const dummyRequest: DailyMusicRequest = {
                date: new Date().toISOString().split('T')[0],
                emotions: [
                    { emotion: "Joy", intensity: 0.8, time: "09:00", event: "Morning Run", hr: 120 }
                ],
                dailySummary: {
                    dominantEmotion: "Joy",
                    emotionDistribution: { "Joy": 1.0 },
                    overallMood: "Energetic",
                    avgHeartRate: 80,
                    totalSteps: 5000
                }
            };

            const res = await musicApi.generateDaily(dummyRequest);
            if (res.code !== 0) throw new Error(res.message);

            const taskId = res.data.taskId;
            pollTask(taskId);

        } catch (error: any) {
            Alert.alert("Error", error.message || "Generation failed");
            setGenerating(false);
        }
    };

    const pollTask = async (taskId: string) => {
        const interval = setInterval(async () => {
            try {
                const res = await musicApi.queryTask(taskId);
                const status = res.data.status;

                if (status === 'succeeded') {
                    clearInterval(interval);
                    setGenerating(false);
                    setMusicUrl(res.data.musicUrl);
                    Alert.alert("Success", "Music Generated! " + res.data.musicUrl);
                } else if (status === 'failed') {
                    clearInterval(interval);
                    setGenerating(false);
                    Alert.alert("Failed", "Generation failed on server.");
                }
                // else: continue polling
            } catch (e) {
                console.error("Polling error", e);
                clearInterval(interval);
                setGenerating(false);
            }
        }, 3000);
    };

    return (
        <ImageBackground
            source={require('../assets/images/StudioViewBackGround.png')}
            style={styles.container}
            resizeMode="cover"
        >
            <SafeAreaView style={styles.content}>
                {/* Header / Top Area */}
                <View style={styles.header}>
                    <Text style={styles.title}>Studio</Text>
                    <Text style={styles.subtitle}>Create your melody</Text>
                </View>

                {/* Staff Area Placeholder */}
                <View style={styles.staffContainer}>
                    <View style={styles.staffPlaceholder}>
                        {generating ? (
                            <View>
                                <ActivityIndicator size="large" color="#333" />
                                <Text style={styles.staffText}>Generating AI Music...</Text>
                            </View>
                        ) : (
                            <View style={{ alignItems: 'center' }}>
                                <Text style={styles.staffText}>Staff Visualization Area</Text>
                                <TouchableOpacity style={styles.generateButton} onPress={handleGenerate}>
                                    <Text style={styles.generateButtonText}>✨ Generate AI Music</Text>
                                </TouchableOpacity>
                                {musicUrl && <Text style={{ marginTop: 10, fontSize: 10 }}>{musicUrl}</Text>}
                            </View>
                        )}
                    </View>
                </View>

                {/* Bottom Bar Controls (Mock) */}
                <View style={styles.bottomBar}>
                    <TouchableOpacity style={styles.controlButton}>
                        <View style={styles.micIcon} />
                        <Text style={styles.controlText}>Mic</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.recordButton}>
                        <View style={styles.recordInner} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.controlButton}>
                        <View style={styles.effectIcon} />
                        <Text style={styles.controlText}>Effect</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
    },
    header: {
        paddingTop: 20,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginTop: 5,
    },
    staffContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    staffPlaceholder: {
        width: '100%',
        height: 200,
        backgroundColor: 'rgba(255,255,255,0.5)',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.8)',
        borderStyle: 'dashed',
    },
    staffText: {
        color: '#333',
        fontSize: 18,
        fontWeight: '600',
    },
    bottomBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingBottom: 20,
        paddingHorizontal: 30,
        height: 100,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
    },
    controlButton: {
        alignItems: 'center',
    },
    controlText: {
        marginTop: 5,
        color: '#333',
        fontWeight: '500',
    },
    micIcon: {
        width: 24,
        height: 24,
        backgroundColor: '#333',
        borderRadius: 12,
    },
    effectIcon: {
        width: 24,
        height: 24,
        backgroundColor: '#333',
        borderRadius: 4,
    },
    recordButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'white',
        borderWidth: 5,
        borderColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    recordInner: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#FF4444',
    },
    generateButton: {
        marginTop: 20,
        backgroundColor: '#6F8CF0',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    generateButtonText: {
        color: 'white',
        fontWeight: 'bold',
    }
});

export default StudioScreen;
