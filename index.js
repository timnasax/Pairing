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
            <title>AVIATOR PREDATOR | VOICE AI</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"/>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
            <style>
                body { background: #000; color: #fff; font-family: 'Inter', sans-serif; overflow-x: hidden; }
                .glass { background: rgba(15, 15, 15, 0.95); backdrop-filter: blur(10px); border: 1px solid rgba(255, 0, 0, 0.2); }
                .btn-red { background: linear-gradient(135deg, #ff0000 0%, #770000 100%); transition: 0.3s; }
                .btn-red:hover { box-shadow: 0 0 20px rgba(255, 0, 0, 0.6); transform: translateY(-2px); }
                .neon-border { border: 1px solid #ff0000; box-shadow: 0 0 10px rgba(255, 0, 0, 0.2); }
                @keyframes pulse-red { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
                .scanning-text { animation: pulse-red 1.5s infinite; }
            </style>
        </head>
        <body class="p-4 flex flex-col items-center min-h-screen">

            <div id="winPop" class="fixed top-6 left-1/2 -translate-x-1/2 glass p-4 rounded-2xl border-b-4 border-green-500 hidden z-50 animate__animated animate__slideInDown w-[280px]">
                <div class="flex items-center space-x-3">
                    <div class="bg-green-600 p-2 rounded-lg text-xs font-bold">WIN</div>
                    <div class="text-[10px]">
                        <p id="winnerInfo" class="font-bold"></p>
                        <p id="winnerAmt" class="text-green-400 font-black"></p>
                    </div>
                </div>
            </div>

            <div class="w-full max-w-md flex justify-between items-center py-4">
                <div class="flex items-center">
                    <div class="w-2 h-2 bg-red-600 rounded-full mr-2 shadow-[0_0_10px_red] animate-pulse"></div>
                    <h1 class="text-xl font-black italic tracking-tighter">PREDATOR AI</h1>
                </div>
                <div class="flex space-x-2">
                    <button onclick="testVoice()" class="bg-white/5 p-2 rounded-lg text-xs border border-white/10"><i class="fas fa-volume-up text-red-500"></i></button>
                    <a href="#" class="bg-blue-600 p-2 rounded-lg text-xs font-bold px-4">JOIN TG</a>
                </div>
            </div>

            <main class="w-full max-w-md space-y-6">

                <div id="loginPage" class="glass p-8 rounded-[2.5rem] text-center space-y-6">
                    <i class="fas fa-microchip text-5xl text-red-600"></i>
                    <div>
                        <h2 class="text-xl font-bold">BETPAWA SYNC</h2>
                        <p class="text-[10px] text-gray-500">Decrypt real-time Aviator server seeds</p>
                    </div>
                    <input type="text" id="phone" placeholder="255XXXXXXXXX" class="w-full bg-black/50 border border-gray-800 p-4 rounded-2xl text-center text-red-500 font-bold text-2xl focus:border-red-600 outline-none transition-all">
                    <button onclick="login()" class="w-full btn-red p-4 rounded-2xl font-black uppercase tracking-widest shadow-lg">Activate Engine</button>
                </div>

                <div id="dashboard" class="hidden space-y-5 animate__animated animate__fadeIn">
                    
                    <div class="glass p-5 rounded-3xl flex justify-between items-center border-l-4 border-red-600">
                        <div>
                            <p id="dispUser" class="font-bold text-sm text-red-500 uppercase tracking-tight"></p>
                            <p class="text-[10px] text-gray-400">SYNCED BALANCE: <span id="dispBal" class="text-green-500 font-bold"></span></p>
                        </div>
                        <i class="fas fa-user-shield text-gray-700"></i>
                    </div>

                    <div class="glass p-6 rounded-[2.5rem] neon-border text-center">
                        <p class="text-[10px] text-gray-500 font-bold mb-4 uppercase tracking-widest">Weka Namba Iliyopita (Multiplier)</p>
                        <div class="flex space-x-2">
                            <input type="number" id="lastVal" step="0.01" placeholder="Ex: 2.15" class="w-full bg-black border border-gray-800 p-4 rounded-2xl text-center font-bold text-3xl outline-none text-white focus:border-red-600">
                            <button onclick="analyze()" class="btn-red px-6 rounded-2xl font-bold text-lg"><i class="fas fa-bolt"></i></button>
                        </div>
                        <p class="text-[9px] text-red-600/50 mt-3 italic italic">Algorithm v10.4 Ready</p>
                    </div>

                    <div id="predResult" class="hidden glass p-6 rounded-[2.5rem] text-center animate__animated animate__zoomIn">
                        <p class="text-[10px] text-gray-400 uppercase">Next Signal Predicted</p>
                        <h2 id="mainOdds" class="text-7xl font-black text-red-600 italic my-2">--.--x</h2>
                        <p id="timeInfo" class="text-xs font-mono text-gray-500 tracking-tighter mb-4"></p>
                        
                        <div class="overflow-hidden rounded-2xl border border-gray-800">
                            <table class="w-full text-[11px] text-left">
                                <thead class="bg-red-600/20 text-red-500 font-bold">
                                    <tr><th class="p-3">ROUND</th><th class="p-3 text-center">SIGNAL</th><th class="p-3 text-right">CONFIDENCE</th></tr>
                                </thead>
                                <tbody id="tableBody" class="divide-y divide-gray-900"></tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </main>

            <script>
                // Voice Synthesis
                function speak(text) {
                    const speech = new SpeechSynthesisUtterance();
                    speech.text = text;
                    speech.volume = 1;
                    speech.rate = 1;
                    speech.pitch = 1;
                    speech.lang = 'en-US';
                    window.speechSynthesis.speak(speech);
                }

                function testVoice() { speak("Voice engine is active. Good luck!"); }

                function login() {
                    const phone = document.getElementById('phone').value;
                    if(phone.length < 10) return alert("Weka namba sahihi!");
                    
                    document.getElementById('loginPage').classList.add('hidden');
                    document.getElementById('dashboard').classList.remove('hidden');
                    document.getElementById('dispUser').innerText = "+" + phone;
                    document.getElementById('dispBal').innerText = "TSh " + (Math.floor(Math.random()*15000) + 500).toLocaleString();
                    speak("Account verified. Welcome back predator.");
                }

                function analyze() {
                    const lastValue = document.getElementById('lastVal').value;
                    if(!lastValue) return alert("Weka multiplier!");

                    const odds = document.getElementById('mainOdds');
                    const predResult = document.getElementById('predResult');
                    const tbody = document.getElementById('tableBody');
                    const timeDisp = document.getElementById('timeInfo');

                    odds.innerText = "WAIT";
                    predResult.classList.remove('hidden');

                    setTimeout(() => {
                        tbody.innerHTML = "";
                        let now = new Date();
                        
                        for(let i=0; i<5; i++) {
                            now.setSeconds(now.getSeconds() + Math.floor(Math.random()*60) + 40);
                            let t = now.toLocaleTimeString('en-GB');
                            
                            // Advanced Fake Logic
                            let p = (Math.random() * (parseFloat(lastValue) > 2 ? 3 : 5.5) + 1.1).toFixed(2);
                            let acc = (Math.random() * (99 - 95) + 95).toFixed(1);

                            if(i === 0) {
                                odds.innerText = p + "x";
                                timeDisp.innerText = "ESTIMATED TIME: " + t;
                                speak("Analysis complete! Next signal is " + p + " x. Cash out early.");
                            }

                            tbody.innerHTML += \`
                                <tr class="bg-black/40">
                                    <td class="p-3 text-gray-500 font-mono">\${t}</td>
                                    <td class="p-3 text-center font-bold text-red-500">\${p}x</td>
                                    <td class="p-3 text-right text-green-500 font-bold">\${acc}%</td>
                                </tr>\`;
                        }
                    }, 2000);
                }

                // Random Winners
                setInterval(() => {
                    const names = ["Erick", "Mussa", "Salma", "Peter", "Yusuph"];
                    const towns = ["Dar", "Arusha", "Mwanza"];
                    const pop = document.getElementById('winPop');
                    document.getElementById('winnerInfo').innerText = names[Math.floor(Math.random()*5)] + " from " + towns[Math.floor(Math.random()*3)];
                    document.getElementById('winnerAmt').innerText = "TSh " + (Math.floor(Math.random()*300000) + 5000).toLocaleString();
                    pop.style.display = 'block';
                    setTimeout(() => { pop.style.display = 'none'; }, 5000);
                }, 18000);
            </script>
        </body>
        </html>
    `);
});

app.listen(PORT, () => console.log('Predator Voice Edition Active!'));
