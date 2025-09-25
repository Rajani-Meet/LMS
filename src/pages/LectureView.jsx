import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { lecturesAPI, aiAPI } from '../services/api';
import { Play, Pause, Volume2, Maximize, MessageCircle, FileText, Search, Sparkles } from 'lucide-react';

const LectureView = () => {
  const { lectureId } = useParams();
  const { user } = useAuth();
  const videoRef = useRef(null);
  const [lecture, setLecture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    fetchLecture();
  }, [lectureId]);

  useEffect(() => {
    if (lecture) {
      generateTranscript();
      generateSummary();
    }
  }, [lecture]);

  const fetchLecture = async () => {
    try {
      const response = await lecturesAPI.getById(lectureId);
      setLecture(response.lecture);
    } catch (error) {
      console.error('Failed to fetch lecture:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateTranscript = async () => {
    try {
      setLoading(true);
      const response = await aiAPI.generateTranscript(lectureId);
      setTranscript(response.transcript.text);
    } catch (error) {
      console.error('Failed to generate transcript:', error);
      setTranscript('Failed to generate transcript. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateSummary = async () => {
    try {
      setLoading(true);
      const response = await aiAPI.generateSummary(lectureId);
      const summary = response.summary;
      
      const formattedSummary = `
        📚 **${summary.title}**
        
        **Key Points:**
        ${summary.keyPoints.map(point => `• ${point}`).join('\n        ')}
        
        **Main Topics:**
        ${summary.mainTopics.map(topic => `• ${topic.topic}: ${topic.description}`).join('\n        ')}
        
        **Study Information:**
        • Estimated Study Time: ${summary.studyTime}
        • Difficulty Level: ${summary.difficulty}
        
        **Prerequisites:**
        ${summary.prerequisites.map(req => `• ${req}`).join('\n        ')}
        
        **Next Steps:**
        ${summary.nextSteps.map(step => `• ${step}`).join('\n        ')}
      `;
      
      setSummary(formattedSummary);
    } catch (error) {
      console.error('Failed to generate summary:', error);
      setSummary('Failed to generate summary. Please ensure transcript is available first.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (time) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (newVolume) => {
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      user: user.name,
      message: newMessage,
      timestamp: new Date(),
      isUser: true
    };

    setChatMessages([...chatMessages, userMessage]);

    // Get AI response
    try {
      const response = await aiAPI.chatWithAI(lectureId, newMessage, chatMessages);
      const aiResponse = {
        id: Date.now() + 1,
        user: 'AI Assistant',
        message: response.response.message,
        timestamp: new Date(),
        isUser: false,
        relatedTimestamps: response.response.relatedTimestamps
      };
      setChatMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      const errorResponse = {
        id: Date.now() + 1,
        user: 'AI Assistant',
        message: 'Sorry, I encountered an error. Please make sure the transcript is available and try again.',
        timestamp: new Date(),
        isUser: false
      };
      setChatMessages(prev => [...prev, errorResponse]);
    }

    setNewMessage('');
  };

  const handleSmartSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const response = await aiAPI.searchTranscript(lectureId, searchQuery);
      const results = response.results.map(result => ({
        timestamp: result.timestamp,
        text: result.text,
        relevance: Math.round(result.relevance * 20), // Convert to percentage
        context: result.context
      }));
      setSearchResults(results);
    } catch (error) {
      console.error('Failed to search transcript:', error);
      setSearchResults([]);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <LoadingSpinner />;

  if (!lecture) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Lecture not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Video Player */}
      <Card className="p-0 overflow-hidden">
        <div className="relative bg-black">
          <video
            ref={videoRef}
            className="w-full h-96 object-contain"
            src={lecture.videoUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
          
          {/* Video Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePlayPause}
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>

              <div className="flex-1">
                <input
                  type="range"
                  min="0"
                  max={duration}
                  value={currentTime}
                  onChange={(e) => handleSeek(parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-white mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Volume2 className="h-4 w-4 text-white" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-16 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => videoRef.current?.requestFullscreen()}
                className="text-white hover:bg-white/20"
              >
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Lecture Info */}
      <Card className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{lecture.title}</h1>
        <p className="text-gray-600 mb-4">{lecture.description}</p>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span>Instructor: {lecture.instructor?.name}</span>
          <span>Duration: {lecture.duration} minutes</span>
          <span>Course: {lecture.course?.title}</span>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <Button
          onClick={() => setShowTranscript(!showTranscript)}
          variant={showTranscript ? 'primary' : 'secondary'}
          className="flex items-center space-x-2"
        >
          <FileText className="h-4 w-4" />
          <span>Transcript</span>
        </Button>

        <Button
          onClick={() => setShowSummary(!showSummary)}
          variant={showSummary ? 'primary' : 'secondary'}
          className="flex items-center space-x-2"
        >
          <Sparkles className="h-4 w-4" />
          <span>AI Summary</span>
        </Button>

        <Button
          onClick={() => setShowChat(!showChat)}
          variant={showChat ? 'primary' : 'secondary'}
          className="flex items-center space-x-2"
        >
          <MessageCircle className="h-4 w-4" />
          <span>AI Chat</span>
        </Button>

        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search in lecture..."
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button onClick={handleSmartSearch} className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <span>Smart Search</span>
          </Button>
        </div>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Search Results</h3>
          <div className="space-y-3">
            {searchResults.map((result, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                onClick={() => handleSeek(result.timestamp)}
              >
                <div>
                  <p className="text-sm font-medium">{result.text}</p>
                  <p className="text-xs text-gray-500">Relevance: {result.relevance}%</p>
                </div>
                <span className="text-sm text-blue-600 font-medium">
                  {formatTime(result.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transcript */}
        {showTranscript && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Auto-Generated Transcript</h3>
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-gray-700">{transcript}</pre>
            </div>
          </Card>
        )}

        {/* AI Summary */}
        {showSummary && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">AI-Generated Summary</h3>
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
              <div className="prose prose-sm max-w-none">
                {summary.split('\n').map((line, index) => (
                  <p key={index} className="mb-2">{line}</p>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* AI Chat */}
        {showChat && (
          <Card className="p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">AI Chat Assistant</h3>
            <div className="border border-gray-200 rounded-lg">
              <div className="h-64 overflow-y-auto p-4 space-y-3">
                {chatMessages.length === 0 ? (
                  <p className="text-gray-500 text-center">Ask me anything about this lecture!</p>
                ) : (
                  chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          msg.isUser
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <p className="text-xs opacity-75 mt-1">
                          {msg.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Ask about the lecture content..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button type="submit">Send</Button>
                </div>
              </form>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LectureView;