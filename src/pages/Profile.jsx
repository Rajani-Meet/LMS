import React, { useState, useEffect } from 'react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import ProgressTracker from '../components/UI/ProgressTracker';
import { useAuth } from '../context/AuthContext';
import { usersAPI, analyticsAPI } from '../services/api';
import { User, Mail, Calendar, Award, BookOpen, TrendingUp } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: ''
  });

  useEffect(() => {
    fetchProfile();
    fetchProgress();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await usersAPI.getById(user.id);
      setProfile(response.user);
      setFormData({
        name: response.user.name,
        email: response.user.email,
        bio: response.user.bio || ''
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const fetchProgress = async () => {
    try {
      const response = await analyticsAPI.getUserProgress(user.id);
      setProgress(response.progress);
    } catch (error) {
      console.error('Failed to fetch progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await usersAPI.update(user.id, formData);
      setProfile({ ...profile, ...formData });
      setEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <Button
          onClick={() => editing ? handleSave() : setEditing(true)}
          variant={editing ? 'primary' : 'secondary'}
        >
          {editing ? 'Save Changes' : 'Edit Profile'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <div className="text-center">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-12 w-12 text-blue-600" />
              </div>
              
              {editing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-semibold text-gray-900">{profile?.name}</h2>
                  <p className="text-gray-600 flex items-center justify-center mt-1">
                    <Mail className="h-4 w-4 mr-1" />
                    {profile?.email}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center justify-center mt-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    Joined {new Date(profile?.createdAt).toLocaleDateString()}
                  </p>
                  {profile?.bio && (
                    <p className="text-sm text-gray-700 mt-3 text-center">{profile.bio}</p>
                  )}
                </>
              )}

              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 capitalize">
                  {user?.role}
                </p>
                <p className="text-xs text-gray-500">Account Type</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Progress & Stats */}
        <div className="lg:col-span-2 space-y-6">
          {user?.role === 'student' && progress && (
            <ProgressTracker progress={progress} type="student" />
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{progress?.coursesEnrolled || 0}</p>
              <p className="text-sm text-gray-600">Courses</p>
            </Card>
            
            <Card className="p-4 text-center">
              <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{progress?.coursesCompleted || 0}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </Card>
            
            <Card className="p-4 text-center">
              <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{progress?.averageScore || 0}%</p>
              <p className="text-sm text-gray-600">Avg Score</p>
            </Card>
            
            <Card className="p-4 text-center">
              <Calendar className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{progress?.totalHours || 0}</p>
              <p className="text-sm text-gray-600">Hours</p>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {progress?.recentActivity?.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-xs text-gray-500">{activity.date}</p>
                  </div>
                </div>
              )) || (
                <p className="text-gray-500 text-center py-4">No recent activity</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;