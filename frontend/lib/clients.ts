import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { somniaTestnet } from "./chain";

export function getPublicClient() {
  return createPublicClient({
    chain: somniaTestnet,
    transport: http(process.env.NEXT_PUBLIC_SOMNIA_RPC || "https://dream-rpc.somnia.network"),
  });
}

export function getWalletClient() {
  const pk = process.env.PRIVATE_KEY;
  if (!pk) throw new Error("PRIVATE_KEY not set");
  return createWalletClient({
    chain: somniaTestnet,
    transport: http(process.env.NEXT_PUBLIC_SOMNIA_RPC || "https://dream-rpc.somnia.network"),
    account: privateKeyToAccount(pk as `0x${string}`),
  });
}
