import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, Dimensions } from 'react-native';
import { StudioInputMode } from '../../hooks/useStudioInputMode';

interface StudioBottomBarProps {
    inputMode: StudioInputMode;
    inputText: string;
    onChangeText: (text: string) => void;
    onEnterTextInput: () => void;
    onEnterVoiceOff: () => void;
    onStartVoiceOn: () => void;
    onCancelVoiceOn: () => void;
    onSendText: () => void;
    onSendVoice: () => void;
    onEndConversation: () => void;
}

const BUTTON_SIZE = 50;
const SMALL_BUTTON_SIZE = 45;

export const StudioBottomBar: React.FC<StudioBottomBarProps> = ({
    inputMode,
    inputText,
    onChangeText,
    onEnterTextInput,
    onEnterVoiceOff,
    onStartVoiceOn,
    onCancelVoiceOn,
    onSendText,
    onSendVoice,
    onEndConversation,
}) => {

    // 1. 文字引导状态
    if (inputMode === StudioInputMode.TextGuide) {
        return (
            <TouchableOpacity style={styles.guideContainer} onPress={onEnterTextInput}>
                <Text style={styles.guideTextBlack}>Strike up a chat with our AI Conductor</Text>
                <Text style={styles.guideTextGold}> DoDo </Text>

            </TouchableOpacity>
        );
    }

    // 2. 文字输入状态
    if (inputMode === StudioInputMode.TextInput) {
        return (
            <View style={styles.rowContainer}>
                {/* Left: Mic */}
                <TouchableOpacity style={styles.squareButton} onPress={onEnterVoiceOff}>
                    <Image source={require('../../assets/images/chat_micro_send_off.png')} style={styles.iconSmall} />
                </TouchableOpacity>

                {/* Center: Input */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Type something..."
                        placeholderTextColor="#93A5E3"
                        value={inputText}
                        onChangeText={onChangeText}
                    />
                    <TouchableOpacity onPress={onSendText}>
                        <Image 
                            source={inputText.trim() ? require('../../assets/images/chat_text_send_on.png') : require('../../assets/images/chat_text_send_off.png')} 
                            style={styles.iconMedium} 
                        />
                    </TouchableOpacity>
                </View>

                {/* Right: End */}
                <TouchableOpacity style={styles.squareButton} onPress={onEndConversation}>
                    <Image source={require('../../assets/images/chat_over.png')} style={styles.iconSmall} />
                </TouchableOpacity>
            </View>
        );
    }

    // 3. 语音待机状态
    if (inputMode === StudioInputMode.VoiceOff) {
        return (
            <View style={styles.rowContainer}>
                {/* Left: Text */}
                <TouchableOpacity style={styles.squareButtonSmall} onPress={onEnterTextInput}>
                    <Image source={require('../../assets/images/chat_text_off_icon.png')} style={styles.iconSmall} />
                </TouchableOpacity>

                {/* Center: Mic (Hold to Record) */}
                <TouchableOpacity 
                    style={styles.micButton} 
                    onLongPress={onStartVoiceOn}
                    delayLongPress={150} // 稍微延迟防误触
                    onPress={() => console.log('Tap mic hint: hold to record')}
                >
                    <Image source={require('../../assets/images/chat_micro_send_off.png')} style={styles.iconMedium} />
                </TouchableOpacity>

                {/* Right: End */}
                <TouchableOpacity style={styles.squareButtonSmall} onPress={onEndConversation}>
                    <Image source={require('../../assets/images/chat_over.png')} style={styles.iconSmall} />
                </TouchableOpacity>
            </View>
        );
    }

    // 4. 语音录制状态
    if (inputMode === StudioInputMode.VoiceOn) {
        return (
            <View style={styles.rowContainer}>
                {/* Left: Text (Cancel) */}
                <TouchableOpacity style={styles.squareButtonSmall} onPress={() => {
                    onCancelVoiceOn();
                    onEnterTextInput();
                }}>
                    <Image source={require('../../assets/images/chat_text_on_icon.png')} style={styles.iconMedium} />
                </TouchableOpacity>

                {/* Center: Waveform (Release to Send) */}
                <TouchableOpacity 
                    style={styles.micButtonActive} 
                    onPressOut={onSendVoice} // 简单模拟松手发送
                >
                    <Text style={{color: '#666', fontSize: 10}}>Recording...</Text>
                </TouchableOpacity>

                {/* Right: Cancel */}
                <TouchableOpacity style={styles.squareButtonSmall} onPress={onCancelVoiceOn}>
                    <Image source={require('../../assets/images/chat_micro_send_cancel.png')} style={styles.iconMedium} />
                </TouchableOpacity>
            </View>
        );
    }

    return null;
};

const styles = StyleSheet.create({
    guideContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 60,
        paddingVertical: 14,
        paddingHorizontal: 20,
        width: 260,
        height: 50,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        marginBottom: 40,
    },
    guideTextBlack: {
        fontSize: 11,
        color: '#000',
        fontWeight: '500',
    },
    guideTextGold: {
        fontSize: 11,
        color: '#F9CE5C',
        fontWeight: '500',
    },
    rowContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 40,
    },
    squareButton: {
        width: BUTTON_SIZE,
        height: BUTTON_SIZE,
        borderRadius: BUTTON_SIZE / 2, // Circle actually
        backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    squareButtonSmall: {
        width: SMALL_BUTTON_SIZE,
        height: SMALL_BUTTON_SIZE,
        borderRadius: SMALL_BUTTON_SIZE / 2,
        backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 60,
        height: 50,
        width: 200, // min 180, max 260
        paddingHorizontal: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    textInput: {
        flex: 1,
        fontSize: 14,
        color: '#333',
        height: '100%',
    },
    micButton: {
        width: BUTTON_SIZE,
        height: BUTTON_SIZE,
        borderRadius: BUTTON_SIZE / 2,
        backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    micButtonActive: {
        width: BUTTON_SIZE,
        height: BUTTON_SIZE,
        borderRadius: BUTTON_SIZE / 2,
        backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#F9CE5C', // Active border
    },
    iconSmall: {
        width: 18,
        height: 18,
        resizeMode: 'contain',
    },
    iconMedium: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
    }
});
