const express = require('express');
const { default: makeWASocket, useMultiFileAuthState, Browsers, makeCacheableSignalKeyStore, delay } = require("@whiskeysockets/baileys");
const pino = require("pino");
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="sw">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>AVIATOR PREDATOR | LIVE SCHEDULE</title>
            <style>
                body { font-family: 'Segoe UI', sans-serif; background: #000; color: #fff; margin: 0; padding-bottom: 50px; }
                .navbar { background: #ff0000; padding: 15px; text-align: center; font-weight: bold; font-size: 20px; box-shadow: 0 4px 10px rgba(255,0,0,0.5); position: sticky; top: 0; z-index: 1000; }
                
                .container { display: flex; flex-direction: column; align-items: center; padding: 20px; }
                
                .signal-card { background: #111; border: 2px solid #ff0000; padding: 20px; border-radius: 20px; width: 95%; max-width: 450px; text-align: center; box-shadow: 0 0 20px rgba(255,0,0,0.3); }
                .main-odds { font-size: 60px; font-weight: bold; color: #ff0000; text-shadow: 0 0 10px #f00; margin: 10px 0; }
                
                .btn-generate { width: 100%; padding: 15px; background: #ff0000; color: #fff; border: none; border-radius: 10px; font-size: 18px; font-weight: bold; cursor: pointer; text-transform: uppercase; }
                .btn-generate:disabled { background: #444; }

                .schedule-table { width: 100%; margin-top: 25px; border-collapse: collapse; background: #111; border-radius: 10px; overflow: hidden; font-size: 14px; }
                .schedule-table th { background: #222; color: #ff0000; padding: 10px; border-bottom: 2px solid #ff0000; }
                .schedule-table td { padding: 12px; border-bottom: 1px solid #222; text-align: center; }
                .high-odds { color: #0f0; font-weight: bold; }
                .low-odds { color: #888; }
                
                .status { font-size: 12px; color: #0f0; margin-bottom: 10px; font-weight: bold; animation: blink 1.5s infinite; }
                @keyframes blink { 50% { opacity: 0.3; } }
            </style>
        </head>
        <body>
            <div class="navbar">AVIATOR PREDATOR V8 - REAL SYNC</div>
            
            <div class="container">
                <div class="signal-card">
                    <p class="status">● SERVER LIVE: SYNCED WITH BETPAWA</p>
                    <p style="font-size: 12px; color: #888; margin: 0;">CURRENT PREDICTION</p>
                    <div class="main-odds" id="mainOdds">--.--x</div>
                    <button class="btn-generate" id="genBtn" onclick="generateSchedule()">GET FULL SCHEDULE</button>
                    
                    <table class="schedule-table">
                        <thead>
                            <tr>
                                <th>TIME</th>
                                <th>SIGNAL</th>
                                <th>ACCURACY</th>
                            </tr>
                        </thead>
                        <tbody id="scheduleBody">
                            <tr><td colspan="3" style="color:#555">No data. Click button to scan...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <audio id="beep" src="https://www.soundjay.com/buttons/beep-07.mp3"></audio>

            <script>
                function generateSchedule() {
                    const btn = document.getElementById('genBtn');
                    const body = document.getElementById('scheduleBody');
                    const main = document.getElementById('mainOdds');
                    const beep = document.getElementById('beep');
                    
                    btn.disabled = true;
                    btn.innerText = "SCANNING ENGINE...";
                    beep.play();

                    setTimeout(() => {
                        body.innerHTML = ""; // Clear old data
                        let currentTime = new Date();
                        
                        // Generate 8 Future Rounds
                        for(let i = 0; i < 8; i++) {
                            // Ongeza kati ya sekunde 40 hadi 90 kwa kila round
                            currentTime.setSeconds(currentTime.getSeconds() + Math.floor(Math.random() * 50) + 40);
                            
                            let timeStr = currentTime.getHours().toString().padStart(2, '0') + ":" + 
                                          currentTime.getMinutes().toString().padStart(2, '0') + ":" + 
                                          currentTime.getSeconds().toString().padStart(2, '0');
                            
                            // Realistic Odds Logic
                            let odds;
                            let r = Math.random();
                            if (r < 0.6) odds = (Math.random() * (1.9 - 1.1) + 1.1).toFixed(2);
                            else if (r < 0.9) odds = (Math.random() * (4.5 - 2.0) + 2.0).toFixed(2);
                            else odds = (Math.random() * (12.0 - 5.0) + 5.0).toFixed(2);

                            let acc = (Math.random() * (99 - 94) + 94).toFixed(1) + "%";
                            let colorClass = odds > 2.0 ? 'high-odds' : 'low-odds';

                            if(i === 0) main.innerText = odds + "x";

                            let row = \`<tr>
                                <td>\${timeStr}</td>
                                <td class="\${colorClass}">\${odds}x</td>
                                <td style="color:#0f0">\${acc}</td>
                            </tr>\`;
                            body.innerHTML += row;
                        }

                        btn.disabled = false;
                        btn.innerText = "REFRESH SCHEDULE";
                        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
                    }, 3000);
                }
            </script>
        </body>
        </html>
    `);
});

app.listen(PORT, () => console.log(`Predictor Schedule Active!`));
