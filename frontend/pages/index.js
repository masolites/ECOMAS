import { useContract, useMetamask } from "@thirdweb-dev/react";
import { useState } from "react";
import { auth, db } from "../../firebase/firebase";

export default function TokenPlatform() {
  const { contract } = useContract("YOUR_CONTRACT_ADDRESS");
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  
  const connectWallet = async () => {
    await useMetamask();
    const user = await auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    setUser(user);
  };
  
  const buyTokens = async (amount) => {
    await contract.call("buyTokens", [user.referrer], { value: amount });
  };
  
  const startMining = async () => {
    await contract.call("startMining");
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="p-4 border-b border-gray-800">
        <h1 className="text-2xl font-bold">MAZOL Token Platform</h1>
        {user ? (
          <button onClick={() => auth.signOut()}>Sign Out</button>
        ) : (
          <button onClick={connectWallet}>Connect Wallet</button>
        )}
      </header>
      
      <main className="p-4">
        {user && (
          <div className="mt-8">
            <div className="bg-gray-800 p-6 rounded-xl">
              <h2 className="text-xl font-semibold">Your Account</h2>
              
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3>Mining Status</h3>
                  <button onClick={startMining} className="mt-2 bg-green-500 px-4 py-2 rounded">
                    Start Mining
                  </button>
                </div>
                
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3>Buy Tokens</h3>
                  <button onClick={() => buyTokens(0.1)} className="mt-2 bg-blue-500 px-4 py-2 rounded">
                    Buy 100 MZLx (0.1 BNB)
                  </button>
                </div>
                
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3>Upgrade Tier</h3>
                  <div className="space-y-2 mt-2">
                    <button className="w-full bg-yellow-600 px-4 py-2 rounded">
                      Gold (₦1000)
                    </button>
                    <button className="w-full bg-purple-600 px-4 py-2 rounded">
                      Platinum (₦3000)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
