/**
 * ConnectWalletButton — triggers MWA connection/disconnection
 */
import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    View,
    ActivityIndicator,
} from 'react-native';
import { useAuthorization } from '../utils/useAuthorization';
import { useMobileWallet } from '../utils/useMobileWallet';
import { colors, borderRadius, spacing, typography } from '../config/theme';
import * as Haptics from 'expo-haptics';

interface ConnectWalletButtonProps {
    compact?: boolean;
}

export function ConnectWalletButton({ compact = false }: ConnectWalletButtonProps) {
    const { selectedAccount, isLoading } = useAuthorization();
    const { connect, disconnect } = useMobileWallet();

    const handlePress = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (selectedAccount) {
            await disconnect();
        } else {
            await connect();
        }
    };

    if (isLoading) {
        return (
            <View style={[styles.button, styles.loading]}>
                <ActivityIndicator color={colors.primary} size="small" />
            </View>
        );
    }

    if (selectedAccount) {
        const address = selectedAccount.publicKey.toBase58();
        const truncated = `${address.slice(0, 4)}...${address.slice(-4)}`;

        return (
            <TouchableOpacity
                style={[styles.button, styles.connected, compact && styles.compact]}
                onPress={handlePress}
                activeOpacity={0.8}
            >
                <View style={styles.connectedDot} />
                <Text style={styles.addressText}>{truncated}</Text>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            style={[styles.button, styles.disconnected, compact && styles.compact]}
            onPress={handlePress}
            activeOpacity={0.8}
        >
            <Text style={styles.connectText}>Connect Wallet</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        minWidth: 140,
    },
    compact: {
        minWidth: 100,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs + 2,
    },
    connected: {
        backgroundColor: colors.accentMuted,
        borderWidth: 1,
        borderColor: colors.accent,
    },
    disconnected: {
        backgroundColor: colors.primaryMuted,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    loading: {
        backgroundColor: colors.surfaceElevated,
        minWidth: 140,
        height: 36,
    },
    connectedDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.accent,
        marginRight: spacing.sm,
    },
    addressText: {
        color: colors.accent,
        fontSize: typography.size.sm,
        fontWeight: '600',
        fontFamily: 'monospace',
    },
    connectText: {
        color: colors.primary,
        fontSize: typography.size.sm,
        fontWeight: '700',
    },
});
