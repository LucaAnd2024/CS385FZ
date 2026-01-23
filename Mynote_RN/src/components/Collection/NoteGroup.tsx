import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { DayGroupSummary } from '../../utils/CollectionDataUtils';
// import { SvgUri } from 'react-native-svg'; // If using remote SVGs
// For local SVGs via transformer, we import them directly.
// But names are dynamic strings "Staff_Joy_1". We need a mapper.

// We need a way to map string names to required assets.
import { StaffAssets } from '../../utils/StaffAssets'; // Wrapper needed?

// Let's assume we have a utility to get image source by name.
// Since imports in RN must be static or require(), dynamic require is tricky.
// Better approach: create a map in a separate file `src/utils/StaffAssets.ts`.

interface NoteGroupProps {
    group: DayGroupSummary;
    positions: { x: number; y: number; scale: number }[];
    containerWidth: number;
    containerHeight: number;
    onToggleDialog: (groupName: string) => void;
}

const NoteGroup: React.FC<NoteGroupProps> = ({ group, positions, containerWidth, containerHeight, onToggleDialog }) => {
    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
            {group.noteIcons.map((iconName, index) => {
                if (index >= positions.length) return null;
                const pos = positions[index];

                // Get Image Source
                const IconComponent = StaffAssets[iconName];
                // Fallback if icon missing
                if (!IconComponent) return null;

                const size = containerWidth * pos.scale;

                return (
                    <TouchableOpacity
                        key={`${group.groupName}-note-${index}`}
                        style={{
                            position: 'absolute',
                            left: containerWidth * pos.x,
                            top: containerHeight * pos.y,
                            width: size,
                            height: size,
                        }}
                        onPress={() => onToggleDialog(group.groupName)}
                    >
                        <IconComponent width="100%" height="100%" />
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

export default NoteGroup;
