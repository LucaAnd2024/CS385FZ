import { Dimensions } from 'react-native';

export enum StaffEmotionCategory {
    Joy = 'Joy',
    Anger = 'Anger',
    Sadness = 'Sadness',
    Surprise = 'Surprise',
    Digest = 'Digest',
    Fear = 'Fear',
}

export interface StaffNote {
    id: string;
    category: StaffEmotionCategory;
    variant: number; // 1 or 2
    staffPosition: number; // 0..1 (Y axis relative position)
    xPercent: number; // 0..1 (X axis relative position)
    size: number;
    assetName: string;
    section: 'Upper' | 'Lower';
}

export interface StaffScore {
    id: string;
    notes: StaffNote[];
    upperEmotion: StaffEmotionCategory;
    lowerEmotion: StaffEmotionCategory;
    createdAt: number;
}

export interface StaffNoteLayout {
    xPositions: number[];
    upperYCenter: number;
    lowerYCenter: number;
    yJitter: number;
}

const DEFAULT_LAYOUT: StaffNoteLayout = {
    xPositions: [0.30, 0.50, 0.70, 0.90],
    upperYCenter: 0.80,
    lowerYCenter: 0.15,
    yJitter: 0.15,
};

export class StaffScoreToolkit {
    /**
     * 生成 UUID
     */
    private static generateUUID(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * 生成随机抖动值
     */
    private static jitter(base: number, span: number): number {
        const delta = (Math.random() * 2 - 1) * span; // -span to +span
        return Math.min(Math.max(base + delta, 0), 1);
    }

    /**
     * 随机选择变体 (1 或 2)
     */
    private static pickVariants(count: number): number[] {
        return Array.from({ length: count }, () => Math.floor(Math.random() * 2) + 1);
    }

    /**
     * 获取资源名称
     */
    public static getAssetName(category: StaffEmotionCategory, variant: number): string {
        return `Staff_${category}_${variant}`;
    }

    /**
     * 生成一段五线谱数据
     */
    public static generateStaffForEvent(
        emotions: StaffEmotionCategory[],
        layout: StaffNoteLayout = DEFAULT_LAYOUT
    ): StaffScore {
        let upperEmotion: StaffEmotionCategory;
        let lowerEmotion: StaffEmotionCategory;

        if (emotions.length > 0) {
            upperEmotion = emotions[0];
            lowerEmotion = emotions.length >= 2 ? emotions[1] : emotions[0];
        } else {
            // Default fallback
            upperEmotion = StaffEmotionCategory.Joy;
            lowerEmotion = StaffEmotionCategory.Joy;
        }

        const upperVariants = this.pickVariants(layout.xPositions.length);
        const lowerVariants = this.pickVariants(layout.xPositions.length);

        const notes: StaffNote[] = [];

        // Generate Upper Notes
        layout.xPositions.forEach((x, index) => {
            const v = upperVariants[index];
            const pos = this.jitter(layout.upperYCenter, layout.yJitter);

            notes.push({
                id: this.generateUUID(),
                category: upperEmotion,
                variant: v,
                staffPosition: pos,
                xPercent: x,
                size: 1.0,
                assetName: this.getAssetName(upperEmotion, v),
                section: 'Upper'
            });
        });

        // Generate Lower Notes
        layout.xPositions.forEach((x, index) => {
            const v = lowerVariants[index];
            const pos = this.jitter(layout.lowerYCenter, layout.yJitter);

            notes.push({
                id: this.generateUUID(),
                category: lowerEmotion,
                variant: v,
                staffPosition: pos,
                xPercent: x,
                size: 1.0,
                assetName: this.getAssetName(lowerEmotion, v),
                section: 'Lower'
            });
        });

        return {
            id: this.generateUUID(),
            notes: notes,
            upperEmotion: upperEmotion,
            lowerEmotion: lowerEmotion,
            createdAt: Date.now()
        };
    }
}

// Helper for Color Mapping
export const getEmotionColor = (emotion: StaffEmotionCategory): string => {
    switch (emotion) {
        // Updated colors to match CollectionRoomView colors (approx)
        case StaffEmotionCategory.Joy: return '#F9CE5C'; // Yellow
        case StaffEmotionCategory.Sadness: return '#93A5E3'; // Blue
        case StaffEmotionCategory.Anger: return '#D86565'; // Red
        case StaffEmotionCategory.Fear: return '#9178C5'; // Purple
        case StaffEmotionCategory.Surprise: return '#E6A0C4'; // Pink
        case StaffEmotionCategory.Digest: return '#5C9A93'; // Green
        default: return '#BBBBBB';
    }
};
