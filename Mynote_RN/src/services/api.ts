import axios from 'axios';
import { Platform } from 'react-native';

const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://10.84.81.247:8000';

export const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    async (config) => {
        // TODO: Add Authorization header from AsyncStorage
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// --- Types ---

export interface EmotionNote {
    pitch: string;
    duration: number;
    velocity: number;
}

export interface EmotionEvent {
    id?: string;
    time: string;
    hr: number;
    hrv: number;
    triggered: boolean;
    userInput: string;
    emotion: string;
    phrase: EmotionNote[];
    conversationId?: string;
    aiTriggered?: boolean;
    conversationSummary?: string;
}

export interface EmotionDayData {
    date: string; // yyyy-MM-dd
    events: EmotionEvent[];
    finalPrompt?: string;
    musicGenerated: boolean;
}

export interface StaffEmotionNote {
    id?: string;
    name: string;
    assetName: string;
    colorHex: string;
    staffPosition: number;
    xPercent: number;
    size: number;
}

export interface StaffScore {
    id?: string;
    title?: string;
    notes: StaffEmotionNote[];
}

import { StaffScore as UIStaffScore } from '../utils/StaffScoreToolkit';
import { StaffEmotionCategory } from '../utils/StaffScoreToolkit';

export interface ChatRecord {
    id: string;
    question: string;
    userAnswer: string;
    aiResponse: string;
    emotions: StaffEmotionCategory[];
    timestamp: number;
}


export interface TimeWindow {
    startTime: Date;
    endTime: Date;
}

export interface MusicSegmentInfo {
    id: string;
    timeWindow: TimeWindow;
    eventText: string;
    emotions: StaffEmotionCategory[];
    audioFilePath: string;
    duration: number; // In seconds
}

export interface Score {
    id?: string;
    title?: string;
    createdAt?: string;

    // --- 详情页/播放器所需扩展字段 ---
    composerText?: string;
    arrangerText?: string;
    coverImageName?: string;

    // 音乐播放片段数据
    musicSegments?: MusicSegmentInfo[];

    // 兼容后端原始 staves 结构
    staves: StaffScore[];

    // 前端 UI 渲染用的完整谱面对象 (兼容 MyNoteCreation)
    staffScore?: {
        staves: UIStaffScore[];
    };
}

// --- API Service ---

export const authApi = {
    login: async (credentials: any) => {
        const response = await api.post('/users/login', credentials);
        return response.data;
    },
    register: async (userData: any) => {
        const response = await api.post('/users/register', userData);
        return response.data;
    },
};

export const coreApi = {
    // Emotions
    getEmotionDays: async () => {
        const response = await api.get('/emotions/days');
        return response.data; // Expected: { code: 0, data: EmotionDayData[], ... }
    },
    getEmotionDay: async (date: string) => {
        const response = await api.get(`/emotions/days/${date}`);
        return response.data;
    },
    upsertEmotionDay: async (data: EmotionDayData) => {
        const response = await api.put('/emotions/days', data);
        return response.data;
    },
    // Scores
    getScores: async () => {
        const response = await api.get('/scores');
        return response.data;
    },
    createScore: async (score: Score) => {
        const response = await api.post('/scores', score);
        return response.data;
    },
};

export const musicApi = {
    generateDaily: async (request: DailyMusicRequest) => {
        const response = await api.post('/music/generate-daily', request);
        return response.data; // { code:0, data: { taskId: "..." } }
    },
    queryTask: async (taskId: string) => {
        const response = await api.get(`/music/query/${taskId}`);
        return response.data;
    }
};

export const checkBackendHealth = async () => {
    try {
        const response = await api.get('/ping');
        return response.data;
    } catch (error) {
        console.error('Backend health check failed:', error);
        return null;
    }
};

export default api;

// --- Music Types ---

export interface EmotionEventData {
    emotion: string;
    intensity: number;
    time: string;
    event: string;
    hr?: number;
    hrv?: number;
    steps?: number;
    calories?: number;
}

export interface DailySummary {
    dominantEmotion: string;
    emotionDistribution: Record<string, number>;
    overallMood: string;
    avgHeartRate: number;
    avgHRV?: number;
    totalSteps: number;
    sleepHours?: number;
    activeMinutes?: number;
}

export interface DailyMusicRequest {
    date: string;
    emotions: EmotionEventData[];
    dailySummary: DailySummary;
}
