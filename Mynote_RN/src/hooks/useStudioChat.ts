import { useState, useCallback, useEffect, useRef } from 'react';
import { StaffEmotionCategory } from '../utils/StaffScoreToolkit';
import { DemoConversationData, ConversationAnswer } from '../utils/DemoConversationData';
import { ChatRecord } from '../services/api';


export interface AIResponse {
    text: string;
    emotions: StaffEmotionCategory[];
    action: 'continueNextTimeSlot' | 'continueCurrentTopic' | 'endConversation';
}

// 模拟 Demo 模式开关
const IS_DEMO_MODE = true;

export const useStudioChat = () => {
    // UI States
    const [showAIChat, setShowAIChat] = useState(false); // 提问气泡
    const [showAIResponse, setShowAIResponse] = useState(false); // 回复卡片
    const [showVoicePopup, setShowVoicePopup] = useState(false); // 录音弹窗
    const [isProcessing, setIsProcessing] = useState(false);

    // Data
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [aiQuestion, setAiQuestion] = useState(
        IS_DEMO_MODE
            ? DemoConversationData.demoQuestions[0]
            : "Hi, Joy! Tell me about your day."
    );
    const [aiResponseText, setAiResponseText] = useState<string | null>(null);
    const [lastEmotions, setLastEmotions] = useState<StaffEmotionCategory[]>([]);
    const [nextQuestionText, setNextQuestionText] = useState<string | null>(null);
    const [conversationAction, setConversationAction] = useState<'continueNextTimeSlot' | 'continueCurrentTopic' | 'endConversation'>('continueNextTimeSlot');
    const [conversationEnded, setConversationEnded] = useState(false);

    // History Tracking
    const [chatHistory, setChatHistory] = useState<ChatRecord[]>([]);

    // Actions

    const startConversation = useCallback(() => {
        setTimeout(() => {
            setShowAIChat(true);
        }, 500);
    }, []);

    const processUserInput = useCallback(async (input: string): Promise<AIResponse> => {
        // 1. Hide Question Bubble
        setShowAIChat(false);
        setIsProcessing(true);

        // Simulate AI delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        let responseText = "";
        let emotions: StaffEmotionCategory[] = [];
        let nextQ: string | undefined = undefined;
        let action: 'continueNextTimeSlot' | 'continueCurrentTopic' | 'endConversation' = 'continueNextTimeSlot';

        if (IS_DEMO_MODE) {
            // Demo Logic
            const answer: ConversationAnswer | null = DemoConversationData.matchAnswer(input, currentQuestionIndex);

            if (answer) {
                responseText = answer.responseContent;
                emotions = answer.emotions.map(e => e.category);
                nextQ = answer.nextQuestion;
                action = answer.conversationAction;
            } else {
                // Fallback if no match (shouldn't happen with defaultAnswer)
                responseText = "I see. Tell me more.";
                emotions = [StaffEmotionCategory.Joy];
                action = 'continueNextTimeSlot';
            }
        } else {
            // Mock AI Logic (Random)
            const allEmotions = Object.values(StaffEmotionCategory);
            const e1 = allEmotions[Math.floor(Math.random() * allEmotions.length)];
            const e2 = allEmotions[Math.floor(Math.random() * allEmotions.length)];

            responseText = `我听到了你的故事！\n"${input}"\n这感觉像是 ${e1} 和 ${e2} 的旋律。`;
            emotions = [e1, e2];
            nextQ = "What happened next?";
            action = 'continueNextTimeSlot';
        }

        setAiResponseText(responseText);
        setLastEmotions(emotions);
        setNextQuestionText(nextQ || null); // Store next question for next round
        setConversationAction(action);
        setIsProcessing(false);

        // Record History
        const newRecord: ChatRecord = {
            id: Date.now().toString(),
            question: aiQuestion,
            userAnswer: input,
            aiResponse: responseText,
            emotions: emotions,
            timestamp: Date.now()
        };
        setChatHistory(prev => [...prev, newRecord]);

        // 2. Show Response Card (Delayed)

        setTimeout(() => {
            setShowAIResponse(true);
        }, 500);

        return { text: responseText, emotions, action };
    }, [currentQuestionIndex]);

    const nextRound = useCallback(() => {
        // Hide Response Card
        setShowAIResponse(false);

        // 移除自动结束逻辑
        // if (conversationAction === 'endConversation') {
        //     setConversationEnded(true);
        //     return;
        // }

        if (nextQuestionText) {
            setAiQuestion(nextQuestionText);
            setCurrentQuestionIndex(prev => prev + 1);

            setTimeout(() => {
                setShowAIChat(true);
            }, 300);
        } else {
            // Fallback end
            console.log("No more questions in Demo Mode");
            // setConversationEnded(true); // 也不要自动结束
        }
    }, [nextQuestionText, conversationAction]);

    // Automatic Countdown Effect
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (showAIResponse) {
            timer = setTimeout(() => {
                nextRound();
            }, 3000); // 3 seconds delay before next question
        }
        return () => clearTimeout(timer);
    }, [showAIResponse, nextRound]);

    const generateDailyMusic = useCallback(async () => {
        setIsProcessing(true);
        await new Promise(resolve => setTimeout(resolve, 3000));
        setIsProcessing(false);
        return "https://example.com/music.mp3";
    }, []);

    return {
        showAIChat,
        showAIResponse,
        showVoicePopup,
        setShowVoicePopup,
        isProcessing,
        aiQuestion,
        aiResponseText,
        lastEmotions,
        chatHistory, // Expose history
        conversationEnded, // Expose this

        startConversation,
        processUserInput,
        nextRound,
        generateDailyMusic,
        aiHealthDataText: IS_DEMO_MODE && DemoConversationData.conversationScenarios[currentQuestionIndex]
            ? DemoConversationData.conversationScenarios[currentQuestionIndex].healthDataText
            : "Health Data Reading...",
    };
};
