 // Tokenomics Configuration
const TOKENOMICS = {
    totalSupply: 50000000,
    privateSale: 25000000,
    currentPrice: 0.001,
    ngnPrice: 18,
    miningBaseRate: 0.0000001,
    badgeMultipliers: {
        free: 1,
        bronze: 1.5,
        silver: 2,
        gold: 3,
        platinum: 4
    },
    platformFee: 0.004,
    maxFreeProducts: 3,
    discounts: {
        free: 0.05,
        bronze: 0.10,
        silver: 0.15,
        gold: 0.20,
        platinum: 0.25
    },
    halvingInterval: 365 * 4,
    initialHalvingDate: new Date('2023-01-01'),
    mlmLevels: 5,
    mlmPercentage: 0.025,
    membershipPrices: {
        free: 0,
        bronze: 1000,
        silver: 5000,
        gold: 10000,
        platinum: 1000
    }
};

// User Management
class UserSystem {
    static register(email, password, referralCode = null) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        if (users.find(u => u.email === email)) {
            return { error: 'Email already registered' };
        }
        
        // Generate unique member ID
        const memberId = this.generateMemberId('free');
        
        const user = {
            email,
            password: btoa(password),
            memberId,
            cryptoWallet: {
                address: this.generateCryptoAddress(),
                balance: 0
            },
            fiatWallet: {
                account: `MAS_${Math.floor(1000000000 + Math.random() * 9000000000)}`,
                balance: 0
            },
            badges: ['free'],
            miningSpeed: TOKENOMICS.miningBaseRate,
            notifications: [
                {
                    message: 'Welcome to Masolites! Start by exploring the platform.',
                    timestamp: new Date().toISOString(),
                    read: false
                }
            ],
            createdAt: new Date().toISOString(),
            referralCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
            referredBy: referralCode,
            products: [],
            transfers: [],
            upline: null,
            downlines: []
        };
        
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Process referral
        if (referralCode) {
            this.processReferral(referralCode, user.email, 0);
        }
        
        return user;
    }
    
    static login(email, password) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.password === btoa(password));
        
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            return user;
        }
        return null;
    }
    
    static getCurrentUser() {
        return JSON.parse(localStorage.getItem('currentUser'));
    }
    
    static logout() {
        localStorage.removeItem('currentUser'));
    }
    
    static addNotification(user, message) {
        if (!user) return;
        
        user.notifications.unshift({
            message,
            timestamp: new Date().toISOString(),
            read: false
        });
        
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const updatedUsers = users.map(u => u.email === user.email ? user : u);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        return user;
    }
    
    static generateCryptoAddress() {
        const chars = '0123456789ABCDEF';
        let address = 'MZLx';
        for (let i = 0; i < 40; i++) {
            address += chars[Math.floor(Math.random() * 16)];
        }
        return address;
    }
    
    static generateMemberId(tier) {
        const prefixes = {
            'free': 'MSL',
            'bronze': 'MSL-B',
            'silver': 'MSL-S',
            'gold': 'MSL-G',
            'platinum': 'MSL-P'
        };
        
        const id = Math.floor(100000000 + Math.random() * 900000000);
        return `${prefixes[tier] || 'MSL'}-${id}`;
    }
    
    static addBadge(user, badge) {
        if (!user.badges.includes(badge)) {
            user.badges.push(badge);
            
            // Update mining speed based on badges
            let multiplier = 1;
            if (user.badges.includes('platinum')) multiplier = TOKENOMICS.badgeMultipliers.platinum;
            else if (user.badges.includes('gold')) multiplier = TOKENOMICS.badgeMultipliers.gold;
            else if (user.badges.includes('silver')) multiplier = TOKENOMICS.badgeMultipliers.silver;
            else if (user.badges.includes('bronze')) multiplier = TOKENOMICS.badgeMultipliers.bronze;
            else multiplier = TOKENOMICS.badgeMultipliers.free;
            
            user.miningSpeed = TOKENOMICS.miningBaseRate * multiplier;
            
            // Update member ID if upgrading
            if (badge !== 'free') {
                user.member极 = this.generateMemberId(badge);
            }
            
            // Update user
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const updatedUsers = users.map(u => u.email === user.email ? user : u);
            localStorage.setItem('users', JSON.stringify(updatedUsers));
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            return true;
        }
        return false;
    }
    
    static addCryptoBalance(user, amount) {
        user.cryptoWallet.balance += amount;
        
        // Update user
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const updatedUsers = users.map(u => u.email === user.email ? user : u);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        return user;
    }
    
    static getDiscount(user) {
        if (!user) return 0;
        
        if (user.badges.includes('platinum')) return TOKENOMICS.discounts.platinum;
        else if (user.badges.includes('gold')) return TOKENOMICS.discounts.gold;
        else if (user.badges.includes('silver')) return TOKENOMICS.discounts.silver;
        else if (user.badges.includes('bronze')) return TOKENOMICS.discounts.bronze;
        else return TOKENOMICS.discounts.free;
    }
    
    static processReferral(referralCode, newUserId, amount) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const referrer = users.find(u => u.referralCode === referralCode);
        
        if (!referrer) return;
        
        // Add new user as downline
        const newUser = users.find(u => u.email === newUserId);
        if (newUser) {
            newUser.upline = referrer.email;
            referrer.downlines.push(newUser.email);
        }
        
        // Distribute rewards through 5 levels
        let currentUpline = referrer;
        for (let level = 0; level < TOKENOMICS.mlmLevels; level++) {
            if (!currentUpline) break;
            
            // Calculate reward
            const reward = amount * TOKENOMICS.mlmPercentage;
            currentUpline.cryptoWallet.balance += reward;
            
            // Add notification
            const message = `You earned ${reward.toFixed(6)} MZLx from level ${level+1} referral!`;
            this.addNotification(currentUpline, message);
            
            // Move to next upline
            if (currentUpline.upline) {
                currentUpline = users.find(u => u.email === currentUpline.upline);
            } else {
                currentUpline = null;
            }
        }
        
        // Update users
        localStorage.setItem('users', JSON.stringify(users));
    }
}

// Display user badges
function displayBadges() {
    const user = UserSystem.getCurrentUser();
    const badgeContainer = document.getElementById('badgeContainer');
    badgeContainer.innerHTML = '';
    
    if (user) {
        const badges = {
            'free': { icon: 'fas fa-gift', class: 'badge-free' },
            'bronze': { icon: 'fas fa-medal', class: 'badge-bronze' },
            'silver': { icon: 'fas fa-medal', class: 'badge-silver' },
            'gold': { icon: 'fas fa-medal', class: 'badge-gold' },
            'platinum': { icon: 'fas fa-star', class: 'badge-platinum' }
        };
        
        user.badges.forEach(badge => {
            if (badges[badge]) {
                const badgeEl = document.createElement('div');
                badgeEl.className = `badge ${badges[badge].class}`;
                badgeEl.innerHTML = `<i class="${badges[badge].icon}"></i>`;
                badgeEl.title = badge.charAt(0).toUpperCase() + badge.slice(1);
                badgeContainer.appendChild(badgeEl);
            }
        });
        
        // Display member ID
        const memberIdEl = document.createElement('div');
        memberIdEl.className = 'member-badge';
        memberIdEl.textContent = user.memberId;
        badgeContainer.appendChild(memberIdEl);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize countdown timer
    function initCountdown() {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 120);
    
        function updateCountdown() {
            const now = new Date();
            const diff = endDate - now;
            
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            
            document.getElementById('days').textContent = days;
            document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
            document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
        }
    
        setInterval(updateCountdown, 60000);
        updateCountdown();
    }
    initCountdown();
    
    // Update current price display
    document.getElementById('currentPrice').textContent = TOKENOMICS.currentPrice.toFixed(3);
    
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
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const referralCode = document.getElementById('referralCode').value || null;
        
        const result = UserSystem.register(email, password, referralCode);
        if (result.error) {
            alert(result.error);
        } else {
            alert('Registration successful!');
            document.getElementById('registerModal').style.display = 'none';
            location.reload();
        }
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
        const user = UserSystem.getCurrentUser();
        if (!user) {
            alert('Please login to buy tokens');
            document.getElementById('loginModal').style.display = 'flex';
            return;
        }
        
        document.getElementById('buyModal').style.display = 'flex';
    });
    
    // Buy MAZOL from ECOMAS
    document.getElementById('buyButton').addEventListener('click', function() {
        const user = UserSystem.getCurrentUser();
        if (!user) {
            alert('Please login to buy tokens');
            document.getElementById('loginModal').style.display = 'flex';
            return;
        }
        
        document.getElementById('buyModal').style.display = 'flex';
    });
    
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', function() {
        UserSystem.logout();
        location.reload();
    });
    
    // Voting
    document.getElementById('submitVote').addEventListener('click', function() {
        const newPrice = parseFloat(document.getElementById('newPrice').value);
        if (newPrice < 0.001) {
            alert('Minimum price is $0.001');
            return;
        }
        
        // This would be handled by the blockchain in a real app
        TOKENOMICS.currentPrice = newPrice;
        document.getElementById('currentPrice').textContent = newPrice.toFixed(3);
        
        alert(`Vote submitted for new price: $${newPrice}`);
    });
    
    // Store original button text
    document.querySelectorAll('.purchase-btn').forEach(btn => {
        btn.dataset.originalText = btn.innerHTML;
    });
    
    // Check if user is logged in
    const user = UserSystem.getCurrentUser();
    if (user) {
        document.getElementById('loginBtn').style.display = 'none';
        document.getElementById('registerBtn').style.display = 'none';
        document.getElementById('logoutBtn').style.display = 'flex';
        document.getElementById('socialActionsTop').style.display = 'flex';
        document.getElementById('socialLoginBtn').style.display = 'none';
        displayBadges();
    } else {
        document.getElementById('socialOverlay').classList.remove('hidden');
        document.getElementById('ecomasPlatform').classList.remove('visible');
        document.getElementById('socialActionsTop').style.display = 'none';
    }
});
