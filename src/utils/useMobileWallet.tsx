import { Account, useAuthorization } from "./useAuthorization";
import {
  Transaction,
  TransactionSignature,
  VersionedTransaction,
} from "@solana/web3.js";
import { useCallback, useMemo } from "react";
import { SignInPayload } from "@solana-mobile/mobile-wallet-adapter-protocol";
import { Alert, Platform } from "react-native";

// Mock transact for Expo Go / Web
const mockTransact = async (callback: (wallet: any) => Promise<any>) => {
  Alert.alert(
    "Development Build Required",
    "Mobile Wallet Adapter requires a native Development Build. It does not work in Expo Go.\n\nPlease run: npx eas build --profile development --platform android"
  );
  throw new Error("MWA not supported in Expo Go");
};

export function useMobileWallet() {
  const { authorizeSessionWithSignIn, authorizeSession, deauthorizeSession } =
    useAuthorization();

  // Lazy load transact to avoid crash in Expo Go
  const getTransact = () => {
    try {
      const mwa = require("@solana-mobile/mobile-wallet-adapter-protocol-web3js");
      return mwa.transact;
    } catch (e) {
      console.warn("MWA not found, using mock:", e);
      return mockTransact;
    }
  };


  const connect = useCallback(async (): Promise<Account> => {
    const transact = getTransact();
    return await transact(async (wallet: any) => {
      return await authorizeSession(wallet);
    });
  }, [authorizeSession]);

  const signIn = useCallback(
    async (signInPayload: SignInPayload): Promise<Account> => {
      const transact = getTransact();
      return await transact(async (wallet: any) => {
        return await authorizeSessionWithSignIn(wallet, signInPayload);
      });
    },
    [authorizeSession]
  );

  const disconnect = useCallback(async (): Promise<void> => {
    const transact = getTransact();
    await transact(async (wallet: any) => {
      await deauthorizeSession(wallet);
    });
  }, [deauthorizeSession]);

  const signAndSendTransaction = useCallback(
    async (
      transaction: Transaction | VersionedTransaction,
      minContextSlot: number,
    ): Promise<TransactionSignature> => {
      const transact = getTransact();
      return await transact(async (wallet: any) => {
        await authorizeSession(wallet);
        const signatures = await wallet.signAndSendTransactions({
          transactions: [transaction],
          minContextSlot,
        });
        return signatures[0];
      });
    },
    [authorizeSession]
  );

  const signMessage = useCallback(
    async (message: Uint8Array): Promise<Uint8Array> => {
      const transact = getTransact();
      return await transact(async (wallet: any) => {
        const authResult = await authorizeSession(wallet);
        const signedMessages = await wallet.signMessages({
          addresses: [authResult.address],
          payloads: [message],
        });
        return signedMessages[0];
      });
    },
    [authorizeSession]
  );

  return useMemo(
    () => ({
      connect,
      signIn,
      disconnect,
      signAndSendTransaction,
      signMessage,
    }),
    [signAndSendTransaction, signMessage]
  );
}
