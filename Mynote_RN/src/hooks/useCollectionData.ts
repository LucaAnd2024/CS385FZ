import { useState, useEffect } from 'react';
import { Score, coreApi } from '../services/api';
import { CollectionDataUtils, DayGroupSummary } from '../utils/CollectionDataUtils';

// 模拟 API 数据标志 (Phase 3 阶段我们强制使用 Mock)
const USE_MOCK_DATA = true;

export const useCollectionData = () => {
    const [scores, setScores] = useState<Score[]>([]);
    const [dayGroups, setDayGroups] = useState<DayGroupSummary[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        try {
            let fetchedScores: Score[] = [];

            if (USE_MOCK_DATA) {
                // 使用刚刚创建的 7 天剧本数据
                fetchedScores = CollectionDataUtils.generateSevenDaysScores();
                console.log("[useCollectionData] Loaded 7 days mock scores:", fetchedScores.length);
            } else {
                // 真实 API
                const response = await coreApi.getScores();
                if (response?.data && Array.isArray(response.data)) {
                    fetchedScores = response.data;
                }
            }

            setScores(fetchedScores);

            // 分组逻辑
            const groups = CollectionDataUtils.groupScores(fetchedScores);
            setDayGroups(groups);

        } catch (error) {
            console.error("Failed to load collection data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    return {
        scores,
        dayGroups,
        loading,
        refresh: loadData
    };
};
