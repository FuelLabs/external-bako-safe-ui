import { Avatar, Center, chakra, Divider, Text } from '@chakra-ui/react';
import { AddressType, ChainName } from '@fuel-ts/providers';
import { Vault } from 'bakosafe';
import React from 'react';

import { Card } from '@/components';
import { AddressCopy } from '@/components/addressCopy';
import { AddressUtils } from '@/modules/core';

interface RecipientProps {
  type: AddressType;
  address: string;
  isSender?: boolean;
  vault?: Pick<Vault['BakoSafeVault'], 'name' | 'predicateAddress'>;
  /* TODO: Check chain name to show is ETH or Fuel */
  chain?: ChainName;
  fullBorderRadius?: boolean;
}

export const RecipientCard = chakra(Card, {
  baseStyle: {
    py: 4,
    w: 'full',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    minH: '100%',
    alignSelf: 'stretch',
  },
});

const DappTransactionRecipient = ({
  type,
  address,
  vault,
  isSender,
  fullBorderRadius,
}: RecipientProps) => {
  const bech32Address = address;

  const isVault = bech32Address === vault?.predicateAddress;
  const isContract = type === AddressType.contract;
  const title = isVault ? vault?.name : 'Unknown';

  return (
    <RecipientCard
      borderBottomRadius={fullBorderRadius ? 10 : 0}
      bg="grey.825"
      h={149}
      w={174}
    >
      <Text variant="description" textAlign="center" mt={-2} color="grey.250">
        {isSender ? 'From' : 'To'}: {isContract && '(Contract)'}
      </Text>
      <Divider borderColor="dark.100" mt={1} mb="10px" />
      <Center flexDirection="column" h={88}>
        <Avatar
          mb={2}
          name={title}
          color="white"
          bgColor="grey.950"
          variant="roundedSquare"
          boxSize="40px"
        />
        <Text textAlign="center" variant="title" mb={1} fontSize={14}>
          {title}
        </Text>

        <AddressCopy
          flexDir="row-reverse"
          address={AddressUtils.format(bech32Address ?? '')!}
          addressToCopy={bech32Address}
          bg="transparent"
          p={0}
          gap={3}
          fontSize={14}
        />
      </Center>
    </RecipientCard>
  );
};

export { DappTransactionRecipient };
