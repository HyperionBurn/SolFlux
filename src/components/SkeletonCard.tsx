/**
 * SkeletonCard — animated shimmer placeholder for loading states
 */
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { colors, borderRadius, spacing } from '../config/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - spacing.md * 2;

export function SkeletonCard() {
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerAnim, {
                    toValue: 1,
                    duration: 1200,
                    useNativeDriver: true,
                }),
                Animated.timing(shimmerAnim, {
                    toValue: 0,
                    duration: 1200,
                    useNativeDriver: true,
                }),
            ])
        );
        loop.start();
        return () => loop.stop();
    }, []);

    const opacity = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <View style={styles.card}>
            <Animated.View style={[styles.imagePlaceholder, { opacity }]} />
            <View style={styles.body}>
                <Animated.View style={[styles.titlePlaceholder, { opacity }]} />
                <Animated.View style={[styles.subtitlePlaceholder, { opacity }]} />
                <View style={styles.row}>
                    <Animated.View style={[styles.badgePlaceholder, { opacity }]} />
                    <Animated.View style={[styles.badgePlaceholder, { opacity, width: 60 }]} />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.card,
        borderRadius: borderRadius.lg,
        marginHorizontal: spacing.md,
        marginBottom: spacing.md,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    imagePlaceholder: {
        width: CARD_WIDTH,
        height: 200,
        backgroundColor: colors.surfaceElevated,
    },
    body: {
        padding: spacing.md,
    },
    titlePlaceholder: {
        width: '70%',
        height: 16,
        backgroundColor: colors.surfaceElevated,
        borderRadius: borderRadius.sm,
        marginBottom: spacing.sm,
    },
    subtitlePlaceholder: {
        width: '50%',
        height: 12,
        backgroundColor: colors.surfaceElevated,
        borderRadius: borderRadius.sm,
        marginBottom: spacing.md,
    },
    row: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    badgePlaceholder: {
        width: 80,
        height: 24,
        backgroundColor: colors.surfaceElevated,
        borderRadius: borderRadius.full,
    },
});
