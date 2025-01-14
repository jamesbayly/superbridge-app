import { formatUnits, isAddressEqual } from "viem";
import {
  Address,
  erc20ABI,
  useAccount,
  useBalance,
  useContractReads,
} from "wagmi";

import { Token } from "@/types/token";
import { isNativeToken } from "@/utils/is-eth";

import { useBridgeControllerGetTokenPrices } from "../codegen";
import { useActiveTokens } from "./use-tokens";

export function useTokenBalances(chainId: number | undefined) {
  const account = useAccount();
  const ethBalance = useBalance({
    chainId: chainId,
    address: account.address,
  });
  const prices = useBridgeControllerGetTokenPrices();
  const tokens = useActiveTokens();

  const reads = useContractReads({
    allowFailure: true,
    contracts: tokens.map((t) => ({
      abi: erc20ABI,
      functionName: "balanceOf",
      args: [account.address ?? "0x"],
      chainId: chainId,
      address: t[chainId ?? 0]?.address as Address,
    })),
    enabled: !!account.address,
  });

  const data = tokens
    .map((token, index) => {
      const balance = isNativeToken(token)
        ? ethBalance.data?.value ?? BigInt(0)
        : reads.data?.[index].error
        ? BigInt(0)
        : (reads.data?.[index].result as bigint) ?? BigInt(0);

      const id = token[chainId ?? 0]?.coinGeckoId
        ? `coingecko:${token[chainId ?? 0]?.coinGeckoId}`
        : `ethereum:${token[1]?.address}`;
      const price: number =
        // @ts-expect-error
        prices.data?.data?.[id]?.price ?? 0;
      const usdValue =
        parseFloat(
          formatUnits(balance, Object.values(token)[0]?.decimals ?? 18)
        ) * price;

      return {
        token,
        balance,
        usdValue,
      };
    })
    .sort((a, b) => b.usdValue - a.usdValue);
  return {
    isLoading: reads.isLoading,
    isError: reads.isError,
    data,
  };
}

export function useTokenBalance(token: Token | null) {
  const tokenBalances = useTokenBalances(token?.chainId);

  if (!token) {
    return BigInt(0);
  }

  return (
    tokenBalances.data.find(
      (x) =>
        x.token[token.chainId]?.address &&
        isAddressEqual(
          x.token[token.chainId]!.address as Address,
          token.address
        )
    )?.balance ?? BigInt(0)
  );
}
