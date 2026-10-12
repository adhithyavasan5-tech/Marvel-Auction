
import { io, Socket } from 'socket.io-client';

const SERVER_URL =
  import.meta.env.VITE_SERVER_URL ||
  'https://marvel-auction-k4q4.onrender.com';

export const socket: Socket = io(SERVER_URL, {
  autoConnect: true,
  transports: ['websocket', 'polling'],
  reconnectionAttempts: 10,
  reconnectionDelay: 1000
});

export function getPlayerProfile(): {
  id: string;
  displayName: string;
  avatar: string;
} {
  let id = localStorage.getItem('dynasty_player_id');

  if (!id) {
    id = `bidder-${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .substring(2, 6)}`;
    localStorage.setItem('dynasty_player_id', id);
  }

  let displayName = localStorage.getItem('dynasty_display_name');

  if (!displayName) {
    const titles = [
      'Tony Stark',
      'Bruce Wayne',
      "T'Challa",
      'Emma Frost',
      'Grandmaster',
      'Victor Von Doom',
      'Namor'
    ];
    displayName = titles[Math.floor(Math.random() * titles.length)];
    localStorage.setItem('dynasty_display_name', displayName);
  }

  let avatar = localStorage.getItem('dynasty_avatar');

  if (!avatar) {
    const avatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'
    ];
    avatar = avatars[Math.floor(Math.random() * avatars.length)];
    localStorage.setItem('dynasty_avatar', avatar);
  }

  return { id, displayName, avatar };
}

export function savePlayerProfile(displayName: string, avatar?: string) {
  localStorage.setItem('dynasty_display_name', displayName);
  if (avatar) {
    localStorage.setItem('dynasty_avatar', avatar);
  }
}
