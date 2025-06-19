 // Tokenomics Configuration
const TOKENOMICS = {
    // ... (same as before) ...
};

// User Management
class UserSystem {
    // ... (same as before) ...
    
    static addFiatBalance(user, amount) {
        user.fiatWallet.balance += amount;
        
        // Update user
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const updatedUsers = users.map(u => u.email === user.email ? user : u);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        return user;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize countdown timer
    function initCountdown() {
        // ... (same as before) ...
    }
    initCountdown();
    
    // Close modals functionality
    document.querySelectorAll('.modal-close').forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        document.querySelectorAll('.modal').forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Auth Event Listeners
    document.getElementById('loginBtn').addEventListener('click', function() {
        document.getElementById('loginModal').style.display = 'flex';
    });
    
    document.getElementById('registerBtn').addEventListener('click', function() {
        document.getElementById('registerModal').style.display = 'flex';
    });
    
    document.getElementById('showRegister').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('loginModal').style.display = 'none';
        document.getElementById('registerModal').style.display = 'flex';
    });
    
    document.getElementById('socialSignup').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('registerModal').style.display = 'flex';
    });
    
    document.getElementById('socialLoginBtn').addEventListener('click', function() {
        document.getElementById('loginModal').style.display = 'flex';
    });
    
    document.getElementById('confirmRegister').addEventListener('click', function() {
        // ... (same as before) ...
    });
    
    document.getElementById('confirmLogin').addEventListener('click', function() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        const user = UserSystem.login(email, password);
        if (user) {
            alert('Login successful!');
            document.getElementById('loginModal').style.display = 'none';
            
            // Show ECOMAS platform after login
            document.getElementById('socialOverlay').classList.add('hidden');
            document.getElementById('ecomasPlatform').classList.add('visible');
            
            // Update UI for logged in user
            document.getElementById('loginBtn').style.display = 'none';
            document.getElementById('registerBtn').style.display = 'none';
            document.getElementById('logoutBtn').style.display = 'flex';
            document.getElementById('socialActionsTop').style.display = 'flex';
            document.getElementById('socialLoginBtn').style.display = 'none';
            displayBadges();
        } else {
            alert('Invalid email or password');
        }
    });
    
    // Switch between interfaces
    document.getElementById('switchToEcomasBtn').addEventListener('click', function() {
        document.getElementById('socialOverlay').classList.add('hidden');
        document.getElementById('ecomasPlatform').classList.add('visible');
    });
    
    document.getElementById('switchToSocialBtn').addEventListener('click', function() {
        document.getElementById('ecomasPlatform').classList.remove('visible');
        document.getElementById('socialOverlay').classList.remove('hidden');
    });
    
    // Buy MAZOL from social interface
    document.getElementById('buyMazolBtn').addEventListener('click', function() {
        // ... (same as before) ...
    });
    
    // Deposit button
    document.getElementById('depositBtn').addEventListener('click', function() {
        const user = UserSystem.getCurrentUser();
        if (!user) {
            alert('Please login to deposit funds');
            document.getElementById('loginModal').style.display = 'flex';
            return;
        }
        
        document.getElementById('fiatWalletBalance').textContent = `₦${user.fiatWallet.balance.toFixed(2)}`;
        document.getElementById('depositModal').style.display = 'flex';
    });
    
    document.getElementById('depositFiatBtn').addEventListener('click', function() {
        const user = UserSystem.getCurrentUser();
        if (!user) {
            alert('Please login to deposit funds');
            document.getElementById('loginModal').style.display = 'flex';
            return;
        }
        
        document.getElementById('fiatWalletBalance').textContent = `₦${user.fiatWallet.balance.toFixed(2)}`;
        document.getElementById('depositModal').style.display = 'flex';
    });
    
    // Deposit handler
    document.getElementById('confirmDeposit').addEventListener('click', function() {
        const amount = parseFloat(document.getElementById('depositAmount').value);
        const method = document.getElementById('depositMethod').value;
        const user = UserSystem.getCurrentUser();
        
        if (!user) {
            alert('Please login to deposit funds');
            return;
        }
        
        if (isNaN(amount) || amount < 100) {
            alert('Minimum deposit amount is ₦100');
            return;
        }
        
        // Process deposit
        FlutterwaveProcessor.makeDeposit(user, amount, method)
            .then(txId => {
                UserSystem.addFiatBalance(user, amount);
                alert(`Successfully deposited ₦${amount.toFixed(2)}!`);
                document.getElementById('depositModal').style.display = 'none';
                location.reload();
            })
            .catch(error => {
                alert(`Deposit failed: ${error}`);
            });
    });
    
    // ... (rest of the code remains the same) ...
});
