/**
 * MintProgressModal — step-by-step progress during mint flow
 */
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { colors, borderRadius, spacing, typography } from '../config/theme';
import { MintStep } from '../types';

interface MintProgressModalProps {
    visible: boolean;
    step: MintStep;
    error: string | null;
    txSignature: string | null;
    onClose: () => void;
}

const STEPS = [
    { key: MintStep.COMPRESSING, label: 'Compressing Image', icon: '🖼️' },
    { key: MintStep.UPLOADING_IMAGE, label: 'Uploading to IPFS', icon: '☁️' },
    { key: MintStep.UPLOADING_METADATA, label: 'Uploading Metadata', icon: '📋' },
    { key: MintStep.BUILDING_TX, label: 'Building Transaction', icon: '🔨' },
    { key: MintStep.SIGNING, label: 'Signing via Wallet', icon: '✍️' },
    { key: MintStep.CONFIRMING, label: 'Confirming On-Chain', icon: '⛓️' },
];

const STEP_ORDER = STEPS.map((s) => s.key);

export function MintProgressModal({
    visible,
    step,
    error,
    txSignature,
    onClose,
}: MintProgressModalProps) {
    const currentStepIndex = STEP_ORDER.indexOf(step);
    const isSuccess = step === MintStep.SUCCESS;
    const isError = step === MintStep.ERROR;

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        {isSuccess ? (
                            <Text style={styles.successIcon}>🎉</Text>
                        ) : isError ? (
                            <Text style={styles.errorIcon}>❌</Text>
                        ) : (
                            <ActivityIndicator color={colors.primary} size="large" />
                        )}
                        <Text style={styles.title}>
                            {isSuccess
                                ? 'Moment Minted!'
                                : isError
                                    ? 'Minting Failed'
                                    : 'Minting Your Moment'}
                        </Text>
                    </View>

                    {/* Steps */}
                    <View style={styles.stepsContainer}>
                        {STEPS.map((s, index) => {
                            const isActive = s.key === step;
                            const isComplete = currentStepIndex > index || isSuccess;
                            const isPending = currentStepIndex < index && !isSuccess;

                            return (
                                <View key={s.key} style={styles.stepRow}>
                                    <View
                                        style={[
                                            styles.stepIndicator,
                                            isComplete && styles.stepComplete,
                                            isActive && styles.stepActive,
                                            isPending && styles.stepPending,
                                        ]}
                                    >
                                        {isComplete ? (
                                            <Text style={styles.checkmark}>✓</Text>
                                        ) : isActive ? (
                                            <ActivityIndicator color={colors.primary} size="small" />
                                        ) : (
                                            <Text style={styles.stepNumber}>{index + 1}</Text>
                                        )}
                                    </View>
                                    <View style={styles.stepContent}>
                                        <Text
                                            style={[
                                                styles.stepLabel,
                                                isComplete && styles.stepLabelComplete,
                                                isActive && styles.stepLabelActive,
                                                isPending && styles.stepLabelPending,
                                            ]}
                                        >
                                            {s.icon} {s.label}
                                        </Text>
                                    </View>
                                    {index < STEPS.length - 1 && (
                                        <View
                                            style={[
                                                styles.connector,
                                                isComplete && styles.connectorComplete,
                                            ]}
                                        />
                                    )}
                                </View>
                            );
                        })}
                    </View>

                    {/* Success info */}
                    {isSuccess && txSignature && (
                        <View style={styles.successInfo}>
                            <Text style={styles.signatureLabel}>Transaction</Text>
                            <Text style={styles.signatureText} numberOfLines={1}>
                                {txSignature.slice(0, 20)}...{txSignature.slice(-8)}
                            </Text>
                        </View>
                    )}

                    {/* Error message */}
                    {isError && error && (
                        <Text style={styles.errorText}>{error}</Text>
                    )}

                    {/* Close button */}
                    {(isSuccess || isError) && (
                        <TouchableOpacity
                            style={[styles.closeButton, isSuccess && styles.successButton]}
                            onPress={onClose}
                            activeOpacity={0.8}
                        >
                            <Text
                                style={[
                                    styles.closeButtonText,
                                    isSuccess && styles.successButtonText,
                                ]}
                            >
                                {isSuccess ? 'View in Feed' : 'Try Again'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: colors.overlay,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.xl,
        padding: spacing.xl,
        width: '90%',
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    successIcon: {
        fontSize: 48,
        marginBottom: spacing.sm,
    },
    errorIcon: {
        fontSize: 48,
        marginBottom: spacing.sm,
    },
    title: {
        color: colors.textPrimary,
        fontSize: typography.size.xl,
        fontWeight: '700',
        marginTop: spacing.sm,
    },
    stepsContainer: {
        marginBottom: spacing.lg,
    },
    stepRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
        position: 'relative',
    },
    stepIndicator: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    stepComplete: {
        backgroundColor: colors.accent,
    },
    stepActive: {
        backgroundColor: colors.primaryMuted,
        borderWidth: 2,
        borderColor: colors.primary,
    },
    stepPending: {
        backgroundColor: colors.surfaceElevated,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    checkmark: {
        color: colors.textInverse,
        fontSize: 14,
        fontWeight: '700',
    },
    stepNumber: {
        color: colors.textTertiary,
        fontSize: 12,
        fontWeight: '600',
    },
    stepContent: {
        flex: 1,
    },
    stepLabel: {
        fontSize: typography.size.md,
    },
    stepLabelComplete: {
        color: colors.accent,
    },
    stepLabelActive: {
        color: colors.textPrimary,
        fontWeight: '600',
    },
    stepLabelPending: {
        color: colors.textTertiary,
    },
    connector: {
        position: 'absolute',
        left: 13,
        top: 28,
        width: 2,
        height: spacing.md,
        backgroundColor: colors.cardBorder,
    },
    connectorComplete: {
        backgroundColor: colors.accent,
    },
    successInfo: {
        backgroundColor: colors.surfaceElevated,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginBottom: spacing.lg,
        alignItems: 'center',
    },
    signatureLabel: {
        color: colors.textSecondary,
        fontSize: typography.size.xs,
        marginBottom: spacing.xs,
    },
    signatureText: {
        color: colors.primary,
        fontSize: typography.size.sm,
        fontFamily: 'monospace',
    },
    errorText: {
        color: colors.error,
        fontSize: typography.size.sm,
        textAlign: 'center',
        marginBottom: spacing.lg,
        paddingHorizontal: spacing.md,
    },
    closeButton: {
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderRadius: borderRadius.full,
        backgroundColor: colors.surfaceElevated,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    successButton: {
        backgroundColor: colors.primaryMuted,
        borderColor: colors.primary,
    },
    closeButtonText: {
        color: colors.textSecondary,
        fontSize: typography.size.md,
        fontWeight: '600',
    },
    successButtonText: {
        color: colors.primary,
    },
});
