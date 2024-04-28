import { io } from 'socket.io-client';
// const { VITE_API_URL } = import.meta.env;

const URL = 'http://localhost:3001';
const socket = io(URL, { autoConnect: false });

socket.on('connect_error', (err) => {
  if (err.message === 'invalid username') {
    console.log('Usuário inválido');
  }
});

export default socket;
