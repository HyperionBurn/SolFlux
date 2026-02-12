/**
 * MomentCard — displays a moment in the feed
 */
import React from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { colors, borderRadius, spacing, typography } from '../config/theme';
import { Moment } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MomentCardProps {
    moment: Moment;
    onPress: (moment: Moment) => void;
}

export function MomentCard({ moment, onPress }: MomentCardProps) {
    const timeAgo = getTimeAgo(moment.timestamp);

    return (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => onPress(moment)}
        >
            {/* Image */}
            <Image
                source={{ uri: moment.imageUri }}
                style={styles.image}
                resizeMode="cover"
            />

            {/* Gradient overlay at bottom of image */}
            <View style={styles.imageOverlay} />

            {/* Location badge on image */}
            <View style={styles.locationBadge}>
                <Text style={styles.locationIcon}>📍</Text>
                <Text style={styles.locationText} numberOfLines={1}>
                    {moment.locationName}
                </Text>
            </View>

            {/* Body */}
            <View style={styles.body}>
                <Text style={styles.title} numberOfLines={1}>
                    {moment.name}
                </Text>
                <View style={styles.metaRow}>
                    <View style={styles.creatorBadge}>
                        <View style={styles.creatorDot} />
                        <Text style={styles.creatorText}>{moment.creatorDisplay}</Text>
                    </View>
                    <Text style={styles.timeText}>{timeAgo}</Text>
                </View>

                {/* SKR tips */}
                {moment.tipCount > 0 && (
                    <View style={styles.tipBadge}>
                        <Text style={styles.tipIcon}>⚡</Text>
                        <Text style={styles.tipText}>{moment.tipCount} SKR</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
}

function getTimeAgo(timestamp: number): string {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d`;
    return `${Math.floor(days / 30)}mo`;
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
    image: {
        width: '100%',
        height: 220,
        backgroundColor: colors.surfaceElevated,
    },
    imageOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        // Using a gradient effect via opacity
    },
    locationBadge: {
        position: 'absolute',
        top: spacing.sm,
        left: spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
        maxWidth: '70%',
    },
    locationIcon: {
        fontSize: 10,
        marginRight: 4,
    },
    locationText: {
        color: colors.textPrimary,
        fontSize: typography.size.xs,
        fontWeight: '500',
    },
    body: {
        padding: spacing.md,
    },
    title: {
        color: colors.textPrimary,
        fontSize: typography.size.lg,
        fontWeight: '700',
        marginBottom: spacing.xs,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    creatorBadge: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    creatorDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.accent,
        marginRight: 6,
    },
    creatorText: {
        color: colors.textSecondary,
        fontSize: typography.size.sm,
        fontFamily: 'monospace',
    },
    timeText: {
        color: colors.textTertiary,
        fontSize: typography.size.sm,
    },
    tipBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.skrGoldMuted,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
        alignSelf: 'flex-start',
        marginTop: spacing.sm,
    },
    tipIcon: {
        fontSize: 12,
        marginRight: 4,
    },
    tipText: {
        color: colors.skrGold,
        fontSize: typography.size.sm,
        fontWeight: '600',
    },
});
