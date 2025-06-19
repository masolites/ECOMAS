 // Flutterwave Payment Processor
class FlutterwaveProcessor {
    static async makeDeposit(user, amount, method) {
        return new Promise((resolve, reject) => {
            FlutterwaveCheckout({
                public_key: "YOUR_FLUTTERWAVE_PUBLIC_KEY",
                tx_ref: `DEP-${Date.now()}-${user.email}`,
                amount: amount,
                currency: "NGN",
                payment_options: method === 'bank' ? 'banktransfer' : 
                                 method === 'mobile' ? 'mobilemoney' : 'card',
                customer: {
                    email: user.email,
                    name: user.memberId,
                    phone_number: "08123456789"
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
                        reject('Payment failed or was cancelled');
                    }
                },
                onclose: function() {
                    reject('Payment cancelled by user');
                }
            });
        });
    }
    
    // ... (rest of the payment methods remain the same) ...
}
