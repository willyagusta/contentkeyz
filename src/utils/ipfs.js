import { create } from 'ipfs-http-client';

// IPFS Configuration
// Note: Alchemy doesn't provide IPFS services, so we use public gateway or custom IPFS node
const IPFS_GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://ipfs.io/ipfs/';
const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;
const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY; // Must be NEXT_PUBLIC_ for browser access

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
  console.warn('[IPFS] No writable IPFS node configured. Uploads will require Pinata API keys.');
  ipfs = null;
}

export class IPFSService {
  static async uploadFile(file, options = {}) {
    console.log('[IPFS] Starting file upload:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      hasPinataJWT: !!PINATA_JWT,
      hasPinataKey: !!PINATA_API_KEY,
      hasPinataSecret: !!PINATA_SECRET_KEY,
      hasCustomNode: !!ipfsNodeUrl,
      ipfsClientInitialized: !!ipfs
    });

    // Try Pinata API first if credentials are available (JWT preferred, then API keys)
    if (PINATA_JWT) {
      console.log('[IPFS] Using Pinata JWT for upload');
      try {
        return await this.uploadToPinata(file, options);
      } catch (error) {
        console.error('[IPFS] Pinata JWT upload failed, trying fallback:', error);
        // Fall through to try API keys or IPFS node if available
      }
    }

    if (PINATA_API_KEY && PINATA_SECRET_KEY) {
      console.log('[IPFS] Using Pinata API keys for upload');
      try {
        return await this.uploadToPinata(file, options);
      } catch (error) {
        console.error('[IPFS] Pinata API key upload failed, trying fallback:', error);
        // Fall through to try IPFS node if available
      }
    }

    // Fallback to direct IPFS node if available
    if (ipfs && ipfsNodeUrl) {
      console.log('[IPFS] Using direct IPFS node for upload');
      try {
        const result = await ipfs.add(file, {
          pin: true,
          progress: options.onProgress
        });
        
        console.log('[IPFS] File uploaded to IPFS node:', result.path);
        
        return {
          hash: result.path,
          size: result.size,
          url: `${IPFS_GATEWAY}${result.path}`
        };
      } catch (error) {
        console.error('[IPFS] IPFS node upload failed:', {
          error: error.message,
          stack: error.stack,
          name: error.name
        });
        throw new Error(`Failed to upload to IPFS node: ${error.message}`);
      }
    }

    // No upload method available
    const errorMsg = 'No IPFS upload method configured. Please set one of:\n' +
      '1. NEXT_PUBLIC_PINATA_JWT (recommended)\n' +
      '2. NEXT_PUBLIC_PINATA_API_KEY and NEXT_PUBLIC_PINATA_SECRET_KEY\n' +
      '3. NEXT_PUBLIC_IPFS_NODE_URL\n\n' +
      'Note: All client-side env vars must be prefixed with NEXT_PUBLIC_';
    console.error('[IPFS]', errorMsg);
    throw new Error(errorMsg);
  }

  /**
   * Upload file directly to Pinata using their API
   * Supports both JWT (recommended) and API key authentication
   */
  static async uploadToPinata(file, options = {}) {
    console.log('[IPFS] Uploading to Pinata API...');
    
    const formData = new FormData();
    formData.append('file', file);

    // Pinata requires metadata to be a JSON string with a 'name' property
    // According to Pinata API docs: https://docs.pinata.cloud/files/uploading-files
    const metadata = {
      name: file.name || 'unnamed-file',
    };
    formData.append('pinataMetadata', JSON.stringify(metadata));

    // Build headers - prefer JWT, fallback to API keys
    const headers = {};
    if (PINATA_JWT) {
      headers['Authorization'] = `Bearer ${PINATA_JWT}`;
      console.log('[IPFS] Using JWT authentication');
    } else if (PINATA_API_KEY && PINATA_SECRET_KEY) {
      headers['pinata_api_key'] = PINATA_API_KEY;
      headers['pinata_secret_api_key'] = PINATA_SECRET_KEY;
      console.log('[IPFS] Using API key authentication');
    } else {
      throw new Error('No Pinata credentials available');
    }

    try {
      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: headers,
        body: formData,
      });

      console.log('[IPFS] Pinata response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        
        console.error('[IPFS] Pinata upload failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          rawError: errorText
        });
        
        const errorMessage = errorData.error?.details || errorData.error?.reason || errorData.message || errorText;
        throw new Error(`Pinata upload failed (${response.status}): ${errorMessage}`);
      }

      const result = await response.json();
      console.log('[IPFS] Pinata upload successful:', {
        hash: result.IpfsHash,
        pinSize: result.PinSize
      });

      return {
        hash: result.IpfsHash,
        size: result.PinSize || file.size,
        url: `${IPFS_GATEWAY}${result.IpfsHash}`
      };
    } catch (error) {
      console.error('[IPFS] Pinata upload error:', {
        error: error.message,
        stack: error.stack,
        name: error.name
      });
      throw error;
    }
  }

  static async uploadJSON(jsonData, filename = 'metadata.json') {
    console.log('[IPFS] Starting JSON upload:', {
      filename,
      dataSize: JSON.stringify(jsonData).length
    });

    if (PINATA_JWT || (PINATA_API_KEY && PINATA_SECRET_KEY)) {
      console.log('[IPFS] Using Pinata API for JSON upload');
      try {
        const jsonString = JSON.stringify(jsonData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const file = new File([blob], filename, { type: 'application/json' });
        return await this.uploadToPinata(file);
      } catch (error) {
        console.error('[IPFS] Pinata JSON upload failed, trying fallback:', error);
        // Fall through to try IPFS node if available
      }
    }

    // Fallback to direct IPFS node if available
    if (ipfs && ipfsNodeUrl) {
      console.log('[IPFS] Using direct IPFS node for JSON upload');
      try {
        const jsonString = JSON.stringify(jsonData, null, 2);
        const result = await ipfs.add(jsonString, { pin: true });
        console.log('[IPFS] JSON uploaded to IPFS node:', result.path);
        
        return {
          hash: result.path,
          url: `${IPFS_GATEWAY}${result.path}`
        };
      } catch (error) {
        console.error('[IPFS] IPFS node JSON upload failed:', {
          error: error.message,
          stack: error.stack
        });
        throw new Error(`Failed to upload JSON to IPFS node: ${error.message}`);
      }
    }

    // No upload method available
    const errorMsg = 'No IPFS upload method configured for JSON. Please set one of:\n' +
      '1. NEXT_PUBLIC_PINATA_JWT (recommended)\n' +
      '2. NEXT_PUBLIC_PINATA_API_KEY and NEXT_PUBLIC_PINATA_SECRET_KEY\n' +
      '3. NEXT_PUBLIC_IPFS_NODE_URL\n\n' +
      'Note: All client-side env vars must be prefixed with NEXT_PUBLIC_';
    console.error('[IPFS]', errorMsg);
    throw new Error(errorMsg);
  }

  static async pinToPinata(ipfsHash, name) {
    if (!PINATA_JWT && (!PINATA_API_KEY || !PINATA_SECRET_KEY)) {
      console.warn('[IPFS] Pinata credentials not available, skipping pin');
      return;
    }

    try {
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (PINATA_JWT) {
        headers['Authorization'] = `Bearer ${PINATA_JWT}`;
      } else {
        headers['pinata_api_key'] = PINATA_API_KEY;
        headers['pinata_secret_api_key'] = PINATA_SECRET_KEY;
      }

      const response = await fetch('https://api.pinata.cloud/pinning/pinByHash', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          hashToPin: ipfsHash,
          pinataMetadata: {
            name: name
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to pin to Pinata: ${errorText}`);
      }

      console.log('[IPFS] Successfully pinned to Pinata:', ipfsHash);
    } catch (error) {
      console.warn('[IPFS] Pinata pinning failed (non-critical):', error.message);
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
