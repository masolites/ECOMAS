 // Social Gifting System
class SocialGifting {
    static async sendGift(receiverId, amount) {
        const user = UserSystem.getCurrentUser();
        if (!user) {
            alert('Please login to send gifts');
            return false;
        }
        
        // Check balance
        if (user.cryptoWallet.balance < amount) {
            alert('Insufficient MZL balance');
            return false;
        }
        
        // Simple validation
        if (!receiverId || !receiverId.startsWith('MZLx') || receiverId.length !== 44) {
            alert('Invalid wallet address format');
            return false;
        }
        
        try {
            // Show processing state
            const giftBtn = document.getElementById('giftButton');
            const originalText = giftBtn.innerHTML;
            giftBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            giftBtn.disabled = true;
            
            // In a real app, this would be a blockchain transaction
            // For demo purposes, we'll simulate with localStorage
            
            // Update sender balance
            user.cryptoWallet.balance -= amount;
            UserSystem.addNotification(user, `Sent ${amount} MZLx to ${receiverId.substring(0, 12)}...`);
            
            // Update receiver balance (if exists)
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const receiver = users.find(u => u.cryptoWallet.address === receiverId);
            if (receiver) {
                receiver.cryptoWallet.balance += amount;
                UserSystem.addNotification(receiver, `Received ${amount} MZLx from ${user.memberId}`);
                localStorage.setItem('users', JSON.stringify(users));
            }
            
            // Update current user
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            // Reset button after delay
            setTimeout(() => {
                giftBtn.innerHTML = originalText;
                giftBtn.disabled = false;
            }, 2000);
            
            alert(`Successfully sent ${amount} MZLx!`);
            return true;
        } catch (error) {
            console.error('Gift failed:', error);
            alert('Failed to send gift');
            giftBtn.innerHTML = originalText;
            giftBtn.disabled = false;
            return false;
        }
    }
}

// Gift button in social interface
document.getElementById('giftButton').addEventListener('click', async function() {
    const amount = parseFloat(prompt('Enter MZL amount to gift:'));
    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }
    
    const receiver = prompt('Enter receiver wallet address:');
    if (!receiver) return;
    
    await SocialGifting.sendGift(receiver, amount);
});
