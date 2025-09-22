import { useMemo } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import bs58 from "bs58";
import {
  type Address,
  type TransactionSendingSigner,
  type SignatureBytes,
} from "@solana/kit";
import { VersionedTransaction, VersionedMessage } from "@solana/web3.js";

export function useWalletSendingSigner(): TransactionSendingSigner<Address> | null {
  const wallet = useWallet();
  const { connection } = useConnection();

  return useMemo(() => {
    if (!wallet.publicKey || !wallet.sendTransaction) return null;

    const address = wallet.publicKey.toBase58() as Address;

    const signAndSendTransactions: TransactionSendingSigner<Address>["signAndSendTransactions"] =
      async (transactions) => {
        const out: SignatureBytes[] = [];

        for (const t of transactions) {
          // `t.messageBytes` já é um Uint8Array brandeado, podemos reusar
          const vMsg = VersionedMessage.deserialize(
            new Uint8Array(t.messageBytes as unknown as Uint8Array)
          );
          const vTx = new VersionedTransaction(vMsg);

          // envia com a wallet (ela assina internamente)
          const sig58 = await wallet.sendTransaction(vTx, connection, {
            skipPreflight: false,
          });

          // converte string base58 para Uint8Array
          const sigBytes = bs58.decode(sig58);

          // força o cast para SignatureBytes (brand interno do kit)
          out.push(sigBytes as unknown as SignatureBytes);
        }

        return out;
      };

    return {
      address,
      signAndSendTransactions,
    } satisfies TransactionSendingSigner<Address>;
  }, [wallet, connection]);
}
