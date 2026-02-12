/**
 * SolFLux — Proof-of-Moment Social Platform
 * Solana Mobile MONOLITH Hackathon Entry
 */

// Polyfills must be imported first
import './src/polyfills';

import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectionProvider } from './src/utils/ConnectionProvider';
import { ClusterProvider } from './src/components/cluster/cluster-data-access';
import { AppNavigator } from './src/navigators/AppNavigator';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ClusterProvider>
        <ConnectionProvider config={{ commitment: 'processed' }}>
          <SafeAreaView style={styles.shell}>
            <AppNavigator />
          </SafeAreaView>
        </ConnectionProvider>
      </ClusterProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
