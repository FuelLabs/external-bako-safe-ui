import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Grid,
  GridItem,
  HStack,
  Icon,
  Text,
  VStack,
} from '@chakra-ui/react';
import { CgList } from 'react-icons/cg';
import { FaRegPlusSquare } from 'react-icons/fa';
import { GoArrowSwitch } from 'react-icons/go';
import { IoChevronBack } from 'react-icons/io5';

import { CustomSkeleton, HomeIcon, VaultIcon } from '@/components';
import { useAuth } from '@/modules/auth';
import { Pages, PermissionRoles } from '@/modules/core';
import { ActionCard } from '@/modules/home/components/ActionCard';
import { EmptyVault } from '@/modules/home/components/EmptyCard/Vault';
import { useHome } from '@/modules/home/hooks/useHome';
import { useGetCurrentWorkspace } from '@/modules/workspace';
import { useSelectWorkspace } from '@/modules/workspace/hooks/select';
import { useWorkspace } from '@/modules/workspace/hooks/useWorkspace';

import { VaultCard } from '../../components';
import { useUserVaults } from '../../hooks/user-vaults/useUserVaults';

const UserVaultsPage = () => {
  const {
    navigate,
    vaultsRequest: { vaults, loadingVaults },
  } = useUserVaults();

  const { MANAGER, OWNER, ADMIN } = PermissionRoles;
  const { hasPermission, goWorkspace } = useWorkspace();
  const { goHome } = useHome();
  const { selectWorkspace } = useSelectWorkspace();
  const {
    workspaces: { current, single },
    isSingleWorkspace,
  } = useAuth();

  const { workspace } = useGetCurrentWorkspace();

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
              current == single ? goHome() : goWorkspace(current)
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
                  onClick={() => goWorkspace(current)} //
                >
                  {workspace?.name}
                  {/* use request of workspace  */}
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
                Vaults
              </BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
        </HStack>

        <Box>
          <Button
            variant="primary"
            fontWeight="bold"
            leftIcon={<FaRegPlusSquare />}
            isDisabled={!hasPermission([OWNER, MANAGER])}
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

      <HStack w="full" spacing={6}>
        <ActionCard.Container
          onClick={() =>
            navigate(
              Pages.userVaults({
                workspaceId: current,
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
        <ActionCard.Container
          onClick={() => {
            navigate(
              Pages.userTransactions({
                workspaceId: current,
              }),
            );
          }}
        >
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
                workspaceId: current,
              }),
            )
          }
        >
          <ActionCard.Icon icon={CgList} />
          <Box>
            <ActionCard.Title>Address book</ActionCard.Title>
            <ActionCard.Description>
              Access and Manage Your Contacts for Easy Transfers and Vault
              Creation.
            </ActionCard.Description>
          </Box>
        </ActionCard.Container>
      </HStack>

      {/* USER VAULTS */}
      <Box mt={4} mb={-2} alignSelf="flex-start">
        <Text
          variant="subtitle"
          fontWeight="semibold"
          fontSize="xl"
          color="grey.200"
        >
          Vaults
        </Text>
      </Box>

      {!vaults?.length && (
        <CustomSkeleton isLoaded={!loadingVaults}>
          <EmptyVault
            showActionButton={hasPermission([OWNER, MANAGER, ADMIN])}
          />
        </CustomSkeleton>
      )}

      <Grid w="full" templateColumns="repeat(4, 1fr)" gap={6} pb={28}>
        {vaults?.map(({ id, name, workspace, members, description }) => {
          return (
            <GridItem key={id}>
              <CustomSkeleton isLoaded={!loadingVaults}>
                <VaultCard
                  id={id}
                  name={name}
                  workspace={workspace}
                  title={description}
                  members={members!}
                  onClick={() => {
                    selectWorkspace(workspace.id, {
                      onSelect: (_workspace) =>
                        navigate(
                          Pages.detailsVault({
                            vaultId: id,
                            workspaceId: _workspace.id,
                          }),
                        ),
                    });
                  }}
                />
              </CustomSkeleton>
            </GridItem>
          );
        })}
      </Grid>
    </VStack>
  );
};

export { UserVaultsPage };
