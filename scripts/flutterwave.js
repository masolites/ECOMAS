 // Flutterwave Payment Processor
class FlutterwaveProcessor {
    static async makePayment(user, amount, currency, tier, tokenAmount) {
        return new Promise((resolve, reject) => {
            FlutterwaveCheckout({
                public_key: "FLWPUBK-67633829eee8c3a462374a9a1a8958de-X", // REPLACE WITH YOUR KEY
                tx_ref: `MZL-${Date.now()}-${user.email}`,
                amount: amount,
                currency: currency,
                payment_options: currency === 'USDT' ? 'ussd,card,mobilemoney,account' : 'card,account,banktransfer',
                customer: {
                    email: user.email,
                    name: user.memberId
                },
                customizations: {
                    title: "MAZOL Token Purchase",
                    description: `Buying ${tokenAmount} MZLx tokens`,
                    logo: "https://masolites.com/logo.png"
                },
                callback: function(response) {
                    if (response.status === 'successful') {
                        resolve(response.transaction_id);
                    } else {
                        reject('Payment failed');
                    }
                },
                onclose: function() {
                    reject('Payment cancelled');
                }
            });
        });
    }
    
    static async makeDeposit(user, amount, method) {
        return new Promise((resolve, reject) => {
            FlutterwaveCheckout({
                public_key: "YOUR_FLUTTERWAVE_PUBLIC_KEY", // REPLACE WITH YOUR KEY
                tx_ref: `DEP-${Date.now()}-${user.email}`,
                amount: amount,
                currency: "NGN",
                payment_options: method === 'bank' ? 'banktransfer' : 
                                 method === 'mobile' ? 'mobilemoney' : 'card',
                customer: {
                    email: user.email,
                    name: user.memberId
                },
                customizations: {
                    title: "NGN Deposit",
                    description: `Depositing ₦${amount} to fiat wallet`,
                    logo: "https://masolites.com/logo.png"
                },
                callback: function(response) {
                    if (response.status === 'successful') {
                        resolve(response.transaction_id);
                    } else {
                        reject('Payment failed');
                    }
                },
                onclose: function() {
                    reject('Payment cancelled');
                }
            });
        });
    }
}

// Flutterwave event handlers
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.purchase-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            const tier = this.dataset.tier;
            const tokenAmount = parseFloat(this.dataset.amount);
            const currency = this.dataset.currency;
            const amount = parseFloat(this.dataset.price);
            const user = UserSystem.getCurrentUser();
            
            if (!user) {
                alert('Please login to make purchases');
                return;
            }
            
            try {
                // Show processing indicator
                this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
                this.disabled = true;
                
                // Process Flutterwave payment
                const txId = await FlutterwaveProcessor.makePayment(
                    user, amount, currency, tier, tokenAmount
                );
                
                // Handle successful payment
                if (tier === 'platinum') {
                    if (!user.badges.some(b => ['bronze','silver','gold'].includes(b))) {
                        alert('Platinum requires existing Bronze, Silver or Gold membership');
                        return;
                    }
                    UserSystem.addBadge(user, 'platinum');
                    alert('Platinum membership added!');
                } else {
                    UserSystem.addBadge(user, tier);
                    UserSystem.addCryptoBalance(user, tokenAmount);
                    alert(`Purchased ${tokenAmount} MZLx!`);
                }
                
                // Update user state
                const users = JSON.parse(localStorage.getItem('users') || '[]');
                const updatedUsers = users.map(u => u.email === user.email ? user : u);
                localStorage.setItem('users', JSON.stringify(updatedUsers));
                localStorage.setItem('currentUser', JSON.stringify(user));
                
                document.getElementById('buyModal').style.display = 'none';
                location.reload();
            } catch (error) {
                console.error('Payment error:', error);
                alert(`Payment failed: ${error}`);
                this.innerHTML = this.dataset.originalText;
                this.disabled = false;
            }
        });
    });
});
