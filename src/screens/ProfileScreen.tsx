/**
 * ProfileScreen — wallet info, balances, user's moments grid
 */
import React, { useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    FlatList,
    Image,
    TouchableOpacity,
    Dimensions,
    RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useQuery } from '@tanstack/react-query';
import { ConnectWalletButton } from '../components/ConnectWalletButton';
import { useAuthorization } from '../utils/useAuthorization';
import { useSKRBalance } from '../hooks/useSKRBalance';
import { useUserMoments } from '../hooks/useUserMoments';
import { colors, spacing, typography, borderRadius } from '../config/theme';
import { RPC_ENDPOINT, BALANCE_STALE_TIME } from '../config/constants';
import { Moment, RootStackParamList } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_GAP = spacing.xs;
const GRID_COLS = 3;
const TILE_SIZE = (SCREEN_WIDTH - spacing.md * 2 - GRID_GAP * (GRID_COLS - 1)) / GRID_COLS;

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export function ProfileScreen() {
    const navigation = useNavigation<NavProp>();
    const { selectedAccount } = useAuthorization();
    const { data: skrBalance } = useSKRBalance();

    const walletAddress = selectedAccount?.publicKey?.toBase58() || null;

    // SOL balance
    const { data: solBalance } = useQuery<number>({
        queryKey: ['sol-balance', walletAddress],
        queryFn: async () => {
            if (!selectedAccount) return 0;
            const connection = new Connection(RPC_ENDPOINT, 'confirmed');
            const balance = await connection.getBalance(selectedAccount.publicKey);
            return balance / LAMPORTS_PER_SOL;
        },
        enabled: !!selectedAccount,
        staleTime: BALANCE_STALE_TIME,
    });

    // User moments
    const {
        data: moments,
        isLoading: momentsLoading,
        refetch,
        isRefetching,
    } = useUserMoments(walletAddress);

    const handleMomentPress = useCallback(
        (moment: Moment) => {
            navigation.navigate('MomentDetail', { moment });
        },
        [navigation]
    );

    if (!selectedAccount) {
        return (
            <View style={styles.container}>
                <View style={styles.connectContainer}>
                    <Text style={styles.connectIcon}>👤</Text>
                    <Text style={styles.connectTitle}>Your Profile</Text>
                    <Text style={styles.connectSubtitle}>
                        Connect your wallet to view your moments and balances
                    </Text>
                    <ConnectWalletButton />
                </View>
            </View>
        );
    }

    const address = walletAddress || '';
    const truncated = `${address.slice(0, 8)}...${address.slice(-8)}`;

    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={refetch}
                        tintColor={colors.primary}
                        colors={[colors.primary]}
                        progressBackgroundColor={colors.surfaceElevated}
                    />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Profile</Text>
                    <ConnectWalletButton compact />
                </View>

                {/* Wallet Card */}
                <View style={styles.walletCard}>
                    <View style={styles.avatarLarge}>
                        <Text style={styles.avatarLargeText}>
                            {address.slice(0, 2).toUpperCase()}
                        </Text>
                    </View>
                    <Text style={styles.walletAddress}>{truncated}</Text>

                    {/* Balances */}
                    <View style={styles.balanceRow}>
                        <View style={styles.balanceItem}>
                            <Text style={styles.balanceValue}>
                                {solBalance?.toFixed(4) || '0.0000'}
                            </Text>
                            <Text style={styles.balanceLabel}>SOL</Text>
                        </View>
                        <View style={styles.balanceDivider} />
                        <View style={styles.balanceItem}>
                            <View style={styles.skrBalanceRow}>
                                <Text style={styles.skrIcon}>⚡</Text>
                                <Text style={styles.balanceValue}>
                                    {skrBalance?.toFixed(2) || '0.00'}
                                </Text>
                            </View>
                            <Text style={styles.balanceLabel}>SKR</Text>
                        </View>
                        <View style={styles.balanceDivider} />
                        <View style={styles.balanceItem}>
                            <Text style={styles.balanceValue}>{moments?.length || 0}</Text>
                            <Text style={styles.balanceLabel}>Moments</Text>
                        </View>
                    </View>
                </View>

                {/* Moments Grid */}
                <View style={styles.gridSection}>
                    <Text style={styles.gridTitle}>Your Moments</Text>

                    {moments && moments.length > 0 ? (
                        <View style={styles.grid}>
                            {moments.map((moment) => (
                                <TouchableOpacity
                                    key={moment.id}
                                    style={styles.gridTile}
                                    onPress={() => handleMomentPress(moment)}
                                    activeOpacity={0.8}
                                >
                                    <Image
                                        source={{ uri: moment.imageUri }}
                                        style={styles.gridImage}
                                        resizeMode="cover"
                                    />
                                    <View style={styles.gridOverlay}>
                                        <Text style={styles.gridLocation} numberOfLines={1}>
                                            📍 {moment.locationName}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.emptyMoments}>
                            <Text style={styles.emptyIcon}>📸</Text>
                            <Text style={styles.emptyText}>
                                {momentsLoading
                                    ? 'Loading your moments...'
                                    : 'No moments yet. Capture your first!'}
                            </Text>
                        </View>
                    )}
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingTop: spacing.xl + spacing.md,
        paddingBottom: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.cardBorder,
    },
    headerTitle: {
        color: colors.textPrimary,
        fontSize: typography.size.xxl,
        fontWeight: '800',
    },
    walletCard: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
        paddingHorizontal: spacing.md,
        marginHorizontal: spacing.md,
        marginTop: spacing.md,
        backgroundColor: colors.card,
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    avatarLarge: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: colors.primaryMuted,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
        borderWidth: 2,
        borderColor: colors.primary,
    },
    avatarLargeText: {
        color: colors.primary,
        fontSize: typography.size.xxl,
        fontWeight: '800',
        fontFamily: 'monospace',
    },
    walletAddress: {
        color: colors.textSecondary,
        fontSize: typography.size.sm,
        fontFamily: 'monospace',
        marginBottom: spacing.lg,
    },
    balanceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
    },
    balanceItem: {
        flex: 1,
        alignItems: 'center',
    },
    balanceDivider: {
        width: 1,
        height: 40,
        backgroundColor: colors.cardBorder,
    },
    balanceValue: {
        color: colors.textPrimary,
        fontSize: typography.size.xl,
        fontWeight: '700',
    },
    balanceLabel: {
        color: colors.textTertiary,
        fontSize: typography.size.xs,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginTop: 4,
    },
    skrBalanceRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    skrIcon: {
        fontSize: 16,
        marginRight: 4,
    },
    gridSection: {
        paddingHorizontal: spacing.md,
        marginTop: spacing.lg,
    },
    gridTitle: {
        color: colors.textPrimary,
        fontSize: typography.size.lg,
        fontWeight: '700',
        marginBottom: spacing.md,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: GRID_GAP,
    },
    gridTile: {
        width: TILE_SIZE,
        height: TILE_SIZE,
        borderRadius: borderRadius.md,
        overflow: 'hidden',
        position: 'relative',
    },
    gridImage: {
        width: '100%',
        height: '100%',
        backgroundColor: colors.surfaceElevated,
    },
    gridOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: spacing.xs,
        paddingVertical: 2,
    },
    gridLocation: {
        color: colors.textPrimary,
        fontSize: 8,
    },
    emptyMoments: {
        alignItems: 'center',
        paddingVertical: spacing.xxl,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: spacing.md,
    },
    emptyText: {
        color: colors.textSecondary,
        fontSize: typography.size.md,
        textAlign: 'center',
    },
    connectContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.xl,
    },
    connectIcon: {
        fontSize: 64,
        marginBottom: spacing.md,
    },
    connectTitle: {
        color: colors.textPrimary,
        fontSize: typography.size.xxl,
        fontWeight: '700',
        marginBottom: spacing.sm,
    },
    connectSubtitle: {
        color: colors.textSecondary,
        fontSize: typography.size.md,
        textAlign: 'center',
        marginBottom: spacing.lg,
        lineHeight: 22,
    },
});
