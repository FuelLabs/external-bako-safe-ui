/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ITransaction } from 'bakosafe';
import { createContext, PropsWithChildren, useContext, useRef } from 'react';

import { queryClient } from '@/config';
import { useBakoSafeTransactionSend } from '@/modules/core';

import { useTransactionToast } from './toast';
import { expectedCommonErrorMessage } from '../../utils';
import { useSignTransaction } from '../../hooks/signature';
import { validateResult } from '../utils/validate-result';

interface TransactionSendContextType {
  clearAll: () => void;
  signTransaction: {
    confirmTransaction: (callback?: (() => void) | undefined) => Promise<void>;
    declineTransaction: (transactionId: string) => Promise<void>;
    isTransactionLoading: boolean;
    isTransactionSuccess: boolean;
    setCurrentTransaction: (transaction: ITransaction) => void;
    retryTransaction: () => Promise<void>;
  };
}

const TransactionSendContext = createContext<TransactionSendContextType>(
  {} as TransactionSendContextType,
);

const TransactionSendProvider = (props: PropsWithChildren) => {
  const toast = useTransactionToast();
  const transactionsRef = useRef<ITransaction[]>([]);

  const isExecuting = (transaction: ITransaction) =>
    !!transactionsRef.current.find((data) => data.id === transaction.id);

  const refetetchTransactionList = () => {
    const queries = ['home', 'transaction', 'assets'];
    queryClient.invalidateQueries({
      predicate: (query) => {
        return queries.some((value) => query.queryHash.includes(value));
      },
    });
  };

  const { mutate: sendTransaction } = useBakoSafeTransactionSend({
    onSuccess: (transaction) => {
      transactionsRef.current = transactionsRef.current.filter(
        (data) => data.id !== transaction.id,
      );
      refetetchTransactionList();
      validateResult(transaction);
    },

    // @ts-ignore
    onError: (error, { transaction }: { transaction: ITransaction }) => {
      const [errorMessage, id] = error.message.split(':');
      const errorMessageSecondCase = error.message || error.toString();

      // Essa tratativa de erro/solução é um caso específico, referente a situação/comentários do hook useBakoSafeTransactionSend(src/modules/core/hooks/bakosafe/transactions)
      // que devido a forma como o instanciamento das transações/vaults são feitos, está sendo retornado um erro de "not enough coins"
      // O que não é o caso, pois há validações para evitar que uma transação seja criada sem que haja o valor disponível no vault.
      // Essa solução (isCompleted) usa a mesma lógica do "transactionStatus" (caminho: src/modules/transactions/utils) para definir se uma transação foi concluída ou não.
      const isNotEnoughError =
        errorMessage.includes(expectedCommonErrorMessage) ||
        errorMessageSecondCase?.includes(expectedCommonErrorMessage);
      if (isNotEnoughError) {
        transactionsRef.current = transactionsRef.current.filter(
          (data) => data.id !== transaction.id,
        );

        refetetchTransactionList();
        const { requiredSigners, witnesses: witnessesResume } =
          transaction.resume;

        const signatureCount =
          witnessesResume?.filter((w) => w !== null).length ?? 0;

        const isCompleted = signatureCount >= requiredSigners;
        validateResult(transaction, isCompleted);

        return;
      }

      toast.error(id, errorMessage);
      refetetchTransactionList();
    },
  });

  const executeTransaction = (transaction: ITransaction) => {
    if (!isExecuting(transaction)) {
      transactionsRef.current.push(transaction);
      toast.loading(transaction);
      sendTransaction({ transaction });
    }
  };

  const {
    setCurrentTransaction,
    confirmTransaction,
    declineTransaction,
    isLoading: isTransactionLoading,
    isSuccess: isTransactionSuccess,
    retryTransaction,
  } = useSignTransaction({ isExecuting, executeTransaction });

  const clearAll = () => {
    transactionsRef.current = [];
    toast.closeAll();
  };

  return (
    <TransactionSendContext.Provider
      value={{
        clearAll,
        signTransaction: {
          setCurrentTransaction,
          confirmTransaction,
          declineTransaction,
          retryTransaction,
          isTransactionLoading,
          isTransactionSuccess,
        },
      }}
    >
      {props.children}
    </TransactionSendContext.Provider>
  );
};

const useTransactionSend = () => {
  return useContext(TransactionSendContext);
};

export { TransactionSendProvider, useTransactionSend };
