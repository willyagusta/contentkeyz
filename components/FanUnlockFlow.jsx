import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import dotenv from "dotenv";

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

const ABI = [
    'function pricePerContent(uint256) view returns (uint256)',
    'function purchaseAccess(uint256) payable',
    'function checkAccess(address,uint256) view returns (bool)',
    'function setPrice(uint256,uint256)',
    'event AccessPurchased(address indexed buyer, uint256 indexed contentId, uint256 amount)'
];

export default function FanUnlockFlow() {
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [account, setAccount] = useState(null);
    const [contract, setContract] = useState(null);
  
    const [contentId, setContentId] = useState(1);
    const [price, setPrice] = useState('0');
    const [status, setStatus] = useState('');
    const [unlocked, setUnlocked] = useState(false);
  
    useEffect(() => {
      if (window.ethereum) {
        const p = new ethers.BrowserProvider(window.ethereum);
        setProvider(p);
      }
    }, []);
  
    useEffect(() => {
      if (provider && account) {
        const s = provider.getSigner();
        setSigner(s);
        const c = new ethers.Contract(CONTRACT_ADDRESS, ABI, s);
        setContract(c);
      }
    }, [provider, account]);
  
    // connect wallet
    async function connectWallet() {
      if (!provider) {
        setStatus('No injected wallet found. Install MetaMask.');
        return;
      }
      try {
        // Request accounts
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setAccount(accounts[0].address || accounts[0]);
          setStatus('Wallet connected');
        }
      } catch (err) {
        setStatus('Wallet connect rejected');
      }
    }
  
    // fetch price for selected contentId
    async function fetchPrice() {
      if (!contract) return;
      try {
        const p = await contract.pricePerContent(contentId);
        setPrice(ethers.formatEther(p));
      } catch (err) {
        setPrice('0');
        console.error(err);
      }
    }
  
    // check access for current account
    async function checkAccess() {
      if (!contract || !account) return;
      try {
        const ok = await contract.checkAccess(account, contentId);
        setUnlocked(Boolean(ok));
        setStatus(ok ? 'Access verified' : 'No access yet');
      } catch (err) {
        console.error(err);
        setStatus('Error checking access');
      }
    }
  
    // buy access (pay ETH)
    async function buyAccess() {
      if (!contract || !signer) {
        setStatus('Connect wallet first');
        return;
      }
      try {
        setStatus('Waiting for tx...');
        // get current price from contract to ensure correct value
        const priceWei = await contract.pricePerContent(contentId);
        const tx = await contract.buyAccess(contentId, { value: priceWei });
        await tx.wait();
        setStatus('Purchase complete — verifying...');
        await checkAccess();
      } catch (err) {
        console.error(err);
        setStatus(err?.message || 'Purchase failed');
      }
    }
  
    async function setPriceOnChain(newPriceEth) {
      if (!contract || !signer) {
        setStatus('Connect as owner');
        return;
      }
      try {
        const newPriceWei = ethers.parseEther(newPriceEth || '0');
        const tx = await contract.setPrice(contentId, newPriceWei);
        setStatus('Setting price — waiting tx...');
        await tx.wait();
        setStatus('Price updated');
        await fetchPrice();
      } catch (err) {
        console.error(err);
        setStatus('Failed to set price');
      }
    }
  
    // Test UI content to reveal
    function RevealContent() {
      if (!unlocked) return null;
      return (
        <div className="mt-4 p-4 border rounded bg-white">
          <h3 className="font-semibold">Unlocked Content</h3>
          <p className="mt-2">Here is your exclusive link / embed:</p>
          <a href="" target="_blank" rel="noreferrer" className="text-blue-600 underline">Open exclusive video</a>
          {/* or embed: */}
          <div className="mt-4">
            <iframe title="exclusive" src="" width="560" height="315" allowFullScreen></iframe>
          </div>
        </div>
      );
    }
  
    // automatically fetch price when contentId or contract updates
    useEffect(() => {
      if (contract) fetchPrice();
    }, [contract, contentId]);
  
    // try check access when account or contract changes
    useEffect(() => {
      if (contract && account) checkAccess();
    }, [contract, account]);
  
    return (
      <div className="max-w-2xl mx-auto p-6 bg-slate-50 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Day 5 — Fan Unlock Flow</h2>
  
        <div className="flex items-center gap-4 mb-4">
          <button onClick={connectWallet} className="px-4 py-2 bg-indigo-600 text-white rounded">{account ? `${account.slice(0,6)}...${account.slice(-4)}` : 'Connect Wallet'}</button>
          <div className="text-sm text-gray-600">{status}</div>
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded bg-white">
            <label className="block text-sm font-medium">Content ID</label>
            <input type="number" value={contentId} onChange={(e) => setContentId(Number(e.target.value))} className="mt-2 p-2 border rounded w-full" />
  
            <div className="mt-3 text-sm">
              <div>Price (ETH): <strong>{price}</strong></div>
              <button onClick={fetchPrice} className="mt-2 inline-block px-3 py-1 rounded bg-gray-200">Refresh Price</button>
            </div>
  
            <div className="mt-4">
              <button onClick={buyAccess} className="px-4 py-2 bg-green-600 text-white rounded">Pay & Unlock</button>
              <button onClick={checkAccess} className="ml-2 px-4 py-2 bg-blue-600 text-white rounded">Check Access</button>
            </div>
          </div>
  
          <div className="p-4 border rounded bg-white">
            <h4 className="font-medium">Owner Controls (optional)</h4>
            <p className="text-sm text-gray-600">Set price for this content (owner only)</p>
            <div className="mt-2 flex gap-2">
              <input id="setPriceInput" type="text" placeholder="0.01" className="p-2 border rounded w-full" />
              <button onClick={() => {
                const el = document.getElementById('setPriceInput');
                if (el) setPriceOnChain(el.value);
              }} className="px-3 py-2 bg-orange-500 text-white rounded">Set</button>
            </div>
  
            <div className="mt-4 text-sm">
              <div>Unlocked: {unlocked ? 'Yes' : 'No'}</div>
              <div className="mt-2">Demo content preview (visible only after unlocked)</div>
            </div>
          </div>
        </div>
  
        <RevealContent />
      </div>
    );
  }