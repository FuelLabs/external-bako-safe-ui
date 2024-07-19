import { Vault } from 'bakosafe';
import { bn } from 'fuels';
import { useCallback, useMemo, useState } from 'react';
import { useQuery } from 'react-query';

import { useAuth } from '@/modules/auth/hooks';
import { assetsMap, ETHDefault, NativeAssetId } from '@/modules/core';

const IS_VISIBLE_KEY = '@bakosafe/balance-is-visible';

const isVisibleBalance = () => localStorage.getItem(IS_VISIBLE_KEY) === 'true';
const setIsVisibleBalance = (isVisible: 'true' | 'false') =>
  localStorage.setItem(IS_VISIBLE_KEY, isVisible);

import { VaultService } from '../../services';

const balancesToAssets = async (predicate?: Vault) => {
  if (!predicate) return {};

  const { currentBalanceUSD, currentBalance } =
    await VaultService.hasReservedCoins(predicate.BakoSafeVaultId);

  return { assets: currentBalance, balanceUSD: currentBalanceUSD };
};

function useVaultAssets(predicate?: Vault) {
  const initialVisibility = isVisibleBalance();

  const [isFirstAssetsLoading, setIsFirstAssetsLoading] = useState(true);
  const [visibleBalance, setVisibleBalance] = useState(initialVisibility);

  const auth = useAuth();

  const { data, ...rest } = useQuery(
    ['predicate/assets', auth.workspaces.current, predicate],
    () => balancesToAssets(predicate),
    {
      initialData: {},
      refetchInterval: 10000,
      keepPreviousData: true,
      enabled: !!predicate,
      onSuccess: () => {
        setIsFirstAssetsLoading(false);
      },
    },
  );

  const getCoinAmount = useCallback(
    (assetId: string, needsFormat?: boolean) => {
      const balance = data?.assets?.find((asset) => asset.assetId === assetId);

      if (!balance) {
        const result = bn(0);
        return needsFormat ? result.format() : result;
      }

      const result = bn(bn.parseUnits(balance.amount!));
      return needsFormat ? result.format() : result;
    },
    [data?.assets],
  );

  const getAssetInfo = (assetId: string) => {
    return (
      assetsMap[assetId] ?? {
        name: 'Unknown',
        slug: 'UKN',
        icon: ETHDefault,
      }
    );
  };

  const hasAssetBalance = useCallback(
    (assetId: string, value: string) => {
      const coinBalance = getCoinAmount(assetId, true);
      const hasBalance = bn(bn.parseUnits(value)).lte(
        bn.parseUnits(String(coinBalance)),
      );

      return hasBalance;
    },
    [getCoinAmount],
  );

  const hasBalance = useMemo(() => {
    const result = data?.assets?.some((asset) =>
      bn(bn.parseUnits(asset.amount)).gt(0),
    );

    return result;
  }, [data?.assets]);

  const ethBalance = useMemo(() => {
    return getCoinAmount(NativeAssetId, true);
  }, [getCoinAmount]) as string;

  const handleSetVisibleBalance = (visible: any) => {
    setVisibleBalance(visible);
    setIsVisibleBalance(visible ? 'true' : 'false');
  };

  return {
    assets: data?.assets,
    ...rest,
    getAssetInfo,
    getCoinAmount,
    hasAssetBalance,
    setVisibleBalance: handleSetVisibleBalance,
    hasBalance,
    ethBalance,
    hasAssets: !!data?.assets?.length,
    isFirstAssetsLoading,
    visibleBalance,
    balanceUSD: data?.balanceUSD,
    setIsFirstAssetsLoading,
  };
}

export { useVaultAssets };
