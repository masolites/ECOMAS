// Token functions
export async function getTokenBalance(walletAddress) {
    const sdk = new ThirdwebSDK.ThirdwebSDK("binance");
    const contract = await sdk.getContract(TOKEN_ADDRESS);
    return await contract.erc20.balanceOf(walletAddress);
}

export async function mintTokens(receiver, amount) {
    const sdk = new ThirdwebSDK.ThirdwebSDK("binance");
    const contract = await sdk.getContract(TOKEN_ADDRESS);
    return await contract.erc20.mintTo(
        receiver, 
        ethers.utils.parseUnits(amount.toString(), 18)
    );
}

// USDT functions
export async function getUSDTBalance(walletAddress) {
    const sdk = new ThirdwebSDK.ThirdwebSDK("binance");
    const contract = await sdk.getContract(USDT_ADDRESS);
    return await contract.erc20.balanceOf(walletAddress);
}

// Voting contract interaction
const VOTING_CONTRACT = "VOTING_CONTRACT_ADDRESS";

export async function submitVote(walletAddress, suggestedPrice) {
    const sdk = new ThirdwebSDK.ThirdwebSDK("binance");
    const contract = await sdk.getContract(VOTING_CONTRACT);
    return await contract.call("submitVote", [
        ethers.utils.parseUnits(suggestedPrice.toString(), 6) // 6 decimals for USD
    ]);
}

export async function finalizeVoting() {
    const sdk = new ThirdwebSDK.ThirdwebSDK("binance");
    const contract = await sdk.getContract(VOTING_CONTRACT);
    return await contract.call("finalizeVoting");
}
