import React, { useState, useEffect, useRef } from 'react';
import { View, Image, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Text, ImageBackground, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useCollectionData } from '../hooks/useCollectionData';
import NoteGroup from '../components/Collection/NoteGroup';
import DialogBox from '../components/Collection/DialogBox';
import VisibilityDetector from '../components/Collection/VisibilityDetector';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Asset imports
const BG_IMAGE = require('../assets/images/CollectionRoomViewBack.jpg');
const NO_DATA_POP = require('../assets/images/CollectionRoomView_NoDataPop.png');
const BEGIN_BTN = require('../assets/images/CollectionRoomViewBegin.png');

// --- Configuration ---

// These percentages are relative to the LONG background image height
// We will calculate the actual pixel values after loading the image size.
const GROUP_POSITIONS = [
    // Group 1: 7-6 days ago (Original Pink)
    {
        notePositions: [
            { x: 0.12, y: 0.24, scale: 0.16 },
            { x: 0.28, y: 0.28, scale: 0.08 }
        ],
        detectorY: 0.26,
        dialogPos: { x: 0.62, y: 0.26 }
    },
    // Group 2: 5-4 days ago (Original Green)
    {
        notePositions: [
            { x: 0.82, y: 0.36, scale: 0.18 },
            { x: 0.62, y: 0.44, scale: 0.18 }
        ],
        detectorY: 0.40,
        dialogPos: { x: 0.25, y: 0.40 } // Dialog on left
    },
    // Group 3: Pre-Yesterday/Yesterday (Original Blue)
    {
        notePositions: [
            { x: 0.14, y: 0.48, scale: 0.10 },
            { x: 0.10, y: 0.54, scale: 0.14 },
            { x: 0.22, y: 0.60, scale: 0.18 }
        ],
        detectorY: 0.54,
        dialogPos: { x: 0.60, y: 0.54 } // Dialog on right
    },
    // Group 4: Today (Original Yellow)
    {
        notePositions: [
            { x: 0.88, y: 0.64, scale: 0.12 },
            { x: 0.78, y: 0.70, scale: 0.12 },
            { x: 0.62, y: 0.73, scale: 0.16 }
        ],
        detectorY: 0.69,
        dialogPos: { x: 0.28, y: 0.69 } // Dialog on left
    }
];

// --- Component ---

const CollectionScreen = () => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const { dayGroups, scores, loading, refresh } = useCollectionData();

    // Layout State
    const [bgHeight, setBgHeight] = useState(SCREEN_HEIGHT * 2); // Default estimate
    const [scrollY, setScrollY] = useState(0);
    const scrollViewRef = useRef<ScrollView>(null);

    // Interaction State
    const [visibleGroups, setVisibleGroups] = useState<Set<string>>(new Set());
    const [hideDialogs, setHideDialogs] = useState<Set<string>>(new Set()); // Manually hidden

    // Load BG Image Size
    useEffect(() => {
        const imageSource = Image.resolveAssetSource(BG_IMAGE);
        if (imageSource) {
            const ratio = imageSource.height / imageSource.width;
            setBgHeight(SCREEN_WIDTH * ratio);
        }
    }, []);

    // Scroll Handler
    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        setScrollY(event.nativeEvent.contentOffset.y);
    };

    // Toggle Dialog Logic
    const toggleDialog = (groupName: string) => {
        if (visibleGroups.has(groupName)) {
            // If visible, hide it manually
            // Actually, the requirement says "Click to show/hide".
            // If visibility logic is automatic, clicking should toggle manual override?
            // Simple version: Toggle "hideDialogs" set.
            setHideDialogs(prev => {
                const next = new Set(prev);
                if (next.has(groupName)) next.delete(groupName);
                else next.add(groupName);
                return next;
            });
        }
    };

    // Check if we have any data at all
    const hasData = scores.length > 0;

    // Date Range Text
    const getDateRangeText = () => {
        const today = new Date();
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 6);
        const fmt = (d: Date) => `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
        // return `记录自${fmt(weekAgo)}\n至${fmt(today)}`;
        return ``;
    };

    return (
        <View style={styles.container}>
            <ScrollView
                ref={scrollViewRef}
                style={styles.scrollView}
                contentContainerStyle={{ height: bgHeight }}
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16} // 60fpsish
                onScroll={handleScroll}
                bounces={false}
            >
                {/* 1. Background Image */}
                <ImageBackground
                    source={BG_IMAGE}
                    style={{ width: SCREEN_WIDTH, height: bgHeight }}
                    resizeMode="cover"
                >
                    {/* 2. Date Text */}
                    <Text style={[styles.dateText, { top: bgHeight * 0.165, left: SCREEN_WIDTH * 0.48 }]}>
                        {getDateRangeText()}
                    </Text>

                    {/* 3. Render Groups (Only if we have data) */}
                    {hasData && GROUP_POSITIONS.map((config, index) => {
                        const groupData = dayGroups.find(g => g.groupIndex === index);
                        if (!groupData) return null; // Should not happen if utils logic is correct

                        const groupName = groupData.groupName;
                        const isVisible = visibleGroups.has(groupName) && !hideDialogs.has(groupName);

                        return (
                            <React.Fragment key={`group-wrapper-${index}`}>
                                {/* Note Icons - Temporarily Commented Out */}
                                {/* <NoteGroup
                                    group={groupData}
                                    positions={config.notePositions}
                                    containerWidth={SCREEN_WIDTH}
                                    containerHeight={bgHeight}
                                    onToggleDialog={toggleDialog}
                                /> */}

                                {/* Visibility Detector Logic */}
                                <VisibilityDetector
                                    scrollY={scrollY}
                                    viewportHeight={SCREEN_HEIGHT}
                                    targetY={bgHeight * config.detectorY}
                                    onVisibilityChange={(visible) => {
                                        setVisibleGroups(prev => {
                                            const next = new Set(prev);
                                            if (visible) next.add(groupName);
                                            else next.delete(groupName);
                                            return next;
                                        });
                                    }}
                                />

                                {/* Dialog Box */}
                                {isVisible && (
                                    <DialogBox
                                        text={groupData.aiSummary || "点击查看详情"}
                                        position={config.dialogPos}
                                        containerWidth={SCREEN_WIDTH}
                                        containerHeight={bgHeight}
                                        alignment={config.dialogPos.x > 0.5 ? 'right' : 'left'}
                                    />
                                )}
                            </React.Fragment>
                        );
                    })}

                    {/* 4. Placeholder Icons if NO DATA - Temporarily Commented Out */}
                    {/* {!hasData && GROUP_POSITIONS.map((config, index) => (
                        <NoteGroup
                            key={`dummy-group-${index}`}
                            group={{
                                id: `dummy-${index}`,
                                groupIndex: index,
                                groupName: `group${index + 1}`,
                                dayRange: [],
                                creations: [],
                                dominantEmotion: 0, // Joy
                                emotionDistribution: {},
                                noteIcons: ['Staff_Joy_1', 'Staff_Joy_2'].slice(0, Math.min(2, config.notePositions.length)),
                                aiSummary: '',
                                summaryGeneratedAt: new Date()
                            }}
                            positions={config.notePositions.slice(0, 2)}
                            containerWidth={SCREEN_WIDTH}
                            containerHeight={bgHeight}
                            onToggleDialog={() => { }}
                        />
                    ))} */}


                    {/* 5. Begin Button */}
                    <TouchableOpacity
                        style={[styles.beginButton, { top: bgHeight * 0.89, left: SCREEN_WIDTH * 0.82 }]}
                        onPress={() => navigation.navigate('CollectionDetail')}
                    >
                        <Image source={BEGIN_BTN} style={styles.beginImage} />
                    </TouchableOpacity>

                    {/* 6. No Data Popup (Aligned to Begin Button logic) */}
                    {!hasData && (
                        <View style={[styles.noDataPopup, { top: bgHeight * 0.89 - (SCREEN_WIDTH * 0.77 * 0.4) - 20 }]}>
                            {/* <Image
                                source={NO_DATA_POP}
                                style={{ width: SCREEN_WIDTH * 0.77, height: SCREEN_WIDTH * 0.77 * 0.4 }} // Aspect ratio estimate
                                resizeMode="contain"
                            /> */}
                        </View>
                    )}

                </ImageBackground>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollView: {
        flex: 1,
    },
    dateText: {
        position: 'absolute',
        fontSize: 15, // Adjusted from Swift 15.4
        fontWeight: '500',
        color: 'rgba(0,0,0,0.85)',
        lineHeight: 20,
    },
    beginButton: {
        position: 'absolute',
        transform: [{ translateX: -80 }, { translateY: -60 }] // Left 40, Up 40
    },
    beginImage: {
        width: SCREEN_WIDTH * 0.48, // Double from 0.24
        height: SCREEN_WIDTH * 0.48 * 0.4,
        resizeMode: 'contain'
    },
    noDataPopup: {
        position: 'absolute',
        left: (SCREEN_WIDTH - (SCREEN_WIDTH * 0.77)) / 2, // Center horizontally
        alignItems: 'center',
        zIndex: 1000,
    }
});

export default CollectionScreen;
