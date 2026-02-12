/**
 * FeedScreen — social feed of minted moments
 */
import React, { useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    RefreshControl,
    StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MomentCard } from '../components/MomentCard';
import { SkeletonCard } from '../components/SkeletonCard';
import { ConnectWalletButton } from '../components/ConnectWalletButton';
import { useMomentFeed } from '../hooks/useMomentFeed';
import { useSKRBalance } from '../hooks/useSKRBalance';
import { useAuthorization } from '../utils/useAuthorization';
import { colors, spacing, typography, borderRadius } from '../config/theme';
import { Moment, RootStackParamList } from '../types';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export function FeedScreen() {
    const navigation = useNavigation<NavProp>();
    const { selectedAccount } = useAuthorization();
    const { data: moments, isLoading, refetch, isRefetching } = useMomentFeed();
    const { data: skrBalance } = useSKRBalance();

    const handleMomentPress = useCallback(
        (moment: Moment) => {
            navigation.navigate('MomentDetail', { moment });
        },
        [navigation]
    );

    const renderItem = useCallback(
        ({ item }: { item: Moment }) => (
            <MomentCard moment={item} onPress={handleMomentPress} />
        ),
        [handleMomentPress]
    );

    const renderEmpty = useCallback(() => {
        if (isLoading) {
            return (
                <View>
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </View>
            );
        }
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📸</Text>
                <Text style={styles.emptyTitle}>No Moments Yet</Text>
                <Text style={styles.emptySubtitle}>
                    Capture your first moment and mint it as a cNFT on Solana
                </Text>
            </View>
        );
    }, [isLoading]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={colors.background} />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.logo}>Sol</Text>
                    <Text style={styles.logoAccent}>FLux</Text>
                </View>
                <View style={styles.headerRight}>
                    {selectedAccount && skrBalance !== undefined && (
                        <View style={styles.balancePill}>
                            <Text style={styles.balanceIcon}>⚡</Text>
                            <Text style={styles.balanceText}>
                                {skrBalance.toFixed(1)} SKR
                            </Text>
                        </View>
                    )}
                    <ConnectWalletButton compact />
                </View>
            </View>

            {/* Feed */}
            <FlatList
                data={moments || []}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={renderEmpty}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={refetch}
                        tintColor={colors.primary}
                        colors={[colors.primary]}
                        progressBackgroundColor={colors.surfaceElevated}
                    />
                }
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingTop: spacing.xl + spacing.md,
        paddingBottom: spacing.md,
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.cardBorder,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logo: {
        color: colors.textPrimary,
        fontSize: typography.size.xxl,
        fontWeight: '800',
    },
    logoAccent: {
        color: colors.primary,
        fontSize: typography.size.xxl,
        fontWeight: '800',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    balancePill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.skrGoldMuted,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs + 2,
        borderRadius: borderRadius.full,
    },
    balanceIcon: {
        fontSize: 12,
        marginRight: 4,
    },
    balanceText: {
        color: colors.skrGold,
        fontSize: typography.size.sm,
        fontWeight: '700',
    },
    listContent: {
        paddingTop: spacing.md,
        paddingBottom: spacing.xxl,
        flexGrow: 1,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.xl,
        paddingTop: 120,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: spacing.md,
    },
    emptyTitle: {
        color: colors.textPrimary,
        fontSize: typography.size.xl,
        fontWeight: '700',
        marginBottom: spacing.sm,
    },
    emptySubtitle: {
        color: colors.textSecondary,
        fontSize: typography.size.md,
        textAlign: 'center',
        lineHeight: 22,
    },
});
