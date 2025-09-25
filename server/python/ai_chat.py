#!/usr/bin/env python3
import openai
import sys
import json
import os
import re
from datetime import datetime

# Set OpenAI API key from environment variable
openai.api_key = os.getenv('OPENAI_API_KEY')

def generate_chat_response(transcript, user_message, chat_history=[]):
    try:
        if not openai.api_key:
            return generate_fallback_response(transcript, user_message)
        
        # Build conversation context
        messages = [
            {
                "role": "system",
                "content": f"""You are an AI teaching assistant for a lecture-based learning system. 
                You have access to the following lecture transcript:
                
                {transcript[:2000]}...
                
                Your role is to:
                1. Answer questions about the lecture content
                2. Provide clarifications and explanations
                3. Help students understand complex concepts
                4. Reference specific parts of the transcript when relevant
                5. Suggest related topics for further study
                
                Always be helpful, educational, and reference the lecture content when possible."""
            }
        ]
        
        # Add chat history
        for msg in chat_history[-5:]:  # Last 5 messages for context
            messages.append({
                "role": "user" if msg.get("isUser") else "assistant",
                "content": msg.get("message", "")
            })
        
        # Add current user message
        messages.append({
            "role": "user",
            "content": user_message
        })
        
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=messages,
            max_tokens=500,
            temperature=0.7
        )
        
        ai_response = response.choices[0].message.content
        
        # Extract relevant timestamps if mentioned
        timestamps = extract_timestamps_from_response(ai_response, transcript)
        
        return {
            "success": True,
            "response": {
                "message": ai_response,
                "timestamp": datetime.now().isoformat(),
                "relatedTimestamps": timestamps,
                "suggestedQuestions": generate_suggested_questions(transcript, user_message),
                "aiGenerated": True
            }
        }
        
    except Exception as e:
        return generate_fallback_response(transcript, user_message)

def generate_fallback_response(transcript, user_message):
    """Generate response without OpenAI API using rule-based approach"""
    user_msg_lower = user_message.lower()
    
    # Rule-based responses
    if any(word in user_msg_lower for word in ['summary', 'summarize', 'main points']):
        response = "Based on the lecture transcript, the main points covered include the fundamental concepts, practical applications, and key takeaways. The lecture provides a comprehensive overview of the subject matter with detailed explanations and examples."
    
    elif any(word in user_msg_lower for word in ['example', 'examples', 'practical']):
        response = "The lecture includes several practical examples to illustrate the concepts. These examples help bridge the gap between theory and real-world application, making the content more relatable and easier to understand."
    
    elif any(word in user_msg_lower for word in ['explain', 'what is', 'define']):
        # Try to find relevant content in transcript
        relevant_content = find_relevant_content(transcript, user_message)
        response = f"Based on the lecture content: {relevant_content}. This concept is explained in detail during the lecture with supporting examples and context."
    
    elif any(word in user_msg_lower for word in ['time', 'when', 'timestamp']):
        response = "I can help you find specific topics in the lecture. The content is organized chronologically, and I can point you to relevant sections based on your questions."
    
    elif any(word in user_msg_lower for word in ['homework', 'assignment', 'study']):
        response = "For studying this lecture, I recommend reviewing the key concepts, practicing with the examples provided, and ensuring you understand the fundamental principles before moving to advanced topics."
    
    else:
        response = f"That's an interesting question about '{user_message}'. Based on the lecture content, this topic relates to the main concepts discussed. The lecture provides comprehensive coverage of the subject matter. Could you be more specific about which aspect you'd like me to explain?"
    
    return {
        "success": True,
        "response": {
            "message": response,
            "timestamp": datetime.now().isoformat(),
            "relatedTimestamps": find_related_timestamps(transcript, user_message),
            "suggestedQuestions": [
                "Can you explain the main concepts?",
                "What are the key takeaways?",
                "Are there practical examples?",
                "How should I study this material?"
            ],
            "aiGenerated": False
        }
    }

def find_relevant_content(transcript, query):
    """Find relevant content in transcript based on query"""
    sentences = transcript.split('.')
    query_words = query.lower().split()
    
    best_match = ""
    max_score = 0
    
    for sentence in sentences:
        score = sum(1 for word in query_words if word in sentence.lower())
        if score > max_score and len(sentence.strip()) > 20:
            max_score = score
            best_match = sentence.strip()
    
    return best_match[:200] + "..." if len(best_match) > 200 else best_match

def find_related_timestamps(transcript, query):
    """Find timestamps related to the query"""
    # Simple pattern matching for timestamps
    timestamp_pattern = r'\[(\d{2}):(\d{2}):(\d{2})\]'
    matches = re.finditer(timestamp_pattern, transcript)
    
    related = []
    query_words = query.lower().split()
    
    for match in matches:
        # Get surrounding text
        start = max(0, match.start() - 100)
        end = min(len(transcript), match.end() + 100)
        context = transcript[start:end].lower()
        
        # Check if query words appear in context
        if any(word in context for word in query_words):
            hours, minutes, seconds = match.groups()
            timestamp_seconds = int(hours) * 3600 + int(minutes) * 60 + int(seconds)
            related.append({
                "timestamp": timestamp_seconds,
                "formatted_time": f"{hours}:{minutes}:{seconds}",
                "context": transcript[match.end():match.end()+100].strip()
            })
    
    return related[:3]  # Return top 3 matches

def extract_timestamps_from_response(response, transcript):
    """Extract timestamps mentioned in AI response"""
    # Look for time references in the response
    time_pattern = r'(\d{1,2}):(\d{2})'
    matches = re.finditer(time_pattern, response)
    
    timestamps = []
    for match in matches:
        minutes, seconds = match.groups()
        timestamp_seconds = int(minutes) * 60 + int(seconds)
        timestamps.append({
            "timestamp": timestamp_seconds,
            "formatted_time": f"{minutes}:{seconds}",
            "context": "Referenced in AI response"
        })
    
    return timestamps

def generate_suggested_questions(transcript, current_question):
    """Generate suggested follow-up questions"""
    base_questions = [
        "Can you explain this concept in simpler terms?",
        "Are there any practical examples?",
        "What are the key takeaways?",
        "How does this relate to other topics?",
        "What should I focus on for studying?"
    ]
    
    # Customize based on current question
    if 'example' in current_question.lower():
        base_questions.insert(0, "Can you provide more examples?")
    elif 'explain' in current_question.lower():
        base_questions.insert(0, "Can you elaborate on this further?")
    
    return base_questions[:4]

if __name__ == "__main__":
    try:
        input_data = json.loads(sys.stdin.read())
        transcript = input_data.get("transcript", "")
        user_message = input_data.get("userMessage", "")
        chat_history = input_data.get("chatHistory", [])
        
        if not transcript or not user_message:
            print(json.dumps({"success": False, "error": "Transcript and user message required"}))
            sys.exit(1)
        
        result = generate_chat_response(transcript, user_message, chat_history)
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))