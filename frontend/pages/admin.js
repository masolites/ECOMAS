import { useContract } from "@thirdweb-dev/react";

export default function AdminDashboard() {
  const { contract } = useContract("YOUR_CONTRACT_ADDRESS");
  
  const updateTokenPrice = async (newPrice) => {
    await contract.call("setTokenPrice", [newPrice]);
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-4">Token Settings</h2>
          <div className="space-y-4">
            <div>
              <label>Token Price (BNB)</label>
              <input 
                type="number" 
                step="0.0001"
                className="bg-gray-700 px-4 py-2 rounded w-full mt-1"
                defaultValue="0.001"
                onChange={(e) => updateTokenPrice(e.target.value)}
              />
            </div>
            
            <div>
              <label>Mining Base Rate</label>
              <input 
                type="number" 
                className="bg-gray-700 px-4 py-2 rounded w-full mt-1"
                defaultValue="1"
              />
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-4">User Approvals</h2>
          {/* Bank deposit approval UI would go here */}
        </div>
      </div>
    </div>
  );
}
