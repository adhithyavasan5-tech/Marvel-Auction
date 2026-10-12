-- =====================================================================
-- MARVEL: Omniverse Auctions Omniverse Auctions — SUPABASE SCHEMA MIGRATION
-- Luxury Superhero Auction & Real-Time Multiplayer Arena
-- =====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. HEROES CATALOGUE
CREATE TABLE IF NOT EXISTS heroes (
  id TEXT PRIMARY KEY,
  external_id INTEGER,
  name TEXT NOT NULL,
  real_name TEXT,
  description TEXT,
  image_url TEXT,
  publisher TEXT NOT NULL DEFAULT 'Marvel Comics',
  alignment TEXT DEFAULT 'good',
  role TEXT NOT NULL DEFAULT 'Vanguard',
  rarity TEXT NOT NULL DEFAULT 'Rare',
  intelligence INTEGER DEFAULT 50,
  strength INTEGER DEFAULT 50,
  speed INTEGER DEFAULT 50,
  durability INTEGER DEFAULT 50,
  power INTEGER DEFAULT 50,
  combat INTEGER DEFAULT 50,
  base_price INTEGER NOT NULL DEFAULT 100,
  abilities JSONB DEFAULT '[]'::jsonb,
  source TEXT DEFAULT 'api',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_heroes_publisher ON heroes(publisher);
CREATE INDEX IF NOT EXISTS idx_heroes_rarity ON heroes(rarity);
CREATE INDEX IF NOT EXISTS idx_heroes_role ON heroes(role);

-- 3. PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  avatar_url TEXT,
  completed_auctions INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  total_heroes_collected INTEGER DEFAULT 0,
  best_team_power INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. AUCTION ROOMS
CREATE TABLE IF NOT EXISTS rooms (
  id TEXT PRIMARY KEY,
  room_code VARCHAR(6) UNIQUE NOT NULL,
  host_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'LOBBY' CHECK (status IN ('LOBBY', 'AUCTION_ACTIVE', 'COMPLETED')),
  settings JSONB NOT NULL DEFAULT '{"startingBudget": 1000, "requiredRosterSize": 5, "bidIncrement": 10, "countdownSeconds": 20, "maxPlayers": 8, "lotCount": 30, "catalogueMode": "marvel"}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(room_code);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);

-- 5. ROOM PLAYERS
CREATE TABLE IF NOT EXISTS room_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  budget INTEGER NOT NULL CHECK (budget >= 0),
  is_ready BOOLEAN DEFAULT FALSE,
  is_host BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, player_id)
);

CREATE INDEX IF NOT EXISTS idx_room_players_room ON room_players(room_id);

-- 6. AUCTION LOTS
CREATE TABLE IF NOT EXISTS auction_lots (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  hero_id TEXT NOT NULL REFERENCES heroes(id),
  lot_number INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'UPCOMING' CHECK (status IN ('UPCOMING', 'LIVE', 'SOLD', 'UNSOLD')),
  highest_bid INTEGER,
  highest_bidder_id TEXT,
  winner_id TEXT,
  final_price INTEGER,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, lot_number)
);

CREATE INDEX IF NOT EXISTS idx_auction_lots_room ON auction_lots(room_id);
CREATE INDEX IF NOT EXISTS idx_auction_lots_status ON auction_lots(status);

-- 7. BIDS (IMMUTABLE LOG)
CREATE TABLE IF NOT EXISTS bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lot_id TEXT NOT NULL REFERENCES auction_lots(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bids_lot ON bids(lot_id);
CREATE INDEX IF NOT EXISTS idx_bids_player ON bids(player_id);

-- 8. PLAYER ROSTER (OWNED HEROES)
CREATE TABLE IF NOT EXISTS roster (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL,
  hero_id TEXT NOT NULL REFERENCES heroes(id),
  purchase_price INTEGER NOT NULL CHECK (purchase_price >= 0),
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, hero_id) -- Hero can only be owned ONCE per room!
);

CREATE INDEX IF NOT EXISTS idx_roster_player ON roster(room_id, player_id);

-- 9. AUCTION RESULTS & FINAL LEADERBOARDS
CREATE TABLE IF NOT EXISTS auction_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  base_power INTEGER NOT NULL DEFAULT 0,
  composition_bonus INTEGER NOT NULL DEFAULT 0,
  final_score INTEGER NOT NULL DEFAULT 0,
  credits_left INTEGER NOT NULL DEFAULT 0,
  roster_count INTEGER NOT NULL DEFAULT 0,
  rank INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, player_id)
);

CREATE INDEX IF NOT EXISTS idx_results_room_rank ON auction_results(room_id, rank);

-- 10. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE auction_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE roster ENABLE ROW LEVEL SECURITY;
ALTER TABLE auction_results ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone can view, user can update own profile
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Rooms: Read is public, writes controlled server-side or host
CREATE POLICY "Rooms viewable by everyone" ON rooms FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create rooms" ON rooms FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Lots & Bids: Read is public
CREATE POLICY "Auction lots viewable by everyone" ON auction_lots FOR SELECT USING (true);
CREATE POLICY "Bids viewable by everyone" ON bids FOR SELECT USING (true);
CREATE POLICY "Rosters viewable by everyone" ON roster FOR SELECT USING (true);
CREATE POLICY "Results viewable by everyone" ON auction_results FOR SELECT USING (true);
