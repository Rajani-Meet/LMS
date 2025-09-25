#!/usr/bin/env python3
import openai
import sys
import json
import os
from datetime import datetime

# Set OpenAI API key from environment variable
openai.api_key = os.getenv('OPENAI_API_KEY')

def generate_summary(transcript_text):
    try:
        if not openai.api_key:
            # Fallback to rule-based summary if no API key
            return generate_fallback_summary(transcript_text)
        
        # Use OpenAI GPT for intelligent summarization
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": """You are an AI assistant that creates comprehensive educational summaries. 
                    Analyze the lecture transcript and provide a structured summary with:
                    1. Key learning objectives
                    2. Main topics covered
                    3. Important concepts and definitions
                    4. Practical applications
                    5. Study recommendations
                    Format the response as JSON."""
                },
                {
                    "role": "user",
                    "content": f"Please create a comprehensive summary of this lecture transcript:\n\n{transcript_text}"
                }
            ],
            max_tokens=1000,
            temperature=0.3
        )
        
        summary_text = response.choices[0].message.content
        
        # Try to parse as JSON, fallback to structured text
        try:
            summary_data = json.loads(summary_text)
        except:
            summary_data = parse_summary_text(summary_text)
        
        return {
            "success": True,
            "summary": {
                "title": f"AI-Generated Summary",
                "keyPoints": summary_data.get("key_points", extract_key_points(transcript_text)),
                "mainTopics": summary_data.get("main_topics", extract_main_topics(transcript_text)),
                "studyTime": estimate_study_time(transcript_text),
                "difficulty": assess_difficulty(transcript_text),
                "prerequisites": summary_data.get("prerequisites", ["Basic understanding of the subject"]),
                "nextSteps": summary_data.get("next_steps", [
                    "Review lecture materials",
                    "Complete practice exercises",
                    "Prepare for assignments"
                ]),
                "generatedAt": datetime.now().isoformat(),
                "aiGenerated": True
            }
        }
        
    except Exception as e:
        return generate_fallback_summary(transcript_text)

def generate_fallback_summary(transcript_text):
    """Generate summary without OpenAI API"""
    words = transcript_text.split()
    word_count = len(words)
    
    # Extract key sentences (simple approach)
    sentences = transcript_text.split('.')
    key_sentences = [s.strip() for s in sentences if len(s.strip()) > 50][:5]
    
    return {
        "success": True,
        "summary": {
            "title": "Lecture Summary",
            "keyPoints": key_sentences,
            "mainTopics": extract_main_topics(transcript_text),
            "studyTime": estimate_study_time(transcript_text),
            "difficulty": assess_difficulty(transcript_text),
            "prerequisites": ["Basic understanding of the subject"],
            "nextSteps": [
                "Review lecture materials and notes",
                "Complete practice exercises",
                "Prepare for upcoming assignments"
            ],
            "generatedAt": datetime.now().isoformat(),
            "aiGenerated": False,
            "wordCount": word_count
        }
    }

def extract_key_points(text):
    """Extract key points using simple NLP"""
    sentences = text.split('.')
    key_sentences = []
    
    keywords = ['important', 'key', 'main', 'fundamental', 'essential', 'critical']
    
    for sentence in sentences:
        if any(keyword in sentence.lower() for keyword in keywords):
            key_sentences.append(sentence.strip())
    
    return key_sentences[:5] if key_sentences else sentences[:3]

def extract_main_topics(text):
    """Extract main topics from transcript"""
    # Simple topic extraction based on common patterns
    topics = []
    sentences = text.split('.')
    
    for i, sentence in enumerate(sentences):
        if any(phrase in sentence.lower() for phrase in ['let\'s discuss', 'moving on to', 'next topic', 'now we\'ll cover']):
            topics.append({
                "topic": sentence.strip()[:50] + "...",
                "description": sentence.strip(),
                "timestamp": i * 10  # Approximate timestamp
            })
    
    return topics[:5]

def estimate_study_time(text):
    """Estimate study time based on content length"""
    word_count = len(text.split())
    if word_count < 500:
        return "30-45 minutes"
    elif word_count < 1000:
        return "1-2 hours"
    elif word_count < 2000:
        return "2-3 hours"
    else:
        return "3-4 hours"

def assess_difficulty(text):
    """Assess difficulty level based on content complexity"""
    complex_words = ['algorithm', 'implementation', 'optimization', 'architecture', 'methodology']
    word_count = len(text.split())
    complex_count = sum(1 for word in complex_words if word in text.lower())
    
    if complex_count / word_count > 0.02:
        return "Advanced"
    elif complex_count / word_count > 0.01:
        return "Intermediate"
    else:
        return "Beginner"

def parse_summary_text(text):
    """Parse unstructured summary text into components"""
    return {
        "key_points": [text[:200] + "..."],
        "main_topics": [{"topic": "Main Content", "description": text[:100] + "..."}]
    }

if __name__ == "__main__":
    try:
        input_data = json.loads(sys.stdin.read())
        transcript = input_data.get("transcript", "")
        
        if not transcript:
            print(json.dumps({"success": False, "error": "No transcript provided"}))
            sys.exit(1)
        
        result = generate_summary(transcript)
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))