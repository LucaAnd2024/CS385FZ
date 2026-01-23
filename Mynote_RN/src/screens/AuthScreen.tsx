import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions, ScrollView, ImageBackground, Alert } from 'react-native';
import { useAuth } from '../store/AuthContext';
import { EyeIcon } from '../components/EyeIcon';
import { AppleIcon } from '../components/AppleIcon';
import { GoogleIcon } from '../components/GoogleIcon';

const { width, height } = Dimensions.get('window');

const AuthScreen = () => {
    const { signIn, loading } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const handleLogin = async () => {
        try {
            await signIn({ login: email, password });
        } catch (e) {
            Alert.alert('登录失败', e instanceof Error ? e.message : String(e));
        }
    };

    return (
        <ImageBackground
            source={require('../assets/images/AuthScreenBackground.jpg')}
            style={styles.backgroundImage}
            resizeMode="cover"
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <ScrollView
                    contentContainerStyle={styles.container}
                    bounces={false}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Login Card */}
                    <View style={styles.loginCard}>
                        {/* Email Input */}
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="Email address or Phone number"
                                placeholderTextColor="#999"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>

                        {/* Password Input */}
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                placeholderTextColor="#999"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!isPasswordVisible}
                            />
                            <TouchableOpacity
                                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                                style={styles.eyeIcon}
                            >
                                <EyeIcon visible={isPasswordVisible} size={20} color="#93A5E3" />
                            </TouchableOpacity>
                        </View>

                        {/* Sign up Link */}
                        <View style={styles.signupContainer}>
                            <Text style={styles.noAccountText}>No account? </Text>
                            <TouchableOpacity>
                                <Text style={styles.signupText}>Sign up</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Log in Button */}
                        <TouchableOpacity
                            style={styles.loginButton}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            <Text style={styles.loginButtonText}>
                                {loading ? 'Logging in...' : 'Log in'}
                            </Text>
                        </TouchableOpacity>

                        {/* Divider */}
                        <View style={styles.divider}>
                            <View style={styles.line} />
                            <Text style={styles.orText}>or</Text>
                            <View style={styles.line} />
                        </View>

                        {/* Apple ID Button */}
                        <TouchableOpacity style={styles.socialButton}>
                            <AppleIcon size={20} color="#000" />
                            <Text style={styles.socialButtonText}>Use Apple ID</Text>
                        </TouchableOpacity>

                        {/* Google ID Button */}
                        <TouchableOpacity style={styles.socialButton}>
                            <GoogleIcon size={18} />
                            <Text style={styles.socialButtonText}>Use Google ID</Text>
                        </TouchableOpacity>

                        {/* Forget Password */}
                        <TouchableOpacity style={styles.forgetPasswordContainer}>
                            <Text style={styles.forgetPasswordText}>Forget password?</Text>
                        </TouchableOpacity>

                        {/* Test Account Hint */}
                        <View style={styles.testHintContainer}>
                            <Text style={styles.testHintText}>Test: admin / 123456</Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: width,
        height: height,
    },
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        // paddingTop: height * 0.23,
        paddingTop: 200,
    },
    loginCard: {
        backgroundColor: 'transparent',
        borderRadius: 30,
        marginHorizontal: 20,
        paddingHorizontal: 30,
        paddingVertical: 35,
    },
    loginTitle: {
        fontSize: 20,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 25,
        color: '#000',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 15,
        marginBottom: 15,
        height: 50,
        borderWidth: 1,
        borderColor: 'rgba(147, 165, 227, 0.36)',
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#000',
    },
    eyeIcon: {
        padding: 5,
        marginLeft: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 20,
        marginTop: -10,
    },
    noAccountText: {
        color: '#999',
        fontSize: 13,
    },
    signupText: {
        color: '#6F8CF0',
        fontSize: 13,
        fontWeight: '500',
    },
    loginButton: {
        // 原色值 #93A5E3 加上 36% 透明度的 Hex 代码 5C
        backgroundColor: '#93A5E35C',
        paddingVertical: 15,
        borderRadius: 25,
        alignItems: 'center',
        marginBottom: 10,
    },
    loginButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '600',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: '#D0D0D0',
    },
    orText: {
        marginHorizontal: 15,
        color: '#93A5E3',
        fontSize: 14,
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 25,
        marginBottom: 12,
        gap: 12,
        backgroundColor: '#93A5E35C',
    },
    socialButtonText: {
        color: '#000',
        fontSize: 15,
        fontWeight: '500',
    },
    forgetPasswordContainer: {
        alignItems: 'center',
        marginTop: 15,
    },
    forgetPasswordText: {
        color: '#999',
        fontSize: 13,
    },
    testHintContainer: {
        alignItems: 'center',
        marginTop: 20,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: 'rgba(147, 165, 227, 0.2)',
    },
    testHintText: {
        color: '#93A5E3',
        fontSize: 12,
    },
});

export default AuthScreen;
