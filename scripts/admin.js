// Admin Wallet Address
const ADMIN_WALLET = "YOUR_ADMIN_WALLET_ADDRESS";

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('admin-address').textContent = ADMIN_WALLET;
    loadPendingDeposits();
    loadVotingData();
});

// Load pending deposits
async function loadPendingDeposits() {
    const response = await fetch('/api/deposits/pending');
    const deposits = await response.json();
    
    const table = document.getElementById('pending-deposits').querySelector('tbody');
    table.innerHTML = '';
    
    deposits.forEach(deposit => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${deposit.email}</td>
            <td>$${deposit.amountUSD.toFixed(2)}</td>
            <td>${deposit.tokenAmount} MZLx</td>
            <td><a href="${deposit.proofUrl}" target="_blank">View Proof</a></td>
            <td>
                <button class="approve-btn" data-id="${deposit.id}">Approve</button>
                <button class="reject-btn" data-id="${deposit.id}">Reject</button>
            </td>
        `;
        table.appendChild(row);
    });
}

// Approve deposit
document.addEventListener('click', async (e) => {
    if(e.target.classList.contains('approve-btn')) {
        const depositId = e.target.dataset.id;
        
        // Get deposit details
        const depositRes = await fetch(`/api/deposits/${depositId}`);
        const deposit = await depositRes.json();
        
        // Mint tokens to user
        try {
            const sdk = new ThirdwebSDK.ThirdwebSDK("binance");
            const tokenContract = await sdk.getContract(TOKEN_ADDRESS);
            
            await tokenContract.erc20.mintTo(
                deposit.userWallet, 
                ethers.utils.parseUnits(deposit.tokenAmount.toString(), 18)
            );
            
            // Update status
            await fetch(`/api/deposits/${depositId}/approve`, { method: 'POST' });
            
            // Update UI
            loadPendingDeposits();
        } catch (error) {
            console.error("Token minting failed:", error);
        }
    }
});

// Voting Management
async function loadVotingData() {
    const response = await fetch('/api/voting');
    const data = await response.json();
    
    document.getElementById('suggested-price').textContent = data.suggestedPrice.toFixed(4);
    document.getElementById('total-votes').textContent = data.totalVotes;
    document.getElementById('quorum-percentage').textContent = `${data.quorumPercentage.toFixed(1)}%`;
    
    // Reward list
    const rewardList = document.getElementById('reward-list');
    rewardList.innerHTML = '';
    
    data.topSuggestions.forEach(suggestion => {
        const li = document.createElement('li');
        li.textContent = `${suggestion.user}: $${suggestion.price} (Reward: ${suggestion.reward} MZLx)`;
        rewardList.appendChild(li);
    });
}

document.getElementById('finalize-vote').addEventListener('click', async () => {
    const response = await fetch('/api/voting/finalize', { method: 'POST' });
    const result = await response.json();
    
    if(result.success) {
        alert("Voting finalized! New price applied");
        loadVotingData();
    }
});

// Token Price Update
document.getElementById('update-price').addEventListener('click', async () => {
    const newPrice = parseFloat(document.getElementById('new-token-price').value);
    
    if(newPrice && newPrice > 0) {
        // Update in backend
        await fetch('/api/token-price', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newPrice })
        });
        
        alert(`Token price updated to $${newPrice}`);
    }
});

// Manual Token Minting
document.getElementById('mint-tokens').addEventListener('click', async () => {
    const address = document.getElementById('mint-address').value;
    const amount = document.getElementById('mint-amount').value;
    
    if(!ethers.utils.isAddress(address)) {
        alert("Invalid wallet address");
        return;
    }
    
    if(!amount || amount <= 0) {
        alert("Invalid amount");
        return;
    }
    
    try {
        const sdk = new ThirdwebSDK.ThirdwebSDK("binance");
        const tokenContract = await sdk.getContract(TOKEN_ADDRESS);
        
        await tokenContract.erc20.mintTo(
            address, 
            ethers.utils.parseUnits(amount.toString(), 18)
        );
        
        alert(`${amount} MZLx minted to ${address}`);
    } catch (error) {
        console.error("Minting failed:", error);
        alert("Minting failed");
    }
});
