import { Server } from 'socket.io';
import { 
  RoomState, 
  RoomSettings, 
  RoomPlayer, 
  AuctionLot, 
  BidRecord, 
  PurchasedHero, 
  PlayerRanking,
  ActivityItem,
  HeroRole
} from '../types/index.js';
import { heroService } from './heroService.js';

export class AuctionEngine {
  private rooms: Map<string, RoomState> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  public getRoom(roomCode: string): RoomState | undefined {
    return this.rooms.get(roomCode.toUpperCase());
  }

  public getAllRooms(): RoomState[] {
    return Array.from(this.rooms.values());
  }

  public createRoom(
    hostPlayer: { id: string; displayName: string; avatar: string },
    customSettings?: Partial<RoomSettings>
  ): RoomState {
    const roomCode = this.generateRoomCode();

    const settings: RoomSettings = {
      startingBudget: Math.max(500, Math.min(5000, customSettings?.startingBudget ?? 1000)),
      requiredRosterSize: Math.max(2, Math.min(10, customSettings?.requiredRosterSize ?? 5)),
      bidIncrement: Math.max(5, Math.min(100, customSettings?.bidIncrement ?? 10)),
      countdownSeconds: Math.max(10, Math.min(60, customSettings?.countdownSeconds ?? 20)),
      maxPlayers: Math.max(2, Math.min(16, customSettings?.maxPlayers ?? 8)),
      lotCount: Math.max(5, Math.min(50, customSettings?.lotCount ?? 30)),
      catalogueMode: customSettings?.catalogueMode ?? 'marvel'
    };

    const player: RoomPlayer = {
      id: hostPlayer.id,
      displayName: hostPlayer.displayName || 'Grandmaster',
      avatar: hostPlayer.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      budget: settings.startingBudget,
      isReady: true, // Host is ready by default
      isHost: true,
      isOnline: true,
      roster: [],
      connectedAt: Date.now()
    };

    const roomState: RoomState = {
      id: `room-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      roomCode,
      hostId: hostPlayer.id,
      status: 'LOBBY',
      settings,
      players: { [player.id]: player },
      lots: [],
      currentLotIndex: -1,
      activeLot: null,
      recentActivity: [
        {
          id: `act-${Date.now()}-1`,
          type: 'JOIN',
          message: `${player.displayName} initialized auction chamber #${roomCode}`,
          timestamp: Date.now()
        }
      ],
      catalogueSource: heroService.getCatalogueSource(),
      rescueState: null,
      createdAt: Date.now()
    };

    this.rooms.set(roomCode, roomState);
    return roomState;
  }

  public joinRoom(
    roomCode: string,
    playerInfo: { id: string; displayName: string; avatar?: string }
  ): { success: boolean; room?: RoomState; error?: string } {
    const code = roomCode.toUpperCase();
    const room = this.rooms.get(code);

    if (!room) {
      return { success: false, error: 'Auction chamber not found. Please verify the 6-character room code.' };
    }

    if (room.status === 'COMPLETED') {
      return { success: false, error: 'This auction has concluded.' };
    }

    // Check if player is reconnecting
    if (room.players[playerInfo.id]) {
      room.players[playerInfo.id].isOnline = true;
      room.players[playerInfo.id].displayName = playerInfo.displayName || room.players[playerInfo.id].displayName;
      if (playerInfo.avatar) room.players[playerInfo.id].avatar = playerInfo.avatar;

      this.addActivity(room, {
        id: `act-${Date.now()}`,
        type: 'JOIN',
        message: `${room.players[playerInfo.id].displayName} reconnected to chamber.`,
        timestamp: Date.now()
      });

      this.recalculateRescueEligibility(room);
      return { success: true, room };
    }

    // New player joining
    if (room.status !== 'LOBBY') {
      return { success: false, error: 'Auction is already in progress. Chamber is sealed for new bidders.' };
    }

    const currentCount = Object.keys(room.players).length;
    if (currentCount >= room.settings.maxPlayers) {
      return { success: false, error: `Chamber is at maximum capacity (${room.settings.maxPlayers} players).` };
    }

    const newPlayer: RoomPlayer = {
      id: playerInfo.id,
      displayName: playerInfo.displayName || `Bidder ${currentCount + 1}`,
      avatar: playerInfo.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80`,
      budget: room.settings.startingBudget,
      isReady: false,
      isHost: false,
      isOnline: true,
      roster: [],
      connectedAt: Date.now()
    };

    room.players[newPlayer.id] = newPlayer;

    this.addActivity(room, {
      id: `act-${Date.now()}`,
      type: 'JOIN',
      message: `${newPlayer.displayName} entered the auction chamber.`,
      timestamp: Date.now()
    });

    this.recalculateRescueEligibility(room);
    return { success: true, room };
  }

  public setReady(roomCode: string, playerId: string, isReady: boolean): { success: boolean; room?: RoomState; error?: string } {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room) return { success: false, error: 'Room not found' };
    if (!room.players[playerId]) return { success: false, error: 'Player not in room' };

    room.players[playerId].isReady = isReady;
    return { success: true, room };
  }

  public leaveRoom(roomCode: string, playerId: string): { success: boolean; room?: RoomState; error?: string } {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room) return { success: false, error: 'Room not found' };

    const player = room.players[playerId];
    if (!player) return { success: false, error: 'Player not found in room' };

    if (room.status === 'LOBBY') {
      delete room.players[playerId];

      // If host left, assign to another player or close room
      const remainingIds = Object.keys(room.players);
      if (remainingIds.length === 0) {
        this.clearRoomTimer(roomCode);
        this.rooms.delete(roomCode);
        return { success: true };
      }

      if (room.hostId === playerId) {
        const nextHostId = remainingIds[0];
        room.hostId = nextHostId;
        room.players[nextHostId].isHost = true;
        this.addActivity(room, {
          id: `act-${Date.now()}`,
          type: 'JOIN',
          message: `${room.players[nextHostId].displayName} is now the Chamber Host.`,
          timestamp: Date.now()
        });
      }
    } else {
      // In active auction, mark as offline
      player.isOnline = false;
    }

    this.addActivity(room, {
      id: `act-${Date.now()}`,
      type: 'LEAVE',
      message: `${player.displayName} left the chamber.`,
      timestamp: Date.now()
    });

    this.recalculateRescueEligibility(room);
    return { success: true, room };
  }

  public startAuction(roomCode: string, requesterId: string): { success: boolean; room?: RoomState; error?: string } {
    const code = roomCode.toUpperCase();
    const room = this.rooms.get(code);
    if (!room) return { success: false, error: 'Room not found' };

    if (room.hostId !== requesterId) {
      return { success: false, error: 'Only the Chamber Host can initiate the auction.' };
    }

    if (room.status !== 'LOBBY') {
      return { success: false, error: 'Auction has already commenced.' };
    }

    const playersList = Object.values(room.players);
    if (playersList.length < 2) {
      return { success: false, error: 'Minimum of 2 bidders required to open the auction.' };
    }

    const unreadyPlayers = playersList.filter(p => !p.isReady);
    if (unreadyPlayers.length > 0) {
      return { success: false, error: `Waiting for ${unreadyPlayers.map(p => p.displayName).join(', ')} to signal ready.` };
    }

    // Assemble hero catalogue: get all eligible heroes
    const allHeroes = heroService.getHeroes({
      mode: room.settings.catalogueMode
    });

    if (allHeroes.length < room.settings.requiredRosterSize * 2) {
      return { success: false, error: 'Insufficient catalogue lots available for this session.' };
    }

    // Compulsory characters for every game: Captain America and Iron Man
    const compulsoryIds = ['hero-captain-america', 'hero-iron-man'];
    const compulsoryHeroes = allHeroes.filter(h => 
      compulsoryIds.includes(h.id) || 
      h.name.toLowerCase() === 'captain america' || 
      h.name.toLowerCase() === 'iron man'
    );
    const nonCompulsoryHeroes = allHeroes.filter(h => !compulsoryHeroes.some(c => c.id === h.id));

    // Shuffle non-compulsory pool using Fisher-Yates
    const shuffledPool = [...nonCompulsoryHeroes];
    for (let i = shuffledPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledPool[i], shuffledPool[j]] = [shuffledPool[j], shuffledPool[i]];
    }

    // Determine how many extra random heroes are needed to fill lotCount
    const targetLotCount = Math.min(room.settings.lotCount, allHeroes.length);
    const neededExtra = Math.max(0, targetLotCount - compulsoryHeroes.length);
    const selectedExtra = shuffledPool.slice(0, neededExtra);

    // Combine compulsory heroes + random pool
    const combinedSessionHeroes = [...compulsoryHeroes, ...selectedExtra];

    // Fisher-Yates shuffle the combined session list so character appearance in rounds is completely random
    for (let i = combinedSessionHeroes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [combinedSessionHeroes[i], combinedSessionHeroes[j]] = [combinedSessionHeroes[j], combinedSessionHeroes[i]];
    }

    room.lots = combinedSessionHeroes.map((hero, index) => ({
      id: `lot-${room.id}-${index + 1}`,
      lotNumber: index + 1,
      hero,
      status: 'UPCOMING',
      currentBid: hero.basePrice,
      highestBidderId: null,
      highestBidderName: null,
      bidHistory: [],
      endsAt: null,
      winnerId: null,
      winnerName: null,
      finalPrice: null,
      skipVotes: []
    }));

    room.status = 'AUCTION_ACTIVE';
    room.currentLotIndex = -1;

    this.addActivity(room, {
      id: `act-${Date.now()}`,
      type: 'START',
      message: `The Dynasty Gavel has struck! ${room.lots.length} legendary lots are open for bidding.`,
      timestamp: Date.now(),
      highlight: true
    });

    // Start first lot
    this.advanceToNextLot(room);

    return { success: true, room };
  }

  public placeBid(
    roomCode: string,
    playerId: string,
    amount: number
  ): { success: boolean; error?: string; room?: RoomState; lot?: AuctionLot } {
    const code = roomCode.toUpperCase();
    const room = this.rooms.get(code);

    if (!room) return { success: false, error: 'Auction room not found' };
    if (room.status !== 'AUCTION_ACTIVE') return { success: false, error: 'Auction is not actively taking bids' };

    const lot = room.activeLot;
    if (!lot || lot.status !== 'LIVE') {
      return { success: false, error: 'No superhero lot currently active for bidding' };
    }

    const player = room.players[playerId];
    if (!player) return { success: false, error: 'Bidder not recognized in this room' };

    // Check roster limit
    if (player.roster.length >= room.settings.requiredRosterSize) {
      return { success: false, error: `Your roster is complete (${room.settings.requiredRosterSize}/${room.settings.requiredRosterSize} heroes collected).` };
    }

    // Check self-outbid
    if (lot.highestBidderId === playerId) {
      return { success: false, error: 'You are already holding the highest bid!' };
    }

    // Check authoritative deadline
    const now = Date.now();
    if (!lot.endsAt || now > lot.endsAt) {
      return { success: false, error: 'Bidding for this lot has closed' };
    }

    // Check minimum increment
    let minRequired: number;
    if (lot.highestBidderId) {
      minRequired = lot.currentBid + room.settings.bidIncrement;
    } else {
      // Opening bid
      minRequired = lot.currentBid;
    }

    // Edge case in reduced price mode: If a player cannot meet the full increment (e.g. has 10 credits when increment requires more, or player goes all-in with their remaining budget above current bid), allow if player.budget > lot.currentBid
    if (lot.isReducedPrice && amount < minRequired) {
      if (amount === player.budget && amount > lot.currentBid) {
        // Allow all-in bid of their full remaining balance
        minRequired = amount;
      } else {
        return { success: false, error: `Bid must be at least ${minRequired} credits (or your full remaining budget of ${player.budget} credits)` };
      }
    } else if (amount < minRequired) {
      return { success: false, error: `Bid must be at least ${minRequired} credits (minimum increment +${room.settings.bidIncrement})` };
    }

    // Check player remaining budget
    if (player.budget < amount) {
      return { success: false, error: `Insufficient credits. You hold ${player.budget} credits, bid requested is ${amount}` };
    }

    // Atomic update of lot
    lot.currentBid = amount;
    lot.highestBidderId = player.id;
    lot.highestBidderName = player.displayName;

    const bidRecord: BidRecord = {
      id: `bid-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      lotId: lot.id,
      playerId: player.id,
      playerName: player.displayName,
      amount,
      timestamp: now
    };
    lot.bidHistory.unshift(bidRecord);

    // Anti-sniping rule: If bid placed in final 5 seconds, extend deadline by 5 seconds
    const remainingMs = lot.endsAt - now;
    if (remainingMs <= 5000) {
      lot.endsAt = lot.endsAt + 5000;
      this.addActivity(room, {
        id: `act-${Date.now()}-snip`,
        type: 'BID',
        message: `⚡ ANTI-SNIPE EXTENSION: Clock extended by 5 seconds!`,
        timestamp: now,
        highlight: true
      });
    }

    this.addActivity(room, {
      id: `act-${Date.now()}`,
      type: 'BID',
      message: `${player.displayName} bid ${amount} credits on ${lot.hero.name}!`,
      timestamp: now
    });

    // Broadcast updated state
    this.io.to(code).emit('BID_ACCEPTED', {
      lot,
      bidRecord,
      message: `${player.displayName} holds the lead at ${amount} credits.`
    });

    this.recalculateRescueEligibility(room);
    return { success: true, room, lot };
  }

  private advanceToNextLot(room: RoomState): void {
    this.clearRoomTimer(room.roomCode);

    room.currentLotIndex += 1;

    // Check if we reached end of lots or if all players have filled their rosters
    const allRostersFull = Object.values(room.players).every(
      p => p.roster.length >= room.settings.requiredRosterSize
    );

    if (room.currentLotIndex >= room.lots.length || allRostersFull) {
      this.finalizeAuction(room);
      return;
    }

    const nextLot = room.lots[room.currentLotIndex];
    nextLot.status = 'LIVE';
    nextLot.endsAt = Date.now() + (room.settings.countdownSeconds * 1000);
    nextLot.originalBasePrice = nextLot.hero.basePrice;

    // Check affordability: Can any eligible player afford the base price?
    const eligiblePlayers = Object.values(room.players).filter(
      p => p.isOnline && p.roster.length < room.settings.requiredRosterSize
    );
    const canAnyAffordBase = eligiblePlayers.some(p => p.budget >= nextLot.hero.basePrice);

    if (!canAnyAffordBase && eligiblePlayers.length > 0) {
      nextLot.isReducedPrice = true;
      // Opening bid: prefer standard bid increment (e.g. 10), or if players have positive credits below that, minimum positive budget
      const maxBudget = Math.max(...eligiblePlayers.map(p => p.budget), 0);
      if (maxBudget > 0) {
        nextLot.currentBid = Math.min(room.settings.bidIncrement, maxBudget);
      } else {
        nextLot.currentBid = 0;
      }
    } else {
      nextLot.isReducedPrice = false;
      nextLot.currentBid = nextLot.hero.basePrice;
    }

    room.activeLot = nextLot;

    if (nextLot.isReducedPrice) {
      this.addActivity(room, {
        id: `act-${Date.now()}`,
        type: 'START',
        message: `⚡ SPECIAL AUCTION — REDUCED PRICE MODE! Lot #${nextLot.lotNumber}: ${nextLot.hero.name}. Opening at ${nextLot.currentBid} CR (Base was ${nextLot.hero.basePrice} CR).`,
        timestamp: Date.now(),
        highlight: true
      });
    } else {
      this.addActivity(room, {
        id: `act-${Date.now()}`,
        type: 'START',
        message: `Lot #${nextLot.lotNumber} open: ${nextLot.hero.name} (${nextLot.hero.rarity} ${nextLot.hero.role}) - Base ${nextLot.hero.basePrice} credits`,
        timestamp: Date.now()
      });
    }

    this.io.to(room.roomCode).emit('LOT_CHANGED', {
      lotIndex: room.currentLotIndex,
      activeLot: nextLot,
      totalLots: room.lots.length,
      roomState: room
    });

    this.recalculateRescueEligibility(room);

    // Start authoritative timer ticker
    this.startLotTimer(room);
  }

  private startLotTimer(room: RoomState): void {
    const timerInterval = setInterval(() => {
      const lot = room.activeLot;
      if (!lot || lot.status !== 'LIVE' || !lot.endsAt) {
        clearInterval(timerInterval);
        return;
      }

      const timeLeft = Math.max(0, Math.ceil((lot.endsAt - Date.now()) / 1000));

      // Periodic timer synchronization
      this.io.to(room.roomCode).emit('TIMER_TICK', {
        lotId: lot.id,
        timeLeft,
        endsAt: lot.endsAt
      });

      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        if (room.rescueState?.isActive && room.rescueState.status === 'PENDING') {
           this.refundRescue(room, 'Timer expired');
        }
        this.settleLot(room, lot);
      }
    }, 1000);

    this.timers.set(room.roomCode, timerInterval);
  }

  private settleLot(room: RoomState, lot: AuctionLot): void {
    this.clearRoomTimer(room.roomCode);

    if (lot.highestBidderId && lot.highestBidderName) {
      // Winner settled atomically
      const winner = room.players[lot.highestBidderId];
      const finalPrice = lot.currentBid;

      if (winner && winner.budget >= finalPrice) {
        winner.budget -= finalPrice;
        const purchasedHero: PurchasedHero = {
          hero: lot.hero,
          purchasePrice: finalPrice,
          purchasedAt: Date.now()
        };
        winner.roster.push(purchasedHero);

        lot.status = 'SOLD';
        lot.winnerId = winner.id;
        lot.winnerName = winner.displayName;
        lot.finalPrice = finalPrice;

        this.addActivity(room, {
          id: `act-${Date.now()}`,
          type: 'SOLD',
          message: `SOLD! ${lot.hero.name} acquired by ${winner.displayName} for ${finalPrice} credits!`,
          timestamp: Date.now(),
          highlight: true
        });

        this.io.to(room.roomCode).emit('LOT_SETTLED', {
          status: 'SOLD',
          lot,
          winner: {
            id: winner.id,
            displayName: winner.displayName,
            remainingBudget: winner.budget,
            rosterCount: winner.roster.length
          },
          roomState: room
        });
      } else {
        // Fallback if bidder lacked budget
        lot.status = 'UNSOLD';
        this.addActivity(room, {
          id: `act-${Date.now()}`,
          type: 'UNSOLD',
          message: `${lot.hero.name} passed unsold due to credit default.`,
          timestamp: Date.now()
        });

        this.io.to(room.roomCode).emit('LOT_SETTLED', {
          status: 'UNSOLD',
          lot,
          roomState: room
        });
      }
    } else {
      // No bids placed
      lot.status = 'UNSOLD';
      this.addActivity(room, {
        id: `act-${Date.now()}`,
        type: 'UNSOLD',
        message: `${lot.hero.name} passed UNSOLD (no bids submitted).`,
        timestamp: Date.now()
      });

      this.io.to(room.roomCode).emit('LOT_SETTLED', {
        status: 'UNSOLD',
        lot,
        roomState: room
      });
    }

    // 4-second delay for celebratory SOLD banner before presenting next lot
    setTimeout(() => {
      this.advanceToNextLot(room);
    }, 4000);
  }

  private finalizeAuction(room: RoomState): void {
    room.status = 'COMPLETED';
    room.activeLot = null;
    this.clearRoomTimer(room.roomCode);

    const rankings = this.computeRankings(room);
    room.rankings = rankings;

    this.addActivity(room, {
      id: `act-${Date.now()}`,
      type: 'START',
      message: `👑 The Grand Dynasty Auction has concluded! Champion: ${rankings[0]?.displayName || 'None'} with a score of ${rankings[0]?.finalScore || 0}!`,
      timestamp: Date.now(),
      highlight: true
    });

    this.io.to(room.roomCode).emit('AUCTION_COMPLETED', {
      roomState: room,
      rankings
    });
  }

  public computeRankings(room: RoomState): PlayerRanking[] {
    const players = Object.values(room.players);

    const scored = players.map(p => {
      const basePower = p.roster.reduce((sum, item) => sum + item.hero.totalPower, 0);

      // Composition Bonus: Reward diversity of roles
      // 5 distinct roles: +100
      // 4 distinct roles: +60
      // 3 distinct roles: +30
      const uniqueRoles = new Set(p.roster.map(item => item.hero.role));
      let compositionBonus = 0;
      if (uniqueRoles.size >= 5) compositionBonus = 100;
      else if (uniqueRoles.size === 4) compositionBonus = 60;
      else if (uniqueRoles.size === 3) compositionBonus = 30;

      const finalScore = basePower + compositionBonus;

      // Stats
      let bestValueHero: PurchasedHero | null = null;
      let highestRatio = -1;
      let mostExpensiveHero: PurchasedHero | null = null;
      let maxCost = -1;
      let totalSpent = 0;

      for (const item of p.roster) {
        totalSpent += item.purchasePrice;
        const ratio = item.hero.totalPower / Math.max(1, item.purchasePrice);
        if (ratio > highestRatio) {
          highestRatio = ratio;
          bestValueHero = item;
        }
        if (item.purchasePrice > maxCost) {
          maxCost = item.purchasePrice;
          mostExpensiveHero = item;
        }
      }

      return {
        rank: 0,
        playerId: p.id,
        displayName: p.displayName,
        avatar: p.avatar,
        basePower,
        compositionBonus,
        finalScore,
        creditsLeft: p.budget,
        rosterCount: p.roster.length,
        rosterTarget: room.settings.requiredRosterSize,
        heroes: p.roster,
        bestValueHero,
        mostExpensiveHero,
        totalSpent
      };
    });

    // Sort by finalScore DESC, rosterCount DESC, creditsLeft DESC
    scored.sort((a, b) => {
      if (b.finalScore !== a.finalScore) return b.finalScore - a.finalScore;
      if (b.rosterCount !== a.rosterCount) return b.rosterCount - a.rosterCount;
      return b.creditsLeft - a.creditsLeft;
    });

    scored.forEach((s, idx) => {
      s.rank = idx + 1;
    });

    return scored;
  }

  public contributeRescue(roomCode: string, playerId: string, amount: number): { success: boolean; error?: string; room?: RoomState } {
    const code = roomCode.toUpperCase();
    const room = this.rooms.get(code);
    if (!room) return { success: false, error: 'Auction room not found' };
    
    const player = room.players[playerId];
    if (!player) return { success: false, error: 'Bidder not recognized' };
    
    if (!room.rescueState || !room.rescueState.isActive || room.rescueState.status !== 'PENDING') {
      return { success: false, error: 'Rescue mode is not active' };
    }
    
    if (player.budget < amount) {
      return { success: false, error: 'Insufficient credits' };
    }
    
    if (![10, 20, 30].includes(amount)) {
      return { success: false, error: 'Invalid contribution amount' };
    }
    
    player.budget -= amount;
    room.rescueState.contributions[playerId] = (room.rescueState.contributions[playerId] || 0) + amount;
    room.rescueState.totalCollected += amount;
    
    this.io.to(room.roomCode).emit('RESCUE_UPDATED', {
      rescueState: room.rescueState,
      roomState: room
    });
    
    if (room.rescueState.totalCollected >= room.rescueState.requiredTarget) {
      this.completeRescue(room);
    }
    
    return { success: true, room };
  }

  public voteSkip(roomCode: string, playerId: string): { success: boolean; error?: string; room?: RoomState } {
    const code = roomCode.toUpperCase();
    const room = this.rooms.get(code);
    if (!room) return { success: false, error: 'Auction room not found' };
    
    if (room.status !== 'AUCTION_ACTIVE') return { success: false, error: 'Auction is not active' };
    
    const lot = room.activeLot;
    if (!lot || lot.status !== 'LIVE') return { success: false, error: 'No live lot to skip' };
    
    if (lot.highestBidderId) return { success: false, error: 'Cannot skip a lot that already has bids' };
    
    if (lot.skipVotes.includes(playerId)) return { success: false, error: 'Already voted to skip' };
    
    lot.skipVotes.push(playerId);
    
    const activePlayers = Object.values(room.players).filter(p => p.isOnline);
    
    if (lot.skipVotes.length >= activePlayers.length) {
      // Unanimous skip
      this.clearRoomTimer(room.roomCode);
      lot.status = 'UNSOLD';
      this.addActivity(room, {
        id: `act-${Date.now()}-skip`,
        type: 'UNSOLD',
        message: `⏭️ ${lot.hero.name} was unanimously skipped by the chamber!`,
        timestamp: Date.now()
      });
      
      this.io.to(room.roomCode).emit('LOT_SETTLED', {
        status: 'UNSOLD',
        lot,
        roomState: room
      });
      
      setTimeout(() => {
        this.advanceToNextLot(room);
      }, 2000);
    } else {
      this.io.to(room.roomCode).emit('SKIP_VOTE_UPDATED', {
        lotId: lot.id,
        skipVotes: lot.skipVotes,
        roomState: room
      });
    }
    
    return { success: true, room };
  }

  private completeRescue(room: RoomState): void {
    if (!room.rescueState || !room.activeLot) return;
    
    room.rescueState.status = 'COMPLETED';
    
    let winnerId: string | null = null;
    let maxContribution = -1;
    
    for (const [playerId, amount] of Object.entries(room.rescueState.contributions)) {
      if (amount > maxContribution) {
        maxContribution = amount;
      }
    }
    
    const tieIds = Object.entries(room.rescueState.contributions)
      .filter(([_, amt]) => amt === maxContribution)
      .map(([id]) => id);
      
    if (tieIds.length > 0) {
      tieIds.sort((a, b) => room.players[a].displayName.localeCompare(room.players[b].displayName));
      winnerId = tieIds[0];
    }
    
    const winner = winnerId ? room.players[winnerId] : null;
    const lot = room.activeLot;
    const finalPrice = room.rescueState.requiredTarget;
    
    this.clearRoomTimer(room.roomCode);
    
    if (winner) {
       const purchasedHero: PurchasedHero = {
          hero: lot.hero,
          purchasePrice: maxContribution,
          purchasedAt: Date.now()
        };
        winner.roster.push(purchasedHero);
        
        lot.status = 'SOLD';
        lot.winnerId = winner.id;
        lot.winnerName = winner.displayName;
        lot.finalPrice = finalPrice;
        
        this.addActivity(room, {
          id: `act-${Date.now()}-rescue-win`,
          type: 'SOLD',
          message: `🦸 RESCUE COMPLETE! ${lot.hero.name} saved by ${winner.displayName} (Highest Contributor)!`,
          timestamp: Date.now(),
          highlight: true
        });

        this.io.to(room.roomCode).emit('RESCUE_COMPLETED', {
          rescueState: room.rescueState,
          roomState: room
        });
        
        this.io.to(room.roomCode).emit('LOT_SETTLED', {
          status: 'SOLD',
          lot,
          winner: {
            id: winner.id,
            displayName: winner.displayName,
            remainingBudget: winner.budget,
            rosterCount: winner.roster.length
          },
          roomState: room
        });
    }
    
    room.rescueState = null;
    
    setTimeout(() => {
      this.advanceToNextLot(room);
    }, 4000);
  }

  private refundRescue(room: RoomState, reason: string): void {
    if (!room.rescueState || room.rescueState.status !== 'PENDING') return;

    for (const [playerId, amount] of Object.entries(room.rescueState.contributions)) {
      if (room.players[playerId]) {
        room.players[playerId].budget += amount;
      }
    }
    room.rescueState.status = 'REFUNDED';
    
    this.addActivity(room, {
      id: `act-${Date.now()}-refund`,
      type: 'START',
      message: `🔄 Rescue failed: ${reason}. Contributions refunded.`,
      timestamp: Date.now()
    });

    this.io.to(room.roomCode).emit('RESCUE_REFUNDED', {
      rescueState: room.rescueState,
      roomState: room
    });
    
    room.rescueState = null;
  }

  private recalculateRescueEligibility(room: RoomState): void {
    if (!room.activeLot || room.activeLot.status !== 'LIVE') {
      room.rescueState = null;
      return;
    }

    const lot = room.activeLot;
    const minRequired = lot.highestBidderId ? lot.currentBid + room.settings.bidIncrement : lot.currentBid;
    
    const eligiblePlayers = Object.values(room.players).filter(
      p => p.isOnline && p.roster.length < room.settings.requiredRosterSize
    );

    if (eligiblePlayers.length === 0) {
      room.rescueState = null;
      return;
    }

    // In reduced price mode, bidding handles the low-budget auction.
    if (lot.isReducedPrice) {
      if (room.rescueState?.isActive && room.rescueState.status === 'PENDING') {
        this.refundRescue(room, 'Special reduced-price bidding is active');
      }
      room.rescueState = null;
      return;
    }

    const anyoneCanAfford = eligiblePlayers.some(p => p.budget >= minRequired);

    if (anyoneCanAfford) {
      if (room.rescueState?.isActive && room.rescueState.status === 'PENDING') {
        this.refundRescue(room, 'A player can now afford the character');
      }
      room.rescueState = null;
    } else {
      if (!room.rescueState) {
        room.rescueState = {
          isActive: true,
          requiredTarget: minRequired,
          totalCollected: 0,
          contributions: {},
          status: 'PENDING'
        };
        
        this.addActivity(room, {
          id: `act-${Date.now()}-rescue`,
          type: 'START',
          message: `🚨 LOW-MONEY RESCUE ACTIVATED! All players are short on credits. Target: ${minRequired}`,
          timestamp: Date.now(),
          highlight: true
        });

        this.io.to(room.roomCode).emit('RESCUE_ACTIVATED', {
          rescueState: room.rescueState,
          roomState: room
        });
      } else {
        room.rescueState.requiredTarget = minRequired;
      }
    }
  }

  private clearRoomTimer(roomCode: string): void {
    const timer = this.timers.get(roomCode);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(roomCode);
    }
  }

  private addActivity(room: RoomState, item: ActivityItem): void {
    room.recentActivity.unshift(item);
    if (room.recentActivity.length > 50) {
      room.recentActivity.pop();
    }
  }

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}
