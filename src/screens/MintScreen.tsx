/**
 * MintScreen — preview and mint a captured moment as a cNFT
 */
import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MintProgressModal } from '../components/MintProgressModal';
import { useMomentMint } from '../hooks/useMomentMint';
import { useAuthorization } from '../utils/useAuthorization';
import { colors, spacing, typography, borderRadius } from '../config/theme';
import { RootStackParamList, MintStep } from '../types';

type MintRouteProp = RouteProp<RootStackParamList, 'MintScreen'>;

export function MintScreen() {
    const navigation = useNavigation();
    const route = useRoute<MintRouteProp>();
    const { capture } = route.params;
    const { selectedAccount } = useAuthorization();
    const { mintMoment, step, error, txSignature, reset, isLoading } = useMomentMint();
    const [showProgress, setShowProgress] = useState(false);

    const handleMint = async () => {
        if (!selectedAccount) {
            return;
        }
        setShowProgress(true);
        await mintMoment(capture);
    };

    const handleClose = () => {
        setShowProgress(false);
        reset();
        if (step === MintStep.SUCCESS) {
            navigation.goBack();
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Preview Image */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: capture.uri }}
                        style={styles.previewImage}
                        resizeMode="cover"
                    />
                    <View style={styles.imageBadge}>
                        <Text style={styles.imageBadgeText}>Preview</Text>
                    </View>
                </View>

                {/* Location Info */}
                <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoIcon}>📍</Text>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Location</Text>
                            <Text style={styles.infoValue}>{capture.locationName}</Text>
                        </View>
                    </View>
                    <View style={styles.infoDivider} />
                    <View style={styles.infoRow}>
                        <Text style={styles.infoIcon}>🕐</Text>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Captured</Text>
                            <Text style={styles.infoValue}>
                                {new Date(capture.timestamp).toLocaleString()}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.infoDivider} />
                    <View style={styles.infoRow}>
                        <Text style={styles.infoIcon}>🌐</Text>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Coordinates</Text>
                            <Text style={styles.infoValueMono}>
                                {capture.latitude.toFixed(6)}, {capture.longitude.toFixed(6)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Mint Cost */}
                <View style={styles.costCard}>
                    <View style={styles.costRow}>
                        <Text style={styles.costLabel}>Mint Cost</Text>
                        <View style={styles.costValue}>
                            <Text style={styles.costIcon}>⚡</Text>
                            <Text style={styles.costAmount}>1 SKR</Text>
                        </View>
                    </View>
                    <Text style={styles.costNote}>
                        1 SKR will be burned to mint this moment as a compressed NFT
                    </Text>
                </View>

                {/* Mint Button */}
                {selectedAccount ? (
                    <TouchableOpacity
                        style={[styles.mintButton, isLoading && styles.mintButtonDisabled]}
                        onPress={handleMint}
                        disabled={isLoading}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.mintButtonIcon}>✨</Text>
                        <Text style={styles.mintButtonText}>Mint as Moment</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.connectPrompt}>
                        <Text style={styles.connectPromptText}>
                            Connect your wallet to mint
                        </Text>
                    </View>
                )}

                {/* Back button */}
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.cancelText}>← Retake Photo</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Mint Progress Modal */}
            <MintProgressModal
                visible={showProgress}
                step={step}
                error={error}
                txSignature={txSignature}
                onClose={handleClose}
            />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: spacing.xxl,
    },
    imageContainer: {
        position: 'relative',
    },
    previewImage: {
        width: '100%',
        height: 350,
        backgroundColor: colors.surfaceElevated,
    },
    imageBadge: {
        position: 'absolute',
        top: spacing.xl + spacing.md,
        right: spacing.md,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
    },
    imageBadgeText: {
        color: colors.textPrimary,
        fontSize: typography.size.xs,
        fontWeight: '500',
    },
    infoCard: {
        backgroundColor: colors.card,
        marginHorizontal: spacing.md,
        marginTop: spacing.md,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    infoIcon: {
        fontSize: 20,
        marginRight: spacing.md,
        width: 28,
        textAlign: 'center',
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        color: colors.textTertiary,
        fontSize: typography.size.xs,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    infoValue: {
        color: colors.textPrimary,
        fontSize: typography.size.md,
        fontWeight: '500',
    },
    infoValueMono: {
        color: colors.textPrimary,
        fontSize: typography.size.sm,
        fontFamily: 'monospace',
    },
    infoDivider: {
        height: 1,
        backgroundColor: colors.cardBorder,
        marginLeft: 44,
    },
    costCard: {
        backgroundColor: colors.skrGoldMuted,
        marginHorizontal: spacing.md,
        marginTop: spacing.md,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.skrGoldDark,
    },
    costRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.xs,
    },
    costLabel: {
        color: colors.skrGold,
        fontSize: typography.size.md,
        fontWeight: '600',
    },
    costValue: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    costIcon: {
        fontSize: 16,
        marginRight: 4,
    },
    costAmount: {
        color: colors.skrGold,
        fontSize: typography.size.lg,
        fontWeight: '800',
    },
    costNote: {
        color: colors.skrGoldDark,
        fontSize: typography.size.xs,
    },
    mintButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        marginHorizontal: spacing.md,
        marginTop: spacing.lg,
        paddingVertical: spacing.md + 4,
        borderRadius: borderRadius.full,
    },
    mintButtonDisabled: {
        opacity: 0.5,
    },
    mintButtonIcon: {
        fontSize: 20,
        marginRight: spacing.sm,
    },
    mintButtonText: {
        color: colors.textPrimary,
        fontSize: typography.size.lg,
        fontWeight: '700',
    },
    connectPrompt: {
        alignItems: 'center',
        marginHorizontal: spacing.md,
        marginTop: spacing.lg,
        paddingVertical: spacing.md,
    },
    connectPromptText: {
        color: colors.textSecondary,
        fontSize: typography.size.md,
    },
    cancelButton: {
        alignItems: 'center',
        marginTop: spacing.md,
        paddingVertical: spacing.sm,
    },
    cancelText: {
        color: colors.textSecondary,
        fontSize: typography.size.md,
    },
});
