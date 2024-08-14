import { CustomSkeleton, TransactionTypeFilters } from '@/components';
import { EmptyState } from '@/components/emptyState';
import { Pages, useScreenSize } from '@/modules/core';
import {
  TransactionCard,
  TransactionCardMobile,
  WaitingSignatureBadge,
  transactionStatus,
} from '@/modules/transactions';
import {
  Box,
  Button,
  Divider,
  HStack,
  Icon,
  Spacer,
  Text,
} from '@chakra-ui/react';
import { MdKeyboardArrowRight } from 'react-icons/md';
import { css, keyframes } from '@emotion/react';
import { useEffect, useState } from 'react';
import { useWorkspaceContext } from '@/modules/workspace/WorkspaceProvider';
import { useTransactionsContext } from '@/modules/transactions/providers/TransactionsProvider';

const shakeAnimation = keyframes`
  0% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  50% { transform: translateX(2px); }
  75% { transform: translateX(-2px); }
  100% { transform: translateX(0); }
`;

const HomeTransactions = () => {
  const [hasTransactions, setHasTransactions] = useState(false);

  const {
    homeTransactions: {
      transactions,
      handlers: { handleIncomingAction, handleOutgoingAction },
      request: { isLoading },
    },
    pendingSignerTransactions,
  } = useTransactionsContext();

  const {
    authDetails: { userInfos },
    workspaceInfos: {
      requests: { latestPredicates },
      handlers: { navigate },
    },
  } = useWorkspaceContext();

  useEffect(() => {
    if (transactions && transactions.length >= 1 && !hasTransactions) {
      setHasTransactions(true);
    }
  }, [transactions]);

  const { isSmall, isMobile, isExtraSmall } = useScreenSize();

  return (
    <Box w="full" mt={{ base: 16, sm: 8 }}>
      <Box
        w="full"
        display="flex"
        flexDir={isSmall ? 'column' : 'row'}
        gap={4}
        mb={4}
      >
        <Box
          display="flex"
          flexDir={isSmall ? 'column' : 'row'}
          alignItems={isSmall ? 'unset' : 'center'}
          gap={isSmall ? 2 : 4}
        >
          <Text fontWeight={700} fontSize="md" color="grey.50">
            Transactions
          </Text>
          <WaitingSignatureBadge
            isLoading={pendingSignerTransactions.isLoading}
            quantity={pendingSignerTransactions.data?.ofUser ?? 0}
          />
        </Box>
        <Spacer />
        <TransactionTypeFilters
          incomingAction={handleIncomingAction}
          outgoingAction={handleOutgoingAction}
          buttonsFullWidth={isSmall}
        />

        <Button
          color="grey.75"
          variant="txFilterType"
          alignSelf={{ base: 'stretch', sm: 'flex-end' }}
          rightIcon={
            <Icon
              as={MdKeyboardArrowRight}
              fontSize="lg"
              ml={isSmall ? -1 : 0}
              className="btn-icon"
            />
          }
          onClick={() =>
            navigate(
              Pages.userTransactions({
                workspaceId: userInfos.workspace?.id,
              }),
            )
          }
          css={css`
            &:hover .btn-icon {
              animation: ${shakeAnimation} 0.5s ease-in-out;
            }
          `}
          px={isExtraSmall ? 3 : 4}
        >
          View all
        </Button>
      </Box>
      {!isLoading && !transactions?.length && <EmptyState showAction={false} />}

      {transactions?.map((grouped) => (
        <>
          <HStack>
            <Text
              fontSize="sm"
              fontWeight="semibold"
              color="grey.425"
              whiteSpace="nowrap"
            >
              {grouped.monthYear}
            </Text>

            <Divider w="full" borderColor="grey.950" />
          </HStack>
          <TransactionCard.List spacing={4} mt={isExtraSmall ? 0 : 7} mb={12}>
            <CustomSkeleton isLoaded={!latestPredicates.isLoading}>
              {grouped?.transactions.map((transaction) => {
                const status = transactionStatus({
                  ...transaction,
                  account: userInfos?.address,
                });
                const isSigner = !!transaction.predicate?.members?.find(
                  (member) => member.address === userInfos?.address,
                );

                return (
                  <>
                    {isMobile ? (
                      <TransactionCardMobile
                        isSigner={isSigner}
                        transaction={transaction}
                        account={userInfos?.address}
                        mt="15px"
                      />
                    ) : (
                      <TransactionCard.Container
                        mb="12px"
                        key={transaction.id}
                        status={status}
                        isSigner={isSigner}
                        transaction={transaction}
                        account={userInfos?.address}
                        details={
                          <TransactionCard.Details
                            transaction={transaction}
                            status={status}
                          />
                        }
                      />
                    )}
                  </>
                );
              })}
            </CustomSkeleton>
          </TransactionCard.List>
        </>
      ))}
    </Box>
  );
};
export default HomeTransactions;
