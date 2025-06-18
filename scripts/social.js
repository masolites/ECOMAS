// Social Gifting System
class SocialGifting {
    static async sendGift(receiverId, amount) {
        const user = UserSystem.getCurrentUser();
        if (!user) return false;
        
        // Check balance
        if (user.cryptoWallet.balance < amount) {
            alert('Insufficient MZL balance');
            return false;
        }
        
        try {
            // Connect to blockchain
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
            
            // Transfer tokens
            const tx = await contract.transfer(
                receiverId,
                ethers.utils.parseUnits(amount.toString(), 18)
            );
            await tx.wait();
            
            // Update local balances
            user.cryptoWallet.balance -= amount;
            UserSystem.addNotification(user, `Sent ${amount} MZLx to ${receiverId}`);
            
            return true;
        } catch (error) {
            console.error('Gift failed:', error);
            return false;
        }
    }
}

// Gift button in social interface
document.getElementById('giftButton').addEventListener('click', async function() {
    const amount = parseFloat(prompt('Enter MZL amount to gift:'));
    const receiver = prompt('Enter receiver wallet address:');
    
    if (amount && receiver) {
        const success = await SocialGifting.sendGift(receiver, amount);
        if (success) {
            alert('Gift sent successfully!');
        } else {
            alert('Failed to send gift');
        }
    }
});
