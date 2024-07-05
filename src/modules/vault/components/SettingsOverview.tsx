import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import {
  Avatar,
  Box,
  Button,
  Center,
  Divider,
  Grid,
  Heading,
  HStack,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';
import { QRCodeSVG } from 'qrcode.react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { Card, CustomSkeleton } from '@/components';
import { AddressCopy } from '@/components/addressCopy';
import { useAuth } from '@/modules/auth';
import { CLISettingsCard } from '@/modules/cli/components';
import { CreateAPITokenDialog } from '@/modules/cli/components/APIToken/create';
import { useCLI } from '@/modules/cli/hooks';
import {
  AddressUtils,
  Pages,
  PermissionRoles,
  useScreenSize,
} from '@/modules/core';
import { useCreateTransaction } from '@/modules/transactions';
import { useWorkspace } from '@/modules/workspace';
import { limitCharacters } from '@/utils';

import { UseVaultDetailsReturn } from '../hooks/details';
import { openFaucet } from '../utils';

export interface CardDetailsProps {
  store: UseVaultDetailsReturn['store'];
  vault: UseVaultDetailsReturn['vault'];
  blockedTransfers: boolean;
}

const SettingsOverview = (props: CardDetailsProps): JSX.Element | null => {
  const navigate = useNavigate();
  const { vault, store, blockedTransfers } = props;
  const { balanceUSD } = store;
  const { isExtraSmall, vaultRequiredSizeToColumnLayout, isLarge } =
    useScreenSize();

  const { hasPermission } = useWorkspace();
  const {
    workspaces: { current },
  } = useAuth();

  const { isEthBalanceLowerThanReservedAmount } = useCreateTransaction();

  const { settings, hasPermission: hasCLIPermission, APIToken } = useCLI(vault);
  const { dialog, steps, tabs, create, list } = APIToken;

  const workspaceId = current ?? '';

  const reqPerm = [
    PermissionRoles.ADMIN,
    PermissionRoles.OWNER,
    PermissionRoles.MANAGER,
    PermissionRoles.SIGNER,
  ];
  const makeTransactionsPerm = useMemo(() => {
    const as = hasPermission(reqPerm);
    return as;
  }, [vault.id]);

  if (!vault) return null;

  return (
    <>
      <Box w="full">
        <Box mb={5} w="full">
          <Text color="grey.200" fontWeight="semibold" fontSize="20px">
            Settings
          </Text>
        </Box>

        <Grid
          gap={10}
          templateColumns={{
            base: 'repeat(1, 1fr)',
            md: hasCLIPermission ? '2fr 1fr' : 'repeat(1, 1fr)',
            lg:
              hasCLIPermission && vaultRequiredSizeToColumnLayout
                ? '2fr 1fr'
                : 'repeat(1, 1fr)',
            xl: !hasCLIPermission || isLarge ? 'repeat(1, 1fr)' : '3fr 1fr',
          }}
        >
          <CustomSkeleton isLoaded={!vault.isLoading} w="full">
            <Card
              p={{ base: 4, sm: 8 }}
              bg="gradients.transaction-card"
              backdropFilter="blur(6px)"
              position="relative"
              borderColor="gradients.transaction-border"
              boxShadow="lg"
            >
              <Stack direction={{ base: 'column', sm: 'row' }}>
                <VStack
                  spacing={{ base: 6, sm: 9 }}
                  w="full"
                  pr={3}
                  justifyContent="space-between"
                >
                  <Stack
                    direction={{ base: 'column', sm: 'row' }}
                    alignItems={{ base: 'flex-start', sm: 'center' }}
                    spacing={{ base: 3, sm: 6 }}
                    w="full"
                    maxW={{ base: 'full', sm: '100%' }}
                  >
                    <Center>
                      <Avatar
                        variant="roundedSquare"
                        name={vault.name}
                        bg="grey.900"
                        color="white"
                        size={'lg'}
                        p={{ base: 10, sm: 10 }}
                      />
                    </Center>
                    <Box maxW="59%">
                      <Heading
                        mb={1}
                        variant="title-xl"
                        fontSize={{ base: 'md', sm: 'xl' }}
                        isTruncated
                        maxW={{ base: 250, xs: 400, md: 350, lg: 350 }}
                      >
                        {isExtraSmall
                          ? limitCharacters(vault?.name ?? '', 10)
                          : vault?.name}
                      </Heading>

                      <Box maxW={420}>
                        <Text variant="description">{vault?.description}</Text>
                      </Box>
                    </Box>
                  </Stack>

                  <VStack w="full" spacing={5}>
                    <Box w="full" maxW="full">
                      <Stack
                        justifyContent={{
                          base: 'flex-start',
                          sm: 'space-between',
                        }}
                        alignItems={{ base: 'flex-start', sm: 'center' }}
                        direction={{ base: 'column', sm: 'row' }}
                        mb={2}
                      >
                        <Text
                          variant="description"
                          maxW={{ base: 20, xs: 'unset' }}
                          noOfLines={2}
                        >
                          {/* Vault {isExtraSmall ? <Text>balance</Text> : 'balance'} */}
                          Vault balance
                        </Text>
                        <HStack spacing={2}>
                          <HStack spacing={2}>
                            <Heading
                              variant="title-xl"
                              fontSize={{ base: 'md', sm: 'lg' }}
                            >
                              {store.visebleBalance
                                ? `${balanceUSD} USD`
                                : '-----'}
                            </Heading>
                          </HStack>
                          <Box
                            display="flex"
                            width="18%"
                            justifyContent="center"
                            alignItems="center"
                            onClick={() =>
                              store.setVisibleBalance(!store.visebleBalance)
                            }
                          >
                            {store.visebleBalance ? (
                              <ViewIcon boxSize={{ base: 5, sm: 6 }} />
                            ) : (
                              <ViewOffIcon boxSize={{ base: 5, sm: 6 }} />
                            )}
                          </Box>
                        </HStack>
                      </Stack>
                    </Box>

                    <Divider
                      w="full"
                      mt={{ base: 0, sm: 0 }}
                      borderColor="dark.100"
                    />

                    <HStack
                      w="full"
                      justifySelf="end"
                      spacing={{ base: 8, sm: 40 }}
                    >
                      <VStack w="full" spacing={2} alignItems="flex-start">
                        <Button
                          minW={isExtraSmall ? 110 : { base: 125, sm: 130 }}
                          variant="primary"
                          onClick={() => openFaucet(vault.predicateAddress!)}
                          position="relative"
                        >
                          Faucet
                        </Button>
                        <Text
                          variant="description"
                          fontSize="xs"
                          position={{ base: 'unset', xs: 'absolute' }}
                          bottom={{ base: -1, sm: 2 }}
                        >
                          Use the faucet to add assets to the vault
                        </Text>
                      </VStack>

                      <VStack
                        w="full"
                        spacing={0}
                        position="relative"
                        alignSelf={{ base: 'flex-start', xs: 'unset' }}
                      >
                        <Button
                          minW={isExtraSmall ? 110 : { base: 125, sm: 130 }}
                          variant="primary"
                          alignSelf="end"
                          isDisabled={
                            !vault?.hasBalance ||
                            blockedTransfers ||
                            !makeTransactionsPerm ||
                            isEthBalanceLowerThanReservedAmount
                          }
                          onClick={() =>
                            navigate(
                              Pages.createTransaction({
                                vaultId: vault.id!,
                                workspaceId,
                              }),
                            )
                          }
                        >
                          Send
                        </Button>

                        {isEthBalanceLowerThanReservedAmount &&
                          !blockedTransfers && (
                            <Text
                              variant="description"
                              textAlign={isExtraSmall ? 'left' : 'right'}
                              fontSize="xs"
                              w="full"
                              mt={2}
                              color="error.500"
                              position={{ base: 'unset', xs: 'absolute' }}
                              bottom={isExtraSmall ? -10 : { base: -5, sm: -6 }}
                            >
                              Not enough balance.
                            </Text>
                          )}

                        {blockedTransfers ? (
                          <Text
                            variant="description"
                            textAlign={isExtraSmall ? 'left' : 'right'}
                            fontSize="xs"
                            w="full"
                            mt={2}
                            color="error.500"
                            position={{ base: 'unset', xs: 'absolute' }}
                            bottom={isExtraSmall ? -10 : { base: -5, sm: -6 }}
                          >
                            Pending transactions
                          </Text>
                        ) : !makeTransactionsPerm ? (
                          <Text
                            variant="description"
                            fontSize="xs"
                            color="error.500"
                            position="absolute"
                            bottom={[-1, 2]}
                          >
                            You dont have permission to send transactions.
                          </Text>
                        ) : (
                          <Text
                            hidden={true}
                            variant="description"
                            fontSize="xs"
                          >
                            Send single or batch <br /> payments with multi
                            assets.
                          </Text>
                        )}
                      </VStack>
                    </HStack>
                  </VStack>
                </VStack>

                <VStack
                  position={{ base: 'absolute', sm: 'relative' }}
                  top={{ base: 4, sm: 0 }}
                  right={{ base: 4, sm: 0 }}
                  spacing={4}
                  align={{ base: 'flex-end', sm: 'center' }}
                  justifyContent="flex-start"
                >
                  <Box
                    p={3}
                    backgroundColor={'white'}
                    w={{ base: 32, sm: 180 }}
                    h={{ base: 32, sm: 180 }}
                    borderRadius={10}
                  >
                    <QRCodeSVG
                      value={vault.predicateAddress!}
                      fgColor="black"
                      bgColor="white"
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: 10,
                      }}
                    />
                  </Box>
                  <AddressCopy
                    w="full"
                    mb={{ base: 4, sm: 0 }}
                    maxW={{ base: '40', sm: 180 }}
                    address={AddressUtils.format(vault.predicateAddress)!}
                    addressToCopy={vault.predicateAddress!}
                  />
                </VStack>
              </Stack>
            </Card>
          </CustomSkeleton>

          {hasCLIPermission && (
            <CustomSkeleton isLoaded={!vault.isLoading}>
              <Grid
                gap={2}
                templateColumns={{
                  base: '1fr',
                  xs: 'repeat(2, 1fr)',
                  md: '1fr',
                  lg: vaultRequiredSizeToColumnLayout
                    ? 'repeat(1, 1fr)'
                    : 'repeat(2, 1fr)',
                  xl: isLarge ? 'repeat(2, 1fr)' : 'repeat(1, 1fr)',
                }}
              >
                {settings.map((setting) => (
                  <CLISettingsCard
                    key={setting.label}
                    onClick={setting.onClick}
                    icon={setting.icon}
                    label={setting.label}
                    disabled={setting.disabled}
                  />
                ))}
              </Grid>
            </CustomSkeleton>
          )}
        </Grid>
      </Box>

      <CreateAPITokenDialog
        control={dialog}
        steps={steps}
        tabs={tabs}
        create={create}
        list={list}
      />
    </>
  );
};

export { SettingsOverview };
