// Connect to Metamask
document.getElementById('connectWalletBtn').addEventListener('click', async function() {
    if (typeof window.ethereum === 'undefined') {
        document.getElementById('walletStatus').textContent = 'Metamask not detected! Please install Metamask first.';
        document.getElementById('walletStatus').className = 'wallet-status wallet-error';
        document.getElementById('walletStatus').style.display = 'block';
        return;
    }
    
    try {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const userAddress = accounts[0];
        
        // Create provider and signer
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        
        // Create contract instance
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        
        // Get token balance
        const balance = await contract.balanceOf(userAddress);
        const formattedBalance = ethers.utils.formatUnits(balance, 18);
        
        // Update UI
        const user = UserSystem.getCurrentUser();
        if (user) {
            user.cryptoWallet.balance = parseFloat(formattedBalance);
            localStorage.setItem('currentUser', JSON.stringify(user));
            document.getElementById('cryptoBalance').textContent = formattedBalance;
        }
        
        document.getElementById('walletStatus').textContent = `Successfully connected to wallet! Balance: ${formattedBalance} MZLx`;
        document.getElementById('walletStatus').className = 'wallet-status wallet-connected';
        document.getElementById('walletStatus').style.display = 'block';
    } catch (error) {
        console.error('Error connecting to Metamask:', error);
        document.getElementById('walletStatus').textContent = 'Failed to connect to wallet. Please try again.';
        document.getElementById('walletStatus').className = 'wallet-status wallet-error';
        document.getElementById('walletStatus').style.display = 'block';
    }
})
