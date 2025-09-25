#!/usr/bin/env python3
import whisper
import sys
import json
import os
from datetime import timedelta

def format_timestamp(seconds):
    """Convert seconds to HH:MM:SS format"""
    td = timedelta(seconds=seconds)
    hours, remainder = divmod(td.total_seconds(), 3600)
    minutes, seconds = divmod(remainder, 60)
    return f"{int(hours):02d}:{int(minutes):02d}:{int(seconds):02d}"

def transcribe_audio(audio_path):
    try:
        # Load Whisper model (base model for balance of speed and accuracy)
        model = whisper.load_model("base")
        
        # Transcribe audio with timestamps
        result = model.transcribe(
            audio_path,
            word_timestamps=True,
            verbose=False
        )
        
        # Extract segments with timestamps
        segments = []
        for segment in result["segments"]:
            segments.append({
                "start": segment["start"],
                "end": segment["end"],
                "text": segment["text"].strip(),
                "timestamp_formatted": format_timestamp(segment["start"])
            })
        
        # Create detailed transcript
        transcript_data = {
            "text": result["text"],
            "language": result["language"],
            "segments": segments,
            "duration": result.get("duration", 0),
            "confidence": 0.95,  # Whisper doesn't provide confidence, using default
            "timestamps": [
                {
                    "time": int(segment["start"]),
                    "text": segment["text"].strip(),
                    "formatted_time": format_timestamp(segment["start"])
                }
                for segment in result["segments"]
            ]
        }
        
        return {
            "success": True,
            "transcript": transcript_data
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({"success": False, "error": "Audio file path required"}))
        sys.exit(1)
    
    audio_path = sys.argv[1]
    
    if not os.path.exists(audio_path):
        print(json.dumps({"success": False, "error": "Audio file not found"}))
        sys.exit(1)
    
    result = transcribe_audio(audio_path)
    print(json.dumps(result))