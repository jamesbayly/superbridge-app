import { useAccount, usePublicClient, useQuery } from "wagmi";

import { useFromChain } from "./use-chain";

export const useIsContractAccount = () => {
  const from = useFromChain();
  const account = useAccount();
  const client = usePublicClient({ chainId: from?.id });

  return useQuery(
    [`is-contract-${account.address}-${client.chain.id}-${from?.id}`],
    () => {
      if (!from?.id) {
        throw new Error("From chain not initialised");
      }

      if (!account.address) {
        throw new Error("No account connected");
      }

      return client.getBytecode({ address: account.address }).then((x) => !!x);
    },
    { enabled: !!account.address }
  );
};
