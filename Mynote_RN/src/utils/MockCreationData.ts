
import { MyNoteCreation, MusicSegmentInfo } from '../types/MyNoteCreation';
import { DemoConversationData } from './DemoConversationData';
import { StaffScoreToolkit, StaffEmotionCategory } from './StaffScoreToolkit';

// Map emotions to local audio assets (filenames in Bundle)
const AUDIO_MAP: Record<string, string> = {
    'Joy': 'Joy.mp3',
    'Happy': 'Happy.mp3',
    'Sadness': 'Joy.mp3', // Fallback
    'Anger': 'Angry.mp3',
    'Surprise': 'Surprise.mp3',
    'Fear': 'Joy.mp3', // Fallback
    'Digest': 'Joy.mp3', // Fallback
};

/**
 * Utility to generate a Mock Creation Object based on Demo Data
 */
export const MockCreationData: MyNoteCreation = (() => {

    // 1. Base Metadata
    const creationId = "mock-creation-001";
    const baseDate = new Date();
    baseDate.setHours(20, 30, 0, 0);

    // 2. Generate Segments from Demo Scenarios
    const segments: MusicSegmentInfo[] = DemoConversationData.conversationScenarios.map((scenario, index) => {
        const chosenAnswer = scenario.commonAnswers[0];

        const startTime = new Date(baseDate);
        startTime.setMinutes(baseDate.getMinutes() + index * 30);
        const endTime = new Date(startTime);
        endTime.setMinutes(startTime.getMinutes() + 30);

        const emotionCategories = chosenAnswer.emotions.map(e => e.category);

        // Pick audio
        const primaryEmotion = emotionCategories[0] || 'Joy';
        const audioAsset = AUDIO_MAP[primaryEmotion] || AUDIO_MAP['Joy'];

        return {
            id: `seg-${index}`,
            timeWindow: { startTime, endTime },
            eventText: chosenAnswer.refinedText,
            emotions: emotionCategories,
            audioFilePath: audioAsset,
            duration: 30,
        };
    });

    // 3. Generate Staff Scores
    const staves = segments.map(seg => {
        return StaffScoreToolkit.generateStaffForEvent(seg.emotions);
    });

    // 4. Construct Final Object
    return {
        id: creationId,
        title: "Morning Overture",
        createdDate: new Date(),
        composerText: "Joy",
        arrangerText: "AI Partner",
        musicSegments: segments,
        staffScore: {
            staves: staves
        },
        coverImageName: "MoodMapView_Joy" // Placeholder string, usage depends on implementation
    };
})();
