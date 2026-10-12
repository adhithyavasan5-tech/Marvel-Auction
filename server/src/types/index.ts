export type HeroRarity = 'Mythic' | 'Legendary' | 'Epic' | 'Rare' | 'Uncommon';
export type HeroRole = 'Titan' | 'Duelist' | 'Tactician' | 'Vanguard' | 'Support';
export type HeroAlignment = 'good' | 'bad' | 'neutral';

export interface Hero {
  id: string;
  externalId: number | string;
  name: string;
  realName: string;
  biography: string;
  imageUrl: string;
  publisher: string;
  alignment: HeroAlignment;
  role: HeroRole;
  rarity: HeroRarity;
  intelligence: number;
  strength: number;
  speed: number;
  durability: number;
  power: number;
  combat: number;
  totalPower: number;
  basePrice: number;
  abilities: string[];
  source: 'api' | 'fallback';
  createdAt: string;
}

export interface RescueState {
  isActive: boolean;
  requiredTarget: number;
  totalCollected: number;
  contributions: Record<string, number>;
  status: 'PENDING' | 'COMPLETED' | 'EXPIRED' | 'REFUNDED';
}

export interface RoomSettings {
  startingBudget: number;
  requiredRosterSize: number;
  bidIncrement: number;
  countdownSeconds: number;
  maxPlayers: number;
  lotCount: number;
  catalogueMode: 'marvel' | 'all';
}

export interface PurchasedHero {
  hero: Hero;
  purchasePrice: number;
  purchasedAt: number;
}

export interface RoomPlayer {
  id: string;
  displayName: string;
  avatar: string;
  budget: number;
  isReady: boolean;
  isHost: boolean;
  isOnline: boolean;
  roster: PurchasedHero[];
  connectedAt: number;
}

export interface BidRecord {
  id: string;
  lotId: string;
  playerId: string;
  playerName: string;
  amount: number;
  timestamp: number;
}

export interface AuctionLot {
  id: string;
  lotNumber: number;
  hero: Hero;
  status: 'UPCOMING' | 'LIVE' | 'SOLD' | 'UNSOLD';
  currentBid: number;
  highestBidderId: string | null;
  highestBidderName: string | null;
  bidHistory: BidRecord[];
  endsAt: number | null; // authoritative server epoch ms
  winnerId: string | null;
  winnerName: string | null;
  finalPrice: number | null;
  skipVotes: string[];
  isReducedPrice?: boolean;
  originalBasePrice?: number;
}

export interface ActivityItem {
  id: string;
  type: 'BID' | 'SOLD' | 'UNSOLD' | 'JOIN' | 'LEAVE' | 'START';
  message: string;
  timestamp: number;
  highlight?: boolean;
}

export interface PlayerRanking {
  rank: number;
  playerId: string;
  displayName: string;
  avatar: string;
  basePower: number;
  compositionBonus: number;
  finalScore: number;
  creditsLeft: number;
  rosterCount: number;
  rosterTarget: number;
  heroes: PurchasedHero[];
  bestValueHero: PurchasedHero | null;
  mostExpensiveHero: PurchasedHero | null;
  totalSpent: number;
}

export interface RoomState {
  id: string;
  roomCode: string;
  hostId: string;
  status: 'LOBBY' | 'AUCTION_ACTIVE' | 'COMPLETED';
  settings: RoomSettings;
  players: Record<string, RoomPlayer>;
  lots: AuctionLot[];
  currentLotIndex: number;
  activeLot: AuctionLot | null;
  recentActivity: ActivityItem[];
  rankings?: PlayerRanking[];
  catalogueSource: 'api' | 'fallback';
  rescueState: RescueState | null;
  createdAt: number;
}
