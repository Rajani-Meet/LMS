import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { lecturesAPI } from '../services/api';

const Lectures = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    duration: ''
  });

  useEffect(() => {
    fetchLectures();
  }, [courseId]);

  const fetchLectures = async () => {
    try {
      const response = await lecturesAPI.getByCourse(courseId);
      setLectures(response.lectures);
    } catch (error) {
      console.error('Failed to fetch lectures:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedLecture) {
        await lecturesAPI.update(selectedLecture._id, formData);
      } else {
        await lecturesAPI.create({ ...formData, course: courseId });
      }
      setShowModal(false);
      setFormData({ title: '', description: '', videoUrl: '', duration: '' });
      setSelectedLecture(null);
      fetchLectures();
    } catch (error) {
      console.error('Failed to save lecture:', error);
    }
  };

  const handleEdit = (lecture) => {
    setSelectedLecture(lecture);
    setFormData({
      title: lecture.title,
      description: lecture.description,
      videoUrl: lecture.videoUrl || '',
      duration: lecture.duration || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (lectureId) => {
    if (window.confirm('Are you sure you want to delete this lecture?')) {
      try {
        await lecturesAPI.delete(lectureId);
        fetchLectures();
      } catch (error) {
        console.error('Failed to delete lecture:', error);
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Lectures</h1>
        {(user?.role === 'instructor' || user?.role === 'admin') && (
          <Button onClick={() => setShowModal(true)}>
            Add Lecture
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {lectures.map((lecture) => (
          <Card key={lecture._id} className="p-6">
            <h3 className="text-xl font-semibold mb-2">{lecture.title}</h3>
            <p className="text-gray-600 mb-4">{lecture.description}</p>
            
            {lecture.videoUrl && (
              <div className="mb-4">
                <video 
                  controls 
                  className="w-full rounded-lg"
                  src={lecture.videoUrl}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}

            {lecture.duration && (
              <p className="text-sm text-gray-500 mb-4">
                Duration: {lecture.duration} minutes
              </p>
            )}

            {(user?.role === 'instructor' || user?.role === 'admin') && (
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleEdit(lecture)}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(lecture._id)}
                >
                  Delete
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>

      {lectures.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No lectures available yet.</p>
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedLecture(null);
          setFormData({ title: '', description: '', videoUrl: '', duration: '' });
        }}
        title={selectedLecture ? 'Edit Lecture' : 'Add New Lecture'}
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
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Video URL
            </label>
            <input
              type="url"
              value={formData.videoUrl}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              {selectedLecture ? 'Update' : 'Create'} Lecture
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Lectures;