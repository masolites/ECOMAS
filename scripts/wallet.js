 // Connect to Metamask
async function connectMetamask() {
    if (typeof window.ethereum === 'undefined') {
        document.getElementById('walletStatus').textContent = 'Metamask not detected! Please install Metamask first.';
        document.getElementById('walletStatus').className = 'wallet-status wallet-error';
        document.getElementById('walletStatus').style.display = 'block';
        return;
    }
    
    try {
        const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
        });
        window.userAddress = accounts[0];
        
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const balance = await provider.getBalance(window.userAddress);
        const ethBalance = ethers.utils.formatEther(balance);
        
        // Update UI
        document.getElementById('walletStatus').innerHTML = `
            Connected: ${window.userAddress.substring(0,6)}...${window.userAddress.substring(38)}
            <br>Balance: ${ethBalance} ETH
        `;
        document.getElementById('walletStatus').className = 'wallet-status wallet-connected';
        document.getElementById('walletStatus').style.display = 'block';
        
        return true;
    } catch (error) {
        console.error('Connection failed:', error);
        document.getElementById('walletStatus').textContent = 'Connection failed. Please try again.';
        document.getElementById('walletStatus').className = 'wallet-status wallet-error';
        document.getElementById('walletStatus').style.display = 'block';
        return false;
    }
}

document.getElementById('connectWalletBtn').addEventListener('click', connectMetamask);

// Process purchase with Metamask
async function processPurchase(tier, amount, ethAmount) {
    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        
        // Get platform wallet address from contract
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        const platformWallet = await contract.DEFAULT_FEE_RECIPIENT();
        
        // Send payment
        const tx = await signer.sendTransaction({
            to: platformWallet,
            value: ethers.utils.parseEther(ethAmount)
        });
        
        await tx.wait();
        return true;
    } catch (error) {
        console.error('Purchase failed:', error);
        return false;
    }
}

// Handle token purchases
document.querySelectorAll('.purchase-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
        const tier = this.dataset.tier;
        const amount = parseFloat(this.dataset.amount);
        const ethAmount = this.dataset.eth;
        const user = UserSystem.getCurrentUser();
        
        if (!user) return;
        
        // Connect wallet if needed
        if (!window.ethereum || !window.ethereum.selectedAddress) {
            const connected = await connectMetamask();
            if (!connected) return;
        }
        
        // Process payment
        const success = await processPurchase(tier, amount, ethAmount);
        
        if (success) {
            // Special handling for Platinum
            if (tier === 'platinum') {
                if (!user.badges.some(b => ['bronze','silver','gold'].includes(b))) {
                    alert('Platinum requires existing Bronze, Silver or Gold membership');
                    return;
                }
                UserSystem.addBadge(user, 'platinum');
                alert('Platinum membership added!');
            } else {
                UserSystem.addBadge(user, tier);
                user.cryptoWallet.balance += amount;
                alert(`Purchased ${amount} MZLx!`);
            }
            
            // Update user state
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const updatedUsers = users.map(u => u.email === user.email ? user : u);
            localStorage.setItem('users', JSON.stringify(updatedUsers));
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            document.getElementById('buyModal').style.display = 'none';
            location.reload();
        } else {
            alert('Purchase failed. Please try again.');
        }
    });
});
