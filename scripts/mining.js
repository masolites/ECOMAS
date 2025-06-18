 // MAZOL Token Contract Details
const CONTRACT_ADDRESS = "0x49F4a728BD98480E92dBfc6a82d595DA9d1F7b83";
const CONTRACT_ABI = [/* Full ABI would be here */];

// Mining System
class MiningSystem {
    constructor() {
        this.miningInterval = null;
        this.minedAmount = 0;
        this.totalMined = 0;
        this.isMining = false;
        this.startTime = 0;
        this.miningDuration = 24 * 60 * 60 * 1000; // 24 hours
        this.lastTotalUpdate = 0;
    }
    
    startMining() {
        if (this.isMining) return;
        
        const user = UserSystem.getCurrentUser();
        if (!user) return;
        
        this.startTime = Date.now();
        this.lastTotalUpdate = this.startTime;
        
        // Apply halving
        const halvingFactor = this.getHalvingFactor();
        const effectiveMiningRate = user.miningSpeed * halvingFactor;
        
        this.miningInterval = setInterval(() => {
            const now = Date.now();
            const elapsed = now - this.startTime;
            
            // Stop mining after 24 hours
            if (elapsed >= this.miningDuration) {
                this.stopMining();
                alert('Mining session completed after 24 hours!');
                return;
            }
            
            // Calculate mined amount based on user's mining speed
            this.minedAmount = (elapsed / 1000) * effectiveMiningRate;
            
            // Update speed display every 100ms
            document.getElementById('minedAmount').textContent = (effectiveMiningRate * 1000000).toFixed(6) + ' MZLx/s';
            
            // Update total display every minute
            if (now - this.lastTotalUpdate >= 60000) {
                this.totalMined = (elapsed / 1000) * effectiveMiningRate;
                document.getElementById('miningTotal').textContent = this.totalMined.toFixed(6) + ' MZLx';
                localStorage.setItem('totalMined', this.totalMined.toString());
                if (this.totalMined > 0) {
                    document.getElementById('claimButton').style.display = 'flex';
                }
                this.lastTotalUpdate = now;
            }
        }, 100); // Update every 100ms
        
        this.isMining = true;
        document.getElementById('miningButton').innerHTML = '<i class="fas fa-stop"></i> MINING (ON)';
        document.getElementById('miningButton').classList.add('mining-active');
        
        // Add notification
        UserSystem.addNotification(user, 'Mining session started!');
    }
    
    stopMining() {
        if (!this.isMining) return;
        
        clearInterval(this.miningInterval);
        this.isMining = false;
        document.getElementById('miningButton').innerHTML = '<i class="fas fa-play"></i> START MINING (OFF)';
        document.getElementById('miningButton').classList.remove('mining-active');
        localStorage.setItem('totalMined', this.totalMined.toString());
        
        // Add notification
        const user = UserSystem.getCurrentUser();
        if (user) {
            UserSystem.addNotification(user, 'Mining session stopped!');
        }
    }
    
    async claimTokens() {
        const user = UserSystem.getCurrentUser();
        if (!user) {
            alert('Please login first!');
            return;
        }
        
        if (this.totalMined <= 0) {
            alert('No tokens to claim!');
            return;
        }
        
        try {
            // Connect to Metamask
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            
            // Create contract instance
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
            
            // Convert tokens to wei
            const tokens = ethers.utils.parseUnits(this.totalMined.toString(), 18);
            
            // Transfer tokens to user
            const tx = await contract.transfer(user.cryptoWallet.address, tokens);
            await tx.wait();
            
            // Update local balance
            user.cryptoWallet.balance += this.totalMined;
            UserSystem.addNotification(user, `Claimed ${this.totalMined.toFixed(6)} MZLx from mining!`);
            
            this.totalMined = 0;
            document.getElementById('miningTotal').textContent = '0.000000 MZLx';
            document.getElementById('claimButton').style.display = 'none';
            this.stopMining();
            
            alert(`Successfully claimed ${this.totalMined.toFixed(6)} MZLx!`);
        } catch (error) {
            console.error('Error claiming tokens:', error);
            alert('Failed to claim tokens. Please try again.');
        }
    }
    
    getHalvingFactor() {
        const now = new Date();
        const daysSinceStart = Math.floor((now - TOKENOMICS.initialHalvingDate) / (1000 * 60 * 60 * 24));
        const halvings = Math.floor(daysSinceStart / TOKENOMICS.halvingInterval);
        return Math.pow(0.5, halvings);
    }
}

// Initialize mining system
const miningSystem = new MiningSystem();

// Mining Event Listeners
document.getElementById('miningButton').addEventListener('click', function() {
    if (!UserSystem.getCurrentUser()) {
        alert('Please login to start mining');
        document.getElementById('loginModal').style.display = 'flex';
        return;
    }
    
    if (miningSystem.isMining) {
        miningSystem.stopMining();
    } else {
        miningSystem.startMining();
    }
});

document.getElementById('claimButton').addEventListener('click', function() {
    miningSystem.claimTokens();
});

// Start mining from social interface
document.getElementById('startMiningBtn').addEventListener('click', function() {
    if (!UserSystem.getCurrentUser()) {
        alert('Please login to start mining');
        document.getElementById('loginModal').style.display = 'flex';
        return;
    }
    
    if (miningSystem.isMining) {
        miningSystem.stopMining();
    } else {
        miningSystem.startMining();
    }
});

// Load mined data if exists
if (localStorage.getItem('totalMined')) {
    miningSystem.totalMined = parseFloat(localStorage.getItem('totalMined'));
    document.getElementById('miningTotal').textContent = miningSystem.totalMined.toFixed(6) + ' MZLx';
    if (miningSystem.totalMined > 0) {
        document.getElementById('claimButton').style.display = 'flex';
    }
}
