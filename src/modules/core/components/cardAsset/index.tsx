import {
  Box,
  Card,
  CardProps,
  Flex,
  Image,
  Text,
  VStack,
} from '@chakra-ui/react';

import { useWorkspaceContext } from '@/modules/workspace/WorkspaceProvider';

import { useGetTokenInfos } from '../../hooks';
import { Asset, NativeAssetId } from '../../utils';

interface DefaultAsset {
  assetId: string;
  amount: string;
  name: string;
  slug: string;
  icon?: string;
}

interface AssetDetailsProps {
  assetName: string;
  assetSlug: string;
  defaultAsset: DefaultAsset;
}

interface AssetCardProps extends CardProps {
  asset: Asset;
  visibleBalance?: boolean;
}

const AssetDetails = ({
  assetName,
  assetSlug,
  defaultAsset,
}: AssetDetailsProps) => {
  return (
    <Box maxW={{ base: '70%', lg: 'full' }}>
      <Text color="grey.100" fontSize={{ base: 'sm', sm: 15 }} isTruncated>
        {assetName ?? defaultAsset.name}
      </Text>

      <Text fontWeight="bold" fontSize="xs" color="grey.400">
        {assetSlug ?? defaultAsset.slug}
      </Text>
    </Box>
  );
};

const AssetCard = ({ asset, visibleBalance, ...rest }: AssetCardProps) => {
  const { assetsMap } = useWorkspaceContext();
  const defaultAsset = {
    ...assetsMap?.[NativeAssetId],
    assetId: NativeAssetId,
    amount: `0`,
  };

  const { assetAmount, assetsInfo } = useGetTokenInfos({
    ...asset,
    assetsMap,
  });

  return (
    <Card
      bgColor="grey.700"
      cursor="pointer"
      borderColor="grey.400"
      borderWidth="1px"
      borderRadius={10}
      px={4}
      py={4}
      w="full"
      h="full"
      {...rest}
    >
      <Flex
        direction={{ base: 'row', lg: 'column' }}
        alignItems="flex-start"
        gap={2}
        mb={1}
      >
        <Image
          w={{ base: 8, sm: 10 }}
          h={{ base: 8, sm: 10 }}
          src={assetsInfo?.icon ?? ''}
          alt="Asset Icon"
          objectFit="cover"
        />
        <AssetDetails
          assetName={assetsInfo.name}
          assetSlug={assetsInfo.slug}
          defaultAsset={defaultAsset}
        />
      </Flex>

      <VStack
        display="flex"
        alignItems="flex-start"
        flexDirection="column"
        justifyContent="center"
        spacing={1}
        gap={-1}
      >
        {visibleBalance ? (
          <Text fontWeight="bold" color="white" maxW="100%" isTruncated>
            {assetAmount ?? defaultAsset.amount}
          </Text>
        ) : (
          <Text color="white" fontSize="md" mr={1}>
            ------
          </Text>
        )}
      </VStack>
    </Card>
  );
};

export { AssetCard };
