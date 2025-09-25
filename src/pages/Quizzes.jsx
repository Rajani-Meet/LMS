import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { quizzesAPI } from '../services/api';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

const Quizzes = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    timeLimit: 30,
    questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }]
  });

  useEffect(() => {
    fetchQuizzes();
  }, [courseId]);

  useEffect(() => {
    let timer;
    if (quizStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [quizStarted, timeLeft]);

  const fetchQuizzes = async () => {
    try {
      const response = await quizzesAPI.getByCourse(courseId);
      setQuizzes(response.quizzes);
    } catch (error) {
      console.error('Failed to fetch quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    try {
      await quizzesAPI.create({ ...formData, course: courseId });
      setShowModal(false);
      setFormData({
        title: '',
        description: '',
        timeLimit: 30,
        questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }]
      });
      fetchQuizzes();
    } catch (error) {
      console.error('Failed to create quiz:', error);
    }
  };

  const handleStartQuiz = async (quiz) => {
    try {
      const response = await quizzesAPI.startAttempt(quiz._id);
      setSelectedQuiz(quiz);
      setTimeLeft(quiz.timeLimit * 60);
      setQuizStarted(true);
      setCurrentQuestion(0);
      setAnswers({});
      setShowQuizModal(true);
    } catch (error) {
      console.error('Failed to start quiz:', error);
    }
  };

  const handleSubmitQuiz = async () => {
    try {
      await quizzesAPI.submitAttempt(selectedQuiz._id, answers);
      setShowQuizModal(false);
      setQuizStarted(false);
      setSelectedQuiz(null);
      fetchQuizzes();
    } catch (error) {
      console.error('Failed to submit quiz:', error);
    }
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [...formData.questions, { question: '', options: ['', '', '', ''], correctAnswer: 0 }]
    });
  };

  const updateQuestion = (index, field, value) => {
    const questions = [...formData.questions];
    questions[index] = { ...questions[index], [field]: value };
    setFormData({ ...formData, questions });
  };

  const updateOption = (qIndex, oIndex, value) => {
    const questions = [...formData.questions];
    questions[qIndex].options[oIndex] = value;
    setFormData({ ...formData, questions });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Quizzes</h1>
        {(user?.role === 'instructor' || user?.role === 'admin') && (
          <Button onClick={() => setShowModal(true)}>
            Create Quiz
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {quizzes.map((quiz) => (
          <Card key={quiz._id} className="p-6">
            <h3 className="text-xl font-semibold mb-2">{quiz.title}</h3>
            <p className="text-gray-600 mb-4">{quiz.description}</p>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                {quiz.timeLimit} minutes
              </div>
              <p className="text-sm text-gray-500">
                {quiz.questions?.length || 0} questions
              </p>
              {quiz.attempts && quiz.attempts.length > 0 && (
                <div className="flex items-center text-sm">
                  {quiz.attempts[0].score >= 70 ? (
                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  Score: {quiz.attempts[0].score}%
                </div>
              )}
            </div>

            {user?.role === 'student' && (
              <Button
                onClick={() => handleStartQuiz(quiz)}
                disabled={quiz.attempts && quiz.attempts.length > 0}
                className="w-full"
              >
                {quiz.attempts && quiz.attempts.length > 0 ? 'Completed' : 'Start Quiz'}
              </Button>
            )}
          </Card>
        ))}
      </div>

      {/* Create Quiz Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Create New Quiz"
        size="large"
      >
        <form onSubmit={handleCreateQuiz} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Limit (minutes)
              </label>
              <input
                type="number"
                value={formData.timeLimit}
                onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Questions</h3>
              <Button type="button" onClick={addQuestion} size="sm">
                Add Question
              </Button>
            </div>

            {formData.questions.map((question, qIndex) => (
              <div key={qIndex} className="border border-gray-200 rounded-lg p-4">
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question {qIndex + 1}
                  </label>
                  <input
                    type="text"
                    value={question.question}
                    onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={`correct-${qIndex}`}
                        checked={question.correctAnswer === oIndex}
                        onChange={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                        className="text-blue-600"
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                        placeholder={`Option ${oIndex + 1}`}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Quiz</Button>
          </div>
        </form>
      </Modal>

      {/* Take Quiz Modal */}
      <Modal
        isOpen={showQuizModal}
        onClose={() => {}}
        title={`${selectedQuiz?.title} - Question ${currentQuestion + 1}`}
        size="large"
      >
        {selectedQuiz && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Question {currentQuestion + 1} of {selectedQuiz.questions?.length}
              </div>
              <div className="flex items-center text-sm font-medium text-red-600">
                <Clock className="h-4 w-4 mr-1" />
                {formatTime(timeLeft)}
              </div>
            </div>

            {selectedQuiz.questions && selectedQuiz.questions[currentQuestion] && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  {selectedQuiz.questions[currentQuestion].question}
                </h3>

                <div className="space-y-2">
                  {selectedQuiz.questions[currentQuestion].options.map((option, index) => (
                    <label key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name={`question-${currentQuestion}`}
                        value={index}
                        checked={answers[currentQuestion] === index}
                        onChange={(e) => setAnswers({ ...answers, [currentQuestion]: parseInt(e.target.value) })}
                        className="text-blue-600"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button
                variant="secondary"
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>

              {currentQuestion === (selectedQuiz.questions?.length - 1) ? (
                <Button onClick={handleSubmitQuiz}>
                  Submit Quiz
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentQuestion(currentQuestion + 1)}
                  disabled={currentQuestion >= (selectedQuiz.questions?.length - 1)}
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Quizzes;