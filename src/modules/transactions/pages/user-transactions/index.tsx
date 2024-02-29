import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Heading,
  HStack,
  Icon,
  VStack,
} from '@chakra-ui/react';
import { format } from 'date-fns';
import { FaRegPlusSquare } from 'react-icons/fa';
import { GoArrowSwitch } from 'react-icons/go';
import { IoChevronBack } from 'react-icons/io5';

import { CustomSkeleton, HomeIcon, VaultIcon } from '@/components';
import { AddressBookIcon } from '@/components/icons/address-book';
import { useAuth } from '@/modules/auth';
import { Pages, PermissionRoles } from '@/modules/core';
import { ActionCard } from '@/modules/home/components/ActionCard';
import { EmptyTransaction } from '@/modules/home/components/EmptyCard/Transaction';
import { useHome } from '@/modules/home/hooks/useHome';
import { useGetCurrentWorkspace, useWorkspace } from '@/modules/workspace';
import { limitCharacters } from '@/utils';

import {
  TransactionCard,
  TransactionFilter,
  WaitingSignatureBadge,
} from '../../components';
import { StatusFilter, useTransactionList } from '../../hooks';
import { transactionStatus } from '../../utils';

const UserTransactionsPage = () => {
  const {
    transactionRequest,
    filter,
    inView,
    account,
    navigate,
    pendingSignerTransactions,
    hasSkeleton,
  } = useTransactionList();

  const { hasPermission, goWorkspace } = useWorkspace();
  const {
    isSingleWorkspace,
    workspaces: { current },
  } = useAuth();

  const { workspace } = useGetCurrentWorkspace();

  const { goHome } = useHome();
  const { OWNER, MANAGER } = PermissionRoles;

  return (
    <VStack w="full" spacing={6}>
      <HStack w="full" h="10" justifyContent="space-between" my={2}>
        <HStack>
          <Button
            variant="primary"
            fontWeight="semibold"
            fontSize={15}
            leftIcon={
              <Box mr={-1}>
                <IoChevronBack size={22} />
              </Box>
            }
            px={3}
            bg="dark.100"
            color="grey.200"
            onClick={() =>
              isSingleWorkspace ? goHome() : goWorkspace(current ?? '')
            }
          >
            Back home
          </Button>

          <Breadcrumb ml={8}>
            <BreadcrumbItem>
              <Icon mr={2} as={HomeIcon} fontSize="sm" color="grey.200" />
              <BreadcrumbLink
                fontSize="sm"
                color="grey.200"
                fontWeight="semibold"
                onClick={() => goHome()}
              >
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>

            {!isSingleWorkspace && (
              <BreadcrumbItem>
                <BreadcrumbLink
                  fontSize="sm"
                  color="grey.200"
                  fontWeight="semibold"
                  onClick={() => goWorkspace(current)}
                >
                  {workspace?.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
            )}

            <BreadcrumbItem>
              <BreadcrumbLink
                fontSize="sm"
                color="grey.200"
                fontWeight="semibold"
                href="#"
              >
                My Transactions
              </BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
        </HStack>

        <Box>
          <Button
            isDisabled={!hasPermission([OWNER, MANAGER])}
            variant="primary"
            fontWeight="bold"
            leftIcon={<FaRegPlusSquare />}
            onClick={() =>
              navigate(
                Pages.createVault({
                  workspaceId: current,
                }),
              )
            }
          >
            Create vault
          </Button>
        </Box>
      </HStack>

      {/* ACTION BUTTONS */}
      <HStack w="full" spacing={6}>
        <ActionCard.Container
          onClick={() =>
            navigate(
              Pages.userVaults({
                workspaceId: current ?? '',
              }),
            )
          }
        >
          <ActionCard.Icon icon={VaultIcon} />
          <Box>
            <ActionCard.Title>Vaults</ActionCard.Title>
            <ActionCard.Description>
              Access and Manage All Your Vaults in One Place.
            </ActionCard.Description>
          </Box>
        </ActionCard.Container>

        <ActionCard.Container cursor="auto">
          <ActionCard.Icon icon={GoArrowSwitch} />
          <Box>
            <ActionCard.Title>Transactions</ActionCard.Title>
            <ActionCard.Description>
              Manage Transactions Across All Vaults in One Place.
            </ActionCard.Description>
          </Box>
        </ActionCard.Container>

        <ActionCard.Container
          onClick={() =>
            navigate(
              Pages.addressBook({
                workspaceId: current ?? '',
              }),
            )
          }
        >
          <ActionCard.Icon icon={AddressBookIcon} />
          <Box>
            <ActionCard.Title>Address book</ActionCard.Title>
            <ActionCard.Description>
              Access and Manage Your Contacts for Easy Transfers and Vault
              Creation.
            </ActionCard.Description>
          </Box>
        </ActionCard.Container>
      </HStack>

      {/* USER TRANSACTIONS */}
      <VStack w="full" mt={6}>
        <HStack w="full">
          <Heading variant="title-xl" color="grey.200">
            Transactions
          </Heading>
          <WaitingSignatureBadge
            isLoading={pendingSignerTransactions.isLoading}
            quantity={pendingSignerTransactions.data?.ofUser ?? 0}
          />
        </HStack>

        {/* FILTER */}
        <Box w="full" mt={3}>
          <TransactionFilter.Control
            value={filter.value!}
            onChange={(value) => {
              filter.set(value as StatusFilter);
            }}
          >
            <TransactionFilter.Field value={StatusFilter.ALL} label="All" />
            <TransactionFilter.Field
              value={StatusFilter.COMPLETED}
              label="Completed"
            />
            <TransactionFilter.Field
              value={StatusFilter.DECLINED}
              label="Declined"
            />
            <TransactionFilter.Field
              value={StatusFilter.PENDING}
              label="Pending"
            />
          </TransactionFilter.Control>
        </Box>
      </VStack>

      {/* LIST */}
      <TransactionCard.List
        mt={1}
        w="full"
        spacing={5}
        maxH="calc(100% - 140px)"
        overflowY="scroll"
        css={{ '::-webkit-scrollbar': { width: '0' }, scrollbarWidth: 'none' }}
      >
        {!transactionRequest.isLoading &&
          !transactionRequest?.transactions.length && <EmptyTransaction />}
        {transactionRequest.transactions.map((transaction) => {
          const isSigner = !!transaction.predicate?.members?.find(
            (member) => member.address === account,
          );

          return (
            <CustomSkeleton key={transaction.id} isLoaded={!hasSkeleton}>
              <TransactionCard.Container
                status={transactionStatus({ ...transaction, account })}
                details={<TransactionCard.Details transaction={transaction} />}
              >
                {transaction.predicate && (
                  <TransactionCard.VaultInfo vault={transaction.predicate} />
                )}
                <TransactionCard.CreationDate>
                  {format(new Date(transaction.createdAt), 'EEE, dd MMM')}
                </TransactionCard.CreationDate>
                <TransactionCard.Assets />
                <TransactionCard.Amount assets={transaction.resume.outputs} />
                <TransactionCard.Name>
                  {limitCharacters(transaction.name, 20)}
                </TransactionCard.Name>
                <TransactionCard.Status
                  transaction={transaction}
                  status={transactionStatus({ ...transaction, account })}
                />
                <TransactionCard.Actions
                  isSigner={isSigner}
                  transaction={transaction}
                  status={transactionStatus({ ...transaction, account })}
                />
              </TransactionCard.Container>
            </CustomSkeleton>
          );
        })}
        <Box ref={inView.ref} />
      </TransactionCard.List>
    </VStack>
  );
};

export { UserTransactionsPage };
