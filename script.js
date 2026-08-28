        // Game configurations
        const gameConfigs = {
            'musical-chairs': {
                title: '🪑 Musical Chairs',
                rules: 'Sab log chairs ke paas nache! Jab music ruke toh sb baithne ke liye ek ghaar ka kami ek player bahar! 🎵',
                color: '#ff006e'
            },
            'musical-statues': {
                title: '🗿 Musical Statues',
                rules: 'Nache raho jab music chale! Music ruke toh freeze ho jao! Move karo toh out! 🧊',
                color: '#00d4ff'
            },
            'freeze-dance': {
                title: '❄️ Freeze Dance',
                rules: 'Apni marzi se nao! Music stop hote hi frozen positions mein ruko! Sabse funny position jeetat hai! 😂',
                color: '#00f5ff'
            },
            'dance-battle': {
                title: '⚡ Dance Battle',
                rules: 'Har pause par ek naya dance move! Kitna creative reh sakte ho? 🕺',
                color: '#ffd60a'
            }
        };

        // State
        let currentMode = 'musical-chairs';
        let isPlaying = false;
        let roundCount = 0;
        let gameStats = [];
        let timerRef = null;

        // DOM Elements
        const audioPlayer = document.getElementById('audioPlayer');
        const musicUrlInput = document.getElementById('musicUrl');
        const minTimeInput = document.getElementById('minTime');
        const maxTimeInput = document.getElementById('maxTime');
        const minDisplay = document.getElementById('minDisplay');
        const maxDisplay = document.getElementById('maxDisplay');
        const gameInfo = document.getElementById('gameInfo');
        const gameTitle = document.getElementById('gameTitle');
        const gameRules = document.getElementById('gameRules');
        const playBtn = document.getElementById('playBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const resumeBtn = document.getElementById('resumeBtn');
        const stopBtn = document.getElementById('stopBtn');
        const playingIndicator = document.getElementById('playingIndicator');
        const statsCard = document.getElementById('statsCard');
        const roundCountDisplay = document.getElementById('roundCount');

        // Event Listeners for Mode Selection
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                currentMode = e.target.dataset.mode;
                updateGameInfo();
            });
        });

        // Update game info display
        function updateGameInfo() {
            const config = gameConfigs[currentMode];
            gameTitle.textContent = config.title;
            gameRules.textContent = config.rules;
            gameInfo.style.borderColor = config.color;
        }

        // Range input displays
        minTimeInput.addEventListener('change', () => {
            minDisplay.textContent = minTimeInput.value;
            if (parseInt(maxTimeInput.value) < parseInt(minTimeInput.value)) {
                maxTimeInput.value = minTimeInput.value;
                maxDisplay.textContent = minTimeInput.value;
            }
        });

        maxTimeInput.addEventListener('change', () => {
            maxDisplay.textContent = maxTimeInput.value;
        });

        // Play music
        function playMusic() {
            const musicUrl = musicUrlInput.value.trim();
            if (!musicUrl) {
                alert('📍 Pehle music URL daalo!');
                return;
            }

            audioPlayer.src = musicUrl;
            audioPlayer.play();
            isPlaying = true;
            updateUI();
            scheduleRandomStop();
        }

        // Pause music
        function pauseMusic() {
            audioPlayer.pause();
            isPlaying = false;
            if (timerRef) clearTimeout(timerRef);
            updateUI();
        }

        // Resume music
        function resumeMusic() {
            audioPlayer.play();
            isPlaying = true;
            updateUI();
            scheduleRandomStop();
        }

        // Stop music
        function stopMusic() {
            audioPlayer.pause();
            audioPlayer.currentTime = 0;
            isPlaying = false;
            roundCount = 0;
            gameStats = [];
            if (timerRef) clearTimeout(timerRef);
            updateUI();
            statsCard.classList.remove('show');
        }

        // Schedule random stop
        function scheduleRandomStop() {
            if (timerRef) clearTimeout(timerRef);

            const minSec = parseInt(minTimeInput.value);
            const maxSec = parseInt(maxTimeInput.value);
            const randomSeconds = Math.floor(Math.random() * (maxSec - minSec + 1) + minSec);

            timerRef = setTimeout(() => {
                audioPlayer.pause();
                isPlaying = false;
                roundCount++;

                gameStats.push({
                    round: roundCount,
                    duration: randomSeconds
                });

                updateUI();
                playStopSound();
                updateStats();
            }, randomSeconds * 1000);
        }

        // Play stop sound
        function playStopSound() {
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.value = 800;
                oscillator.type = 'sine';

                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.5);
            } catch (e) {
                console.log('Sound not supported');
            }
        }

        // Update UI
        function updateUI() {
            if (isPlaying) {
                playBtn.classList.add('hidden');
                pauseBtn.classList.remove('hidden');
                resumeBtn.classList.add('hidden');
                playingIndicator.classList.remove('hidden');
                statsCard.classList.add('show');
            } else {
                playBtn.classList.remove('hidden');
                pauseBtn.classList.add('hidden');
                resumeBtn.classList.remove('hidden');
                playingIndicator.classList.add('hidden');
            }

            if (roundCount === 0) {
                statsCard.classList.remove('show');
            }
        }

        // Update stats
        function updateStats() {
            roundCountDisplay.textContent = `Round #${roundCount} Complete! 🎉`;

            const durations = gameStats.map(s => s.duration);
            const avgDuration = (durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(1);
            const fastest = Math.min(...durations);
            const longest = Math.max(...durations);

            document.getElementById('avgDuration').textContent = avgDuration;
            document.getElementById('fastestRound').textContent = fastest;
            document.getElementById('longestRound').textContent = longest;
        }

        // Initialize
        updateGameInfo();
