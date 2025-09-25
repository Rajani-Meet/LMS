import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const transcribeAudio = async (audioFilePath) => {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, '../python/whisper_transcribe.py');
    
    // Check if Python script exists
    if (!fs.existsSync(pythonScript)) {
      reject(new Error('Whisper transcription script not found'));
      return;
    }

    // Check if audio file exists
    if (!fs.existsSync(audioFilePath)) {
      reject(new Error('Audio file not found'));
      return;
    }
    
    const pythonProcess = spawn('python', [pythonScript, audioFilePath], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let output = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(output);
          if (result.success) {
            resolve(result.transcript);
          } else {
            reject(new Error(result.error || 'Transcription failed'));
          }
        } catch (parseError) {
          reject(new Error('Failed to parse transcription result'));
        }
      } else {
        reject(new Error(`Transcription failed with code ${code}: ${error}`));
      }
    });

    pythonProcess.on('error', (err) => {
      reject(new Error(`Failed to start Python process: ${err.message}`));
    });

    // Set timeout for long-running transcriptions
    setTimeout(() => {
      pythonProcess.kill();
      reject(new Error('Transcription timeout'));
    }, 300000); // 5 minutes timeout
  });
};

export const generateSummary = async (transcript) => {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, '../python/ai_summary.py');
    
    if (!fs.existsSync(pythonScript)) {
      reject(new Error('AI summary script not found'));
      return;
    }
    
    const pythonProcess = spawn('python', [pythonScript], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let output = '';
    let error = '';

    pythonProcess.stdin.write(JSON.stringify({ transcript }));
    pythonProcess.stdin.end();

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(output);
          if (result.success) {
            resolve(result.summary);
          } else {
            reject(new Error(result.error || 'Summary generation failed'));
          }
        } catch (parseError) {
          reject(new Error('Failed to parse summary result'));
        }
      } else {
        reject(new Error(`Summary generation failed with code ${code}: ${error}`));
      }
    });

    pythonProcess.on('error', (err) => {
      reject(new Error(`Failed to start Python process: ${err.message}`));
    });

    // Set timeout
    setTimeout(() => {
      pythonProcess.kill();
      reject(new Error('Summary generation timeout'));
    }, 60000); // 1 minute timeout
  });
};

export const generateChatResponse = async (transcript, userMessage, chatHistory = []) => {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, '../python/ai_chat.py');
    
    if (!fs.existsSync(pythonScript)) {
      reject(new Error('AI chat script not found'));
      return;
    }
    
    const pythonProcess = spawn('python', [pythonScript], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let output = '';
    let error = '';

    const inputData = {
      transcript,
      userMessage,
      chatHistory: chatHistory.slice(-10) // Keep last 10 messages for context
    };

    pythonProcess.stdin.write(JSON.stringify(inputData));
    pythonProcess.stdin.end();

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(output);
          if (result.success) {
            resolve(result.response);
          } else {
            reject(new Error(result.error || 'Chat response generation failed'));
          }
        } catch (parseError) {
          reject(new Error('Failed to parse chat response'));
        }
      } else {
        reject(new Error(`Chat response generation failed with code ${code}: ${error}`));
      }
    });

    pythonProcess.on('error', (err) => {
      reject(new Error(`Failed to start Python process: ${err.message}`));
    });

    // Set timeout
    setTimeout(() => {
      pythonProcess.kill();
      reject(new Error('Chat response timeout'));
    }, 30000); // 30 seconds timeout
  });
};

export const extractAudioFromVideo = async (videoFilePath) => {
  return new Promise((resolve, reject) => {
    const outputPath = videoFilePath.replace(/\.[^/.]+$/, '.wav');
    
    // Use ffmpeg to extract audio
    const ffmpegProcess = spawn('ffmpeg', [
      '-i', videoFilePath,
      '-vn', // No video
      '-acodec', 'pcm_s16le', // Audio codec
      '-ar', '16000', // Sample rate for Whisper
      '-ac', '1', // Mono channel
      '-y', // Overwrite output file
      outputPath
    ]);

    let error = '';

    ffmpegProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    ffmpegProcess.on('close', (code) => {
      if (code === 0) {
        resolve(outputPath);
      } else {
        reject(new Error(`Audio extraction failed: ${error}`));
      }
    });

    ffmpegProcess.on('error', (err) => {
      reject(new Error(`FFmpeg process failed: ${err.message}`));
    });
  });
};

export const smartSearchTranscript = async (transcript, query) => {
  // Simple search implementation in JavaScript
  const sentences = transcript.split(/[.!?]+/);
  const queryWords = query.toLowerCase().split(/\s+/);
  
  const results = [];
  
  sentences.forEach((sentence, index) => {
    const sentenceLower = sentence.toLowerCase();
    let relevanceScore = 0;
    
    queryWords.forEach(word => {
      if (sentenceLower.includes(word)) {
        relevanceScore += 1;
      }
    });
    
    if (relevanceScore > 0) {
      // Extract timestamp if available
      const timestampMatch = sentence.match(/\[(\d{2}):(\d{2}):(\d{2})\]/);
      let timestamp = index * 30; // Approximate timestamp
      
      if (timestampMatch) {
        const [, hours, minutes, seconds] = timestampMatch;
        timestamp = parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);
      }

      results.push({
        text: sentence.trim(),
        timestamp,
        relevance: relevanceScore,
        context: sentences.slice(Math.max(0, index - 1), index + 2).join('. ')
      });
    }
  });

  // Sort by relevance score
  results.sort((a, b) => b.relevance - a.relevance);
  
  return {
    results: results.slice(0, 10),
    totalFound: results.length,
    query
  };
};