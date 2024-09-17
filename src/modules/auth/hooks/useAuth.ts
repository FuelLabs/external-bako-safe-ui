import { useFuel } from '@fuels/react';
import { BakoSafe } from 'bakosafe';
import { Provider } from 'fuels';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { queryClient } from '@/config';

import {
  generateRedirectQueryParams,
  useAuthCookies,
  useQueryParams,
} from '..';
import { AuthenticateParams, IUseAuthReturn, TypeUser } from '../services';
import { useUserInfoRequest } from './useUserInfoRequest';

export type SingleAuthentication = {
  workspace: string;
};

export type WorkspaceAuthentication = {
  workspace: string;
};

const useAuth = (): IUseAuthReturn => {
  const { infos, isLoading, isFetching, refetch } = useUserInfoRequest();
  const [invalidAccount, setInvalidAccount] = useState(false);
  const { fuel } = useFuel();
  const { setAuthCookies, clearAuthCookies, userAuthCookiesInfo } =
    useAuthCookies();
  const { account, singleWorkspace } = userAuthCookiesInfo();
  const { sessionId, origin, name, request_id } = useQueryParams();
  const navigate = useNavigate();

  const authenticate = (params: AuthenticateParams) => {
    setAuthCookies(params);
  };

  const logout = () => {
    clearAuthCookies();
    queryClient.clear();

    const queryParams = generateRedirectQueryParams({
      sessionId,
      origin,
      name,
      request_id,
    });
    navigate(`/${queryParams}`);
  };

  const logoutWhenExpired = async () => {
    clearAuthCookies();
    queryClient.clear();
    navigate('/?expired=true');
  };

  const userProvider = async () => {
    const _userProvider = infos?.type != TypeUser.WEB_AUTHN;

    return {
      provider: await Provider.create(
        _userProvider
          ? (await fuel.currentNetwork()).url
          : BakoSafe.getProviders('CHAIN_URL'),
      ),
    };
  };

  return {
    handlers: {
      logout,
      logoutWhenExpired,
      authenticate,
      setInvalidAccount,
    },
    userProvider,
    invalidAccount,
    userInfos: {
      avatar: infos?.avatar!,
      id: infos?.id!,
      name: infos?.name!,
      onSingleWorkspace: infos?.onSingleWorkspace ?? false,
      type: infos?.type!,
      webauthn: infos?.webauthn!,
      workspace: infos?.workspace!,
      address: account,
      singleWorkspaceId: singleWorkspace,
      firstLogin: infos?.firstLogin!,
      isLoading,
      isFetching,
      refetch,
    },
  };
};

export { useAuth };
