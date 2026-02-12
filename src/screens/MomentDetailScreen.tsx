/**
 * MomentDetailScreen — full-screen moment view with tip button
 */
import React from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Linking,
    Dimensions,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { TipButton } from '../components/TipButton';
import { colors, spacing, typography, borderRadius } from '../config/theme';
import { RootStackParamList } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
type DetailRouteProp = RouteProp<RootStackParamList, 'MomentDetail'>;

export function MomentDetailScreen() {
    const navigation = useNavigation();
    const route = useRoute<DetailRouteProp>();
    const { moment } = route.params;

    const formattedDate = new Date(moment.timestamp).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    const openExplorer = () => {
        if (moment.assetId) {
            Linking.openURL(
                `https://explorer.solana.com/address/${moment.assetId}?cluster=devnet`
            );
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Hero Image */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: moment.imageUri }}
                        style={styles.heroImage}
                        resizeMode="cover"
                    />

                    {/* Back button */}
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backIcon}>←</Text>
                    </TouchableOpacity>

                    {/* Location on image */}
                    <View style={styles.locationBadge}>
                        <Text style={styles.locationIcon}>📍</Text>
                        <Text style={styles.locationText}>{moment.locationName}</Text>
                    </View>
                </View>

                {/* Content */}
                <View style={styles.content}>
                    <Text style={styles.title}>{moment.name}</Text>
                    <Text style={styles.description}>{moment.description}</Text>

                    {/* Creator */}
                    <View style={styles.creatorCard}>
                        <View style={styles.creatorInfo}>
                            <View style={styles.creatorAvatar}>
                                <Text style={styles.avatarText}>
                                    {moment.creatorDisplay.slice(0, 2)}
                                </Text>
                            </View>
                            <View>
                                <Text style={styles.creatorLabel}>Creator</Text>
                                <Text style={styles.creatorAddress}>{moment.creator}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Details Grid */}
                    <View style={styles.detailsGrid}>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailIcon}>🕐</Text>
                            <Text style={styles.detailLabel}>Captured</Text>
                            <Text style={styles.detailValue}>{formattedDate}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailIcon}>🌐</Text>
                            <Text style={styles.detailLabel}>Coordinates</Text>
                            <Text style={styles.detailValueMono}>
                                {moment.latitude.toFixed(6)}{'\n'}{moment.longitude.toFixed(6)}
                            </Text>
                        </View>
                        {moment.tipCount > 0 && (
                            <View style={styles.detailItem}>
                                <Text style={styles.detailIcon}>⚡</Text>
                                <Text style={styles.detailLabel}>Tips Received</Text>
                                <Text style={styles.detailValue}>{moment.tipCount} SKR</Text>
                            </View>
                        )}
                    </View>

                    {/* View on Explorer */}
                    {moment.assetId && (
                        <TouchableOpacity
                            style={styles.explorerButton}
                            onPress={openExplorer}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.explorerIcon}>🔍</Text>
                            <Text style={styles.explorerText}>View on Solana Explorer</Text>
                        </TouchableOpacity>
                    )}

                    {/* Tip Button */}
                    <View style={styles.tipSection}>
                        <Text style={styles.tipSectionTitle}>Support this Creator</Text>
                        <TipButton recipientAddress={moment.creator} />
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        paddingBottom: spacing.xxl,
    },
    imageContainer: {
        position: 'relative',
    },
    heroImage: {
        width: SCREEN_WIDTH,
        height: SCREEN_WIDTH,
        backgroundColor: colors.surfaceElevated,
    },
    backButton: {
        position: 'absolute',
        top: spacing.xl + spacing.md,
        left: spacing.md,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    backIcon: {
        color: colors.textPrimary,
        fontSize: 20,
        fontWeight: '700',
    },
    locationBadge: {
        position: 'absolute',
        bottom: spacing.md,
        left: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
    },
    locationIcon: {
        fontSize: 14,
        marginRight: 6,
    },
    locationText: {
        color: colors.textPrimary,
        fontSize: typography.size.sm,
        fontWeight: '500',
    },
    content: {
        padding: spacing.md,
    },
    title: {
        color: colors.textPrimary,
        fontSize: typography.size.xxl,
        fontWeight: '800',
        marginBottom: spacing.sm,
    },
    description: {
        color: colors.textSecondary,
        fontSize: typography.size.md,
        lineHeight: 24,
        marginBottom: spacing.lg,
    },
    creatorCard: {
        backgroundColor: colors.card,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    creatorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    creatorAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.primaryMuted,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    avatarText: {
        color: colors.primary,
        fontSize: typography.size.md,
        fontWeight: '700',
        fontFamily: 'monospace',
    },
    creatorLabel: {
        color: colors.textTertiary,
        fontSize: typography.size.xs,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    creatorAddress: {
        color: colors.textSecondary,
        fontSize: typography.size.sm,
        fontFamily: 'monospace',
    },
    detailsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    detailItem: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: colors.card,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    detailIcon: {
        fontSize: 20,
        marginBottom: spacing.xs,
    },
    detailLabel: {
        color: colors.textTertiary,
        fontSize: typography.size.xs,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: spacing.xs,
    },
    detailValue: {
        color: colors.textPrimary,
        fontSize: typography.size.sm,
        fontWeight: '500',
    },
    detailValueMono: {
        color: colors.textPrimary,
        fontSize: typography.size.sm,
        fontFamily: 'monospace',
    },
    explorerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surfaceElevated,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.lg,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    explorerIcon: {
        fontSize: 16,
        marginRight: spacing.sm,
    },
    explorerText: {
        color: colors.textSecondary,
        fontSize: typography.size.md,
        fontWeight: '500',
    },
    tipSection: {
        alignItems: 'center',
        paddingTop: spacing.md,
    },
    tipSectionTitle: {
        color: colors.textSecondary,
        fontSize: typography.size.md,
        fontWeight: '500',
        marginBottom: spacing.md,
    },
});
