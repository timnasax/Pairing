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
            <title>AVIATOR PREDATOR | MANUAL ANALYSIS</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"/>
            <style>
                body { background: #010101; color: #fff; font-family: 'Inter', sans-serif; }
                .glass { background: rgba(20, 20, 20, 0.9); backdrop-filter: blur(15px); border: 1px solid #331111; }
                .neon-red { box-shadow: 0 0 15px rgba(255, 0, 0, 0.3); border: 1px solid #ff0000; }
                .btn-gradient { background: linear-gradient(90deg, #ff0000, #990000); }
                .status-dot { height: 8px; width: 8px; background: #0f0; border-radius: 50%; display: inline-block; box-shadow: 0 0 10px #0f0; }
            </style>
        </head>
        <body class="p-4 flex flex-col items-center">

            <div id="winNotify" class="fixed top-4 right-4 glass p-3 rounded-xl border-r-4 border-red-600 hidden animate__animated animate__fadeInRight z-50">
                <p id="winText" class="text-[10px] font-bold text-red-500"></p>
                <p id="winAmt" class="text-xs font-black"></p>
            </div>

            <div class="w-full max-w-md flex justify-between items-center mb-6">
                <div>
                    <h1 class="text-2xl font-black tracking-tighter text-red-600">PREDATOR AI</h1>
                    <p class="text-[10px] text-gray-500 uppercase tracking-widest"><span class="status-dot mr-1"></span> Live Data Sync</p>
                </div>
                <a href="https://t.me/yourlink" class="bg-[#24A1DE] p-2 rounded-full px-4 text-[10px] font-bold shadow-lg">
                    <i class="fab fa-telegram mr-1"></i> TELEGRAM
                </a>
            </div>

            <main class="w-full max-w-md space-y-6">

                <div id="loginSection" class="glass p-8 rounded-3xl text-center space-y-4">
                    <h2 class="text-xl font-bold uppercase tracking-tight">Login Account</h2>
                    <input type="text" id="phone" placeholder="255XXXXXXXXX" class="w-full bg-black border border-gray-800 p-4 rounded-2xl text-center text-red-600 font-bold text-xl outline-none">
                    <button onclick="login()" class="w-full btn-gradient p-4 rounded-2xl font-black uppercase shadow-xl active:scale-95 transition">Verify Account</button>
                </div>

                <div id="dashboard" class="hidden space-y-6 animate__animated animate__fadeIn">
                    
                    <div class="glass p-4 rounded-2xl flex justify-between items-center border-l-4 border-red-600">
                        <div>
                            <p id="uName" class="font-bold text-sm text-red-500"></p>
                            <p class="text-[9px] text-gray-500">BALANCE: <span id="uBal" class="text-green-500"></span></p>
                        </div>
                        <div class="text-right text-[10px] text-gray-400">STATUS: VERIFIED</div>
                    </div>

                    <div class="glass p-6 rounded-3xl neon-red text-center">
                        <h3 class="text-xs font-bold text-gray-400 mb-4 uppercase">Ingiza Round Iliopita (Last Multiplier)</h3>
                        <div class="flex space-x-2 mb-4">
                            <input type="number" id="lastRound" step="0.01" placeholder="Mfano: 1.50" class="w-full bg-black border border-gray-800 p-4 rounded-2xl text-center text-white font-bold text-2xl outline-none focus:border-red-600">
                            <button onclick="analyzeData()" class="bg-red-600 px-6 rounded-2xl font-bold"><i class="fas fa-search"></i></button>
                        </div>
                        <p class="text-[9px] text-gray-600 italic">Mfumo utatumia namba hii kukokotoa algorithm ya mzunguko unaokuja</p>
                    </div>

                    <div id="resultCard" class="hidden glass p-6 rounded-3xl text-center">
                        <p class="text-[10px] text-gray-500 uppercase">Next Predicted Signal</p>
                        <div id="mainOdds" class="text-6xl font-black text-red-600 my-2">--.--x</div>
                        <p id="nextTime" class="text-xs font-mono text-green-500 mb-4 tracking-tighter"></p>

                        <div class="mt-4 overflow-hidden rounded-xl border border-gray-800">
                            <table class="w-full text-[11px] text-left">
                                <thead class="bg-red-600/10 text-red-500 font-bold">
                                    <tr>
                                        <th class="p-3">ROUND</th>
                                        <th class="p-3">SIGNAL</th>
                                        <th class="p-3">CONFIDENCE</th>
                                    </tr>
                                </thead>
                                <tbody id="tableData" class="divide-y divide-gray-900">
                                    </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </main>

            <script src="https://kit.fontawesome.com/a076d05399.js"></script>
            <script>
                // Login simulation
                function login() {
                    const phone = document.getElementById('phone').value;
                    if(phone.length < 10) return alert("Ingiza namba ya Betpawa!");
                    
                    document.getElementById('loginSection').classList.add('hidden');
                    document.getElementById('dashboard').classList.remove('hidden');
                    document.getElementById('uName').innerText = "+" + phone;
                    document.getElementById('uBal').innerText = "TSh " + (Math.floor(Math.random()*250000) + 1200).toLocaleString();
                }

                // AI Analysis Simulation
                function analyzeData() {
                    const lastVal = document.getElementById('lastRound').value;
                    if(!lastVal) return alert("Tafadhali ingiza multiplier iliopita!");

                    const resultCard = document.getElementById('resultCard');
                    const table = document.getElementById('tableData');
                    const mainOdds = document.getElementById('mainOdds');
                    const timeDisp = document.getElementById('nextTime');

                    mainOdds.innerText = "WAIT...";
                    resultCard.classList.remove('hidden');

                    setTimeout(() => {
                        table.innerHTML = "";
                        let baseTime = new Date();
                        
                        // Generate Next 5 Predictions
                        for(let i=0; i<5; i++) {
                            baseTime.setSeconds(baseTime.getSeconds() + Math.floor(Math.random() * 60) + 40);
                            let tStr = baseTime.toLocaleTimeString('en-GB');
                            
                            // Analysis Logic based on input
                            let seed = parseFloat(lastVal);
                            let prediction = (Math.random() * (seed > 2 ? 3 : 5) + 1.1).toFixed(2);
                            let conf = (Math.random() * (99 - 94) + 94).toFixed(1);

                            if(i === 0) {
                                mainOdds.innerText = prediction + "x";
                                timeDisp.innerText = "NEXT ROUND EXPECTED AT: " + tStr;
                            }

                            table.innerHTML += \`
                                <tr class="bg-black/40">
                                    <td class="p-3 text-gray-400">\${tStr}</td>
                                    <td class="p-3 font-bold text-red-500">\${prediction}x</td>
                                    <td class="p-3 text-green-500">\${conf}%</td>
                                </tr>
                            \`;
                        }
                        if(navigator.vibrate) navigator.vibrate(200);
                    }, 2000);
                }

                // Winner Popups
                function showWinners() {
                    const notify = document.getElementById('winNotify');
                    const names = ["Ally", "Neema", "Frank", "Zubeir", "Jane"];
                    notify.style.display = 'block';
                    document.getElementById('winText').innerText = names[Math.floor(Math.random()*5)] + " from Dar";
                    document.getElementById('winAmt').innerText = "WIN: TSh " + (Math.floor(Math.random()*500000) + 10000).toLocaleString();
                    setTimeout(() => { notify.style.display = 'none'; }, 4000);
                }
                setInterval(showWinners, 12000);
            </script>
        </body>
        </html>
    `);
});

app.listen(PORT, () => console.log('Predator Manual Engine Active!'));
