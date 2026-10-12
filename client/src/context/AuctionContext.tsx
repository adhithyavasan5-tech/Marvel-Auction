import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { RoomState, AuctionLot, RoomSettings, RoomPlayer } from '../types/index.js';
import { socket, getPlayerProfile, savePlayerProfile } from '../services/socketService.js';
import { sounds } from '../lib/soundEffects.js';
import confetti from 'canvas-confetti';

interface AuctionContextType {
  roomState: RoomState | null;
  activeLot: AuctionLot | null;
  timeLeft: number;
  myPlayer: RoomPlayer | null;
  isConnected: boolean;
  isMuted: boolean;
  reducedMotion: boolean;
  toastMessage: string | null;
  soldBanner: { lot: AuctionLot; winnerName?: string; finalPrice?: number; status: 'SOLD' | 'UNSOLD' } | null;
  toggleSound: () => void;
  toggleReducedMotion: () => void;
  createRoom: (settings?: Partial<RoomSettings>) => Promise<{ success: boolean; room?: RoomState; error?: string }>;
  joinRoom: (roomCode: string, name?: string) => Promise<{ success: boolean; room?: RoomState; error?: string }>;
  setReady: (isReady: boolean) => void;
  startAuction: () => Promise<{ success: boolean; error?: string }>;
  placeBid: (amount: number) => Promise<{ success: boolean; error?: string }>;
  contributeRescue: (amount: number) => Promise<{ success: boolean; error?: string }>;
  voteSkip: () => Promise<{ success: boolean; error?: string }>;
  leaveRoom: () => void;
  updateProfileName: (name: string, avatar?: string) => void;
  dismissToast: () => void;
}

const AuctionContext = createContext<AuctionContextType | null>(null);

export const AuctionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState(getPlayerProfile());
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [activeLot, setActiveLot] = useState<AuctionLot | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(socket.connected);
  const [isMuted, setIsMuted] = useState<boolean>(sounds.getIsMuted());
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    return localStorage.getItem('dynasty_reduced_motion') === 'true';
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [soldBanner, setSoldBanner] = useState<{ lot: AuctionLot; winnerName?: string; finalPrice?: number; status: 'SOLD' | 'UNSOLD' } | null>(null);

  const prevHighestBidderRef = useRef<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 4500);
  }, []);

  const toggleSound = useCallback(() => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  }, []);

  const toggleReducedMotion = useCallback(() => {
    setReducedMotion(prev => {
      const next = !prev;
      localStorage.setItem('dynasty_reduced_motion', String(next));
      return next;
    });
  }, []);

  const updateProfileName = useCallback((name: string, avatar?: string) => {
    savePlayerProfile(name, avatar);
    setProfile(getPlayerProfile());
    if (roomState) {
      socket.emit('UPDATE_PLAYER_PROFILE', {
        roomCode: roomState.roomCode,
        playerId: profile.id,
        displayName: name,
        avatar: avatar || profile.avatar
      });
    }
  }, [roomState, profile.id, profile.avatar]);

  const myPlayer = roomState && profile.id ? roomState.players[profile.id] || null : null;

  // Socket Lifecycle Listeners
  useEffect(() => {
    const onConnect = () => {
      setIsConnected(true);
      // Re-request state if we had a room
      const savedCode = localStorage.getItem('dynasty_active_room_code');
      if (savedCode) {
        socket.emit('REQUEST_ROOM_STATE', { roomCode: savedCode, playerId: profile.id });
      }
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    const onRoomState = (data: { roomState: RoomState }) => {
      if (data?.roomState) {
        setRoomState(data.roomState);
        setActiveLot(data.roomState.activeLot || null);
        localStorage.setItem('dynasty_active_room_code', data.roomState.roomCode);
      }
    };

    const onLotChanged = (data: { activeLot: AuctionLot; roomState: RoomState }) => {
      setActiveLot(data.activeLot);
      setRoomState(data.roomState);
      setSoldBanner(null);
      prevHighestBidderRef.current = null;
      sounds.playGavel();
    };

    const onTimerTick = (data: { timeLeft: number }) => {
      setTimeLeft(data.timeLeft);
      if (data.timeLeft <= 5 && data.timeLeft > 0) {
        sounds.playTick();
      }
    };

    const onBidAccepted = (data: { lot: AuctionLot; message: string }) => {
      setActiveLot(data.lot);
      sounds.playBid();

      // Check if current user was just outbid
      if (
        prevHighestBidderRef.current === profile.id &&
        data.lot.highestBidderId !== profile.id
      ) {
        sounds.playOutbid();
        showToast(`⚠️ You have been outbid on ${data.lot.hero.name}!`);
      }
      prevHighestBidderRef.current = data.lot.highestBidderId;

      setRoomState(prev => {
        if (!prev) return null;
        return {
          ...prev,
          activeLot: data.lot
        };
      });
    };

    const onBidRejected = (data: { error: string }) => {
      sounds.playOutbid();
      showToast(data.error || 'Bid rejected');
    };

    const onLotSettled = (data: { status: 'SOLD' | 'UNSOLD'; lot: AuctionLot; winner?: any; roomState: RoomState }) => {
      setRoomState(data.roomState);
      setActiveLot(null);

      setSoldBanner({
        lot: data.lot,
        winnerName: data.winner?.displayName || data.lot.winnerName || undefined,
        finalPrice: data.lot.finalPrice || undefined,
        status: data.status
      });

      if (data.status === 'SOLD') {
        sounds.playSold();
        if (data.winner?.id === profile.id && !reducedMotion) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#F0D79A', '#C6A15B', '#8B1020', '#FFFFFF']
          });
        }
      } else {
        sounds.playGavel();
      }
    };

    const onAuctionCompleted = (data: { roomState: RoomState; rankings: any[] }) => {
      setRoomState(data.roomState);
      setActiveLot(null);
      setSoldBanner(null);
      sounds.playSold();
      if (!reducedMotion) {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.5 },
          colors: ['#F0D79A', '#C6A15B', '#C62838']
        });
      }
    };

    const onError = (data: { message: string }) => {
      showToast(data.message || 'An error occurred');
    };

    const onRescueEvent = (data: { roomState: RoomState }) => {
      if (data?.roomState) {
        setRoomState(data.roomState);
      }
    };

    const onSkipVoteUpdated = (data: { lotId: string, skipVotes: string[], roomState: RoomState }) => {
      if (data?.roomState) {
        setRoomState(data.roomState);
      }
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('ROOM_CREATED', onRoomState);
    socket.on('ROOM_STATE_UPDATED', onRoomState);
    socket.on('AUCTION_STARTED', onRoomState);
    socket.on('LOT_CHANGED', onLotChanged);
    socket.on('TIMER_TICK', onTimerTick);
    socket.on('BID_ACCEPTED', onBidAccepted);
    socket.on('BID_REJECTED', onBidRejected);
    socket.on('LOT_SETTLED', onLotSettled);
    socket.on('AUCTION_COMPLETED', onAuctionCompleted);
    socket.on('ERROR', onError);
    socket.on('RESCUE_ACTIVATED', onRescueEvent);
    socket.on('RESCUE_UPDATED', onRescueEvent);
    socket.on('RESCUE_COMPLETED', onRescueEvent);
    socket.on('RESCUE_REFUNDED', onRescueEvent);
    socket.on('SKIP_VOTE_UPDATED', onSkipVoteUpdated);

    // Initial check
    if (socket.connected) {
      onConnect();
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('ROOM_CREATED', onRoomState);
      socket.off('ROOM_STATE_UPDATED', onRoomState);
      socket.off('AUCTION_STARTED', onRoomState);
      socket.off('LOT_CHANGED', onLotChanged);
      socket.off('TIMER_TICK', onTimerTick);
      socket.off('BID_ACCEPTED', onBidAccepted);
      socket.off('BID_REJECTED', onBidRejected);
      socket.off('LOT_SETTLED', onLotSettled);
      socket.off('AUCTION_COMPLETED', onAuctionCompleted);
      socket.off('ERROR', onError);
      socket.off('RESCUE_ACTIVATED', onRescueEvent);
      socket.off('RESCUE_UPDATED', onRescueEvent);
      socket.off('RESCUE_COMPLETED', onRescueEvent);
      socket.off('RESCUE_REFUNDED', onRescueEvent);
      socket.off('SKIP_VOTE_UPDATED', onSkipVoteUpdated);
    };
  }, [profile.id, reducedMotion, showToast]);

  const createRoom = useCallback(async (settings?: Partial<RoomSettings>) => {
    const currentProfile = getPlayerProfile();
    return new Promise<{ success: boolean; room?: RoomState; error?: string }>((resolve) => {
      socket.emit('CREATE_ROOM', { hostPlayer: currentProfile, settings }, (res: any) => {
        if (res?.success) {
          setRoomState(res.room);
          localStorage.setItem('dynasty_active_room_code', res.room.roomCode);
          resolve({ success: true, room: res.room });
        } else {
          resolve({ success: false, error: res?.error || 'Failed to create auction chamber' });
        }
      });
    });
  }, []);

  const joinRoom = useCallback(async (roomCode: string, name?: string) => {
    if (name) updateProfileName(name);
    const currentProfile = getPlayerProfile();

    return new Promise<{ success: boolean; room?: RoomState; error?: string }>((resolve) => {
      socket.emit('JOIN_ROOM', { roomCode: roomCode.toUpperCase().trim(), player: currentProfile }, (res: any) => {
        if (res?.success) {
          setRoomState(res.room);
          localStorage.setItem('dynasty_active_room_code', res.room.roomCode);
          resolve({ success: true, room: res.room });
        } else {
          resolve({ success: false, error: res?.error || 'Unable to join auction chamber' });
        }
      });
    });
  }, [updateProfileName]);

  const setReady = useCallback((isReady: boolean) => {
    if (!roomState) return;
    socket.emit('SET_READY', { roomCode: roomState.roomCode, playerId: profile.id, isReady });
  }, [roomState, profile.id]);

  const startAuction = useCallback(async () => {
    if (!roomState) return { success: false, error: 'No active room' };
    return new Promise<{ success: boolean; error?: string }>((resolve) => {
      socket.emit('START_AUCTION', { roomCode: roomState.roomCode, playerId: profile.id }, (res: any) => {
        if (res?.success) {
          resolve({ success: true });
        } else {
          resolve({ success: false, error: res?.error || 'Failed to start auction' });
        }
      });
    });
  }, [roomState, profile.id]);

  const placeBid = useCallback(async (amount: number) => {
    if (!roomState) return { success: false, error: 'No active room' };
    return new Promise<{ success: boolean; error?: string }>((resolve) => {
      socket.emit('PLACE_BID', { roomCode: roomState.roomCode, playerId: profile.id, amount }, (res: any) => {
        if (res?.success) {
          resolve({ success: true });
        } else {
          resolve({ success: false, error: res?.error || 'Bid rejected' });
        }
      });
    });
  }, [roomState, profile.id]);

  const contributeRescue = useCallback(async (amount: number) => {
    if (!roomState) return { success: false, error: 'No active room' };
    return new Promise<{ success: boolean; error?: string }>((resolve) => {
      socket.emit('CONTRIBUTE_RESCUE', { roomCode: roomState.roomCode, playerId: profile.id, amount }, (res: any) => {
        if (res?.success) {
          resolve({ success: true });
        } else {
          resolve({ success: false, error: res?.error || 'Contribution rejected' });
        }
      });
    });
  }, [roomState, profile.id]);

  const voteSkip = useCallback(async () => {
    if (!roomState) return { success: false, error: 'No active room' };
    return new Promise<{ success: boolean; error?: string }>((resolve) => {
      socket.emit('VOTE_SKIP', { roomCode: roomState.roomCode, playerId: profile.id }, (res: any) => {
        if (res?.success) {
          resolve({ success: true });
        } else {
          resolve({ success: false, error: res?.error || 'Failed to vote' });
        }
      });
    });
  }, [roomState, profile.id]);

  const leaveRoom = useCallback(() => {
    if (roomState) {
      socket.emit('LEAVE_ROOM', { roomCode: roomState.roomCode, playerId: profile.id });
    }
    setRoomState(null);
    setActiveLot(null);
    setSoldBanner(null);
    localStorage.removeItem('dynasty_active_room_code');
  }, [roomState, profile.id]);

  return (
    <AuctionContext.Provider value={{
      roomState,
      activeLot,
      timeLeft,
      myPlayer,
      isConnected,
      isMuted,
      reducedMotion,
      toastMessage,
      soldBanner,
      toggleSound,
      toggleReducedMotion,
      createRoom,
      joinRoom,
      setReady,
      startAuction,
      placeBid,
      contributeRescue,
      voteSkip,
      leaveRoom,
      updateProfileName,
      dismissToast: () => setToastMessage(null)
    }}>
      {children}
    </AuctionContext.Provider>
  );
};

export const useAuction = () => {
  const ctx = useContext(AuctionContext);
  if (!ctx) throw new Error('useAuction must be used within an AuctionProvider');
  return ctx;
};
