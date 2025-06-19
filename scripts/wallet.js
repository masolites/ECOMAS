 class WalletSystem {
    static connectMetamask() {
        if (typeof window.ethereum === 'undefined') {
            document.getElementById('walletStatus').textContent = 'Metamask not installed!';
            return;
        }
        
        window.ethereum.request({ method: 'eth_requestAccounts' })
            .then(accounts => {
                const address = accounts[0];
                document.getElementById('walletStatus').innerHTML = `
                    <i class="fas fa-check-circle" style="color:var(--success)"></i>
                    Connected: ${address.substring(0, 6)}...${address.substring(address.length - 4)}
                `;
                document.getElementById('connectWalletBtn').style.display = 'none';
            })
            .catch(err => {
                document.getElementById('walletStatus').textContent = 'Connection failed: ' + err.message;
            });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('connectWalletBtn').addEventListener('click', function() {
        WalletSystem.connectMetamask();
    });
});
