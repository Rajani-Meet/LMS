import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { assignmentsAPI, submissionsAPI } from '../services/api';
import PlagiarismChecker from '../components/UI/PlagiarismChecker';

const Assignments = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    maxPoints: 100
  });
  const [submissionData, setSubmissionData] = useState({
    content: '',
    attachments: []
  });
  const [plagiarismResults, setPlagiarismResults] = useState(null);
  const [checkingPlagiarism, setCheckingPlagiarism] = useState(false);

  useEffect(() => {
    fetchAssignments();
    if (user?.role === 'student') {
      fetchMySubmissions();
    }
  }, [courseId, user]);

  const fetchAssignments = async () => {
    try {
      const response = await assignmentsAPI.getByCourse(courseId);
      setAssignments(response.assignments);
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMySubmissions = async () => {
    try {
      const response = await submissionsAPI.getMy();
      setSubmissions(response.submissions);
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedAssignment) {
        await assignmentsAPI.update(selectedAssignment._id, formData);
      } else {
        await assignmentsAPI.create({ ...formData, course: courseId });
      }
      setShowModal(false);
      setFormData({ title: '', description: '', dueDate: '', maxPoints: 100 });
      setSelectedAssignment(null);
      fetchAssignments();
    } catch (error) {
      console.error('Failed to save assignment:', error);
    }
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    try {
      // Auto-check plagiarism before submission
      if (submissionData.content) {
        await handlePlagiarismCheck();
      }
      
      await submissionsAPI.submit({
        assignment: selectedAssignment._id,
        content: submissionData.content,
        attachments: submissionData.attachments,
        plagiarismResults
      });
      setShowSubmissionModal(false);
      setSubmissionData({ content: '', attachments: [] });
      setPlagiarismResults(null);
      setSelectedAssignment(null);
      fetchMySubmissions();
    } catch (error) {
      console.error('Failed to submit assignment:', error);
    }
  };

  const handlePlagiarismCheck = async () => {
    if (!submissionData.content.trim()) return;
    
    setCheckingPlagiarism(true);
    try {
      // Simulate plagiarism check
      const mockResults = {
        overallScore: Math.floor(Math.random() * 30),
        totalSources: Math.floor(Math.random() * 5),
        matchedWords: Math.floor(Math.random() * 100),
        uniquePercentage: 100 - Math.floor(Math.random() * 30),
        matches: [
          {
            similarity: Math.floor(Math.random() * 25),
            words: Math.floor(Math.random() * 50),
            source: 'Academic Source',
            originalText: submissionData.content.substring(0, 100),
            matchedText: 'Similar content found in academic database',
            url: 'https://example.com/source'
          }
        ]
      };
      setPlagiarismResults(mockResults);
    } catch (error) {
      console.error('Plagiarism check failed:', error);
    } finally {
      setCheckingPlagiarism(false);
    }
  };

  const getSubmissionStatus = (assignmentId) => {
    const submission = submissions.find(s => s.assignment._id === assignmentId);
    if (!submission) return 'Not Submitted';
    if (submission.grade !== undefined) return `Graded: ${submission.grade}/100`;
    return 'Submitted';
  };

  const isSubmitted = (assignmentId) => {
    return submissions.some(s => s.assignment._id === assignmentId);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
        {(user?.role === 'instructor' || user?.role === 'admin') && (
          <Button onClick={() => setShowModal(true)}>
            Create Assignment
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {assignments.map((assignment) => (
          <Card key={assignment._id} className="p-6">
            <h3 className="text-xl font-semibold mb-2">{assignment.title}</h3>
            <p className="text-gray-600 mb-4">{assignment.description}</p>
            
            <div className="space-y-2 mb-4">
              <p className="text-sm text-gray-500">
                Due: {new Date(assignment.dueDate).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-500">
                Max Points: {assignment.maxPoints}
              </p>
              {user?.role === 'student' && (
                <p className="text-sm font-medium">
                  Status: {getSubmissionStatus(assignment._id)}
                </p>
              )}
            </div>

            <div className="flex space-x-2">
              {user?.role === 'student' && !isSubmitted(assignment._id) && (
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedAssignment(assignment);
                    setShowSubmissionModal(true);
                  }}
                >
                  Submit
                </Button>
              )}
              
              {(user?.role === 'instructor' || user?.role === 'admin') && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSelectedAssignment(assignment);
                      setFormData({
                        title: assignment.title,
                        description: assignment.description,
                        dueDate: assignment.dueDate.split('T')[0],
                        maxPoints: assignment.maxPoints
                      });
                      setShowModal(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to delete this assignment?')) {
                        try {
                          await assignmentsAPI.delete(assignment._id);
                          fetchAssignments();
                        } catch (error) {
                          console.error('Failed to delete assignment:', error);
                        }
                      }
                    }}
                  >
                    Delete
                  </Button>
                </>
              )}
            </div>
          </Card>
        ))}
      </div>

      {assignments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No assignments available yet.</p>
        </div>
      )}

      {/* Assignment Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedAssignment(null);
          setFormData({ title: '', description: '', dueDate: '', maxPoints: 100 });
        }}
        title={selectedAssignment ? 'Edit Assignment' : 'Create New Assignment'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Points
            </label>
            <input
              type="number"
              value={formData.maxPoints}
              onChange={(e) => setFormData({ ...formData, maxPoints: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {selectedAssignment ? 'Update' : 'Create'} Assignment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Submission Modal */}
      <Modal
        isOpen={showSubmissionModal}
        onClose={() => {
          setShowSubmissionModal(false);
          setSelectedAssignment(null);
          setSubmissionData({ content: '', attachments: [] });
        }}
        title="Submit Assignment"
      >
        <form onSubmit={handleSubmitAssignment} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Submission Content
            </label>
            <textarea
              value={submissionData.content}
              onChange={(e) => setSubmissionData({ ...submissionData, content: e.target.value })}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your assignment submission here..."
              required
            />
          </div>

          {/* Plagiarism Checker */}
          <PlagiarismChecker
            content={submissionData.content}
            onCheck={handlePlagiarismCheck}
            results={plagiarismResults}
            loading={checkingPlagiarism}
          />

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowSubmissionModal(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={plagiarismResults && plagiarismResults.overallScore > 30}
            >
              Submit Assignment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Assignments;