import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import WebApp from '@twa-dev/sdk';
import {
  Volume2,
  VolumeX,
  Plus,
  Wallet,
  Trophy,
  History,
  Settings,
  Gamepad2,
  ArrowDownCircle,
  ArrowUpCircle,
  Shuffle,
  Languages,
  Copy,
  Check,
  Sparkles,
  Grid
} from 'lucide-react';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://tedemeru-bingo-server.onrender.com';

const TRANSLATIONS = {
  am: {
    appName: 'TEDEMERU BINGO',
    liveBadge: 'ቀጥታ',
    drawingBadge: 'ቁጥር በመውጣት ላይ',
    bingoTab: 'ቢንጎ',
    walletTab: 'ዋሌት',
    leadersTab: 'ደረጃዎች',
    historyTab: 'ታሪክ',
    settingsTab: 'ቅንብሮች',
    kenoBannerTag: 'ፈጣን ኬኖ 80',
    kenoBannerDesc: 'በ80 ሰከንድ 20 ቁጥሮች የሚወጡበት ፈጣን ጨዋታ!',
    kenoBannerWin: 'እስከ 30,000 ETB ያሸንፉ',
    playBtn: 'ተጫወት ►',
    backToBingo: '← ወደ ቢንጎ ተመለስ',
    potLabel: 'ድራሽ (POT)',
    roundLabel: 'ዙር',
    timerLabel: 'ቀሪ ሰዓት',
    cardsTaken: 'የተያዙ ካርዶች',
    cardInputTitle: 'ካርድ ይቁረጡ (1 - 999)',
    cardPrice: '1 ካርድ = 10 ETB',
    cardPlaceholder: 'ካርድ ቁጥር (ምሳሌ 232)',
    cutBtn: 'ቁረጥ',
    randomBtn: 'በዘፈቀደ',
    pageLabel: 'ክፍል ይምረጡ (Page)',
    statusOpen: 'ክፍት',
    statusMine: 'የእኔ',
    statusTaken: 'የተያዘ',
    myCardsTitle: 'የእኔ ካርዶች (5x5)',
    calledBallsTitle: 'የወጡ ቁጥሮች',
    kenoChooseHint: 'እስከ 10 ቁጥሮች ይምረጡ (1 - 80)',
    kenoSelected: 'የተመረጡ',
    kenoBetBtn: 'ውርርድ ያስገቡ (BET 10 ETB)',
    kenoDrawnTitle: 'የመጨረሻው የኬኖ ውጤት',
    depositBtn: 'ማስገቢያ (Deposit)',
    withdrawBtn: 'ማውጫ (Withdraw)',
    paymentMethodLabel: 'የክፍያ ዘዴ ይምረጡ',
    merchantAccountLabel: 'የመቀበያ ሒሳብ ቁጥር',
    amountLabel: 'የገንዘብ መጠን (ETB)',
    minMaxNote: '(50 - 10,000 ብር)',
    withdrawPhoneLabel: 'የመቀበያ ስልክ ቁጥር (09... / 07...)',
    withdrawNameLabel: 'ሙሉ ስም (በሒሳቡ የተመዘገበ)',
    proceedPayBtn: 'ቀጥል (Proceed to Pay)',
    submitWithdrawBtn: 'ገንዘብ አውጣ (Submit Withdrawal)',
    leadersTitle: 'የሳምንቱ ከፍተኛ ተጫዋቾች',
    cardsUnit: 'ካርዶች',
    historyTitle: 'የጨዋታ እና የሒሳብ ታሪክ',
    noHistory: 'እስካሁን የተመዘገበ እንቅስቃሴ የለም።',
    referralTitle: 'የሪፈራል ሊንክዎ',
    copyBtn: 'ቅዳ',
    copiedBtn: 'ተቀድቷል',
    audioSettingsTitle: 'የድምጽ ቅንብሮች',
    bgMusicLabel: 'የጀርባ ሙዚቃ (Lobby BG Music)',
    callerVoiceLabel: 'የቁጥር ጠሪ ድምጽ (Voice Caller)',
    onState: 'በርቷል (ON)',
    offState: 'ጠፍቷል (OFF)',
    invalidCard: 'እባክዎ ከ 1 እስከ 999 ያለ ትክክለኛ የካርድ ቁጥር ያስገቡ።',
    cardTaken: 'ይህ ካርድ ቀድሞ ተይዟል፤ ሌላ ቁጥር ይምረጡ።',
    lowBalance: 'በቂ ሒሳብ የለዎትም። እባክዎ ዋሌት ያስገቡ።',
    roundStarted: 'አዲስ የቢንጎ ዙር ተጀምሯል!',
    winnerBanner: 'አሸናፊ! ካርድ #{card} ({name}) — {prize} ETB'
  },
  en: {
    appName: 'TEDEMERU BINGO',
    liveBadge: 'Live',
    drawingBadge: 'Drawing Balls',
    bingoTab: 'Bingo',
    walletTab: 'Wallet',
    leadersTab: 'Leaders',
    historyTab: 'History',
    settingsTab: 'Settings',
    kenoBannerTag: 'FAST KENO 80',
    kenoBannerDesc: 'Fast game drawing 20 numbers in 80 seconds!',
    kenoBannerWin: 'Win up to 30,000 ETB',
    playBtn: 'Play ►',
    backToBingo: '← Back to Bingo',
    potLabel: 'POT PRIZE',
    roundLabel: 'ROUND',
    timerLabel: 'TIME LEFT',
    cardsTaken: 'Cards Taken',
    cardInputTitle: 'Pick Card Number (1 - 999)',
    cardPrice: '1 Card = 10 ETB',
    cardPlaceholder: 'Card # (e.g. 232)',
    cutBtn: 'Cut',
    randomBtn: 'Random',
    pageLabel: 'Select Page Range',
    statusOpen: 'Open',
    statusMine: 'Mine',
    statusTaken: 'Taken',
    myCardsTitle: 'My Active Cards (5x5)',
    calledBallsTitle: 'Called Balls',
    kenoChooseHint: 'Choose up to 10 numbers (1 - 80)',
    kenoSelected: 'Selected',
    kenoBetBtn: 'PLACE BET (10 ETB)',
    kenoDrawnTitle: 'Latest Keno Draw',
    depositBtn: 'Deposit',
    withdrawBtn: 'Withdraw',
    paymentMethodLabel: 'Select Payment Method',
    merchantAccountLabel: 'Receiving Account Number',
    amountLabel: 'Amount (ETB)',
    minMaxNote: '(50 - 10,000 ETB)',
    withdrawPhoneLabel: 'Your Payout Phone (09... / 07...)',
    withdrawNameLabel: 'Full Name (Registered Account Name)',
    proceedPayBtn: 'Proceed to Pay',
    submitWithdrawBtn: 'Submit Withdrawal',
    leadersTitle: 'Top Players of the Week',
    cardsUnit: 'Cards',
    historyTitle: 'Game & Wallet History',
    noHistory: 'No transactions or bets recorded yet.',
    referralTitle: 'Your Referral Link',
    copyBtn: 'Copy',
    copiedBtn: 'Copied',
    audioSettingsTitle: 'Audio Settings',
    bgMusicLabel: 'Lobby BG Music',
    callerVoiceLabel: 'Number Caller Voice',
    onState: 'ON',
    offState: 'OFF',
    invalidCard: 'Please enter a valid card number between 1 and 999.',
    cardTaken: 'This card is already taken. Pick another number.',
    lowBalance: 'Insufficient balance. Please deposit in Wallet.',
    roundStarted: 'New Bingo round has started!',
    winnerBanner: 'Winner! Card #{card} ({name}) — {prize} ETB'
  }
};

const PAGE_RANGES = [
  { label: '1-100', start: 1, end: 100 },
  { label: '101-200', start: 101, end: 200 },
  { label: '201-300', start: 201, end: 300 },
  { label: '301-400', start: 301, end: 400 },
  { label: '401-500', start: 401, end: 500 },
  { label: '501-600', start: 501, end: 600 },
  { label: '601-700', start: 601, end: 700 },
  { label: '701-800', start: 701, end: 800 },
  { label: '801-900', start: 801, end: 900 },
  { label: '901-999', start: 901, end: 999 }
];

const PAYMENT_ACCOUNTS = {
  telebirr: { am: 'ቴሌብር (Telebirr)', en: 'Telebirr', number: '0910845986', holder: 'Tedemeru Bingo - Telebirr' },
  mpesa: { am: 'ኤም-ፔሳ (M-Pesa)', en: 'M-Pesa', number: '0717725751', holder: 'Tedemeru Bingo - M-Pesa' },
  cbe: { am: 'ንግድ ባንክ (CBE Birr)', en: 'CBE Birr', number: '0911725751', holder: 'Tedemeru Bingo - CBE Birr' }
};

const TOP_PLAYERS = [
  { rank: '#1', name: 'Mekdes', cards: 1393 },
  { rank: '#2', name: 'Natnael', cards: 574 },
  { rank: '#3', name: 'Hiwot', cards: 407 },
  { rank: '#4', name: 'Elias', cards: 396 },
  { rank: '#5', name: 'Tsion', cards: 332 },
  { rank: '#6', name: 'Henok', cards: 234 },
  { rank: '#7', name: 'Bethelhem', cards: 206 }
];

export default function App() {
  const [lang, setLang] = useState('am');
  const t = TRANSLATIONS[lang];

  const [activeTab, setActiveTab] = useState('bingo');
  const [walletTab, setWalletTab] = useState('deposit');
  const [user, setUser] = useState({ name: 'Player', id: '893721201', balance: 100.0 });

  const [phase, setPhase] = useState('BETTING');
  const [bingoTimer, setBingoTimer] = useState(15);
  const [potPrize, setPotPrize] = useState(2360.0);
  const [roundNumber, setRoundNumber] = useState(1214);
  const [activeRange, setActiveRange] = useState(PAGE_RANGES[0]);
  const [cardInput, setCardInput] = useState('');
  const [takenCards, setTakenCards] = useState([]);
  const [myBoughtCards, setMyBoughtCards] = useState([]);
  const [calledNumbers, setCalledNumbers] = useState([]);
  const [winnerNotice, setWinnerNotice] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const [kenoRound, setKenoRound] = useState(408);
  const [kenoTimer, setKenoTimer] = useState(22);
  const [kenoSelected, setKenoSelected] = useState([]);
  const [kenoLastDrawn, setKenoLastDrawn] = useState([]);

  const [activityLog, setActivityLog] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('telebirr');
  const [amount, setAmount] = useState(100);
  const [withdrawPhone, setWithdrawPhone] = useState('');
  const [withdrawName, setWithdrawName] = useState('');
  const [bgMusicOn, setBgMusicOn] = useState(false);
  const [callerVoiceOn, setCallerVoiceOn] = useState(true);
  const [copiedRef, setCopiedRef] = useState(false);

  const socketRef = useRef(null);

  const showNotice = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg((prev) => (prev === msg ? '' : prev)), 3000);
  };

  const speakBall = (ball) => {
    if (!callerVoiceOn) return;
    try {
      if ('speechSynthesis' in window) {
        const utter = new SpeechSynthesisUtterance(String(ball));
        utter.lang = lang === 'am' ? 'am-ET' : 'en-US';
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utter);
      }
    } catch {}
  };

  useEffect(() => {
    let resolvedUserKey = user.id;
    try {
      WebApp.ready();
      WebApp.expand();
      const tgUser = WebApp.initDataUnsafe?.user;
      if (tgUser) {
        const fullName = `${tgUser.first_name || ''} ${tgUser.last_name || ''}`.trim();
        resolvedUserKey = String(tgUser.id || resolvedUserKey);
        setUser((prev) => ({ ...prev, name: fullName || prev.name, id: resolvedUserKey }));
      }
    } catch {}

    const socket = io(SOCKET_URL, { query: { userKey: resolvedUserKey }, transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('init_state', (data) => {
      if (data.bingo) {
        setPhase(data.bingo.phase);
        setBingoTimer(data.bingo.timer);
        setPotPrize(data.bingo.potPrize);
        setRoundNumber(data.bingo.roundNumber);
        setTakenCards(data.bingo.takenCards || []);
        setCalledNumbers(data.bingo.calledNumbers || []);
      }
      if (data.keno) {
        setKenoRound(data.keno.roundNumber);
        setKenoTimer(data.keno.timer);
        setKenoLastDrawn(data.keno.lastDrawn || []);
      }
      if (data.wallet) {
        setUser((prev) => ({ ...prev, balance: data.wallet.balance }));
        setActivityLog(data.wallet.history || []);
      }
    });

    socket.on('wallet_update', (walletData) => {
      setUser((prev) => ({ ...prev, balance: walletData.balance }));
      setActivityLog(walletData.history || []);
    });

    socket.on('timer_update', (data) => {
      if (data.bingo) {
        setPhase(data.bingo.phase);
        setBingoTimer(data.bingo.timer);
        setPotPrize(data.bingo.potPrize);
        setRoundNumber(data.bingo.roundNumber);
      }
      if (data.keno) {
        setKenoRound(data.keno.roundNumber);
        setKenoTimer(data.keno.timer);
      }
    });

    socket.on('card_reserved', (payload) => {
      setTakenCards(payload.takenCards || []);
      if (typeof payload.potPrize === 'number') setPotPrize(payload.potPrize);
    });

    socket.on('bingo_ball_called', ({ ball, calledNumbers: balls }) => {
      setCalledNumbers(balls || []);
      speakBall(ball);
    });

    socket.on('bingo_winner', ({ winners, calledNumbers: balls }) => {
      setCalledNumbers(balls || []);
      if (winners?.[0]) {
        const first = winners[0];
        setWinnerNotice(
          t.winnerBanner
            .replace('{card}', String(first.cardNumber))
            .replace('{name}', first.playerName)
            .replace('{prize}', String(first.prize))
        );
      }
    });

    socket.on('bingo_round_started', (nextBingo) => {
      setPhase(nextBingo.phase);
      setBingoTimer(nextBingo.timer);
      setPotPrize(nextBingo.potPrize);
      setRoundNumber(nextBingo.roundNumber);
      setTakenCards([]);
      setMyBoughtCards([]);
      setCalledNumbers([]);
      setWinnerNotice('');
      showNotice(t.roundStarted);
    });

    socket.on('keno_round_result', ({ drawn }) => setKenoLastDrawn(drawn || []));

    return () => socket.disconnect();
  }, []);

  const handleCutCard = (rawNum) => {
    const num = Number(rawNum ?? cardInput);
    if (!Number.isInteger(num) || num < 1 || num > 999) return showNotice(t.invalidCard);
    if (takenCards.includes(num)) return showNotice(t.cardTaken);
    if (user.balance < 10) {
      showNotice(t.lowBalance);
      return setActiveTab('wallet');
    }

    socketRef.current?.emit('buy_bingo_card', { cardNumber: num, userKey: user.id, playerName: user.name }, (res) => {
      if (res?.ok && res.grid) {
        setMyBoughtCards((prev) => [...prev, { cardNumber: res.cardNumber, grid: res.grid }]);
        setCardInput('');
      }
    });
  };

  const handleRandomCard = () => {
    const takenSet = new Set(takenCards);
    const available = [];
    for (let i = activeRange.start; i <= activeRange.end; i++) {
      if (!takenSet.has(i)) available.push(i);
    }
    if (!available.length) return;
    handleCutCard(available[Math.floor(Math.random() * available.length)]);
  };

  const toggleKenoNumber = (num) => {
    if (kenoSelected.includes(num)) setKenoSelected(kenoSelected.filter((n) => n !== num));
    else if (kenoSelected.length < 10) setKenoSelected([...kenoSelected, num]);
  };

  const handleKenoBet = () => {
    if (!kenoSelected.length) return;
    if (user.balance < 10) {
      showNotice(t.lowBalance);
      return setActiveTab('wallet');
    }
    socketRef.current?.emit('place_keno_bet', { numbers: kenoSelected, stake: 10, userKey: user.id }, (res) => {
      if (res?.ok) setKenoSelected([]);
    });
  };

  const handleWalletSubmit = (e) => {
    e.preventDefault();
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount < 50 || numericAmount > 10000) return showNotice(t.minMaxNote);
    socketRef.current?.emit(
      'wallet_transaction',
      { type: walletTab, method: paymentMethod, amount: numericAmount, userKey: user.id },
      (res) => {
        if (res?.ok) {
          setWithdrawPhone('');
          setWithdrawName('');
          showNotice(`${walletTab === 'deposit' ? t.depositBtn : t.withdrawBtn}: ${numericAmount.toFixed(2)} ETB`);
        }
      }
    );
  };

  const copyReferral = async () => {
    const refUrl = `https://t.me/tedemerubingobot?start=ref_${user.id}`;
    try {
      await navigator.clipboard.writeText(refUrl);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    } catch {
      showNotice(refUrl);
    }
  };

  const myCardNumbers = myBoughtCards.map((c) => c.cardNumber);
  const calledSet = new Set(calledNumbers);
  const rangeNumbers = Array.from({ length: activeRange.end - activeRange.start + 1 }, (_, idx) => activeRange.start + idx);
  const referralLink = `https://t.me/tedemerubingobot?start=ref_${user.id}`;

  return (
    <div className="min-h-screen bg-[#070c1a] text-white flex flex-col justify-between max-w-md mx-auto border-x border-slate-800 select-none pb-20">
      <header className="bg-gradient-to-r from-blue-950 via-indigo-950 to-blue-950 p-3 flex items-center justify-between border-b border-blue-800/40 sticky top-0 z-20">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">TB</div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xs tracking-wide truncate">{t.appName}</span>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.5 rounded">
                {phase === 'DRAWING' ? t.drawingBadge : t.liveBadge}
              </span>
            </div>
            <p className="text-[10px] text-blue-300 truncate">{user.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setLang((prev) => (prev === 'am' ? 'en' : 'am'))}
            className="bg-slate-900/90 px-2 py-1 rounded-full border border-cyan-500/40 text-[10px] font-bold text-cyan-300 flex items-center gap-1"
          >
            <Languages size={12} />
            <span>{lang === 'am' ? 'EN' : 'አማ'}</span>
          </button>

          <button
            type="button"
            onClick={() => setCallerVoiceOn((prev) => !prev)}
            className="bg-slate-900/90 p-1.5 rounded-full border border-slate-700 text-amber-400"
          >
            {callerVoiceOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>

          <div className="bg-slate-900/95 px-2.5 py-1 rounded-full border border-emerald-500/40 flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-emerald-400">{user.balance.toFixed(2)} ETB</span>
            <button
              type="button"
              onClick={() => { setWalletTab('deposit'); setActiveTab('wallet'); }}
              className="bg-emerald-500 text-slate-950 rounded-full p-0.5 font-bold"
            >
              <Plus size={12} />
            </button>
          </div>
        </div>
      </header>

      {toastMsg && (
        <div className="mx-3 mt-2 bg-cyan-950/90 border border-cyan-500/50 text-cyan-200 px-3 py-2 rounded-xl text-xs font-bold text-center">
          {toastMsg}
        </div>
      )}
      {winnerNotice && (
        <div className="mx-3 mt-2 bg-amber-500/20 border border-amber-400 text-amber-300 px-3 py-2.5 rounded-xl text-xs font-extrabold text-center flex items-center justify-center gap-1.5">
          <Sparkles size={14} />
          <span>{winnerNotice}</span>
        </div>
      )}

      <main className="flex-1 p-3 space-y-3">
        {activeTab === 'bingo' && (
          <>
            <div
              onClick={() => setActiveTab('keno')}
              className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 p-3 rounded-2xl border border-emerald-500/40 flex items-center justify-between cursor-pointer"
            >
              <div className="space-y-0.5 pr-2">
                <span className="inline-block bg-emerald-500 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded">{t.kenoBannerTag}</span>
                <p className="text-[11px] text-slate-300">{t.kenoBannerDesc}</p>
                <p className="text-xs font-extrabold text-amber-400">{t.kenoBannerWin}</p>
              </div>
              <button type="button" className="bg-emerald-500 text-slate-950 font-black px-3 py-1.5 rounded-xl text-xs shrink-0">
                {t.playBtn}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-900/85 p-2.5 rounded-xl border border-slate-800">
                <p className="text-[10px] text-slate-400">{t.potLabel}</p>
                <p className="text-sm font-black text-amber-400 mt-0.5">{potPrize.toFixed(2)} ETB</p>
                <p className="text-[9px] text-slate-500 mt-0.5">{t.cardsTaken}: {takenCards.length}</p>
              </div>
              <div className="bg-slate-900/85 p-2.5 rounded-xl border border-slate-800">
                <p className="text-[10px] text-slate-400">{t.roundLabel}</p>
                <p className="text-sm font-black text-white mt-0.5">#{roundNumber}</p>
                <p className="text-[9px] text-cyan-400 mt-0.5">{t.appName}</p>
              </div>
              <div className="bg-slate-900/85 p-2.5 rounded-xl border border-slate-800">
                <p className="text-[10px] text-slate-400">{t.timerLabel}</p>
                <p className="text-sm font-black text-cyan-400 mt-0.5">{phase === 'DRAWING' ? 'LIVE' : `${bingoTimer}s`}</p>
                <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-emerald-400 h-full transition-all" style={{ width: `${Math.min(100, (bingoTimer / 15) * 100)}%` }} />
                </div>
              </div>
            </div>

            {calledNumbers.length > 0 && (
              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
                <p className="text-[10px] font-bold text-amber-400">{t.calledBallsTitle} ({calledNumbers.length}/75)</p>
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {calledNumbers.slice().reverse().map((ball, idx) => (
                    <span
                      key={`${ball}-${idx}`}
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                        idx === 0 ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-cyan-300 border border-slate-700'
                      }`}
                    >
                      {ball}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200">{t.cardInputTitle}</span>
                <span className="bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-md text-[10px] font-bold">{t.cardPrice}</span>
              </div>
              <div className="flex gap-1.5">
                <input
                  type="number"
                  min={1}
                  max={999}
                  value={cardInput}
                  onChange={(e) => setCardInput(e.target.value)}
                  placeholder={t.cardPlaceholder}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
                <button type="button" onClick={() => handleCutCard()} className="bg-cyan-600 hover:bg-cyan-500 px-3 py-2 rounded-lg font-bold text-xs shrink-0">{t.cutBtn}</button>
                <button type="button" onClick={handleRandomCard} className="bg-emerald-600 hover:bg-emerald-500 px-2.5 py-2 rounded-lg font-bold text-xs flex items-center gap-1 shrink-0">
                  <Shuffle size={12} />
                  <span>{t.randomBtn}</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>{t.pageLabel}</span>
                <div className="flex items-center gap-2.5">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-500 inline-block" />{t.statusOpen}</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />{t.statusMine}</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-600 inline-block" />{t.statusTaken}</span>
                </div>
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {PAGE_RANGES.map((range) => (
                  <button
                    key={range.label}
                    type="button"
                    onClick={() => setActiveRange(range)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap border ${
                      activeRange.label === range.label ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-6 gap-1.5 max-h-56 overflow-y-auto pr-0.5">
              {rangeNumbers.map((num) => {
                const isMine = myCardNumbers.includes(num);
                const isTaken = takenCards.includes(num);
                let styleClass = 'bg-slate-900 border-slate-800 text-slate-200 hover:border-cyan-500/60';
                if (isMine) styleClass = 'bg-emerald-600/30 border-emerald-400 text-emerald-200';
                else if (isTaken) styleClass = 'bg-slate-950/60 border-slate-900 text-slate-600 cursor-not-allowed';

                return (
                  <button key={num} type="button" disabled={isTaken} onClick={() => handleCutCard(num)} className={`py-2 rounded-lg font-bold text-xs border transition ${styleClass}`}>
                    {num}
                  </button>
                );
              })}
            </div>

            {myBoughtCards.length > 0 && (
              <div className="space-y-2 pt-1">
                <p className="text-xs font-extrabold text-emerald-400 flex items-center gap-1">
                  <Grid size={14} />
                  <span>{t.myCardsTitle}</span>
                </p>
                {myBoughtCards.map((item) => (
                  <div key={item.cardNumber} className="bg-slate-900/95 p-2.5 rounded-xl border border-emerald-500/40 space-y-1.5">
                    <p className="text-[11px] font-bold text-amber-400">Card #{item.cardNumber}</p>
                    <div className="grid grid-cols-5 gap-1 text-center text-[11px] font-bold">
                      {item.grid.flat().map((cell, idx) => {
                        const marked = cell === 'FREE' || calledSet.has(cell);
                        return (
                          <div key={idx} className={`py-1.5 rounded border ${marked ? 'bg-emerald-500 text-slate-950 border-emerald-300' : 'bg-slate-950 text-slate-200 border-slate-800'}`}>
                            {cell}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'keno' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <span className="text-xs font-extrabold text-emerald-400">{t.kenoBannerTag} — #{kenoRound}</span>
              <button type="button" onClick={() => setActiveTab('bingo')} className="text-[11px] bg-red-600/25 text-red-300 border border-red-500/30 px-2.5 py-1 rounded-lg">
                {t.backToBingo}
              </button>
            </div>
            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">{t.kenoChooseHint}</p>
                <p className="text-[11px] text-emerald-400 mt-0.5">{t.kenoSelected}: {kenoSelected.length}/10</p>
              </div>
              <div className="text-xl font-black text-cyan-400 font-mono">00:{kenoTimer < 10 ? `0${kenoTimer}` : kenoTimer}</div>
            </div>
            <div className="grid grid-cols-8 gap-1">
              {Array.from({ length: 80 }, (_, idx) => idx + 1).map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => toggleKenoNumber(num)}
                  className={`py-2 rounded-md text-xs font-bold border ${kenoSelected.includes(num) ? 'bg-emerald-500 border-emerald-300 text-slate-950' : 'bg-slate-900 border-slate-800 text-slate-300'}`}
                >
                  {num}
                </button>
              ))}
            </div>
            <button type="button" onClick={handleKenoBet} className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 rounded-xl text-xs">
              {t.kenoBetBtn} ({kenoSelected.length})
            </button>
            {kenoLastDrawn.length > 0 && (
              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
                <p className="text-[10px] font-bold text-amber-400">{t.kenoDrawnTitle}</p>
                <div className="flex flex-wrap gap-1">
                  {kenoLastDrawn.map((n) => (
                    <span key={n} className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 text-[11px] font-bold">{n}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'wallet' && (
          <form onSubmit={handleWalletSubmit} className="space-y-3">
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button type="button" onClick={() => setWalletTab('deposit')} className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 ${walletTab === 'deposit' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}>
                <ArrowDownCircle size={14} /><span>{t.depositBtn}</span>
              </button>
              <button type="button" onClick={() => setWalletTab('withdraw')} className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 ${walletTab === 'withdraw' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}>
                <ArrowUpCircle size={14} /><span>{t.withdrawBtn}</span>
              </button>
            </div>

            <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-3">
              <p className="text-xs font-bold text-amber-400">{t.paymentMethodLabel}</p>
              <div className="grid grid-cols-3 gap-2">
                {Object.keys(PAYMENT_ACCOUNTS).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPaymentMethod(key)}
                    className={`p-2 rounded-xl border text-center transition ${paymentMethod === key ? 'border-emerald-500 bg-slate-950 text-emerald-300' : 'border-slate-800 bg-slate-950/60 text-slate-400'}`}
                  >
                    <p className="text-[11px] font-bold truncate">{PAYMENT_ACCOUNTS[key][lang]}</p>
                    <p className="text-[9px] font-mono text-slate-400 mt-0.5">{PAYMENT_ACCOUNTS[key].number}</p>
                  </button>
                ))}
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-0.5">
                <p className="text-[10px] text-slate-400">{t.merchantAccountLabel}</p>
                <p className="text-sm font-mono font-extrabold text-amber-400">{PAYMENT_ACCOUNTS[paymentMethod].number}</p>
                <p className="text-[10px] text-slate-500">{PAYMENT_ACCOUNTS[paymentMethod].holder}</p>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <label className="text-slate-300">{t.amountLabel}</label>
                  <span className="text-slate-500">{t.minMaxNote}</span>
                </div>
                <input type="number" min={50} max={10000} value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white" />
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {[100, 300, 500, 1000, 3000, 5000].map((preset) => (
                  <button key={preset} type="button" onClick={() => setAmount(preset)} className="bg-slate-950 border border-slate-800 py-1.5 rounded-lg text-xs font-bold">
                    {preset}
                  </button>
                ))}
              </div>

              {walletTab === 'withdraw' && (
                <div className="space-y-2 pt-1">
                  <input type="text" value={withdrawPhone} onChange={(e) => setWithdrawPhone(e.target.value)} placeholder={t.withdrawPhoneLabel} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white" />
                  <input type="text" value={withdrawName} onChange={(e) => setWithdrawName(e.target.value)} placeholder={t.withdrawNameLabel} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white" />
                </div>
              )}

              <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-xl text-xs">
                {walletTab === 'deposit' ? t.proceedPayBtn : t.submitWithdrawBtn}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'leaders' && (
          <div className="space-y-2.5">
            <div className="bg-gradient-to-r from-amber-500/20 to-blue-900/30 p-3 rounded-xl border border-amber-500/30 text-center">
              <h2 className="text-xs font-extrabold text-amber-400">{t.leadersTitle}</h2>
            </div>
            {TOP_PLAYERS.map((player) => (
              <div key={player.rank} className="flex items-center justify-between bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="font-black text-amber-400">{player.rank}</span>
                  <span className="font-bold text-white">{player.name}</span>
                </div>
                <span className="font-mono text-cyan-300">{player.cards} {t.cardsUnit}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-2.5">
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
              <h2 className="text-xs font-extrabold text-cyan-400">{t.historyTitle}</h2>
            </div>
            {activityLog.length === 0 ? (
              <div className="bg-slate-900/60 p-6 rounded-xl border border-slate-800 text-center text-xs text-slate-400">{t.noHistory}</div>
            ) : (
              activityLog.map((item) => (
                <div key={item.id} className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-white">{item.title}</p>
                    <p className="text-[10px] text-slate-400">{item.status}</p>
                  </div>
                  <span className="font-mono font-bold text-amber-400">{item.amount}</span>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-3">
            <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <p className="text-xs font-bold text-amber-400">{t.referralTitle}</p>
              <div className="flex gap-1.5">
                <input type="text" readOnly value={referralLink} className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-[11px] font-mono text-slate-300" />
                <button type="button" onClick={copyReferral} className="bg-blue-600 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1">
                  {copiedRef ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copiedRef ? t.copiedBtn : t.copyBtn}</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-3">
              <p className="text-xs font-bold text-cyan-400">{t.audioSettingsTitle}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-200">{t.bgMusicLabel}</span>
                <button type="button" onClick={() => setBgMusicOn((prev) => !prev)} className={`px-3 py-1 rounded-lg font-bold text-[11px] ${bgMusicOn ? 'bg-emerald-600 text-white' : 'bg-red-950 text-red-300 border border-red-700/50'}`}>
                  {bgMusicOn ? t.onState : t.offState}
                </button>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-200">{t.callerVoiceLabel}</span>
                <button type="button" onClick={() => setCallerVoiceOn((prev) => !prev)} className={`px-3 py-1 rounded-lg font-bold text-[11px] ${callerVoiceOn ? 'bg-emerald-600 text-white' : 'bg-red-950 text-red-300 border border-red-700/50'}`}>
                  {callerVoiceOn ? t.onState : t.offState}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-slate-950/95 backdrop-blur-md border-t border-slate-800 grid grid-cols-5 py-2 text-center text-[10px] font-bold z-20">
        <button type="button" onClick={() => setActiveTab('bingo')} className={activeTab === 'bingo' || activeTab === 'keno' ? 'text-cyan-400' : 'text-slate-500'}>
          <Gamepad2 size={17} className="mx-auto mb-0.5" /><span>{t.bingoTab}</span>
        </button>
        <button type="button" onClick={() => setActiveTab('wallet')} className={activeTab === 'wallet' ? 'text-cyan-400' : 'text-slate-500'}>
          <Wallet size={17} className="mx-auto mb-0.5" /><span>{t.walletTab}</span>
        </button>
        <button type="button" onClick={() => setActiveTab('leaders')} className={activeTab === 'leaders' ? 'text-cyan-400' : 'text-slate-500'}>
          <Trophy size={17} className="mx-auto mb-0.5" /><span>{t.leadersTab}</span>
        </button>
        <button type="button" onClick={() => setActiveTab('history')} className={activeTab === 'history' ? 'text-cyan-400' : 'text-slate-500'}>
          <History size={17} className="mx-auto mb-0.5" /><span>{t.historyTab}</span>
        </button>
        <button type="button" onClick={() => setActiveTab('settings')} className={activeTab === 'settings' ? 'text-cyan-400' : 'text-slate-500'}>
          <Settings size={17} className="mx-auto mb-0.5" /><span>{t.settingsTab}</span>
        </button>
      </nav>
    </div>
  );
}
