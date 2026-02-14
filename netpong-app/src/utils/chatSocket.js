import { io } from 'socket.io-client';
import { getToken } from './authToken';
import { refreshAccessToken } from './api';

let chatSocket = null;

export async function getChatSocket() {
  if (chatSocket && chatSocket.connected) {
    return chatSocket;
  }

  let token = getToken();

  if (!token) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      return null;
    }
    token = getToken();
  }

  chatSocket = io({
    path: '/socket.io',
    transports: ['websocket'],
    withCredentials: true,
    auth: {
      token,
    },
  });

  return chatSocket;
}

export function disconnectChatSocket() {
  if (chatSocket) {
    chatSocket.disconnect();
    chatSocket = null;
  }
}
