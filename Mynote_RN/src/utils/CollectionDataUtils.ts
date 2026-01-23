import { Score, MusicSegmentInfo, TimeWindow } from '../services/api';
import { StaffEmotionCategory, StaffScoreToolkit, StaffScore, StaffEmotionNote } from './StaffScoreToolkit';

/**
 * 收藏室数据工具类
 * 负责生成过去7天的演示数据，以及对数据进行按时间段分组。
 */

// --- 基础类型定义 ---

export interface DayGroupSummary {
    groupIndex: number; // 0-3
    groupName: string; // group1, group2...
    dayRange: Date[]; // 该组包含的日期
    creations: Score[]; // 该组内的所有创作
    dominantEmotion: StaffEmotionCategory; // 主导情绪
    emotionDistribution: Record<string, number>; // 情绪分布
    noteIcons: string[]; // 用于UI展示的音符图标名称列表
    aiSummary: string; // 对话气泡内容
    summaryGeneratedAt: Date;
}

// --- 7天剧本配置 (Synced with iOS DemoCreationData.swift) ---

type ThemeEvent = {
    text: string;
    emotions: StaffEmotionCategory[];
    timeRange: string; // "HH:mm-HH:mm"
};

type DayTheme = {
    emotion: StaffEmotionCategory;
    title: string;
    events: ThemeEvent[];
    aiSummary: string; // 新增：每组对应的气泡文案，可以直接在这里定义，或者聚合时生成
};

// 注意：顺序对应 7天前 -> 今天
// Index 0: 6天前 (Day 1)
// Index 6: 今天 (Day 7)
const DAY_THEMES: DayTheme[] = [
    // Day 1: Sadness (6天前) -> Group 1
    {
        emotion: StaffEmotionCategory.Sadness,
        title: "Quiet Reflection Day",
        aiSummary: "Sometimes, sadness is a gentle way to heal.",
        events: [
            { text: "When walking alone,\nI have the chance to listen to my inner voice", emotions: [StaffEmotionCategory.Sadness, StaffEmotionCategory.Digest], timeRange: "09:00-10:00" },
            { text: "A song touched my heart,\nthese emotions also need to be treated gently", emotions: [StaffEmotionCategory.Sadness], timeRange: "14:00-15:00" },
            { text: "The beauty in old photos,\nreminds me that happiness is still in my heart", emotions: [StaffEmotionCategory.Sadness, StaffEmotionCategory.Joy], timeRange: "20:00-21:00" }
        ]
    },
    // Day 2: Joy (5天前) -> Group 2
    {
        emotion: StaffEmotionCategory.Joy,
        title: "A Sunny Day",
        aiSummary: "Your joy is shining like the sun!",
        events: [
            { text: "Seeing the sunrise during a morning run\nbrightly lit up my heart", emotions: [StaffEmotionCategory.Joy, StaffEmotionCategory.Surprise], timeRange: "06:30-07:00" },
            { text: "Gathering with friends,\nmakes me feel understood and warm", emotions: [StaffEmotionCategory.Joy], timeRange: "12:00-13:00" },
            { text: "Completing an important project,\nis an affirmation of my efforts", emotions: [StaffEmotionCategory.Joy, StaffEmotionCategory.Surprise], timeRange: "16:00-17:00" }
        ]
    },
    // Day 3: Fear (4天前) -> Group 2
    {
        emotion: StaffEmotionCategory.Fear,
        title: "Challenge Self Day",
        aiSummary: "You faced your fears with great courage.",
        events: [
            { text: "Although nervous on stage,\nI chose to be brave", emotions: [StaffEmotionCategory.Fear, StaffEmotionCategory.Surprise], timeRange: "10:00-11:00" },
            { text: "Insecurity about trying new things is normal,\naccepting it is also gentle", emotions: [StaffEmotionCategory.Fear, StaffEmotionCategory.Joy], timeRange: "15:00-16:00" },
            { text: "The moment I realized I was braver\nthan I imagined", emotions: [StaffEmotionCategory.Fear, StaffEmotionCategory.Joy], timeRange: "19:00-20:00" }
        ]
    },
    // Day 4: Joy (3天前) -> Group 3
    {
        emotion: StaffEmotionCategory.Joy,
        title: "Happy Weekend",
        aiSummary: "Every small happiness counts.",
        events: [
            { text: "Picnic time,\nfamily laughter brings pure happiness", emotions: [StaffEmotionCategory.Joy], timeRange: "11:00-12:00" },
            { text: "Stories in movies make me feel\nthat I am not alone", emotions: [StaffEmotionCategory.Joy, StaffEmotionCategory.Surprise], timeRange: "15:00-17:00" },
            { text: "Learning a new skill,\nis recognition and encouragement for myself", emotions: [StaffEmotionCategory.Joy, StaffEmotionCategory.Surprise], timeRange: "19:00-20:00" }
        ]
    },
    // Day 5: Surprise (2天前) -> Group 3
    {
        emotion: StaffEmotionCategory.Surprise,
        title: "Unexpected Day",
        aiSummary: "Life is full of little surprises.",
        events: [
            { text: "A friend's gesture,\nmakes me feel remembered", emotions: [StaffEmotionCategory.Surprise, StaffEmotionCategory.Joy], timeRange: "09:00-10:00" },
            { text: "The appearance of an old friend,\nbrings familiar warmth", emotions: [StaffEmotionCategory.Surprise, StaffEmotionCategory.Joy], timeRange: "13:00-14:00" },
            { text: "Discovering a cozy little shop,\na small surprise in life", emotions: [StaffEmotionCategory.Surprise, StaffEmotionCategory.Digest], timeRange: "16:00-17:00" }
        ]
    },
    // Day 6: Anger (1天前) -> Group 3 (Wait, typically yest/day-before is Group 3. Let's check grouping later)
    {
        emotion: StaffEmotionCategory.Anger,
        title: "Challenging Day",
        aiSummary: "It's okay to feel angry sometimes.",
        events: [
            { text: "Work pressure makes me irritable,\nallowing myself to have emotions", emotions: [StaffEmotionCategory.Anger, StaffEmotionCategory.Sadness], timeRange: "09:00-10:00" },
            { text: "Exercise releases emotions,\nfeeling the connection between body and mind", emotions: [StaffEmotionCategory.Anger, StaffEmotionCategory.Joy], timeRange: "17:00-18:00" },
            { text: "Finding peace at night,\nreconciling with emotions is also growth", emotions: [StaffEmotionCategory.Digest, StaffEmotionCategory.Joy], timeRange: "20:00-21:00" }
        ]
    },
    // Day 7: Joy (今天) -> Group 4
    {
        emotion: StaffEmotionCategory.Joy,
        title: "Inspiration Day",
        aiSummary: "Your creativity is flowing today!",
        events: [
            { text: "Clear thoughts in the morning,\nrecording new ideas makes me happy", emotions: [StaffEmotionCategory.Joy, StaffEmotionCategory.Surprise], timeRange: "08:00-09:00" },
            { text: "Completing works,\nis a beautiful moment of deep conversation with myself", emotions: [StaffEmotionCategory.Joy], timeRange: "14:00-15:00" },
            { text: "Communicating with people who understand you,\nfeeling seen is warm and firm", emotions: [StaffEmotionCategory.Joy, StaffEmotionCategory.Digest], timeRange: "18:00-19:00" }
        ]
    }
];

export const CollectionDataUtils = {

    /**
     * 生成过去 7 天的完整 Mock 数据 (Scores)
     * 这些数据将成为 App 的"假数据"基础，也用于 CollectionScreen 展示
     */
    generateSevenDaysScores: (): Score[] => {
        const scores: Score[] = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        DAY_THEMES.forEach((theme, index) => {
            // Index 0 is 6 days ago, Index 6 is Today
            const dayOffset = -(6 - index);
            const date = new Date(today);
            date.setDate(today.getDate() + dayOffset);

            const score = generateScoreForTheme(date, theme, index);
            scores.push(score);
        });

        // 按时间倒序排列 (最新的在最前) ? 或者按需要。CollectionScreen 内部会有分组逻辑。
        // 这里返回原始列表 (升序或降序不重要，后续会按日期处理)
        return scores.reverse(); // 让最新的在前面，方便 HomeScreen 展示
    },

    /**
     * 将 Score 列表分组为 CollectionScreen 所需的 4 个分组
     * Group 1: 7-6天前
     * Group 2: 5-4天前
     * Group 3: 前天 & 昨天
     * Group 4: 今天
     */
    groupScores: (scores: Score[]): DayGroupSummary[] => {
        const groups: DayGroupSummary[] = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Helper to check days diff
        const getDaysDiff = (d: Date) => {
            const target = new Date(d);
            target.setHours(0, 0, 0, 0);
            const diffTime = today.getTime() - target.getTime();
            return Math.floor(diffTime / (1000 * 60 * 60 * 24));
        };

        // Initialize 4 Groups
        // Group 定义依据 iOS:
        // Group 1: Days 6 & 7 (Indices 0, 1 in reverse? No, Days Ago 6 & 5? Let's stick to iOS logic)
        // iOS Logic:
        // dayThemes[0] (Sadness -6d) -> ?
        // dayThemes[6] (Joy Today) -> Group 4

        // Let's iterate scores and bucket them.
        const bucket: Record<number, Score[]> = { 0: [], 1: [], 2: [], 3: [] };

        scores.forEach(score => {
            if (!score.createdAt) return;
            const dateParts = score.createdAt.split('.'); // "2024.01.20"
            const date = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
            const diff = getDaysDiff(date); // 0 = today, 1 = yesterday...6 = 6 days ago

            // Group 4: Today (Day 7, Index 6) -> diff = 0
            if (diff === 0) bucket[3].push(score);

            // Group 3: Yesterday & Day Before (Day 6 & 5, Index 5 & 4) -> diff = 1, 2
            else if (diff <= 2) bucket[2].push(score);

            // Group 2: Day 4 & 3 (Index 3 & 2) -> diff = 3, 4
            else if (diff <= 4) bucket[1].push(score);

            // Group 1: Day 2 & 1 (Index 1 & 0) -> diff = 5, 6
            else if (diff <= 6) bucket[0].push(score);
        });

        // Build Summary Objects with explicit Theme Mapping
        // Map Group Index to Representative Theme Index in DAY_THEMES
        // Group 3 (Today) -> uses DAY_THEMES[6]
        // Group 2 (1-2 days ago) -> uses DAY_THEMES[5] (Surprise) or 4
        // Group 1 (3-4 days ago) -> uses DAY_THEMES[3] (Joy)
        // Group 0 (5-6 days ago) -> uses DAY_THEMES[1] (Joy)
        const themeMapping: Record<number, number> = {
            3: 6, // Today -> Inspiration Day
            2: 5, // Yest -> Unexpected Day (Surprise)
            1: 3, // 3d ago -> Happy Weekend (Joy)
            0: 1  // 5d ago -> Sunny Day (Joy)
        };

        for (let i = 0; i < 4; i++) {
            const groupScores = bucket[i];

            // 默认值
            let summary = "Keep going!";
            let domEmotion = StaffEmotionCategory.Joy;
            let noteIcons: string[] = [];

            // If we have data, double check, otherwise fallback to Theme default
            if (groupScores.length > 0) {
                // Use Theme mapping to decide dominant info
                const themeIdx = themeMapping[i];
                const theme = DAY_THEMES[themeIdx];

                domEmotion = theme.emotion;
                summary = theme.aiSummary;

                // Generate icons: If the group matches a theme, use that theme's emotion.
                // Otherwise calculate from scores. Since this is mock, we trust the theme.
                // We want 2-3 icons.
                noteIcons = [`Staff_${domEmotion}_1`, `Staff_${domEmotion}_2`];
            }

            groups.push({
                groupIndex: i,
                groupName: `group${i + 1}`,
                dayRange: [],
                creations: groupScores,
                dominantEmotion: domEmotion,
                emotionDistribution: {},
                noteIcons: noteIcons,
                aiSummary: summary,
                summaryGeneratedAt: new Date()
            });
        }

        return groups;
    }
};

// --- Private Helpers ---

const generateScoreForTheme = (date: Date, theme: DayTheme, index: number): Score => {
    // 1. Generate Music Segments
    const segments: MusicSegmentInfo[] = theme.events.map((evt, idx) => {
        const timeWindow = parseTimeRange(date, evt.timeRange);
        return {
            id: `seg-${index}-${idx}`,
            timeWindow: timeWindow,
            eventText: evt.text,
            emotions: evt.emotions,
            audioFilePath: mapEmotionToAudio(evt.emotions[0]),
            duration: 15,
            order: idx
        };
    });

    // 2. Generate Staff Staves
    const staves: StaffScore[] = segments.map((seg, idx) =>
        StaffScoreToolkit.generateStaffForEvent(seg.emotions)
    );

    // 3. Construct Score
    return {
        id: `mock-score-${index}`,
        title: theme.title,
        createdAt: formatDate(date),
        composerText: "Joy", // User
        arrangerText: "AI Partner",

        musicSegments: segments,
        staves: staves,
        staffScore: { staves },

        // Extra props for HomeScreen compatibility
        // @ts-ignore
        emotion: theme.emotion.toLowerCase(), // 'joy', 'sadness' maps to lower for HomeCard
        coverImageName: `MoodMapView_${theme.emotion}`
    };
};

const parseTimeRange = (date: Date, range: string): TimeWindow => {
    // "09:00-10:00"
    const [startStr, endStr] = range.split('-');
    const parseTime = (str: string) => {
        const d = new Date(date);
        const [h, m] = str.split(':').map(Number);
        d.setHours(h, m, 0, 0);
        return d;
    };
    return {
        startTime: parseTime(startStr),
        endTime: parseTime(endStr)
    };
};

const mapEmotionToAudio = (e: StaffEmotionCategory) => {
    return `${e.toString()}.mp3`;
};

const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}.${m}.${d}`;
};
