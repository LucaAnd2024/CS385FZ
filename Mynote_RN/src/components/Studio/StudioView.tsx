import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';

interface StudioViewProps {
    onTap: () => void;
}

export const StudioView: React.FC<StudioViewProps> = ({ onTap }) => {
    return (
        <TouchableOpacity style={styles.container} onPress={onTap} activeOpacity={1}>
            <View style={styles.content}>
                <Image 
                    source={require('../../assets/images/DoDo.png')} 
                    style={styles.image}
                    resizeMode="contain"
                />
                <Text style={styles.text}>
                Click any spot on the screen{'\n'}let your today’s music journey begin！
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    content: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 140,
    },
    image: {
        width: 160,
        height: 160,
        marginBottom: 16,
    },
    text: {
        fontSize: 14,
        color: 'gray',
        textAlign: 'center',
        lineHeight: 20,
        fontWeight: '500',
    }
});
