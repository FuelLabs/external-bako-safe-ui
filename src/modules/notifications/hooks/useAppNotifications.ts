import { useDisclosure } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useNavigate } from 'react-router-dom';

import { queryClient } from '@/config';
import { useTransactionState } from '@/modules/transactions/states';

import { useListNotificationsRequest } from './useListNotificationsRequest';
import { useSetNotificationsAsReadRequest } from './useSetNotificationsAsReadRequest';
import { useUnreadNotificationsCounterRequest } from './useUnreadNotificationsCounterRequest';

interface UseAppNotificationsParams {
  onClose?: () => void;
  isOpen?: boolean;
  onSelect?: (vaultId: string) => void;
}

export interface TransactionRedirect {
  id?: string;
  name?: string;
}

const useAppNotifications = (props?: UseAppNotificationsParams) => {
  const navigate = useNavigate();
  const drawer = useDisclosure();
  const inView = useInView({ delay: 300 });

  const notificationsListRequest = useListNotificationsRequest();
  const unreadNotificationsRequest = useUnreadNotificationsCounterRequest();
  const setNotificationAsReadRequest = useSetNotificationsAsReadRequest();
  const { setSelectedTransaction } = useTransactionState();

  const unreadCounter = unreadNotificationsRequest.data?.total ?? 0;

  const onNotificationClick = (
    path: string,
    transaction?: TransactionRedirect,
  ) => {
    queryClient.invalidateQueries([
      'notifications/pagination',
      'notifications/counter',
    ]);

    if (transaction?.id) setSelectedTransaction(transaction);

    navigate(path);
    if (unreadCounter > 0) setNotificationAsReadRequest.mutate({});
    // TODO: close dialog
  };

  const onCloseDrawer = () => {
    props?.onClose?.();
    queryClient.invalidateQueries('notifications/pagination');
  };

  useEffect(() => {
    if (inView.inView && !notificationsListRequest.isLoading) {
      notificationsListRequest.fetchNextPage();
    }
  }, [
    inView.inView,
    notificationsListRequest.isLoading,
    notificationsListRequest.fetchNextPage,
  ]);

  return {
    drawer: {
      ...drawer,
      onClose: onCloseDrawer,
    },
    inView,
    unreadCounter,
    notificationsListRequest,
    navigate,
    onNotificationClick,
  };
};

export { useAppNotifications };
