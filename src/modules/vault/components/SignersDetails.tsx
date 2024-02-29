import { Badge, Box, chakra, HStack, Text, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

import { Card, CustomSkeleton } from '@/components';
import { useAddressBook } from '@/modules/addressBook';
import { useAuth } from '@/modules/auth';
import { SignersDetailsProps } from '@/modules/core/models/predicate';
import { Pages } from '@/modules/core/routes';

import { CardMember } from './CardMember';

const SignerCard = chakra(Card, {
  baseStyle: {
    w: 'full',
    py: 5,
    px: 6,
    bgColor: 'dark.300',
    flex: 1,
  },
});

const SignersDetails = (props: SignersDetailsProps) => {
  const navigate = useNavigate();
  const { contactByAddress } = useAddressBook();
  const {
    workspaces: { current },
  } = useAuth();

  const { vault } = props;

  const isBig = !vault?.members ? 0 : vault?.members.length - 4;

  if (!vault) return null;

  const owner = vault.members?.find((member) => member.id === vault.owner?.id);
  const notOwners =
    vault.members?.filter((member) => member.id !== vault.owner?.id) ?? [];

  // Order members with owner in first position
  const members = [owner, ...notOwners];

  return (
    <Box w="md">
      <HStack alignItems="flex-start" mb={5} w="full" spacing={8}>
        <Text color="grey.400" fontWeight="semibold" fontSize="20px">
          Signers
        </Text>
        <Badge p={1} rounded="xl" px={4} fontWeight="semibold" variant="gray">
          Required signers {vault?.minSigners}/{vault.members?.length}
        </Badge>
      </HStack>
      <VStack spacing={5}>
        {members?.map((member, index: number) => {
          const max = 3;

          if (isBig > 0 && index > max) return;

          if (isBig > 0 && index == max) {
            return (
              <CustomSkeleton isLoaded={!vault.isLoading} key={index}>
                <SignerCard borderStyle="dashed">
                  <HStack
                    w="100%"
                    spacing={0}
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    flexDirection="column"
                    cursor="pointer"
                    onClick={() =>
                      navigate(
                        Pages.vaultSettings({
                          vaultId: vault.id!,
                          workspaceId: current,
                        }),
                      )
                    }
                  >
                    <Text variant="description" fontSize="lg" fontWeight="bold">
                      +{isBig + 1}
                    </Text>
                    <Text variant="description" fontSize="md">
                      View all
                    </Text>
                  </HStack>
                </SignerCard>
              </CustomSkeleton>
            );
          }

          return (
            <CustomSkeleton isLoaded={!vault.isLoading} key={index}>
              <CardMember
                isOwner={member?.id === owner?.id}
                member={{
                  ...member,
                  nickname: member?.address
                    ? contactByAddress(member?.address)?.nickname ?? undefined
                    : undefined,
                  avatar: member?.avatar ?? '',
                  address: member?.address ?? '',
                }}
              />
            </CustomSkeleton>
          );
        })}
      </VStack>
    </Box>
  );
};

export { SignersDetails };
