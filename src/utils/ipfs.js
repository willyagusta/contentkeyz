import { create } from 'ipfs-http-client';

// IPFS Configuration
// Note: Alchemy doesn't provide IPFS services, so we use public gateway or custom IPFS node
const IPFS_GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://ipfs.io/ipfs/';
const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;

// Initialize IPFS client
// Using public IPFS gateway or custom node if provided
const ipfsNodeUrl = process.env.NEXT_PUBLIC_IPFS_NODE_URL;
let ipfs;

if (ipfsNodeUrl) {
  // Use custom IPFS node if provided
  const url = new URL(ipfsNodeUrl);
  ipfs = create({
    host: url.hostname,
    port: url.port || (url.protocol === 'https:' ? 443 : 80),
    protocol: url.protocol.replace(':', ''),
    path: url.pathname || '/api/v0',
  });
} else {
  // Use public IPFS gateway (no auth required)
  ipfs = create({
    host: 'ipfs.io',
    port: 443,
    protocol: 'https',
  });
}

export class IPFSService {
  static async uploadFile(file, options = {}) {
    try {
      console.log('Uploading file to IPFS:', file.name);
      
      // Upload to IPFS
      const result = await ipfs.add(file, {
        pin: true,
        progress: options.onProgress
      });
      
      console.log('File uploaded to IPFS:', result.path);
      
      // Optionally pin to Pinata for better reliability
      if (PINATA_API_KEY) {
        await this.pinToPinata(result.path, file.name);
      }
      
      return {
        hash: result.path,
        size: result.size,
        url: `${IPFS_GATEWAY}${result.path}`
      };
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      throw new Error('Failed to upload file to IPFS');
    }
  }

  static async uploadJSON(jsonData, filename = 'metadata.json') {
    try {
      const jsonString = JSON.stringify(jsonData, null, 2);
      const result = await ipfs.add(jsonString, { pin: true });
      
      if (PINATA_API_KEY) {
        await this.pinToPinata(result.path, filename);
      }
      
      return {
        hash: result.path,
        url: `${IPFS_GATEWAY}${result.path}`
      };
    } catch (error) {
      console.error('Error uploading JSON to IPFS:', error);
      throw new Error('Failed to upload JSON to IPFS');
    }
  }

  static async pinToPinata(ipfsHash, name) {
    try {
      const response = await fetch('https://api.pinata.cloud/pinning/pinByHash', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_KEY,
        },
        body: JSON.stringify({
          hashToPin: ipfsHash,
          pinataMetadata: {
            name: name
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to pin to Pinata');
      }

      console.log('Successfully pinned to Pinata:', ipfsHash);
    } catch (error) {
      console.warn('Pinata pinning failed (non-critical):', error.message);
    }
  }

  static getIPFSUrl(hash) {
    return `${IPFS_GATEWAY}${hash}`;
  }

  static async createPreview(file) {
    const fileType = file.type;
    
    if (fileType.startsWith('image/')) {
      return await this.createImagePreview(file);
    } else if (fileType.startsWith('video/')) {
      return await this.createVideoPreview(file);
    } else if (fileType === 'application/pdf') {
      return await this.createPDFPreview(file);
    }
    
    return null;
  }

  static async createImagePreview(file) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = 300;
        canvas.height = 200;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob(resolve, 'image/jpeg', 0.8);
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  static async createVideoPreview(file) {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      video.onloadedmetadata = () => {
        video.currentTime = Math.min(5, video.duration / 2); // Capture at 5s or middle
      };
      
      video.onseeked = () => {
        canvas.width = 300;
        canvas.height = 200;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob(resolve, 'image/jpeg', 0.8);
      };
      
      video.src = URL.createObjectURL(file);
    });
  }

  static async createPDFPreview(file) {
    return null;
  }
}

export default IPFSService;
