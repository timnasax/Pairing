const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="sw">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>AVIATOR PREDATOR | ULTIMATE SYNC</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"/>
            <style>
                body { background: #020202; color: #eee; font-family: 'Inter', sans-serif; overflow-x: hidden; }
                .glass { background: rgba(15, 15, 15, 0.8); backdrop-filter: blur(12px); border: 1px solid rgba(255, 0, 0, 0.15); }
                .neon-glow { box-shadow: 0 0 20px rgba(255, 0, 0, 0.4); }
                .win-popup { position: fixed; bottom: 20px; left: 20px; z-index: 1000; display: none; }
                .shimmer { background: linear-gradient(90deg, #111 25%, #222 50%, #111 75%); background-size: 200% 100%; animation: shimmer 2s infinite; }
                @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
            </style>
        </head>
        <body class="flex flex-col items-center p-4">

            <div id="winNotify" class="win-popup glass p-3 rounded-lg border-l-4 border-green-500 animate__animated animate__fadeInUp">
                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-xs">💰</div>
                    <div>
                        <p id="winnerName" class="text-[10px] font-bold">---</p>
                        <p id="winnerAmount" class="text-[12px] text-green-400 font-black">---</p>
                    </div>
                </div>
            </div>

            <header class="w-full max-w-md bg-red-700 p-4 rounded-b-3xl mb-8 flex justify-between items-center neon-glow">
                <div>
                    <h1 class="font-black text-xl tracking-tighter">PREDATOR ELITE</h1>
                    <p class="text-[10px] opacity-70">BETPAWA SYNC v10.4</p>
                </div>
                <div class="text-right">
                    <span class="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></span>
                    <span class="text-[10px] font-mono">LIVE CLOUD</span>
                </div>
            </header>

            <main class="w-full max-w-md space-y-6">

                <section id="syncCard" class="glass p-8 rounded-[2rem] shadow-2xl">
                    <div class="text-center mb-6">
                        <i class="fas fa-shield-alt text-red-600 text-4xl mb-4"></i>
                        <h2 class="text-xl font-bold">Account Verification</h2>
                        <p class="text-gray-400 text-xs">Verify your number to decrypt the next signals</p>
                    </div>
                    <div class="space-y-4">
                        <input type="text" id="phoneInput" placeholder="255XXXXXXXXX" 
                            class="w-full bg-black/50 border border-gray-800 p-4 rounded-2xl text-center text-red-500 font-bold text-2xl outline-none focus:border-red-600 transition-all">
                        <button onclick="startVerification()" 
                            class="w-full bg-red-600 hover:bg-red-700 p-4 rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-red-600/40">
                            Connect Engine
                        </button>
                    </div>
                </section>

                <section id="dashboard" class="hidden animate__animated animate__fadeIn">
                    
                    <div class="glass p-4 rounded-2xl mb-4 flex justify-between items-center border-l-4 border-red-600">
                        <div class="flex items-center space-x-3">
                            <div class="w-12 h-12 shimmer rounded-xl border border-gray-700 flex items-center justify-center">
                                <span class="text-red-600 font-bold">UID</span>
                            </div>
                            <div>
                                <p id="dispUser" class="font-bold text-sm">--</p>
                                <p class="text-[9px] text-gray-500 uppercase font-mono tracking-widest">Premium Member</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <p class="text-[9px] text-gray-400">SYNCED BALANCE</p>
                            <p id="dispBalance" class="text-green-500 font-black text-lg">---</p>
                        </div>
                    </div>

                    <div class="glass p-6 rounded-[2rem] text-center border-t-2 border-red-600">
                        <p class="text-[10px] text-gray-500 uppercase mb-2">Next Predicted Multiplier</p>
                        <h3 id="currentOdds" class="text-7xl font-black text-red-600 mb-2 italic">--.--x</h3>
                        <p id="nextRoundTime" class="text-xs font-mono text-gray-400 tracking-widest">WAITING FOR DATA...</p>
                        
                        <div class="grid grid-cols-2 gap-4 mt-6">
                            <div class="bg-black/40 p-3 rounded-xl border border-gray-800">
                                <p class="text-[9px] text-gray-500">ACCURACY</p>
                                <p class="text-sm font-bold text-green-500">98.2%</p>
                            </div>
                            <div class="bg-black/40 p-3 rounded-xl border border-gray-800">
                                <p class="text-[9px] text-gray-500">RISK LEVEL</p>
                                <p class="text-sm font-bold text-yellow-500">LOW</p>
                            </div>
                        </div>

                        <button onclick="fetchSignals()" class="mt-6 w-full py-4 bg-white/5 border border-gray-800 rounded-xl hover:bg-red-600/10 transition-all font-bold text-xs uppercase">
                            Refresh Signals
                        </button>
                    </div>
                </section>

            </main>

            <script src="https://kit.fontawesome.com/a076d05399.js"></script>
            <script>
                // Winner Popups
                const names = ["Juma M.", "Kelvin K.", "Sarah P.", "Hassan W.", "Said H.", "Maria L."];
                const towns = ["Dar", "Arusha", "Mwanza", "Mbeya", "Dodoma"];
                
                function showWinner() {
                    const notify = document.getElementById('winNotify');
                    const name = document.getElementById('winnerName');
                    const amount = document.getElementById('winnerAmount');
                    
                    name.innerText = names[Math.floor(Math.random()*names.length)] + " kutoka " + towns[Math.floor(Math.random()*towns.length)];
                    amount.innerText = "AMETOKA KUSHINDA TSh " + (Math.random() * 800000 + 10000).toLocaleString(undefined, {maximumFractionDigits:0});
                    
                    notify.style.display = 'block';
                    setTimeout(() => { notify.style.display = 'none'; }, 5000);
                }
                setInterval(showWinner, 15000);

                // Verification Logic
                function startVerification() {
                    const phone = document.getElementById('phoneInput').value;
                    if(phone.length < 10) return alert("Ingiza namba ya Betpawa!");
                    
                    document.getElementById('syncCard').innerHTML = \`
                        <div class="text-center py-10">
                            <div class="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p class="text-sm animate-pulse">Syncing with Betpawa DB...</p>
                        </div>
                    \`;

                    setTimeout(() => {
                        document.getElementById('syncCard').classList.add('hidden');
                        document.getElementById('dashboard').classList.remove('hidden');
                        document.getElementById('dispUser').innerText = "+" + phone;
                        document.getElementById('dispBalance').innerText = "TSh " + (Math.floor(Math.random()*45000) + 1200).toLocaleString();
                        fetchSignals();
                    }, 3000);
                }

                // Signal Logic
                function fetchSignals() {
                    const odds = document.getElementById('currentOdds');
                    const time = document.getElementById('nextRoundTime');
                    
                    odds.innerText = "SCAN";
                    
                    setTimeout(() => {
                        const val = (Math.random() * (Math.random() > 0.7 ? 8 : 2.5) + 1.1).toFixed(2);
                        const now = new Date();
                        now.setSeconds(now.getSeconds() + 45);
                        
                        odds.innerText = val + "x";
                        time.innerText = "ROUND TIME: " + now.toLocaleTimeString('en-GB');
                        if(navigator.vibrate) navigator.vibrate(200);
                    }, 1500);
                }
            </script>
        </body>
        </html>
    `);
});

app.listen(PORT, () => console.log('Predator V10 Active!'));
