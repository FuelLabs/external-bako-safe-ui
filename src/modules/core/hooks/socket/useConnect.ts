import { BSAFEConnectorEvents } from 'bsafe';
import { useContext } from 'react';

import { SocketContext } from '@/config/socket';
import { useQueryParams } from '@/modules/auth';

export enum SocketEvents {
  CONNECT = 'connection',

  DEFAULT = 'message',

  CONNECTED = '[CONNECTED]',
  DISCONNECTED = '[CLIENT_DISCONNECTED]',

  TX_CONFIRM = '[TX_EVENT_CONFIRMED]',
  TX_REQUEST = '[TX_EVENT_REQUESTED]',
}

export enum SocketUsernames {
  UI = '[UI]',
  CONNECTOR = '[CONNECTOR]',
  API = '[API]',
}

export interface IDefaultMessage {
  username: string;
  room: string;
  to: SocketUsernames;
  type: SocketEvents;
  request_id: string;
  data: any;
}

export interface ISocketConnectParams {
  username: string;
  param: SocketUsernames;
  sessionId: string;
  origin: string;
  connectionAlert?: {
    event: string;
    content: { [key: string]: string };
  };
  callbacks?: { [key: string]: (data: any) => void };
}

export interface ISocketEmitMessageParams {
  event: BSAFEConnectorEvents;
  to: string;
  content: { [key: string]: unknown };
  callback?: () => void;
}

export const useSocket = () => {
  const socket = useContext(SocketContext);
  const { request_id, origin } = useQueryParams();

  const connect = (sessionId: string) => {
    /* 
    qualquer info que mandar daqui pelo auth vai ser validadno no middleware
    do servidor io.use
    */
    if (socket.connected) return;
    socket.auth = {
      username: SocketUsernames.UI,
      data: new Date(),
      sessionId,
      origin,
      request_id: request_id ?? '',
    };
    socket.connect();
  };

  /* 
    Existe em duas partes:
      - cliente emite uma mensagem
      - servidor repassa a mensagem para todos os clientes conectados
    do servidor io.use
    */
  const emitMessage = ({
    to,
    event,
    content,
    callback,
  }: ISocketEmitMessageParams) => {
    socket.emit(
      event,
      {
        content,
        to,
      },
      setTimeout(callback!, 3000),
    );
  };

  return { connect, emitMessage, socket };
};
