# MARVEL: Omniverse Auctions
## Luxury Superhero Auction & Real-Time Multiplayer Arena

> **"Assemble Your Legends. Command the Auction."**

A fully functional, cinematic, server-authoritative real-time multiplayer superhero auction game. Two or more players on different browsers or devices can join the same private room, bid on superheroes using virtual credits, collect a team, and compete on final power rankings.

---

## ✅ What's Implemented & Working

| Feature | Status |
|---|---|
| Real-time multiplayer auction via Socket.IO | ✅ Live |
| Server-authoritative bid validation & timers | ✅ Live |
| Anti-sniping clock extension (+5s in final 5s) | ✅ Live |
| Atomic lot settlement (no double-sales) | ✅ Live |
| Live superhero catalogue from community API (563 heroes) | ✅ Live |
| Local fallback catalogue (35 curated Marvel heroes) | ✅ Live |
| Hero normalization (rarity, role, price, abilities) | ✅ Live |
| Room creation with configurable settings | ✅ Live |
| 6-character unique room codes | ✅ Live |
| Multiplayer lobby with ready states | ✅ Live |
| Live countdown synced from server deadline | ✅ Live |
| Bid increment validation | ✅ Live |
| Budget enforcement per player | ✅ Live |
| Roster limit enforcement | ✅ Live |
| Outbid detection + Toast notification | ✅ Live |
| SOLD/UNSOLD overlay banner | ✅ Live |
| My Team page with composition bonus | ✅ Live |
| Final Leaderboard & Rankings | ✅ Live |
| Team composition synergy bonus | ✅ Live |
| Player roster inspection in results | ✅ Live |
| Web Audio procedural sound effects | ✅ Live |
| Confetti on lot wins | ✅ Live |
| Sound toggle (mute/unmute) | ✅ Live |
| Reduced-motion toggle | ✅ Live |
| Superhero Catalogue Browser modal | ✅ Live |
| Live/Fallback data source indicator | ✅ Live |
| Reconnection state recovery | ✅ Live |
| Responsive design (mobile, tablet, desktop) | ✅ Live |
| Supabase DB schema (SQL migrations) | ✅ Ready |
| All 8 auction engine tests pass | ✅ Verified |

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js v18+ (v24 confirmed working)
- npm v9+

### 1. Clone & Install Dependencies

```bash
# From the project root (Marvel-Auction/)
npm install          # root dev tools

cd server
npm install

cd ../client
npm install
```

### 2. Configure Environment

**Server** (`server/.env`):
```env
PORT=4000
CLIENT_URL=http://localhost:5173
```

**Client** (`client/.env`):
```env
VITE_SERVER_URL=http://localhost:4000
```

### 3. Start the Servers

Open two terminals:

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
```
Output:
```
🏰 MARVEL:Omniverse Auctions — Auction House Online
📡 Server listening on http://localhost:4000
💎 Catalogue Status: [API]
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```
Open: **http://localhost:5173**

---

## 🧪 Running Automated Tests

All server-side auction engine tests:

```bash
cd server
npx tsx --test src/tests/auction.test.ts
```

**8/8 tests pass:**
- ✔ Creates room with correct settings
- ✔ Rejects invalid room codes
- ✔ Join room and set ready state
- ✔ Prevents non-host from starting
- ✔ Prevents start with < 2 players
- ✔ Starts auction when all conditions met
- ✔ Validates bids (increment, self-outbid, budget)
- ✔ Computes correct rankings with composition bonus

---

## 🎮 Multiplayer Test Guide

To test with two players on **different browsers or devices**:

1. **Player 1** → Open `http://localhost:5173` → Click **CREATE AUCTION**
   - Set a display name (e.g. "Tony Stark")
   - Configure settings or use defaults
   - Click **INITIALIZE AUCTION CHAMBER**
   - Note the **6-character room code** (e.g. `KV8M3P`)

2. **Player 2** → Open a **different browser or incognito tab** → Click **JOIN AUCTION**
   - Enter the 6-character room code
   - Set a display name (e.g. "Thor")
   - Click **ENTER CHAMBER**

3. Both players are now in the **Multiplayer Lobby**
   - Both click **⚡ SIGNAL READY**
   - Host clicks **STRIKE GAVEL (START AUCTION)**

4. The **Live Arena** activates simultaneously on both screens:
   - Same hero lot, same countdown
   - Each player bids using their credits
   - Anti-snipe clock extends automatically
   - SOLD banner appears on all screens

5. After all lots, visit **LEADERBOARD** for final rankings

For mobile testing: replace `localhost` with your machine's local network IP (e.g. `192.168.1.x`).

---

## 🌐 Hero Catalogue

- **Source:** [akabab/superhero-api](https://github.com/akabab/superhero-api) — public community dataset, no key required
- **Total available:** 563 heroes (Marvel)
- **Default auction mode:** Marvel-focused (~300+ heroes)
- **Fallback:** 35 curated Marvel heroes with CDN images (always available offline)
- **Normalization:** Rarity, role, base price, abilities all generated deterministically from stable character IDs — same hero never changes between sessions

### Hero Rarity Scale
| Rarity | Total Power Score |
|---|---|
| Mythic | 490+ |
| Legendary | 410–489 |
| Epic | 330–409 |
| Rare | 250–329 |
| Uncommon | <250 |

### Composition Bonus
| Unique Roles | Bonus |
|---|---|
| 5 distinct roles | +100 |
| 4 distinct roles | +60 |
| 3 distinct roles | +30 |
| <3 roles | 0 |

---

## 🗄️ Database (Supabase — Optional)

The game currently runs fully in-memory (perfect for development and demo). To add persistence:

1. Create a free project at [supabase.com](https://supabase.com)
2. Run the migration in `server/db/migrations.sql` in the Supabase SQL editor
3. Add to `server/.env`:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

---

## ☁️ Deployment

### Frontend → Vercel

```bash
cd client
npm run build
# Deploy dist/ folder to Vercel
# Set VITE_SERVER_URL to your backend URL
```

Or connect the `client/` directory directly in the Vercel dashboard.

### Backend → Render (Free Tier)

1. Create a new **Web Service** on [render.com](https://render.com)
2. Set the root directory to `server/`
3. Build command: `npm install`
4. Start command: `npm start` (or `npx tsx src/index.ts`)
5. Add environment variable: `PORT=10000` (Render sets this automatically)
6. Update `client/.env` (or Vercel env vars) with the Render service URL

---

## 🏗️ Project Structure

```
Marvel-Auction/
├── client/                      # Vite + React + TypeScript + Tailwind
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx       # Navigation, sound/motion toggles
│   │   │   ├── HeroCard.tsx     # Hero cards (compact & full)
│   │   │   ├── CreateRoomModal.tsx
│   │   │   ├── JoinRoomModal.tsx
│   │   │   ├── CatalogueBrowser.tsx  # Browse all 563+ heroes
│   │   │   ├── ProfileModal.tsx
│   │   │   └── Toast.tsx
│   │   ├── context/
│   │   │   └── AuctionContext.tsx    # Central React state + socket listeners
│   │   ├── lib/
│   │   │   └── soundEffects.ts      # Web Audio procedural SFX
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx
│   │   │   ├── LobbyPage.tsx
│   │   │   ├── AuctionArenaPage.tsx  # Live bidding floor
│   │   │   ├── MyTeamPage.tsx
│   │   │   └── ResultsPage.tsx
│   │   ├── services/
│   │   │   └── socketService.ts
│   │   └── types/
│   │       └── index.ts
│   └── public/
│       └── crest.svg            # Custom Dynasty insignia
│
└── server/                      # Node.js + Express + Socket.IO
    ├── src/
    │   ├── index.ts             # Entry point, HTTP + Socket server
    │   ├── socket/
    │   │   └── auctionSocket.ts # WebSocket event handlers
    │   ├── services/
    │   │   ├── auctionEngine.ts # Authoritative game state engine
    │   │   └── heroService.ts   # API fetch, normalize, cache, fallback
    │   ├── data/
    │   │   └── fallbackHeroes.ts # 35 curated offline heroes
    │   ├── types/
    │   │   └── index.ts
    │   └── tests/
    │       └── auction.test.ts  # 8 automated engine tests
    └── db/
        └── migrations.sql       # Full Supabase schema + RLS policies
```

---

## 🎨 Design System: Omniverse Auctions

| Token | Color | Usage |
|---|---|---|
| Obsidian Black | `#08090D` | Base background |
| Midnight Charcoal | `#111319` | Cards, panels |
| Deep Crimson | `#8B1020` | Dramatic highlights, CTA bg |
| Blood Red | `#C62838` | Active states, bid button |
| Antique Gold | `#C6A15B` | Borders, labels, accents |
| Champagne Gold | `#F0D79A` | Primary values, credits |
| Warm Ivory | `#F5F0E7` | Body text |
| Muted Silver | `#9295A0` | Secondary text |

**Fonts:**
- **Cinzel** — Display titles, hero names, brand wordmark
- **Inter** — UI labels, descriptions, body copy  
- **JetBrains Mono** — Credits, timers, bid amounts, room codes

---

## ⚖️ Legal Notes

- Character data sourced from [akabab/superhero-api](https://github.com/akabab/superhero-api) — MIT licensed community data
- Character artwork served directly from the CDN provided by the dataset (`cdn.jsdelivr.net/gh/akabab/superhero-api`)
- This project is **not affiliated** with Marvel Entertainment, DC Comics, or any other publisher
- No real money, no gambling mechanics, no real-world transactions — virtual credits only
- Review the akabab dataset licence and image terms before any commercial deployment
