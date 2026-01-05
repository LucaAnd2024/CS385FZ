import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../store/AuthContext';

const { width, height } = Dimensions.get('window');

const AuthScreen = () => {
    const navigation = useNavigation();
    const { signIn, loading } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const handleLogin = async () => {
        try {
            await signIn({ login: email, password });
        } catch (e) {
            alert('Login Failed: ' + (e instanceof Error ? e.message : String(e)));
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.sheetContainer}>
                {/* Title */}
                <Text style={styles.title}>登录</Text>

                {/* Inputs */}
                <View style={styles.inputContainer}>
                    {/* Email */}
                    <View style={styles.inputWrapper}>
                        <Image source={require('../assets/images/InputBack.png')} style={styles.inputBackground} />
                        <TextInput
                            style={styles.input}
                            placeholder="输入手机号/邮箱"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                        />
                    </View>

                    {/* Password */}
                    <View style={styles.inputWrapper}>
                        <Image source={require('../assets/images/InputBack.png')} style={styles.inputBackground} />
                        <View style={styles.passwordRow}>
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                placeholder="输入密码"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!isPasswordVisible}
                            />
                            <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon}>
                                <Text>{isPasswordVisible ? 'Hide' : 'Show'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Register Link */}
                <View style={styles.registerContainer}>
                    <Text style={styles.grayText}>没有账号？ </Text>
                    <TouchableOpacity>
                        <Text style={styles.blueText}>注册</Text>
                    </TouchableOpacity>
                </View>

                {/* Login Button */}
                <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
                    <Text style={styles.loginButtonText}>{loading ? 'Logging in...' : '登录'}</Text>
                </TouchableOpacity>

                {/* Social Login / Divider */}
                <View style={styles.divider}>
                    <View style={styles.line} />
                    <Text style={styles.orText}>或</Text>
                    <View style={styles.line} />
                </View>

                {/* Admin Secret Hint */}
                <Text style={{ textAlign: 'center', marginTop: 10, color: '#ccc' }}>Test: admin / 123456</Text>

            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.1)', // Overlay effect
        justifyContent: 'center',
        alignItems: 'center',
    },
    sheetContainer: {
        width: width * 0.9,
        backgroundColor: 'white',
        borderRadius: 40,
        padding: 30,
        // Shadow
        shadowColor: '#B8C1E3',
        shadowOffset: { width: 0, height: -7 },
        shadowOpacity: 0.5,
        shadowRadius: 26,
        elevation: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
    },
    inputContainer: {
        gap: 15,
    },
    inputWrapper: {
        height: 50,
        width: '100%',
        borderRadius: 12,
        overflow: 'hidden',
        justifyContent: 'center',
    },
    inputBackground: {
        ...StyleSheet.absoluteFillObject,
        width: '100%',
        height: '100%',
        opacity: 0.5,
    },
    input: {
        paddingHorizontal: 15,
        fontSize: 16,
        height: '100%',
    },
    passwordRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 10,
    },
    eyeIcon: {
        padding: 5,
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 15,
        marginBottom: 20,
    },
    grayText: { color: 'gray', fontSize: 12 },
    blueText: { color: '#6F8CF0', fontSize: 12 },
    loginButton: {
        backgroundColor: '#EEF2FF', // Color(red: 0.93, green: 0.95, blue: 1.0)
        paddingVertical: 15,
        borderRadius: 40,
        alignItems: 'center',
    },
    loginButtonText: {
        fontWeight: '600',
        color: 'black',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
        paddingHorizontal: 10,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: '#93A5E3',
    },
    orText: {
        marginHorizontal: 10,
        color: '#93A5E3',
    },
});

export default AuthScreen;
