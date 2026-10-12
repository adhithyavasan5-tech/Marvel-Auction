import { Server, Socket } from 'socket.io';
import { AuctionEngine } from '../services/auctionEngine.js';
import { heroService } from '../services/heroService.js';

export function setupAuctionSocket(io: Server, engine: AuctionEngine) {
  io.on('connection', (socket: Socket) => {
    let currentRoomCode: string | null = null;
    let currentPlayerId: string | null = null;

    console.log(`[Socket] Client connected: ${socket.id}`);

    // CREATE ROOM
    socket.on('CREATE_ROOM', (payload: any, callback?: Function) => {
      try {
        const { hostPlayer, settings } = payload || {};
        if (!hostPlayer?.id) {
          const err = 'Invalid host identity';
          if (callback) callback({ success: false, error: err });
          return socket.emit('ERROR', { message: err });
        }

        const room = engine.createRoom(hostPlayer, settings);
        currentRoomCode = room.roomCode;
        currentPlayerId = hostPlayer.id;

        socket.join(room.roomCode);

        if (callback) callback({ success: true, room });
        socket.emit('ROOM_CREATED', { roomState: room });
      } catch (err: any) {
        console.error('[Socket] CREATE_ROOM error:', err);
        const msg = err.message || 'Failed to create room';
        if (callback) callback({ success: false, error: msg });
        socket.emit('ERROR', { message: msg });
      }
    });

    // JOIN ROOM
    socket.on('JOIN_ROOM', (payload: any, callback?: Function) => {
      try {
        const { roomCode, player } = payload || {};
        if (!roomCode || !player?.id) {
          const err = 'Room code and player ID required';
          if (callback) callback({ success: false, error: err });
          return socket.emit('ERROR', { message: err });
        }

        const result = engine.joinRoom(roomCode, player);
        if (!result.success || !result.room) {
          if (callback) callback({ success: false, error: result.error });
          return socket.emit('ERROR', { message: result.error });
        }

        currentRoomCode = result.room.roomCode;
        currentPlayerId = player.id;
        socket.join(result.room.roomCode);

        if (callback) callback({ success: true, room: result.room });

        // Notify room
        io.to(result.room.roomCode).emit('ROOM_STATE_UPDATED', { roomState: result.room });
        io.to(result.room.roomCode).emit('PLAYER_JOINED', {
          player: result.room.players[player.id],
          roomState: result.room
        });
      } catch (err: any) {
        console.error('[Socket] JOIN_ROOM error:', err);
        const msg = err.message || 'Failed to join room';
        if (callback) callback({ success: false, error: msg });
        socket.emit('ERROR', { message: msg });
      }
    });

    // SET READY
    socket.on('SET_READY', (payload: any) => {
      try {
        const { roomCode, playerId, isReady } = payload || {};
        if (!roomCode || !playerId) return;

        const result = engine.setReady(roomCode, playerId, !!isReady);
        if (result.success && result.room) {
          io.to(result.room.roomCode).emit('ROOM_STATE_UPDATED', { roomState: result.room });
        }
      } catch (err) {
        console.error('[Socket] SET_READY error:', err);
      }
    });

    // START AUCTION
    socket.on('START_AUCTION', (payload: any, callback?: Function) => {
      try {
        const { roomCode, playerId } = payload || {};
        const result = engine.startAuction(roomCode, playerId);
        if (!result.success || !result.room) {
          if (callback) callback({ success: false, error: result.error });
          return socket.emit('ERROR', { message: result.error });
        }

        if (callback) callback({ success: true, room: result.room });
        io.to(result.room.roomCode).emit('AUCTION_STARTED', { roomState: result.room });
      } catch (err: any) {
        console.error('[Socket] START_AUCTION error:', err);
        const msg = err.message || 'Failed to start auction';
        if (callback) callback({ success: false, error: msg });
        socket.emit('ERROR', { message: msg });
      }
    });

    // PLACE BID
    socket.on('PLACE_BID', (payload: any, callback?: Function) => {
      try {
        const { roomCode, playerId, amount } = payload || {};
        if (!roomCode || !playerId || typeof amount !== 'number') {
          const err = 'Invalid bid submission';
          if (callback) callback({ success: false, error: err });
          return socket.emit('BID_REJECTED', { error: err });
        }

        const result = engine.placeBid(roomCode, playerId, amount);
        if (!result.success) {
          if (callback) callback({ success: false, error: result.error });
          return socket.emit('BID_REJECTED', { error: result.error });
        }

        if (callback) callback({ success: true, lot: result.lot });
      } catch (err: any) {
        console.error('[Socket] PLACE_BID error:', err);
        const msg = err.message || 'Failed to place bid';
        if (callback) callback({ success: false, error: msg });
        socket.emit('BID_REJECTED', { error: msg });
      }
    });

    // CONTRIBUTE RESCUE
    socket.on('CONTRIBUTE_RESCUE', (payload: any, callback?: Function) => {
      try {
        const { roomCode, playerId, amount } = payload || {};
        if (!roomCode || !playerId || typeof amount !== 'number') {
          const err = 'Invalid contribution';
          if (callback) callback({ success: false, error: err });
          return socket.emit('ERROR', { message: err });
        }

        const result = engine.contributeRescue(roomCode, playerId, amount);
        if (!result.success) {
          if (callback) callback({ success: false, error: result.error });
          return socket.emit('ERROR', { message: result.error });
        }

        if (callback) callback({ success: true, room: result.room });
      } catch (err: any) {
        console.error('[Socket] CONTRIBUTE_RESCUE error:', err);
        const msg = err.message || 'Failed to contribute';
        if (callback) callback({ success: false, error: msg });
        socket.emit('ERROR', { message: msg });
      }
    });

    // VOTE SKIP
    socket.on('VOTE_SKIP', (payload: any, callback?: Function) => {
      try {
        const { roomCode, playerId } = payload || {};
        if (!roomCode || !playerId) {
          if (callback) callback({ success: false, error: 'Invalid request' });
          return;
        }

        const result = engine.voteSkip(roomCode, playerId);
        if (callback) callback(result);
      } catch (err: any) {
        console.error('[Socket] VOTE_SKIP error:', err);
        if (callback) callback({ success: false, error: err.message });
      }
    });

    // REQUEST CURRENT STATE / REJOIN
    socket.on('REQUEST_ROOM_STATE', (payload: any, callback?: Function) => {
      try {
        const { roomCode, playerId } = payload || {};
        const room = engine.getRoom(roomCode);
        if (!room) {
          if (callback) callback({ success: false, error: 'Chamber not found' });
          return;
        }

        if (playerId && room.players[playerId]) {
          room.players[playerId].isOnline = true;
          socket.join(room.roomCode);
          currentRoomCode = room.roomCode;
          currentPlayerId = playerId;
        }

        if (callback) callback({ success: true, roomState: room });
        socket.emit('ROOM_STATE_UPDATED', { roomState: room });
      } catch (err: any) {
        if (callback) callback({ success: false, error: err.message });
      }
    });

    // UPDATE PLAYER PROFILE
    socket.on('UPDATE_PLAYER_PROFILE', (payload: any) => {
      try {
        const { roomCode, playerId, displayName, avatar } = payload || {};
        if (!roomCode || !playerId) return;

        const room = engine.getRoom(roomCode);
        if (room && room.players[playerId]) {
          if (displayName) room.players[playerId].displayName = displayName;
          if (avatar) room.players[playerId].avatar = avatar;
          io.to(room.roomCode).emit('ROOM_STATE_UPDATED', { roomState: room });
        }
      } catch (err) {
        console.error('[Socket] UPDATE_PLAYER_PROFILE error:', err);
      }
    });

    // LEAVE ROOM
    socket.on('LEAVE_ROOM', (payload: any) => {
      try {
        const { roomCode, playerId } = payload || {};
        if (roomCode && playerId) {
          const result = engine.leaveRoom(roomCode, playerId);
          socket.leave(roomCode);
          if (result.room) {
            io.to(result.room.roomCode).emit('ROOM_STATE_UPDATED', { roomState: result.room });
            io.to(result.room.roomCode).emit('PLAYER_LEFT', { playerId, roomState: result.room });
          }
        }
      } catch (err) {
        console.error('[Socket] LEAVE_ROOM error:', err);
      }
    });

    // DISCONNECT
    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
      if (currentRoomCode && currentPlayerId) {
        const room = engine.getRoom(currentRoomCode);
        if (room && room.players[currentPlayerId]) {
          room.players[currentPlayerId].isOnline = false;
          io.to(room.roomCode).emit('ROOM_STATE_UPDATED', { roomState: room });
        }
      }
    });
  });
}
