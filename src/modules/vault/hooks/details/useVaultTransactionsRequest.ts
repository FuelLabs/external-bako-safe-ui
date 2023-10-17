import { useQuery } from 'react-query';

import {
  SortOption,
  TransactionService,
} from '@/modules/transactions/services';

const VAULT_TRANSACTIONS_QUERY_KEY = 'transactions/byVault';

const useVaultTransactionsRequest = (id: string) => {
  return useQuery(
    [VAULT_TRANSACTIONS_QUERY_KEY, id],
    () =>
      TransactionService.getVaultTransactions({
        orderBy: 'createdAt',
        sort: SortOption.DESC,
        predicateId: [id],
      }),
    {
      initialData: [],
      enabled: !!id,
    },
  );
};

export { useVaultTransactionsRequest, VAULT_TRANSACTIONS_QUERY_KEY };
