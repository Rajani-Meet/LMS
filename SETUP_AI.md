# AI Features Setup Guide

## Prerequisites

### 1. Python Installation
Ensure Python 3.8+ is installed:
```bash
python --version
# or
python3 --version
```

### 2. Install Python Dependencies
Navigate to the server directory and install Python packages:
```bash
cd server/python
pip install -r requirements.txt
```

### 3. Install FFmpeg (for audio extraction)
**Windows:**
- Download from https://ffmpeg.org/download.html
- Add to system PATH

**macOS:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt update
sudo apt install ffmpeg
```

### 4. OpenAI API Key (Optional)
For enhanced AI features, set your OpenAI API key:
```bash
# Add to your environment variables
export OPENAI_API_KEY="your-api-key-here"
```

## Features

### 1. Auto Transcript Generation
- **Technology**: OpenAI Whisper
- **Supported Formats**: MP3, WAV, MP4, AVI, MOV
- **Languages**: 99+ languages supported
- **Accuracy**: ~95% for clear audio

### 2. AI-Powered Summary
- **Technology**: OpenAI GPT-3.5 (with fallback)
- **Features**: 
  - Key points extraction
  - Topic identification
  - Study time estimation
  - Difficulty assessment

### 3. AI Chat Assistant
- **Technology**: OpenAI GPT-3.5 (with fallback)
- **Features**:
  - Context-aware responses
  - Transcript-based answers
  - Timestamp references
  - Suggested questions

### 4. Smart Search
- **Technology**: NLP-based search
- **Features**:
  - Semantic search in transcripts
  - Relevance scoring
  - Timestamp navigation

## Usage

### 1. Generate Transcript
```javascript
// Upload audio file or use existing video
const response = await aiAPI.generateTranscript(lectureId, audioFile);
```

### 2. Generate Summary
```javascript
// Requires transcript to be generated first
const response = await aiAPI.generateSummary(lectureId);
```

### 3. Chat with AI
```javascript
const response = await aiAPI.chatWithAI(lectureId, message, chatHistory);
```

### 4. Search Transcript
```javascript
const response = await aiAPI.searchTranscript(lectureId, query);
```

## Configuration

### Environment Variables
```env
# Optional: OpenAI API key for enhanced features
OPENAI_API_KEY=your-api-key-here

# Python executable path (if not in PATH)
PYTHON_PATH=/usr/bin/python3
```

### Performance Tuning
- **Whisper Model**: Default is 'base' (balance of speed/accuracy)
- **Available Models**: tiny, base, small, medium, large
- **Change Model**: Edit `whisper_transcribe.py` line 15

## Troubleshooting

### Common Issues

1. **Python not found**
   - Ensure Python is in system PATH
   - Try `python3` instead of `python`

2. **Whisper installation fails**
   - Install PyTorch first: `pip install torch torchaudio`
   - Use conda: `conda install pytorch torchaudio -c pytorch`

3. **FFmpeg not found**
   - Install FFmpeg and add to PATH
   - Restart terminal/IDE after installation

4. **Transcription timeout**
   - Increase timeout in `whisperService.js`
   - Use smaller Whisper model for faster processing

5. **OpenAI API errors**
   - Check API key validity
   - Verify account has credits
   - System falls back to rule-based responses

### Performance Tips

1. **Audio Quality**: Higher quality audio = better transcription
2. **File Size**: Compress large files before upload
3. **Language**: Specify language for better accuracy
4. **Model Selection**: Use appropriate Whisper model for your needs

## API Endpoints

### Transcript Generation
```
POST /api/ai/transcript/:lectureId
Content-Type: multipart/form-data
Body: audio file (optional)
```

### Summary Generation
```
POST /api/ai/summary/:lectureId
```

### AI Chat
```
POST /api/ai/chat/:lectureId
Body: { message, chatHistory }
```

### Smart Search
```
POST /api/ai/search/:lectureId
Body: { query }
```

### Status Check
```
GET /api/ai/transcript/:lectureId/status
```

## Development

### Testing AI Features
1. Upload a lecture video/audio
2. Generate transcript using the UI
3. Test summary generation
4. Try AI chat functionality
5. Use smart search feature

### Extending Features
- Modify Python scripts in `server/python/`
- Add new AI endpoints in `server/routes/ai.js`
- Update frontend components as needed

## Production Deployment

### Docker Setup
```dockerfile
# Add to Dockerfile
RUN apt-get update && apt-get install -y python3 python3-pip ffmpeg
COPY server/python/requirements.txt /app/python/
RUN pip3 install -r /app/python/requirements.txt
```

### Environment Setup
- Set OPENAI_API_KEY in production
- Ensure Python and FFmpeg are available
- Configure appropriate timeouts for large files