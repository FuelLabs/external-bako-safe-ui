import { TransactionRequestLike } from 'fuels';
import { useEffect, useState } from 'react';

import { useQueryParams } from '@/modules/auth/hooks';
import { SocketEvents, SocketUsernames, useSocket } from '@/modules/core/hooks';

import { useTransactionSummary } from './useTransactionSummary';

export interface IVaultEvent {
  id: string;
  name: string;
  address: string;
  description: string;
  provider: string;
  pending_tx: boolean;
  workspace_id: string;
}

export const useTransactionSocket = () => {
  const [vault, setVault] = useState<IVaultEvent | undefined>({
    id: '',
    name: '',
    address: '',
    description: '',
    provider: '',
    pending_tx: true,
    workspace_id: '',
  });
  const [validAt, setValidAt] = useState<string | undefined>(undefined);
  const [tx, setTx] = useState<TransactionRequestLike>();
  const [sending, setSending] = useState(false);

  const { connect, socket } = useSocket();
  const { sessionId, request_id } = useQueryParams();

  const summary = useTransactionSummary();

  const handleSocketEvent = (data: any) => {
    const { to, type, data: content } = data;
    const { vault, tx, validAt } = content;
    const isValid =
      to === SocketUsernames.UI && type === SocketEvents.TX_REQUEST;

    if (!isValid) return;

    setVault(vault);
    setTx(tx);
    setValidAt(validAt);
    summary.getTransactionSummary({
      transactionLike: tx,
      from: vault.address,
      providerUrl: vault.provider,
    });
  };

  useEffect(() => {
    console.log('SOCKET_CONNECTED:', socket.connected);
    if (!socket.connected) {
      console.log('CONNECTING_SOCKET');
      connect(sessionId!);
      return;
    }

    console.log('SENDING_MESSAGE');
    socket.emit(SocketEvents.DEFAULT, {
      sessionId,
      to: SocketUsernames.CONNECTOR,
      request_id,
      type: SocketEvents.CONNECTED,
      data: {},
    });

    console.log('GETTING_SUMMARY');
    socket.on(SocketEvents.DEFAULT, handleSocketEvent);
  }, [socket.connected]);

  const sendTransaction = async () => {
    if (!tx) return;
    setSending(true);

    console.log('[EMITINDO TRNSACTION]');
    socket.emit(SocketEvents.TX_CONFIRM, {
      operations: summary.transactionSummary,
      tx,
    });
  };

  // emmit message to the server and close window
  const cancelTransaction = () => {
    socket.emit(SocketEvents.DEFAULT, {
      username: SocketUsernames.UI,
      sessionId,
      to: SocketUsernames.CONNECTOR,
      type: SocketEvents.DISCONNECTED,
      request_id,
      data: {},
    });
  };

  return {
    vault,
    summary,
    validAt,
    cancelTransaction: () => {
      cancelTransaction();
    },
    send: sendTransaction,
    pendingSignerTransactions: vault?.pending_tx ?? true,
    isLoading: sending,
    socket,
  };
};
