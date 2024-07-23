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
import { useAuth } from '@/modules/auth';
import { PermissionRoles } from '@/modules/core';
import { useGetParams, useScreenSize } from '@/modules/core/hooks';
import { Pages } from '@/modules/core/routes';
import { useHome } from '@/modules/home/hooks/useHome';
import { useTemplateStore } from '@/modules/template/store/useTemplateStore';
import {
  TransactionCard,
  TransactionCardMobile,
  transactionStatus,
  WaitingSignatureBadge,
} from '@/modules/transactions';
import { useGetCurrentWorkspace } from '@/modules/workspace';
import { useWorkspace } from '@/modules/workspace/hooks/useWorkspace';
import { limitCharacters } from '@/utils/limit-characters';

import { CardDetails } from '../../components/CardDetails';
import { SignersDetails } from '../../components/SignersDetails';
import { useVaultInfosContext } from '../../VaultInfosProvider';
import { useNavigate } from 'react-router-dom';

const VaultDetailsPage = () => {
  const menuDrawer = useDisclosure();
  const {
    vaultPageParams: { workspaceId: vaultWkId },
  } = useGetParams();
  const navigate = useNavigate();
  const { vaultPageParams } = useGetParams();
  const {
    vault,
    assets,
    account,
    inView,
    pendingSignerTransactions,
    transactions,
    isPendingSigner,
  } = useVaultInfosContext();

  const { setTemplateFormInitial } = useTemplateStore();
  const { goWorkspace, hasPermission } = useWorkspace();
  const { workspace } = useGetCurrentWorkspace();

  const { transactions: vaultTransactions, isLoading } = transactions;

  const { goHome } = useHome();
  const {
    workspaces: { current },
  } = useAuth();
  const { vaultRequiredSizeToColumnLayout, isSmall, isMobile, isLarge } =
    useScreenSize();

  const workspaceId = current ?? '';
  const hasTransactions = !isLoading && vaultTransactions?.data?.length;

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

            {!workspace?.single && (
              <BreadcrumbItem>
                <BreadcrumbLink
                  fontSize="sm"
                  color="grey.200"
                  fontWeight="semibold"
                  onClick={() => goWorkspace(workspaceId)}
                  maxW={40}
                  isTruncated
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
                {limitCharacters(vault?.predicate?.name ?? '', 25)}
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
                !vault.predicate?.id ||
                !vault.predicate?.minSigners ||
                !vault.predicate.members ||
                !vaultPageParams.workspaceId
              )
                return;
              setTemplateFormInitial({
                minSigners: vault.predicate?.minSigners!,
                addresses:
                  vault.members! &&
                  vault.predicate?.members.map((signer) => signer.address),
              });
              navigate(
                Pages.createTemplate({
                  vaultId: vault.predicate.id!,
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
          incomingAction={transactions.handleIncomingAction}
          outgoingAction={transactions.handleOutgoingAction}
          buttonsFullWidth={isSmall}
        />
      </Box>

      <CustomSkeleton
        minH="30vh"
        isLoaded={!vault.isLoading && !isLoading}
        h={!vault.isLoading && !isLoading ? 'unset' : '100px'}
      >
        {hasTransactions
          ? vaultTransactions?.data.map((grouped) => (
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
                  {grouped?.transactions.map((transaction) => {
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

                        {!isLoading && <Box ref={inView.ref} />}
                      </>
                    );
                  })}
                </TransactionCard.List>
              </>
            ))
          : !hasTransactions &&
            !!vaultTransactions && (
              <EmptyState
                isDisabled={!assets.hasBalance}
                buttonAction={() =>
                  navigate(
                    Pages.createTransaction({
                      workspaceId: vaultWkId!,
                      vaultId: vault?.predicate?.id!,
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
