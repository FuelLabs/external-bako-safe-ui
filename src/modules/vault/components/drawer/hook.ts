import debounce from 'lodash.debounce';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { Predicate, Workspace } from '@/modules/core';
import { Pages } from '@/modules/core/routes';
import { useVaultListRequest } from '@/modules/vault/hooks';
import { useWorkspaceContext } from '@/modules/workspace/WorkspaceProvider';
import { useTransactionsContext } from '@/modules/transactions/providers/TransactionsProvider';

interface UseVaultDrawerParams {
  onClose?: () => void;
  isOpen?: boolean;
  onSelect?: (
    vault: Predicate & {
      workspace: Workspace;
    },
  ) => void;
}

const useVaultDrawer = (props: UseVaultDrawerParams) => {
  const inView = useInView({ delay: 300 });
  const [search, setSearch] = useState('');

  const {
    authDetails: { userInfos },
    workspaceInfos: {
      handlers: { handleWorkspaceSelection },
      requests: {
        workspaceBalance: { refetch: refetchWorkspaceBalance },
      },
    },
    vaultDetails: {
      vaultRequest: { refetch: refetchVaultRequest },
    },
    invalidateGifAnimationRequest,
  } = useWorkspaceContext();

  const {
    transactionsPageList: {
      request: { refetch: refetchTransactions },
    },
  } = useTransactionsContext();

  const vaultList = useVaultListRequest({ q: search }, props.isOpen);

  const invalidateRequests = () => {
    invalidateGifAnimationRequest();
    refetchVaultRequest();
    refetchWorkspaceBalance();
    refetchTransactions();
    vaultList.refetch();
  };

  const debouncedSearchHandler = useCallback(
    debounce((event: string | ChangeEvent<HTMLInputElement>) => {
      if (typeof event === 'string') {
        setSearch(event);
        return;
      }

      setSearch(event.target.value);
    }, 300),
    [],
  );

  useEffect(() => {
    if (inView.inView && vaultList.hasNextPage && !vaultList.isLoading) {
      vaultList.fetchNextPage();
    }
  }, [
    inView.inView,
    vaultList.isFetching,
    vaultList.isLoading,
    vaultList.fetchNextPage,
    vaultList.hasNextPage,
  ]);

  const onSelectVault = (
    vault: Predicate & {
      workspace: Workspace;
    },
  ) => {
    props.onClose?.();
    invalidateRequests();
    setSearch('');
    handleWorkspaceSelection(
      vault.workspace.id,
      Pages.detailsVault({
        vaultId: vault.id,
        workspaceId: userInfos.workspace?.id,
      }),
    );
  };

  const onCloseDrawer = () => {
    props.onClose?.();
    setSearch('');
  };

  return {
    drawer: {
      onSelectVault: onSelectVault,
      onClose: onCloseDrawer,
    },
    search: {
      value: search,
      handler: debouncedSearchHandler,
    },
    request: vaultList,
    inView,
  };
};

export { useVaultDrawer };
