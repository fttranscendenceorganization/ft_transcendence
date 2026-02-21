import { io } from 'socket.io-client';
import { getToken } from './authToken';
import { refreshAccessToken } from './api';

let gameSocket = null;

export async function getGameSocket() {
  if (gameSocket && gameSocket.connected) {
    return gameSocket;
  }

  let token = getToken();

  if (!token) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      return null;
    }
    token = getToken();
  }

  const backendUrl = import.meta.env.VITE_BACKEND_URL || window.location.origin;

  gameSocket = io(backendUrl, {
    path: '/socket.io',
    transports: ['websocket'],
    withCredentials: true,
    auth: {
      token,
    },
  });

  return gameSocket;
}

export function disconnectGameSocket() {
  if (gameSocket) {
    gameSocket.disconnect();
    gameSocket = null;
  }
}
