import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import { StaffNote } from '../../utils/StaffScoreToolkit';
import { StaffAssets } from '../../utils/StaffAssets';

interface StaffViewProps {
    notes: StaffNote[];
    width?: number;
    height?: number;
}

const DEFAULT_HEIGHT = 140;
const PADDING_TOP = 24;
const PADDING_BOTTOM = 24;
const NOTE_BASE_SIZE = 48;

export const StaffView: React.FC<StaffViewProps> = ({ 
    notes, 
    width = Dimensions.get('window').width, 
    height = DEFAULT_HEIGHT 
}) => {
    
    const usableHeight = height - PADDING_TOP - PADDING_BOTTOM;

    return (
        <View style={[styles.container, { width, height }]}>
            {/* 五线谱背景 */}
            <Image 
                source={require('../../assets/images/StudioStaff.png')} 
                style={styles.backgroundImage}
                resizeMode="contain"
            />

            {/* 音符渲染 */}
            {notes.map((note) => {
                const AssetComponent = StaffAssets[note.assetName];
                
                if (!AssetComponent) {
                    console.warn(`StaffView: Asset not found for ${note.assetName}`);
                    return null;
                }

                // 计算位置
                // iOS: let y = (canvasSize.height - bottomPadding) - (t * usableHeight)
                // staffPosition 0..1 (0 is bottom, 1 is top)
                const t = Math.min(Math.max(note.staffPosition, 0), 1);
                const y = (height - PADDING_BOTTOM) - (t * usableHeight);
                const x = width * note.xPercent;

                // 居中修正：音符坐标通常指中心点，需要减去一半宽高
                const size = NOTE_BASE_SIZE * note.size;
                const left = x - size / 2;
                const top = y - size / 2;

                return (
                    <View 
                        key={note.id}
                        style={[
                            styles.noteContainer,
                            {
                                left,
                                top,
                                width: size,
                                height: size,
                            }
                        ]}
                    >
                        <AssetComponent width={size} height={size} />
                    </View>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backgroundImage: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    noteContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        // Shadow for depth (iOS style)
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    }
});
