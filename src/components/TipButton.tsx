/**
 * TipButton — animated SKR tip button with amount selector
 */
import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Pressable,
    ActivityIndicator,
} from 'react-native';
import { colors, borderRadius, spacing, typography } from '../config/theme';
import { useSKRTip } from '../hooks/useSKRTip';
import { TIP_AMOUNTS } from '../config/constants';
import * as Haptics from 'expo-haptics';

interface TipButtonProps {
    recipientAddress: string;
    onSuccess?: (signature: string) => void;
}

export function TipButton({ recipientAddress, onSuccess }: TipButtonProps) {
    const [showSelector, setShowSelector] = useState(false);
    const { tip, isLoading, error } = useSKRTip();

    const handleTip = async (amount: number) => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setShowSelector(false);

        const signature = await tip(recipientAddress, amount);
        if (signature && onSuccess) {
            onSuccess(signature);
        }
    };

    return (
        <>
            <TouchableOpacity
                style={[styles.tipButton, isLoading && styles.tipButtonDisabled]}
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowSelector(true);
                }}
                activeOpacity={0.8}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color={colors.skrGold} size="small" />
                ) : (
                    <>
                        <Text style={styles.tipIcon}>⚡</Text>
                        <Text style={styles.tipText}>Tip SKR</Text>
                    </>
                )}
            </TouchableOpacity>

            {/* Amount Selector Modal */}
            <Modal
                visible={showSelector}
                transparent
                animationType="fade"
                onRequestClose={() => setShowSelector(false)}
            >
                <Pressable
                    style={styles.overlay}
                    onPress={() => setShowSelector(false)}
                >
                    <Pressable style={styles.selectorContainer}>
                        <Text style={styles.selectorTitle}>Tip Creator</Text>
                        <Text style={styles.selectorSubtitle}>Select amount in SKR</Text>

                        <View style={styles.amountRow}>
                            {TIP_AMOUNTS.map((amount) => (
                                <TouchableOpacity
                                    key={amount}
                                    style={styles.amountButton}
                                    onPress={() => handleTip(amount)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.amountIcon}>⚡</Text>
                                    <Text style={styles.amountText}>{amount}</Text>
                                    <Text style={styles.amountLabel}>SKR</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {error && <Text style={styles.errorText}>{error}</Text>}

                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setShowSelector(false)}
                        >
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </Pressable>
                </Pressable>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    tipButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.skrGoldMuted,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.skrGold,
    },
    tipButtonDisabled: {
        opacity: 0.5,
    },
    tipIcon: {
        fontSize: 16,
        marginRight: 6,
    },
    tipText: {
        color: colors.skrGold,
        fontSize: typography.size.md,
        fontWeight: '700',
    },
    overlay: {
        flex: 1,
        backgroundColor: colors.overlay,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectorContainer: {
        backgroundColor: colors.surfaceElevated,
        borderRadius: borderRadius.xl,
        padding: spacing.xl,
        width: '85%',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    selectorTitle: {
        color: colors.textPrimary,
        fontSize: typography.size.xl,
        fontWeight: '700',
        marginBottom: spacing.xs,
    },
    selectorSubtitle: {
        color: colors.textSecondary,
        fontSize: typography.size.md,
        marginBottom: spacing.lg,
    },
    amountRow: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    amountButton: {
        alignItems: 'center',
        backgroundColor: colors.skrGoldMuted,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.skrGoldDark,
        minWidth: 80,
    },
    amountIcon: {
        fontSize: 24,
        marginBottom: spacing.xs,
    },
    amountText: {
        color: colors.skrGold,
        fontSize: typography.size.xl,
        fontWeight: '800',
    },
    amountLabel: {
        color: colors.skrGoldDark,
        fontSize: typography.size.xs,
        fontWeight: '600',
        marginTop: 2,
    },
    errorText: {
        color: colors.error,
        fontSize: typography.size.sm,
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    cancelButton: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.xl,
    },
    cancelText: {
        color: colors.textSecondary,
        fontSize: typography.size.md,
        fontWeight: '500',
    },
});
