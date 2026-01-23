import { useState, useCallback } from 'react';

export enum StudioInputMode {
    TextGuide = 'TextGuide',
    TextInput = 'TextInput',
    VoiceOff = 'VoiceOff',
    VoiceOn = 'VoiceOn',
}

export const useStudioInputMode = () => {
    const [inputMode, setInputMode] = useState<StudioInputMode>(StudioInputMode.TextGuide);
    const [inputText, setInputText] = useState('');

    const enterTextInput = useCallback(() => {
        setInputMode(StudioInputMode.TextInput);
    }, []);

    const enterVoiceOff = useCallback(() => {
        setInputMode(StudioInputMode.VoiceOff);
    }, []);

    const startVoiceOn = useCallback(() => {
        setInputMode(StudioInputMode.VoiceOn);
    }, []);

    const cancelVoiceOn = useCallback(() => {
        setInputMode(StudioInputMode.VoiceOff);
    }, []);

    const endConversation = useCallback(() => {
        // TODO: Trigger music generation
        console.log('End conversation triggered');
    }, []);

    return {
        inputMode,
        inputText,
        setInputText,
        enterTextInput,
        enterVoiceOff,
        startVoiceOn,
        cancelVoiceOn,
        endConversation,
    };
};
