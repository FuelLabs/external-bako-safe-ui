import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Divider,
  HStack,
  Icon,
  Spacer,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { RiMenuUnfoldLine } from 'react-icons/ri';

import { CustomSkeleton, HomeIcon, TransactionTypeFilters } from '@/components';
import { EmptyState } from '@/components/emptyState';
import { Drawer } from '@/layouts/dashboard/drawer';
import { PermissionRoles } from '@/modules/core';
import { useGetParams, useScreenSize } from '@/modules/core/hooks';
import { Pages } from '@/modules/core/routes';
import { useTemplateStore } from '@/modules/template/store/useTemplateStore';
import {
  TransactionCard,
  TransactionCardMobile,
  transactionStatus,
  WaitingSignatureBadge,
} from '@/modules/transactions';
import { limitCharacters } from '@/utils/limit-characters';

import { CardDetails } from '../../components/CardDetails';
import { SignersDetails } from '../../components/SignersDetails';
import { useVaultInfosContext } from '../../VaultInfosProvider';
import { useNavigate } from 'react-router-dom';
import { useWorkspaceContext } from '@/modules/workspace/WorkspaceProvider';
import { useTransactionsContext } from '@/modules/transactions/providers/TransactionsProvider';

const VaultDetailsPage = () => {
  const menuDrawer = useDisclosure();
  const {
    vaultPageParams: { workspaceId: vaultWkId },
  } = useGetParams();
  const navigate = useNavigate();
  const { vaultPageParams } = useGetParams();
  const { vault, assets, account, pendingSignerTransactions, isPendingSigner } =
    useVaultInfosContext();

  const {
    transactionsPageList: {
      lists: { vaultDetailsLimitedTransactions },
      request: { isLoading },
      handlers: { handleIncomingAction, handleOutgoingAction },
    },
  } = useTransactionsContext();

  const { setTemplateFormInitial } = useTemplateStore();

  const {
    authDetails: { userInfos },
    workspaceInfos: {
      handlers: { handleWorkspaceSelection, hasPermission, goHome },
    },
  } = useWorkspaceContext();
  const { vaultRequiredSizeToColumnLayout, isSmall, isMobile, isLarge } =
    useScreenSize();

  const workspaceId = userInfos.workspace?.id ?? '';
  const hasTransactions = !isLoading && vaultDetailsLimitedTransactions?.length;

  const { OWNER, SIGNER } = PermissionRoles;

  const canSetTemplate = hasPermission([SIGNER]) || hasPermission([OWNER]);

  const hideSetTemplateButton = true;

  if (!vault) return null;

  return (
    <Box w="full">
      <Drawer isOpen={menuDrawer.isOpen} onClose={menuDrawer.onClose} />

      <HStack mb={9} w="full" justifyContent="space-between">
        {vaultRequiredSizeToColumnLayout ? (
          <HStack gap={1.5} onClick={menuDrawer.onOpen}>
            <Icon as={RiMenuUnfoldLine} fontSize="xl" color="grey.200" />
            <Text fontSize="sm" fontWeight="normal" color="grey.100">
              Menu
            </Text>
          </HStack>
        ) : (
          <Breadcrumb>
            <BreadcrumbItem>
              <BreadcrumbLink
                fontSize="sm"
                color="grey.200"
                fontWeight="semibold"
                onClick={() => goHome()}
              >
                <Icon mr={2} as={HomeIcon} fontSize="sm" color="grey.200" />
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>

            {!userInfos.onSingleWorkspace && (
              <BreadcrumbItem>
                <BreadcrumbLink
                  fontSize="sm"
                  color="grey.200"
                  fontWeight="semibold"
                  onClick={() =>
                    handleWorkspaceSelection(
                      workspaceId,
                      Pages.workspace({
                        workspaceId: userInfos.workspace?.id,
                      }),
                    )
                  }
                  maxW={40}
                  isTruncated
                >
                  {userInfos.workspace?.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
            )}

            <BreadcrumbItem>
              <BreadcrumbLink
                fontSize="sm"
                color="grey.200"
                fontWeight="semibold"
                onClick={() =>
                  navigate(
                    Pages.userVaults({
                      workspaceId,
                    }),
                  )
                }
              >
                Vaults
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbItem>
              <BreadcrumbLink
                fontSize="sm"
                color="grey.200"
                fontWeight="semibold"
                href="#"
                isTruncated
                maxW={640}
              >
                {limitCharacters(vault?.data?.name ?? '', 25)}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
        )}
        {!hideSetTemplateButton && (
          <Button
            color="dark.200"
            bgColor="grey.200"
            fontWeight="medium"
            fontSize={{ base: 'sm', sm: 'md' }}
            border="none"
            isDisabled={!canSetTemplate || true} // todo: fix this
            onClick={() => {
              if (
                !vault.data?.id ||
                !vault.data?.minSigners ||
                !vault.data.members ||
                !vaultPageParams.workspaceId
              )
                return;
              setTemplateFormInitial({
                minSigners: vault.data?.minSigners!,
                addresses:
                  vault.data.members! &&
                  vault.data?.members.map((signer) => signer.address),
              });
              navigate(
                Pages.createTemplate({
                  vaultId: vault.data.id!,
                  workspaceId: vaultPageParams.workspaceId!,
                }),
              );
            }}
          >
            Set as template
          </Button>
        )}
      </HStack>

      <HStack
        mb={{ base: 10, sm: 14 }}
        alignItems="flex-start"
        w="full"
        gap={10}
      >
        <CardDetails
          vault={vault}
          assets={assets}
          isPendingSigner={isPendingSigner}
        />

        {!isLarge && <SignersDetails vault={vault} />}
      </HStack>
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
      </Box>

      <CustomSkeleton
        minH="30vh"
        isLoaded={!vault.isLoading && !isLoading}
        h={!vault.isLoading && !isLoading ? 'unset' : '100px'}
      >
        {hasTransactions
          ? vaultDetailsLimitedTransactions?.map((grouped) => (
              <>
                <HStack w="full">
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
                <TransactionCard.List
                  mt={5}
                  w="full"
                  maxH={{ base: undefined, sm: 'calc(100% - 82px)' }}
                  spacing={0}
                >
                  {grouped?.transactions?.map((transaction) => {
                    const status = transactionStatus({
                      ...transaction,
                      account,
                    });
                    const isSigner = !!transaction.predicate?.members?.find(
                      (member) => member.address === account,
                    );

                    return (
                      <>
                        {isMobile ? (
                          <TransactionCardMobile
                            isSigner={isSigner}
                            transaction={transaction}
                            account={account}
                            mt={2.5}
                            w="full"
                          />
                        ) : (
                          <TransactionCard.Container
                            mb={2.5}
                            key={transaction.id}
                            status={status}
                            isSigner={isSigner}
                            transaction={transaction}
                            account={account}
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
                </TransactionCard.List>
              </>
            ))
          : !hasTransactions &&
            !!vaultDetailsLimitedTransactions && (
              <EmptyState
                isDisabled={!assets.hasBalance}
                buttonAction={() =>
                  navigate(
                    Pages.createTransaction({
                      workspaceId: vaultWkId!,
                      vaultId: vault?.data?.id!,
                    }),
                  )
                }
                mb={10}
              />
            )}
      </CustomSkeleton>

      {isLarge && (
        <Box mt={7}>
          <SignersDetails vault={vault} />
        </Box>
      )}
    </Box>
  );
};

export { VaultDetailsPage };
