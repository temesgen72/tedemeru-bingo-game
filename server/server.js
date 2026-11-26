require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

const PORT = process.env.PORT || 5000;
const CARD_PRICE_ETB = 10;

function generateBingoCard(cardNumber) {
  let seed = cardNumber * 2654435761;
  const nextRand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  const columns = [[1, 15], [16, 30], [31, 45], [46, 60], [61, 75]];
  const grid = Array.from({ length: 5 }, () => Array(5).fill(0));

  for (let col = 0; col < 5; col++) {
    const [min, max] = columns[col];
    const pool = [];
    for (let n = min; n <= max; n++) pool.push(n);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(nextRand() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    for (let row = 0; row < 5; row++) {
      grid[row][col] = (row === 2 && col === 2) ? 'FREE' : pool[row];
    }
  }
  return grid;
}

function checkBingoWin(grid, calledSet) {
  const isMarked = (r, c) => grid[r][c] === 'FREE' || calledSet.has(grid[r][c]);
  for (let i = 0; i < 5; i++) {
    if ([0, 1, 2, 3, 4].every((c) => isMarked(i, c))) return true;
    if ([0, 1, 2, 3, 4].every((r) => isMarked(r, i))) return true;
  }
  if ([0, 1, 2, 3, 4].every((d) => isMarked(d, d))) return true;
  if ([0, 1, 2, 3, 4].every((d) => isMarked(d, 4 - d))) return true;
  return false;
}

const wallets = new Map();
function getWallet(key) {
  if (!wallets.has(key)) wallets.set(key, { balance: 100.0, history: [] });
  return wallets.get(key);
}

let bingoState = {
  phase: 'BETTING',
  roundNumber: 1214,
  timer: 15,
  potPrize: 2360.0,
  cardPrice: CARD_PRICE_ETB,
  takenCards: new Map(),
  calledNumbers: [],
  lastWinners: []
};

let kenoState = { roundNumber: 408, timer: 22, bets: [], lastDrawn: [] };

function startNewBingoRound() {
  bingoState.phase = 'BETTING';
  bingoState.roundNumber += 1;
  bingoState.timer = 15;
  bingoState.takenCards.clear();
  bingoState.calledNumbers = [];
  bingoState.lastWinners = [];
  io.emit('bingo_round_started', getPublicBingoState());
}

function drawNextBingoBall() {
  const remaining = [];
  for (let n = 1; n <= 75; n++) {
    if (!bingoState.calledNumbers.includes(n)) remaining.push(n);
  }
  if (remaining.length === 0 || bingoState.lastWinners.length > 0) {
    setTimeout(startNewBingoRound, 4000);
    return;
  }
  const ball = remaining[Math.floor(Math.random() * remaining.length)];
  bingoState.calledNumbers.push(ball);
  const calledSet = new Set(bingoState.calledNumbers);

  const winners = [];
  for (const [cardNum, entry] of bingoState.takenCards.entries()) {
    if (checkBingoWin(generateBingoCard(cardNum), calledSet)) {
      winners.push({ cardNumber: cardNum, userKey: entry.userKey, playerName: entry.playerName });
    }
  }

  if (winners.length > 0) {
    const payoutEach = Number((bingoState.potPrize / winners.length).toFixed(2));
    bingoState.lastWinners = winners.map((w) => ({ ...w, prize: payoutEach }));
    for (const w of winners) {
      const wallet = getWallet(w.userKey);
      wallet.balance = Number((wallet.balance + payoutEach).toFixed(2));
      wallet.history.unshift({
        id: `${Date.now()}-${w.cardNumber}`,
        title: `Bingo Win Card #${w.cardNumber}`,
        amount: `+${payoutEach} ETB`,
        status: 'WON'
      });
    }
    io.emit('bingo_winner', {
      roundNumber: bingoState.roundNumber,
      winners: bingoState.lastWinners,
      calledNumbers: bingoState.calledNumbers
    });
    bingoState.potPrize = 500.0;
    setTimeout(startNewBingoRound, 5000);
  } else {
    io.emit('bingo_ball_called', {
      ball,
      calledNumbers: bingoState.calledNumbers,
      roundNumber: bingoState.roundNumber
    });
  }
}

function resolveKenoRound() {
  const pool = Array.from({ length: 80 }, (_, idx) => idx + 1);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const drawn = pool.slice(0, 20).sort((a, b) => a - b);
  const drawnSet = new Set(drawn);

  kenoState.bets.forEach((bet) => {
    const hits = bet.numbers.filter((n) => drawnSet.has(n)).length;
    const multiplier = hits >= 5 ? hits * 2 : hits >= 3 ? 1.5 : 0;
    const payout = Number((bet.stake * multiplier).toFixed(2));
    if (payout > 0) {
      const wallet = getWallet(bet.userKey);
      wallet.balance = Number((wallet.balance + payout).toFixed(2));
      wallet.history.unshift({
        id: `${Date.now()}-keno`,
        title: `Keno Win (${hits} hits)`,
        amount: `+${payout} ETB`,
        status: 'WON'
      });
    }
  });

  kenoState.lastDrawn = drawn;
  kenoState.bets = [];
  kenoState.roundNumber += 1;
  kenoState.timer = 22;
  io.emit('keno_round_result', { roundNumber: kenoState.roundNumber - 1, drawn });
}

function getPublicBingoState() {
  return {
    phase: bingoState.phase,
    roundNumber: bingoState.roundNumber,
    timer: bingoState.timer,
    potPrize: bingoState.potPrize,
    cardPrice: bingoState.cardPrice,
    takenCards: Array.from(bingoState.takenCards.keys()),
    calledNumbers: bingoState.calledNumbers,
    lastWinners: bingoState.lastWinners
  };
}

setInterval(() => {
  if (bingoState.phase === 'BETTING') {
    bingoState.timer -= 1;
    if (bingoState.timer <= 0) {
      bingoState.phase = 'DRAWING';
      bingoState.timer = 0;
      drawNextBingoBall();
    }
  } else if (bingoState.phase === 'DRAWING') {
    drawNextBingoBall();
  }
  kenoState.timer -= 1;
  if (kenoState.timer <= 0) resolveKenoRound();

  io.emit('timer_update', {
    bingo: getPublicBingoState(),
    keno: { roundNumber: kenoState.roundNumber, timer: kenoState.timer, lastDrawn: kenoState.lastDrawn }
  });
}, 1000);

io.on('connection', (socket) => {
  const userKey = socket.handshake.query.userKey || socket.id;
  const wallet = getWallet(userKey);
  socket.emit('init_state', {
    bingo: getPublicBingoState(),
    keno: { roundNumber: kenoState.roundNumber, timer: kenoState.timer, lastDrawn: kenoState.lastDrawn },
    wallet
  });

  socket.on('buy_bingo_card', ({ cardNumber, userKey, playerName }, cb) => {
    const num = Number(cardNumber);
    const key = userKey || socket.id;
    const walletData = getWallet(key);
    if (
      bingoState.phase !== 'BETTING' ||
      bingoState.takenCards.has(num) ||
      walletData.balance < bingoState.cardPrice
    ) {
      if (typeof cb === 'function') cb({ ok: false });
      return;
    }
    walletData.balance = Number((walletData.balance - bingoState.cardPrice).toFixed(2));
    walletData.history.unshift({
      id: `${Date.now()}-${num}`,
      title: `Bingo Card #${num}`,
      amount: `-${bingoState.cardPrice} ETB`,
      status: 'ACTIVE'
    });
    bingoState.takenCards.set(num, { userKey: key, playerName: playerName || 'Player' });
    bingoState.potPrize = Number((bingoState.potPrize + 8).toFixed(2));

    io.emit('card_reserved', {
      cardNumber: num,
      takenCards: Array.from(bingoState.takenCards.keys()),
      potPrize: bingoState.potPrize
    });
    socket.emit('wallet_update', walletData);
    if (typeof cb === 'function') cb({ ok: true, cardNumber: num, grid: generateBingoCard(num) });
  });

  socket.on('place_keno_bet', ({ numbers, stake, userKey }, cb) => {
    const key = userKey || socket.id;
    const walletData = getWallet(key);
    const betStake = Number(stake) || 10;
    if (walletData.balance < betStake) {
      if (typeof cb === 'function') cb({ ok: false });
      return;
    }
    walletData.balance = Number((walletData.balance - betStake).toFixed(2));
    walletData.history.unshift({
      id: `${Date.now()}-keno`,
      title: `Fast Keno (${numbers.join(', ')})`,
      amount: `-${betStake} ETB`,
      status: 'WAITING'
    });
    kenoState.bets.push({ socketId: socket.id, userKey: key, numbers: [...numbers], stake: betStake });
    socket.emit('wallet_update', walletData);
    if (typeof cb === 'function') cb({ ok: true });
  });

  socket.on('wallet_transaction', ({ type, method, amount, userKey }, cb) => {
    const key = userKey || socket.id;
    const walletData = getWallet(key);
    const numericAmount = Number(amount);
    if (type === 'deposit') {
      walletData.balance = Number((walletData.balance + numericAmount).toFixed(2));
      walletData.history.unshift({
        id: `${Date.now()}-dep`,
        title: `Deposit (${method})`,
        amount: `+${numericAmount} ETB`,
        status: 'CREDITED'
      });
    } else if (walletData.balance >= numericAmount) {
      walletData.balance = Number((walletData.balance - numericAmount).toFixed(2));
      walletData.history.unshift({
        id: `${Date.now()}-wd`,
        title: `Withdraw (${method})`,
        amount: `-${numericAmount} ETB`,
        status: 'PENDING'
      });
    }
    socket.emit('wallet_update', walletData);
    if (typeof cb === 'function') cb({ ok: true });
  });
});

app.get('/health', (_req, res) => res.json({ status: 'ok', round: bingoState.roundNumber }));
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
