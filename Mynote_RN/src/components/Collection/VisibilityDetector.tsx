import React, { useEffect, useState } from 'react';
import { View, LayoutChangeEvent } from 'react-native';

interface VisibilityDetectorProps {
    scrollY: number; // Current scroll offset of ScrollView
    viewportHeight: number; // Height of the visible area (screen height)
    targetY: number; // The absolute Y position of the target in the long background
    threshold?: number; // Detection threshold (percentage of viewport)
    onVisibilityChange: (isVisible: boolean) => void;
}

const VisibilityDetector: React.FC<VisibilityDetectorProps> = ({
    scrollY,
    viewportHeight,
    targetY,
    threshold = 0.6, // Default: Item is visible if it's around the 60% mark of the screen
    onVisibilityChange
}) => {
    // Simple logic: check if targetY is within [scrollY + topBuffer, scrollY + bottomBuffer]
    // "Visible" here might mean "Active" (triggering the dialog).
    // Let's define "Active" as being in the middle area of the screen.
    // e.g., between 20% and 80% of current viewport.

    useEffect(() => {
        const relativeY = targetY - scrollY;
        const screenTop = viewportHeight * 0.2;
        const screenBottom = viewportHeight * 0.8;

        const isVisible = relativeY >= screenTop && relativeY <= screenBottom;
        onVisibilityChange(isVisible);
    }, [scrollY, viewportHeight, targetY]);

    return null; // This is a logic component, no UI rendering
};

export default VisibilityDetector;
