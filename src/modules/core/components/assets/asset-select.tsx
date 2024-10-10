import { FormControl } from '@chakra-ui/react';
import React from 'react';

import { Select, SelectProps } from '@/components';
import {
  Asset,
  assetsList,
  useGetTokenInfosArray,
  useSortTokenInfosArray,
} from '@/modules/core';
import { useWorkspaceContext } from '@/modules/workspace/WorkspaceProvider';

interface Props extends SelectProps {
  assets?: Asset[];
  helperText?: React.ReactNode;
}

function AssetSelect(props: Props) {
  const { assetsMap } = useWorkspaceContext();
  const formattedAssets = useGetTokenInfosArray(
    props.assets ?? assetsList,
    assetsMap,
  );
  const sortedAssets = useSortTokenInfosArray(formattedAssets, assetsMap);

  return (
    <FormControl
      sx={{
        input: {
          boxShadow: 'none !important',
        },
      }}
    >
      <Select
        variant="dark"
        label="Asset"
        value={props.value}
        isInvalid={props.isInvalid}
        onChange={props.onChange}
        options={sortedAssets.map((asset) => ({
          label: `${asset.slug} - ${asset.name}`,
          value: asset.assetId,
        }))}
        maxOptionsHeight={120}
        style={{
          color: '#CFCCC9',
          fontWeight: 600,
          fontSize: '14px',
          height: '50px',
          border: '1px solid',
          borderColor: '#868079',
        }}
      />
      {props.helperText}
    </FormControl>
  );
}

export { AssetSelect };
