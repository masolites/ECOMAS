// ================ CONFIGURATION ================
const TOKEN_ADDRESS = "YOUR_BEP20_MAZOL_CONTRACT_ADDRESS";
const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955"; // BSC USDT
const NETWORK = "binance";
const TOKEN_PRICE = 0.001; // USD
const MIN_PURCHASE = 500; // MZLx
const REFERRAL_RATE = 0.025; // 2.5%

// DOM Elements
const authSection = document.getElementById('auth-section');
const dashboard = document.getElementById('dashboard');

// State
let user = null;
let miningInterval;
let minedTokens = 0;
let tokenContract, usdtContract;
let userWalletAddress = null;

// Initialize thirdweb
async function initThirdweb() {
    const sdk = new ThirdwebSDK.ThirdwebSDK(NETWORK);
    tokenContract = await sdk.getContract(TOKEN_ADDRESS);
    usdtContract = await sdk.getContract(USDT_ADDRESS);
}

// User Authentication
document.getElementById('signup-btn').addEventListener('click', () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const referralCode = document.getElementById('referral-code').value;
    
    // Generate user ID
    const userId = `mazol_${Date.now()}`;
    
    // Generate referral code (first 6 chars of user ID)
    const userReferral = userId.substring(0, 6).toUpperCase();
    
    user = {
        email,
        password,
        userId,
        referralCode: userReferral,
        tier: 'silver',
        balance: 0,
        usdtBalance: 0,
        ngnBalance: 0,
        referralEarnings: 0
    };
    
    // Apply referral if exists
    if(referralCode) {
        applyReferral(referralCode);
    }
    
    localStorage.setItem('mazol_user', JSON.stringify(user));
    showDashboard();
});

document.getElementById('login-btn').addEventListener('click', () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const storedUser = JSON.parse(localStorage.getItem('mazol_user'));
    
    if(storedUser && storedUser.email === email && storedUser.password === password) {
        user = storedUser;
        showDashboard();
    } else {
        alert("Invalid credentials");
    }
});

function showDashboard() {
    authSection.style.display = 'none';
    dashboard.style.display = 'block';
    updateUserDisplay();
}

// Update UI with user data
function updateUserDisplay() {
    if(!user) return;
    
    // Update tier
    document.getElementById('tier-indicator').textContent = 
        user.tier === 'gold' ? '🥇 GOLD' : '🥈 SILVER';
    document.getElementById('tier-indicator').className = 
        user.tier === 'gold' ? 'gold-tier' : 'silver-tier';
    
    // Update mining speed
    document.getElementById('mining-speed').textContent = 
        user.tier === 'gold' ? '🥇 x4' : '🥈 x1';
    
    // Update balances
    document.getElementById('token-balance').textContent = `${user.balance} MZLx`;
    document.getElementById('usdt-balance').textContent = user.usdtBalance.toFixed(2);
    document.getElementById('ngn-balance').textContent = user.ngnBalance.toFixed(2);
    
    // Update referral code
    document.getElementById('user-referral').textContent = user.referralCode;
    
    // Update referral earnings
    document.getElementById('referral-amount').textContent = `${user.referralEarnings} MZLx`;
    
    // Enable voting for Gold tier
    document.getElementById('cast-vote').disabled = user.tier !== 'gold' || user.balance < 1000;
}

// Wallet Connection
document.getElementById('connect-metamask').addEventListener('click', async () => {
    if(window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            });
            userWalletAddress = accounts[0];
            document.getElementById('wallet-address').textContent = userWalletAddress;
            
            // Update balances
            updateBalances();
        } catch (error) {
            console.error("Wallet connection failed:", error);
        }
    } else {
        alert("MetaMask not installed!");
    }
});

async function updateBalances() {
    if(userWalletAddress) {
        try {
            // Get MZLx balance
            const balance = await tokenContract.erc20.balanceOf(userWalletAddress);
            user.balance = parseFloat(balance.displayValue);
            
            // Get USDT balance
            const usdtBalance = await usdtContract.erc20.balanceOf(userWalletAddress);
            user.usdtBalance = parseFloat(usdtBalance.displayValue);
            
            updateUserDisplay();
        } catch (error) {
            console.error("Balance update failed:", error);
        }
    }
}

// Mining Logic
document.getElementById('start-mining').addEventListener('click', () => {
    if(miningInterval) {
        clearInterval(miningInterval);
        miningInterval = null;
        document.getElementById('start-mining').textContent = "Start Mining";
        return;
    }
    
    const multiplier = user.tier === 'gold' ? 4 : 1;
    document.getElementById('start-mining').textContent = "Stop Mining";
    
    miningInterval = setInterval(() => {
        minedTokens += multiplier;
        document.getElementById('mined-tokens').textContent = `${minedTokens} MZLx`;
        
        // Every 10 mining cycles, send to backend
        if(minedTokens % 10 === 0) {
            saveMinedTokens();
        }
    }, 60000); // Mines every minute
});

function saveMinedTokens() {
    // Send to backend to record mined tokens
    fetch('/api/mining', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId: user.userId,
            tokens: minedTokens
        })
    });
}

// Flutterwave Payment
document.getElementById('flutterwave-btn').addEventListener('click', () => {
    const tokenAmount = parseInt(document.getElementById('token-amount').value) || MIN_PURCHASE;
    if(tokenAmount < MIN_PURCHASE) {
        alert(`Minimum purchase is ${MIN_PURCHASE} MZLx`);
        return;
    }
    
    const amountUSD = tokenAmount * TOKEN_PRICE;
    const amountNGN = amountUSD * 1500; // Example exchange rate
    
    FlutterwaveCheckout({
        public_key: "FLW_PUBLIC_KEY",
        tx_ref: `MZLx_${Date.now()}`,
        amount: amountNGN,
        currency: "NGN",
        payment_options: "card, banktransfer, ussd",
        customer: {
            email: user.email,
        },
        meta: {
            token_amount: tokenAmount,
            user_id: user.userId
        },
        callback: function(response) {
            if(response.status === 'successful') {
                completePurchase(tokenAmount, "flutterwave", amountNGN);
            } else {
                alert("Payment failed");
            }
        },
        onclose: function() {
            // Payment modal closed
        }
    });
});

// USDT Purchase
document.getElementById('connect-metamask').addEventListener('click', async () => {
    if(!userWalletAddress) return;
    
    const tokenAmount = parseInt(document.getElementById('token-amount').value) || MIN_PURCHASE;
    if(tokenAmount < MIN_PURCHASE) {
        alert(`Minimum purchase is ${MIN_PURCHASE} MZLx`);
        return;
    }
    
    const amountUSD = tokenAmount * TOKEN_PRICE;
    
    try {
        // Approve USDT transfer
        await usdtContract.erc20.approve(
            TOKEN_ADDRESS, 
            ethers.utils.parseUnits(amountUSD.toString(), 18)
        );
        
        // Execute purchase
        const tx = await tokenContract.call(
            "buyWithUSDT", 
            [ethers.utils.parseUnits(tokenAmount.toString(), 18)]
        );
        
        await tx.wait();
        completePurchase(tokenAmount, "usdt", amountUSD);
    } catch (error) {
        console.error("USDT purchase failed:", error);
    }
});

// Bank Deposit
document.getElementById('bank-deposit-btn').addEventListener('click', () => {
    const tokenAmount = parseInt(document.getElementById('token-amount').value) || MIN_PURCHASE;
    if(tokenAmount < MIN_PURCHASE) {
        alert(`Minimum purchase is ${MIN_PURCHASE} MZLx`);
        return;
    }
    
    const amountUSD = tokenAmount * TOKEN_PRICE;
    
    // Create deposit record
    fetch('/api/deposits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId: user.userId,
            tokenAmount,
            amountUSD,
            status: 'pending'
        })
    });
    
    alert(`Deposit request submitted! Please transfer $${amountUSD} to UBA: Masses 1026664654`);
});

// Complete purchase flow
function completePurchase(tokenAmount, method, amount) {
    // Upgrade to Gold tier
    user.tier = 'gold';
    
    // Credit tokens
    user.balance += tokenAmount;
    
    // Credit platform wallet
    if(method === 'flutterwave') {
        user.ngnBalance += amount;
    } else if(method === 'usdt') {
        user.usdtBalance += amount;
    }
    
    // Apply referral
    if(user.referredBy) {
        const referralReward = tokenAmount * REFERRAL_RATE;
        user.referralEarnings += referralReward;
        
        // Credit referrer (in a real system, this would update the referrer's account)
        fetch('/api/referral', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                referrer: user.referredBy,
                reward: referralReward
            })
        });
    }
    
    // Save user
    localStorage.setItem('mazol_user', JSON.stringify(user));
    updateUserDisplay();
    
    alert(`Successfully purchased ${tokenAmount} MZLx!`);
}

// Voting System
document.getElementById('cast-vote').addEventListener('click', async () => {
    if(user.tier !== 'gold' || user.balance < 1000) {
        document.getElementById('vote-error').textContent = 
            "Gold tier with min 1000 MZLx required to vote";
        return;
    }
    
    const suggestedPrice = parseFloat(document.getElementById('price-suggestion').value);
    if(!suggestedPrice || suggestedPrice <= TOKEN_PRICE) {
        document.getElementById('vote-error').textContent = 
            "Price must be higher than current price";
        return;
    }
    
    // Submit vote to backend
    const response = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId: user.userId,
            suggestedPrice,
            tokensHeld: user.balance
        })
    });
    
    const result = await response.json();
    if(result.success) {
        document.getElementById('vote-error').textContent = "";
        alert("Vote submitted successfully!");
    } else {
        document.getElementById('vote-error').textContent = result.message;
    }
});

// Referral System
function applyReferral(code) {
    // In a real system, validate code from backend
    user.referredBy = code;
}

document.getElementById('copy-referral').addEventListener('click', () => {
    const referralLink = `${window.location.origin}?ref=${user.referralCode}`;
    navigator.clipboard.writeText(referralLink);
    alert("Referral link copied!");
});

// Initialize
initThirdweb();
