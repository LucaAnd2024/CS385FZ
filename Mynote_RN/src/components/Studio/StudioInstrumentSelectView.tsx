import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ImageBackground, Image, Alert, SafeAreaView, Dimensions } from 'react-native';

interface StudioInstrumentSelectViewProps {
    visible: boolean;
    onSelect: () => void;
}

type InstrumentType = 'piano' | 'guitar' | 'bass';

const { width, height } = Dimensions.get('window');
const backgroundImageSource = require('../../assets/images/StudioSelectViewBack.png');
const bgImageSize = Image.resolveAssetSource(backgroundImageSource);
const bgImageHeight = bgImageSize ? (bgImageSize.height * (width / bgImageSize.width)) : height;

export const StudioInstrumentSelectView: React.FC<StudioInstrumentSelectViewProps> = ({ visible, onSelect }) => {
    if (!visible) return null;

    const [selectedInstrument, setSelectedInstrument] = useState<InstrumentType>('piano');

    const handleComingSoon = () => {
        Alert.alert("Coming Soon", "Guitar and Bass features are currently under development. Stay tuned!", [
            { text: "Got it", style: "cancel" }
        ]);
    };

    const handleConfirm = () => {
        onSelect();
    };

    return (
        <View style={styles.container}>
            <Image
                source={backgroundImageSource}
                style={[styles.backgroundImage, { height: bgImageHeight }]}
                resizeMode="contain"
            />
            <SafeAreaView style={styles.safeArea}>
                    <View style={styles.contentContainer}>
                        {/* Spacer to push content down */}
                        <View style={styles.topSpacer} />

                        {/* Piano Card */}
                        <TouchableOpacity
                            style={[
                                styles.card,
                                selectedInstrument === 'piano' && styles.selectedCard
                            ]}
                            onPress={() => setSelectedInstrument('piano')}
                            activeOpacity={0.9}
                        >
                            <View style={styles.cardContent}>
                                <View style={styles.textContainer}>
                                    <Text style={styles.cardTitle}>Piano</Text>
                                    <Text style={styles.cardSubtitle}>Crystal Clear</Text>
                                    <Text style={styles.cardSubtitle}>Striking Chord</Text>
                                </View>
                                <Image
                                    source={require('../../assets/images/StudioSelectViewPiano.png')}
                                    style={styles.pianoImage}
                                    resizeMode="contain"
                                />
                            </View>
                        </TouchableOpacity>

                        {/* Guitar & Bass Row */}
                        <View style={styles.row}>
                            {/* Guitar */}
                            <TouchableOpacity
                                style={[styles.smallCard, styles.cardBase]}
                                onPress={handleComingSoon}
                                activeOpacity={0.9}
                            >
                                <View style={styles.smallCardContent}>
                                    <View style={styles.textContainer}>
                                        <Text style={styles.cardTitle}>Guitar</Text>
                                        <Text style={styles.cardSubtitle}>Cozy Upbeat</Text>
                                        <Text style={styles.cardSubtitle}>Effortless Groove</Text>
                                    </View>
                                    <Image
                                        source={require('../../assets/images/StudioSelectViewGuita.png')}
                                        style={styles.smallImage}
                                        resizeMode="contain"
                                    />
                                </View>
                                {/* Plus Ribbon */}
                                <Image
                                    source={require('../../assets/images/StudioSelectViewPlus.png')}
                                    style={styles.ribbon}
                                    resizeMode="contain"
                                />
                            </TouchableOpacity>

                            {/* Bass */}
                            <TouchableOpacity
                                style={[styles.smallCard, styles.cardBase]}
                                onPress={handleComingSoon}
                                activeOpacity={0.9}
                            >
                                <View style={styles.smallCardContent}>
                                    <View style={styles.textContainer}>
                                        <Text style={styles.cardTitle}>Bass</Text>
                                        <Text style={styles.cardSubtitle}>Steady & Rich</Text>
                                        <Text style={styles.cardSubtitle}>Muttering mood</Text>
                                    </View>
                                    <Image
                                        source={require('../../assets/images/StudioSelectViewBeisi.png')}
                                        style={styles.smallImage}
                                        resizeMode="contain"
                                    />
                                </View>
                                {/* Plus Ribbon */}
                                <Image
                                    source={require('../../assets/images/StudioSelectViewPlus.png')}
                                    style={styles.ribbon}
                                    resizeMode="contain"
                                />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.bottomSpacer} />

                        {/* Confirm Button */}
                        <TouchableOpacity
                            style={styles.confirmButton}
                            onPress={handleConfirm}
                        >
                            <Text style={styles.confirmButtonText}>Confirm</Text>
                        </TouchableOpacity>
                    </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        backgroundColor: 'transparent',
    },
    backgroundImage: {
        position: 'absolute',
        bottom: 0,
        width: width,
        // height is set dynamically
    },
    safeArea: {
        flex: 1,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    topSpacer: {
        flex: 1, // Push content to bottom
    },
    bottomSpacer: {
        height: 20, // Space between cards and button
    },
    cardBase: {
        backgroundColor: 'white',
        borderRadius: 16,
        shadowColor: '#9F8EA7',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 5,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        paddingHorizontal: 18,
        paddingVertical: 12,
        marginBottom: 14,
        shadowColor: '#9F8EA7',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 5,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedCard: {
        borderColor: '#F9CE5C',
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: 'black',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 10,
        color: 'black',
        fontWeight: '400',
    },
    pianoImage: {
        width: 96,
        height: 96,
    },
    row: {
        flexDirection: 'row',
        gap: 14,
    },
    smallCard: {
        flex: 1,
        paddingHorizontal: 14,
        paddingVertical: 16,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    smallCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    smallImage: {
        width: 72,
        height: 72,
        marginLeft: 8,
    },
    ribbon: {
        position: 'absolute',
        top: -12,
        right: -12,
        width: 45,
        height: 45,
    },
    confirmButton: {
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 30,
        alignSelf: 'center',
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 4,
        marginBottom: 10,
    },
    confirmButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: 'black',
    }
});
