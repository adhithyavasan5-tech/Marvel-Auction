import { describe, it } from 'node:test';
import assert from 'node:assert';
import { AuctionEngine } from '../services/auctionEngine.js';
import { heroService } from '../services/heroService.js';
import { Server } from 'socket.io';
import http from 'http';

describe('MARVEL: Omniverse Auctions — Auction Engine Tests', async () => {
  await heroService.initialize();

  const dummyServer = http.createServer();
  const dummyIo = new Server(dummyServer);
  const engine = new AuctionEngine(dummyIo);

  it('creates an auction room with correct default settings and host', () => {
    const host = { id: 'player-stark', displayName: 'Tony Stark', avatar: 'https://example.com/stark.jpg' };
    const room = engine.createRoom(host, { startingBudget: 1500, requiredRosterSize: 3 });

    assert.ok(room.roomCode.length === 6);
    assert.strictEqual(room.hostId, host.id);
    assert.strictEqual(room.settings.startingBudget, 1500);
    assert.strictEqual(room.settings.requiredRosterSize, 3);
    assert.strictEqual(room.players[host.id].budget, 1500);
    assert.strictEqual(room.players[host.id].isHost, true);
    assert.strictEqual(room.status, 'LOBBY');
  });

  it('rejects joining with an invalid room code', () => {
    const res = engine.joinRoom('XXXXXX', { id: 'p2', displayName: 'Peter Parker', avatar: '' });
    assert.strictEqual(res.success, false);
    assert.ok(res.error?.includes('not found'));
  });

  it('allows a second player to join the room and set ready', () => {
    const host = { id: 'host-1', displayName: 'Collector', avatar: '' };
    const room = engine.createRoom(host);

    const res = engine.joinRoom(room.roomCode, { id: 'bidder-2', displayName: 'Thor', avatar: '' });
    assert.strictEqual(res.success, true);
    assert.strictEqual(Object.keys(room.players).length, 2);

    const readyRes = engine.setReady(room.roomCode, 'bidder-2', true);
    assert.strictEqual(readyRes.success, true);
    assert.strictEqual(room.players['bidder-2'].isReady, true);
  });

  it('prevents non-host from starting auction', () => {
    const host = { id: 'host-1', displayName: 'Collector', avatar: '' };
    const room = engine.createRoom(host);
    engine.joinRoom(room.roomCode, { id: 'bidder-2', displayName: 'Thor', avatar: '' });
    engine.setReady(room.roomCode, 'bidder-2', true);

    const startRes = engine.startAuction(room.roomCode, 'bidder-2');
    assert.strictEqual(startRes.success, false);
    assert.ok(startRes.error?.includes('Only the Chamber Host'));
  });

  it('prevents starting with less than 2 ready players', () => {
    const host = { id: 'host-solo', displayName: 'Doctor Strange', avatar: '' };
    const room = engine.createRoom(host);

    const startRes = engine.startAuction(room.roomCode, host.id);
    assert.strictEqual(startRes.success, false);
    assert.ok(startRes.error?.includes('Minimum of 2 bidders'));
  });

  it('starts auction when host requests and all players ready', () => {
    const host = { id: 'host-a', displayName: 'Odin', avatar: '' };
    const room = engine.createRoom(host, { countdownSeconds: 15, lotCount: 10 });
    engine.joinRoom(room.roomCode, { id: 'player-b', displayName: 'Loki', avatar: '' });
    engine.setReady(room.roomCode, 'player-b', true);

    const startRes = engine.startAuction(room.roomCode, host.id);
    assert.strictEqual(startRes.success, true);
    assert.strictEqual(room.status, 'AUCTION_ACTIVE');
    assert.ok(room.activeLot !== null);
    assert.strictEqual(room.activeLot?.status, 'LIVE');
  });

  it('validates bids: rejects below increment, self-outbid, or insufficient credits', () => {
    const host = { id: 'p1', displayName: 'Steve', avatar: '' };
    const room = engine.createRoom(host, { startingBudget: 200, bidIncrement: 10 });
    engine.joinRoom(room.roomCode, { id: 'p2', displayName: 'Bucky', avatar: '' });
    engine.setReady(room.roomCode, 'p2', true);
    engine.startAuction(room.roomCode, host.id);

    const activeLot = room.activeLot!;
    const basePrice = activeLot.currentBid;

    // Test 1: Bid below base price
    const lowBid = engine.placeBid(room.roomCode, 'p2', basePrice - 10);
    assert.strictEqual(lowBid.success, false);

    // Test 2: Valid opening bid
    const validBid = engine.placeBid(room.roomCode, 'p2', basePrice);
    assert.strictEqual(validBid.success, true);
    assert.strictEqual(room.activeLot?.highestBidderId, 'p2');

    // Test 3: Self outbid rejected
    const selfBid = engine.placeBid(room.roomCode, 'p2', basePrice + 10);
    assert.strictEqual(selfBid.success, false);
    assert.ok(selfBid.error?.includes('already holding the highest bid'));

    // Test 4: Insufficient budget
    const excessiveBid = engine.placeBid(room.roomCode, 'p1', 5000);
    assert.strictEqual(excessiveBid.success, false);
    assert.ok(excessiveBid.error?.includes('Insufficient credits'));
  });

  it('computes correct rankings with composition bonus and roster scores', () => {
    const host = { id: 'p1', displayName: 'Leader', avatar: '' };
    const room = engine.createRoom(host);
    engine.joinRoom(room.roomCode, { id: 'p2', displayName: 'Rival', avatar: '' });

    // Give p1 3 heroes with different roles
    const heroes = heroService.getHeroes({ limit: 5 });
    room.players['p1'].roster = [
      { hero: { ...heroes[0], role: 'Titan', totalPower: 400 }, purchasePrice: 150, purchasedAt: 1 },
      { hero: { ...heroes[1], role: 'Tactician', totalPower: 350 }, purchasePrice: 120, purchasedAt: 2 },
      { hero: { ...heroes[2], role: 'Duelist', totalPower: 300 }, purchasePrice: 100, purchasedAt: 3 }
    ];
    room.players['p1'].budget = 630;

    // Give p2 2 heroes
    room.players['p2'].roster = [
      { hero: { ...heroes[3], role: 'Titan', totalPower: 200 }, purchasePrice: 80, purchasedAt: 4 },
      { hero: { ...heroes[4], role: 'Titan', totalPower: 200 }, purchasePrice: 80, purchasedAt: 5 }
    ];
    room.players['p2'].budget = 840;

    const rankings = engine.computeRankings(room);
    assert.strictEqual(rankings.length, 2);
    // p1 has 400+350+300 = 1050 base power + 30 role bonus (3 unique roles) = 1080 final score
    assert.strictEqual(rankings[0].playerId, 'p1');
    assert.strictEqual(rankings[0].basePower, 1050);
    assert.strictEqual(rankings[0].compositionBonus, 30);
    assert.strictEqual(rankings[0].finalScore, 1080);
    assert.strictEqual(rankings[0].rank, 1);

    // p2 has 400 base power, 0 role bonus (only 1 unique role)
    assert.strictEqual(rankings[1].playerId, 'p2');
    assert.strictEqual(rankings[1].basePower, 400);
    assert.strictEqual(rankings[1].compositionBonus, 0);
    assert.strictEqual(rankings[1].finalScore, 400);
    assert.strictEqual(rankings[1].rank, 2);
  });

  it('automatically activates reduced-price mode when no eligible player can afford base price', () => {
    const host = { id: 'pA', displayName: 'Player A', avatar: '' };
    // Set startingBudget to 150 (below hero base prices like 175, 200, etc.)
    const room = engine.createRoom(host, { startingBudget: 150, bidIncrement: 10, countdownSeconds: 15 });
    engine.joinRoom(room.roomCode, { id: 'pB', displayName: 'Player B', avatar: '' });
    room.players['pA'].budget = 120;
    room.players['pB'].budget = 150;
    engine.setReady(room.roomCode, 'pB', true);

    engine.startAuction(room.roomCode, host.id);
    const lot = room.activeLot!;

    // If hero's base price is > 150, isReducedPrice MUST be true
    if (lot.hero.basePrice > 150) {
      assert.strictEqual(lot.isReducedPrice, true);
      assert.strictEqual(lot.originalBasePrice, lot.hero.basePrice);
      // Opening bid should be <= 10
      assert.ok(lot.currentBid <= 10);
      assert.ok(lot.currentBid <= 150);

      // Player A (120 credits) can place a valid opening bid of 10
      const bid1 = engine.placeBid(room.roomCode, 'pA', 10);
      assert.strictEqual(bid1.success, true);
      assert.strictEqual(lot.highestBidderId, 'pA');
      assert.strictEqual(lot.currentBid, 10);

      // Player B (150 credits) uses +10 or +20 increment: bid 20 or 30
      const bid2 = engine.placeBid(room.roomCode, 'pB', 20);
      assert.strictEqual(bid2.success, true);
      assert.strictEqual(lot.highestBidderId, 'pB');
      assert.strictEqual(lot.currentBid, 20);

      // Player A raises to 40 (+20 increment)
      const bid3 = engine.placeBid(room.roomCode, 'pA', 40);
      assert.strictEqual(bid3.success, true);
      assert.strictEqual(lot.highestBidderId, 'pA');
      assert.strictEqual(lot.currentBid, 40);

      // Player A cannot bid above remaining budget (120 CR)
      const overBid = engine.placeBid(room.roomCode, 'pB', 200);
      assert.strictEqual(overBid.success, false);
      assert.ok(overBid.error?.includes('Insufficient credits'));
    }
  });

  it('keeps normal auction mode when at least one player can afford the base price', () => {
    const host = { id: 'rich-host', displayName: 'Tony Stark', avatar: '' };
    const room = engine.createRoom(host, { startingBudget: 2000, bidIncrement: 10 });
    engine.joinRoom(room.roomCode, { id: 'broke-guest', displayName: 'Peter Parker', avatar: '' });
    room.players['rich-host'].budget = 2000;
    room.players['broke-guest'].budget = 50;
    engine.setReady(room.roomCode, 'broke-guest', true);

    engine.startAuction(room.roomCode, host.id);
    const lot = room.activeLot!;

    // Because Tony has 2000 credits, base price is affordable
    assert.strictEqual(lot.isReducedPrice, false);
    assert.strictEqual(lot.currentBid, lot.hero.basePrice);

    // Bid below base price is rejected
    const lowBid = engine.placeBid(room.roomCode, 'rich-host', lot.hero.basePrice - 10);
    assert.strictEqual(lowBid.success, false);
  });

  it('deducts exactly the final winning bid, not base price, when special auction settles', () => {
    const host = { id: 'p1', displayName: 'Gamer 1', avatar: '' };
    const room = engine.createRoom(host, { startingBudget: 100, bidIncrement: 10, countdownSeconds: 1 });
    engine.joinRoom(room.roomCode, { id: 'p2', displayName: 'Gamer 2', avatar: '' });
    room.players['p1'].budget = 80;
    room.players['p2'].budget = 90;
    engine.setReady(room.roomCode, 'p2', true);

    engine.startAuction(room.roomCode, host.id);
    const lot = room.activeLot!;

    // Force lot to be reduced price
    lot.isReducedPrice = true;
    lot.hero.basePrice = 250;
    lot.currentBid = 10;

    // p2 bids 30
    const bidRes = engine.placeBid(room.roomCode, 'p2', 30);
    assert.strictEqual(bidRes.success, true);

    // Manually trigger settlement to test exact deduction
    const initialP2Budget = room.players['p2'].budget; // 90
    (engine as any).settleLot(room, lot);

    assert.strictEqual(lot.status, 'SOLD');
    assert.strictEqual(lot.winnerId, 'p2');
    assert.strictEqual(lot.finalPrice, 30);
    // p2 budget must be deducted by exactly 30, not 250 basePrice!
    assert.strictEqual(room.players['p2'].budget, initialP2Budget - 30);
    // p1 budget unchanged
    assert.strictEqual(room.players['p1'].budget, 80);
    // Hero in p2 roster
    assert.strictEqual(room.players['p2'].roster.length, 1);
    assert.strictEqual(room.players['p2'].roster[0].purchasePrice, 30);
  });

  it('guarantees Captain America and Iron Man are compulsory in every auction session', () => {
    const host = { id: 'p1', displayName: 'Host 1', avatar: '' };
    const room = engine.createRoom(host, { lotCount: 15 });
    engine.joinRoom(room.roomCode, { id: 'p2', displayName: 'Player 2', avatar: '' });
    engine.setReady(room.roomCode, 'p2', true);

    const startRes = engine.startAuction(room.roomCode, host.id);
    assert.strictEqual(startRes.success, true);

    const heroNames = room.lots.map(l => l.hero.name.toLowerCase());
    assert.ok(heroNames.includes('captain america'), 'Session must contain Captain America');
    assert.ok(heroNames.includes('iron man'), 'Session must contain Iron Man');
  });
});

