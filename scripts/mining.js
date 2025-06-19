 class MiningSystem {
    static startMining() {
        const user = UserSystem.getCurrentUser();
        if (!user) return;
        
        // Check if mining is already active
        if (localStorage.getItem('miningActive') === 'true') return;
        
        // Store start time
        const startTime = new Date().getTime();
        localStorage.setItem('miningStartTime', startTime.toString());
        localStorage.setItem('miningActive', 'true');
        
        // Update UI
        document.getElementById('miningButton').innerHTML = '<i class="fas fa-pause"></i> STOP MINING (ON)';
        document.getElementById('miningButton').classList.add('mining-active');
        document.getElementById('claimButton').style.display = 'none';
        
        // Start mining interval
        const miningInterval = setInterval(() => {
            if (localStorage.getItem('miningActive') !== 'true') {
                clearInterval(miningInterval);
                return;
            }
            
            // Calculate mined amount
            const currentTime = new Date().getTime();
            const elapsedSeconds = (currentTime - startTime) / 1000;
            const minedAmount = user.miningSpeed * elapsedSeconds;
            
            // Update UI
            document.getElementById('minedAmount').textContent = `${user.miningSpeed.toFixed(6)} MZLx/s`;
            document.getElementById('miningTotal').textContent = `${minedAmount.toFixed(6)} MZLx`;
        }, 1000);
        
        // Automatically stop after 24 hours
        setTimeout(() => {
            this.stopMining();
        }, 24 * 60 * 60 * 1000);
    }
    
    static stopMining() {
        localStorage.setItem('miningActive', 'false');
        document.getElementById('miningButton').innerHTML = '<i class="fas fa-play"></i> START MINING (OFF)';
        document.getElementById('miningButton').classList.remove('mining-active');
        document.getElementById('claimButton').style.display = 'block';
    }
    
    static claimMinedAmount() {
        const user = UserSystem.getCurrentUser();
        if (!user) return;
        
        const startTime = parseInt(localStorage.getItem('miningStartTime') || '0');
        if (!startTime) return;
        
        const currentTime = new Date().getTime();
        const elapsedSeconds = (currentTime - startTime) / 1000;
        const minedAmount = user.miningSpeed * elapsedSeconds;
        
        if (minedAmount > 0) {
            UserSystem.addCryptoBalance(user, minedAmount);
            localStorage.removeItem('miningStartTime');
            localStorage.removeItem('miningActive');
            
            document.getElementById('miningTotal').textContent = '0.000000 MZLx';
            document.getElementById('claimButton').style.display = 'none';
            
            alert(`Successfully claimed ${minedAmount.toFixed(6)} MZLx!`);
        }
    }
}

// Initialize mining system
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('miningButton').addEventListener('click', function() {
        if (localStorage.getItem('miningActive') === 'true') {
            MiningSystem.stopMining();
        } else {
            MiningSystem.startMining();
        }
    });
    
    document.getElementById('claimButton').addEventListener('click', function() {
        MiningSystem.claimMinedAmount();
    });
    
    // Initialize mining status
    if (localStorage.getItem('miningActive') === 'true') {
        document.getElementById('miningButton').innerHTML = '<i class="fas fa-pause"></i> STOP MINING (ON)';
        document.getElementById('miningButton').classList.add('mining-active');
        document.getElementById('claimButton').style.display = 'none';
    }
});
