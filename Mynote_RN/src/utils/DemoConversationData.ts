import { StaffEmotionCategory } from './StaffScoreToolkit';

export interface EmotionData {
    category: StaffEmotionCategory;
    intensity: number;
    section: 'Upper' | 'Lower';
}

export interface ConversationAnswer {
    keywords: string[];
    refinedText: string;
    emotions: EmotionData[];
    confidence: number;
    responseContent: string;
    conversationAction: 'continueNextTimeSlot' | 'continueCurrentTopic' | 'endConversation';
    nextQuestion?: string;
}

export interface ConversationScenario {
    questionIndex: number;
    timeRange: string;
    momentType: string;
    healthDataText: string;
    commonAnswers: ConversationAnswer[];
    defaultAnswer: ConversationAnswer;
}

export const DemoConversationData = {
    demoQuestions: [
        "I noticed you didn't get much rest last night, only about four hours. Was there something keeping you from sleeping peacefully?",
        "I noticed that your step count increased between 8:15 and 8:48. Were you running at that time？",
        "I noticed some fluctuations in your heart rate between 9:17 and 9:20 AM. What were you doing at that time?",
        "I noticed your heart rate sped up again between 6:05 and 6:35 PM, but your activity level wasn't high. Did something happen?"
    ],

    conversationScenarios: [
        {
            questionIndex: 0,
            timeRange: "20:16-20:46",
            momentType: "Lack of sleep",
            healthDataText: "Sleep Time: 4.7 hours",
            commonAnswers: [
                {
                    keywords: ["考试", "紧张", "压力", "失眠", "睡觉"],
                    refinedText: "Lack of sleep due to test nervousness",
                    emotions: [
                        { category: StaffEmotionCategory.Fear, intensity: 0.7, section: 'Upper' },
                        { category: StaffEmotionCategory.Sadness, intensity: 0.4, section: 'Lower' }
                    ],
                    confidence: 0.9,
                    responseContent: "It's normal to be nervous before a test, and lack of sleep can indeed affect your state. ",
                    conversationAction: "continueNextTimeSlot",
                    nextQuestion: "I noticed your heart rate became much steadier between 8:23 and 8:53. Did you finally find a moment of peace then?"
                },
                {
                    keywords: ["work", "overtime", "busy"],
                    refinedText: "Lack of sleep due to busy work",
                    emotions: [
                        { category: StaffEmotionCategory.Sadness, intensity: 0.6, section: 'Upper' },
                        { category: StaffEmotionCategory.Fear, intensity: 0.3, section: 'Lower' }
                    ],
                    confidence: 0.85,
                    responseContent: "Work is important, but rest is equally important. Remember to balance work and rest.",
                    conversationAction: "continueNextTimeSlot",
                    nextQuestion: "I noticed your heart rate became much steadier between 8:23 and 8:53. Did you finally find a moment of peace then?"
                }
            ],
            defaultAnswer: {
                keywords: [],
                refinedText: "Lack of sleep last night",
                emotions: [
                    { category: StaffEmotionCategory.Sadness, intensity: 0.5, section: 'Upper' }
                ],
                confidence: 0.7,
                responseContent: "Lack of sleep can affect your state the next day. I hope you can get a good sleep tonight.",
                conversationAction: "continueNextTimeSlot",
                nextQuestion: "I noticed your heart rate became much steadier between 8:23 and 8:53. Did you finally find a moment of peace then?"
            }
        },
        {
            questionIndex: 1,
            timeRange: "09:23-09:53",
            momentType: "Heart rate decrease",
            healthDataText: "Heart rate: 66 beats/minute",
            commonAnswers: [
                {
                    keywords: ["breakfast", "team", "encourage", "confidence", "relax", "mutual"],
                    refinedText: "Team encouragement boosts confidence",
                    emotions: [
                        { category: StaffEmotionCategory.Joy, intensity: 0.8, section: 'Upper' },
                        { category: StaffEmotionCategory.Digest, intensity: 0.5, section: 'Lower' }
                    ],
                    confidence: 0.9,
                    responseContent: "The power of the team is truly strong! Mutual encouragement not only relieves tension but also boosts confidence. With such team support, you will surely perform at your best!",
                    conversationAction: "continueNextTimeSlot",
                    nextQuestion: "I noticed some fluctuations in your heart rate between 9:17 and 9:20 AM. What were you doing at that time?"
                },
                {
                    keywords: ["relax", "good", "comfortable", "calm"],
                    refinedText: "Feeling relaxed and calm",
                    emotions: [
                        { category: StaffEmotionCategory.Joy, intensity: 0.7, section: 'Upper' },
                        { category: StaffEmotionCategory.Digest, intensity: 0.4, section: 'Lower' }
                    ],
                    confidence: 0.85,
                    responseContent: "Glad to hear you feel relaxed! This state of calmness is a good sign of physical and mental adjustment.",
                    conversationAction: "continueNextTimeSlot",
                    nextQuestion: "I noticed some fluctuations in your heart rate between 9:17 and 9:20 AM. What were you doing at that time?"
                }
            ],
            defaultAnswer: {
                keywords: [],
                refinedText: "Heart rate decrease in the morning",
                emotions: [
                    { category: StaffEmotionCategory.Joy, intensity: 0.5, section: 'Upper' }
                ],
                confidence: 0.7,
                responseContent: "Take a deep breath and believe in yourself!",
                conversationAction: "continueNextTimeSlot",
                nextQuestion: "I noticed some fluctuations in your heart rate between 9:17 and 9:20 AM. What were you doing at that time?"
            }
        },
        {
            questionIndex: 2,
            timeRange: "10:17-10:47",
            momentType: "Heart rate decrease",
            healthDataText: "Heart rate: 70 beats/minute",
            commonAnswers: [
                {
                    keywords: ["work", "busy", "meeting"],
                    refinedText: "Working in the afternoon",
                    emotions: [
                        { category: StaffEmotionCategory.Digest, intensity: 0.5, section: 'Upper' }
                    ],
                    confidence: 0.7,
                    responseContent: "It's important to take appropriate breaks and maintain a good state while working in the afternoon.",
                    conversationAction: "continueNextTimeSlot",
                    nextQuestion: "I noticed your heart rate sped up again between 6:05 and 6:35 PM, but your activity level wasn't high. Did something happen?"
                },
                {
                    keywords: ["tired", "fatigue", "rest"],
                    refinedText: "Feeling tired and resting",
                    emotions: [
                        { category: StaffEmotionCategory.Sadness, intensity: 0.5, section: 'Upper' },
                        { category: StaffEmotionCategory.Digest, intensity: 0.3, section: 'Lower' }
                    ],
                    confidence: 0.75,
                    responseContent: "Resting when you feel tired is a great choice; listen to your body's signals.",
                    conversationAction: "continueNextTimeSlot",
                    nextQuestion: "I noticed your heart rate sped up again between 6:05 and 6:35 PM, but your activity level wasn't high. Did something happen?"
                }
            ],
            defaultAnswer: {
                keywords: [],
                refinedText: "Heart rate fluctuation in the afternoon",
                emotions: [
                    { category: StaffEmotionCategory.Digest, intensity: 0.4, section: 'Upper' }
                ],
                confidence: 0.6,
                responseContent: "The body has natural rhythmic changes in the afternoon, which is normal.",
                conversationAction: "continueNextTimeSlot",
                nextQuestion: "I noticed your heart rate sped up again between 6:05 and 6:35 PM, but your activity level wasn't high. Did something happen?"
            }
        },
        {
            questionIndex: 3,
            timeRange: "18:05-18:35",
            momentType: "Heart rate increase",
            healthDataText: "Heart rate: 105 beats/minute",
            commonAnswers: [
                {
                    keywords: ["movie", "horror", "thrilling", "scared"],
                    refinedText: "Watching a horror movie, nervous and thrilled",
                    emotions: [
                        { category: StaffEmotionCategory.Fear, intensity: 0.8, section: 'Upper' },
                        { category: StaffEmotionCategory.Joy, intensity: 0.6, section: 'Lower' }
                    ],
                    confidence: 0.9,
                    responseContent: "The tension when watching a horror movie is very real! This thrilling experience is also a spice of life.",
                    conversationAction: "endConversation",
                    nextQuestion: undefined
                },
                {
                    keywords: ["game", "play", "excited"],
                    refinedText: "Playing games, very excited",
                    emotions: [
                        { category: StaffEmotionCategory.Joy, intensity: 0.7, section: 'Upper' },
                        { category: StaffEmotionCategory.Surprise, intensity: 0.5, section: 'Lower' }
                    ],
                    confidence: 0.85,
                    responseContent: "The excitement of games is thrilling! Moderate gaming is a good way to relax.",
                    conversationAction: "endConversation",
                    nextQuestion: undefined
                }
            ],
            defaultAnswer: {
                keywords: [],
                refinedText: "Heart rate increase at night",
                emotions: [
                    { category: StaffEmotionCategory.Surprise, intensity: 0.5, section: 'Upper' }
                ],
                confidence: 0.7,
                responseContent: "Changes in heart rate at night may be related to activity or mood; keep an eye on it.",
                conversationAction: "endConversation",
                nextQuestion: undefined
            }
        }
    ],

    matchAnswer: (userInput: string, questionIndex: number): ConversationAnswer | null => {
        const scenarios = DemoConversationData.conversationScenarios;
        if (questionIndex >= scenarios.length) return null;

        const scenario = scenarios[questionIndex];
        const input = userInput.toLowerCase();

        // Try to match common answers
        for (const answer of scenario.commonAnswers) {
            for (const keyword of answer.keywords) {
                if (input.includes(keyword)) {
                    return answer;
                }
            }
        }

        // Return default answer
        return scenario.defaultAnswer;
    }
};
