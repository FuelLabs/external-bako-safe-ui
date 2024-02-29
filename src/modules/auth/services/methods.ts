import { bytesToHex } from '@noble/curves/abstract/utils';
import { defaultConfig } from 'bsafe';
import { Address } from 'fuels';

import { api } from '@/config';
import { Workspace } from '@/modules/core';
import { createAccount, signChallange } from '@/modules/core/utils/webauthn';

export enum Encoder {
  FUEL = 'FUEL',
  METAMASK = 'METAMASK',
  WEB_AUTHN = 'WEB_AUTHN',
}

export enum TypeUser {
  FUEL = 'FUEL',
  WEB_AUTHN = 'WEB_AUTHN',
}

export type SignWebAuthnPayload = {
  id: string;
  challenge: string;
  publicKey: string;
};

export type CreateUserResponse = {
  id: string;
  code: string;
  type: TypeUser;
};

export type UseSignInRequestParams = {
  code: string;
  type: TypeUser;
};

export type CreateUserPayload = {
  address: string;
  provider: string;
  type: TypeUser;
  webauthn?: {
    id: string;
    publicKey: string;
    origin: string;
  };
};

export type SignInPayload = {
  encoder: Encoder;
  signature: string;
  digest: string;
};

export type SignInResponse = {
  accessToken: string;
  address: string;
  avatar: string;
  user_id: string;
  workspace: Workspace;
  id: string;
  notify: boolean;
  firstLogin: boolean;
  webAuthn?: {
    id: string;
    publicKey: string;
  };
};

export type CheckNicknameResponse = {
  id: string;
  address: string;
  name: string;
  provider: string;
  type: TypeUser;
  webauthn: {
    id: string;
    publicKey: string;
    origin: string;
    hardware: string;
  };
};

export class UserService {
  static async create(payload: CreateUserPayload) {
    const { data } = await api.post<CreateUserResponse>('/user', payload);
    return data;
  }

  static async signIn(payload: SignInPayload) {
    const { data } = await api.post<SignInResponse>('/auth/sign-in', payload);

    return data;
  }

  static async verifyNickname(nickname: string) {
    if (!nickname) return;
    const { data } = await api.get<CheckNicknameResponse>(
      `/user/nickname/${nickname}`,
    );

    return data;
  }

  static async createHardwareId() {
    const localStorage = window.localStorage;

    return localStorage.setItem(
      localStorageKeys.HARDWARE_ID,
      crypto.randomUUID(),
    ); // todo: make this to enums
  }

  static async getHardwareId() {
    return new Promise((resolve) => {
      const localStorage = window.localStorage;
      return resolve(localStorage.getItem(localStorageKeys.HARDWARE_ID));
    });
  }

  static async getByHardwareId(hardwareId: string) {
    const { data } = await api.get<CheckNicknameResponse[]>(
      `/user/by-hardware/${hardwareId}`,
    );

    return data;
  }

  static async createWebAuthnAccount(name: string) {
    const account = await createAccount(name, Address.fromRandom().toB256());

    const payload = {
      name,
      address: Address.fromB256(account.address).toString(),
      provider: defaultConfig['PROVIDER']!,
      type: TypeUser.WEB_AUTHN,
      webauthn: {
        // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
        id: account.credential?.id!,
        publicKey: account.publicKeyHex,
        origin: window.location.origin,
        hardware: localStorage.getItem(localStorageKeys.HARDWARE_ID)!,
      },
    };
    return {
      ...(await UserService.create(payload)),
      id: payload.webauthn.id,
      publicKey: payload.webauthn.publicKey,
    };
  }

  static async signMessageWebAuthn({
    id,
    challenge,
    publicKey,
  }: SignWebAuthnPayload) {
    const signature = await signChallange(id, challenge, publicKey);

    return await UserService.signIn({
      encoder: Encoder.WEB_AUTHN,
      signature: bytesToHex(signature!.sig_compact),
      digest: bytesToHex(signature!.dig_compact),
    });
  }

  static async generateSignInCode(address: string) {
    const { data } = await api.post<CreateUserResponse>(
      `/auth/code/${address}`,
    );
    return data;
  }
}

export const localStorageKeys = {
  HARDWARE_ID: 'bsafe/hardwareId',
};

export const UserQueryKey = {
  DEFAULT: 'user',
  CREATE_WEB_AUTHN_ACCOUNT: () => [
    UserQueryKey.DEFAULT,
    'create-web-authn-account',
  ],
  SIGN_MESSAGE_WEB_AUTHN: () => [
    UserQueryKey.DEFAULT,
    'sign-message-web-authn',
  ],
  // HARDWARE_ID: () => [UserQueryKey.DEFAULT, 'hardware-id'],
  ACCOUNTS: (hardwareId: string) => [
    UserQueryKey.DEFAULT,
    'accounts',
    hardwareId,
  ],
  NICKNAME: (search: string) => [UserQueryKey.DEFAULT, 'nickname', search],
  FULL_DATA: (search: string, hardwareId: string) => [
    UserQueryKey.DEFAULT,
    UserQueryKey.NICKNAME(search),
    // UserQueryKey.HARDWARE_ID(),
    UserQueryKey.ACCOUNTS(hardwareId),
  ],
};
