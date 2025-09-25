import fs from 'fs';
import path from 'path';

export const scanFile = async (filePath) => {
  try {
    const stats = fs.statSync(filePath);
    const fileSize = stats.size;
    const maxSize = 50 * 1024 * 1024; // 50MB limit

    if (fileSize > maxSize) {
      return {
        isClean: false,
        reason: 'File size exceeds maximum allowed limit',
        details: { fileSize, maxSize }
      };
    }

    const ext = path.extname(filePath).toLowerCase();
    const blacklistedExtensions = ['.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js'];
    
    if (blacklistedExtensions.includes(ext)) {
      return {
        isClean: false,
        reason: 'File type not allowed',
        details: { extension: ext }
      };
    }

    await new Promise(resolve => setTimeout(resolve, 100));

    return {
      isClean: true,
      reason: 'File passed security checks',
      scanDate: new Date(),
      details: {
        fileSize,
        extension: ext,
        scanEngine: 'stub-scanner-v1.0'
      }
    };

  } catch (error) {
    return {
      isClean: false,
      reason: 'Error during file scanning',
      details: { error: error.message }
    };
  }
};