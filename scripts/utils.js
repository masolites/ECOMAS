// Format currency
export function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2
    }).format(amount);
}

// Generate referral code
export function generateReferralCode(userId) {
    return userId.substring(0, 6).toUpperCase();
}

// Calculate mining rewards
export function calculateMiningRewards(miningTime, tier) {
    const baseRate = 1; // 1 token per minute
    const multiplier = tier === 'gold' ? 4 : 1;
    return Math.floor(miningTime / 60) * baseRate * multiplier;
}

// Calculate token amount from USD
export function calculateTokenAmount(usdAmount) {
    return Math.floor(usdAmount / TOKEN_PRICE);
}
