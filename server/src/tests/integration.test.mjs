// Integration test for Socket.IO multiplayer auction flow
// Tests two players creating a room, joining, starting, and bidding

import { io } from 'socket.io-client';

const SERVER_URL = 'http://localhost:4000';

function createPlayer(id, name) {
  return { id, displayName: name, avatar: 'https://example.com/avatar.jpg' };
}

async function runIntegrationTest() {
  console.log('\n🏰 MARVEL: Omniverse Auctions — Multiplayer Socket.IO Integration Test\n');

  const player1 = createPlayer('test-p1-host', 'Tony Stark (Host)');
  const player2 = createPlayer('test-p2-bidder', 'Thor (Bidder)');

  // Connect two sockets
  const socket1 = io(SERVER_URL, { transports: ['websocket'] });
  const socket2 = io(SERVER_URL, { transports: ['websocket'] });

  let testsPassed = 0;
  let testsFailed = 0;
  let roomCode = null;

  const assert = (condition, label) => {
    if (condition) {
      console.log(`  ✔ ${label}`);
      testsPassed++;
    } else {
      console.error(`  ✘ FAIL: ${label}`);
      testsFailed++;
    }
  };

  await new Promise(resolve => setTimeout(resolve, 1000)); // wait for connections

  // Test 1: Player 1 creates room
  console.log('[ Room Creation ]');
  const createResult = await new Promise(resolve => {
    socket1.emit('CREATE_ROOM', {
      hostPlayer: player1,
      settings: { startingBudget: 500, requiredRosterSize: 2, lotCount: 5, countdownSeconds: 8 }
    }, resolve);
  });
  assert(createResult?.success === true, 'Room created successfully');
  assert(createResult?.room?.roomCode?.length === 6, 'Room code is 6 characters');
  assert(createResult?.room?.hostId === player1.id, 'Host ID is correct');
  assert(createResult?.room?.players[player1.id]?.isHost === true, 'Player 1 is marked as host');
  roomCode = createResult?.room?.roomCode;
  console.log(`  Room Code: ${roomCode}`);

  // Test 2: Player 2 joins the room
  console.log('\n[ Room Join ]');
  const joinResult = await new Promise(resolve => {
    socket2.emit('JOIN_ROOM', { roomCode, player: player2 }, resolve);
  });
  assert(joinResult?.success === true, 'Player 2 joined successfully');
  assert(joinResult?.room?.players[player2.id]?.isReady === false, 'Player 2 not ready by default');

  // Test 3: Invalid room code
  console.log('\n[ Invalid Room Code ]');
  const invalidJoin = await new Promise(resolve => {
    socket2.emit('JOIN_ROOM', { roomCode: 'XXXXXX', player: player2 }, resolve);
  });
  assert(invalidJoin?.success === false, 'Invalid room code rejected');
  assert(typeof invalidJoin?.error === 'string', 'Error message provided');

  // Test 4: Player 2 sets ready
  console.log('\n[ Ready State ]');
  socket2.emit('SET_READY', { roomCode, playerId: player2.id, isReady: true });
  await new Promise(resolve => setTimeout(resolve, 200));

  // Test 5: Player 2 cannot start the auction
  console.log('\n[ Host Enforcement ]');
  const nonHostStart = await new Promise(resolve => {
    socket2.emit('START_AUCTION', { roomCode, playerId: player2.id }, resolve);
  });
  assert(nonHostStart?.success === false, 'Non-host cannot start auction');

  // Test 6: Start auction as host (P1 already ready since host is auto-ready)
  console.log('\n[ Auction Start ]');
  const startResult = await new Promise(resolve => {
    socket1.emit('START_AUCTION', { roomCode, playerId: player1.id }, resolve);
  });
  assert(startResult?.success === true, 'Host started auction successfully');
  assert(startResult?.room?.status === 'AUCTION_ACTIVE', 'Room status is AUCTION_ACTIVE');
  assert(startResult?.room?.activeLot !== null, 'Active lot is set');
  assert(startResult?.room?.lots?.length >= 2, 'Lots available in auction');

  // Test 7: Place a bid on the current lot
  console.log('\n[ Bid Validation ]');
  const activeLot = startResult?.room?.activeLot;
  const openingBid = activeLot?.currentBid;
  console.log(`  Active lot: ${activeLot?.hero?.name} | Opening bid: ${openingBid}`);

  // Player 2 places valid opening bid
  const bidResult = await new Promise(resolve => {
    socket2.emit('PLACE_BID', { roomCode, playerId: player2.id, amount: openingBid }, resolve);
  });
  assert(bidResult?.success === true, 'Valid opening bid accepted');

  // Player 2 tries to self-outbid
  const selfBid = await new Promise(resolve => {
    socket2.emit('PLACE_BID', { roomCode, playerId: player2.id, amount: openingBid + 10 }, resolve);
  });
  assert(selfBid?.success === false, 'Self-outbid correctly rejected');

  // Player 1 places higher bid
  const higherBid = await new Promise(resolve => {
    socket1.emit('PLACE_BID', { roomCode, playerId: player1.id, amount: openingBid + 10 }, resolve);
  });
  assert(higherBid?.success === true, 'Higher bid from player 1 accepted');

  // Player 2 bids too low (increment violation)
  const tooLowBid = await new Promise(resolve => {
    socket2.emit('PLACE_BID', { roomCode, playerId: player2.id, amount: openingBid + 5 }, resolve);
  });
  assert(tooLowBid?.success === false, 'Below-increment bid rejected');

  // Player 2 tries to bid more than their budget
  const overBudgetBid = await new Promise(resolve => {
    socket2.emit('PLACE_BID', { roomCode, playerId: player2.id, amount: 99999 }, resolve);
  });
  assert(overBudgetBid?.success === false, 'Over-budget bid rejected');

  // Test 8: Request current room state (reconnect simulation)
  console.log('\n[ Reconnection State Recovery ]');
  const stateResult = await new Promise(resolve => {
    socket1.emit('REQUEST_ROOM_STATE', { roomCode, playerId: player1.id }, resolve);
  });
  assert(stateResult?.success === true, 'State request succeeded');
  assert(stateResult?.roomState?.roomCode === roomCode, 'Room code matches in state');

  // Final Summary
  socket1.disconnect();
  socket2.disconnect();

  console.log(`\n${'='.repeat(55)}`);
  console.log(`🏆 INTEGRATION TEST RESULTS`);
  console.log(`${'='.repeat(55)}`);
  console.log(`  ✔ Tests Passed: ${testsPassed}`);
  if (testsFailed > 0) console.error(`  ✘ Tests Failed: ${testsFailed}`);
  console.log(`${'='.repeat(55)}\n`);

  process.exit(testsFailed > 0 ? 1 : 0);
}

runIntegrationTest().catch(err => {
  console.error('Integration test crashed:', err);
  process.exit(1);
});
