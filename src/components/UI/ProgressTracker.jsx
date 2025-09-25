import React from 'react';
import { CheckCircle, Circle, Clock, Trophy, Target } from 'lucide-react';

const ProgressTracker = ({ progress, type = 'course' }) => {
  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getProgressIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  if (type === 'course') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Course Progress</h3>
          <div className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span className="text-sm font-medium text-gray-600">
              {progress?.completedItems || 0} / {progress?.totalItems || 0}
            </span>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm font-medium text-gray-900">
              {progress?.percentage || 0}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(progress?.percentage || 0)}`}
              style={{ width: `${progress?.percentage || 0}%` }}
            />
          </div>
        </div>

        {/* Progress Breakdown */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {progress?.lecturesCompleted || 0}
              </p>
              <p className="text-sm text-gray-600">Lectures Watched</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {progress?.assignmentsCompleted || 0}
              </p>
              <p className="text-sm text-gray-600">Assignments Done</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">
                {progress?.quizzesCompleted || 0}
              </p>
              <p className="text-sm text-gray-600">Quizzes Taken</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">
                {progress?.averageScore || 0}%
              </p>
              <p className="text-sm text-gray-600">Average Score</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        {progress?.recentActivity && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Activity</h4>
            <div className="space-y-2">
              {progress.recentActivity.slice(0, 3).map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 text-sm">
                  {getProgressIcon(activity.status)}
                  <span className="flex-1">{activity.title}</span>
                  <span className="text-gray-500">{activity.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (type === 'student') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Student Progress</h3>
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium text-gray-600">
              {progress?.coursesEnrolled || 0} Courses
            </span>
          </div>
        </div>

        {/* Student Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">
              {progress?.coursesCompleted || 0}
            </p>
            <p className="text-sm text-blue-700">Courses Completed</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
            <p className="text-3xl font-bold text-green-600">
              {progress?.totalScore || 0}
            </p>
            <p className="text-sm text-green-700">Total Points</p>
          </div>
        </div>

        {/* Course Progress List */}
        {progress?.courses && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Course Progress</h4>
            {progress.courses.map((course, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">
                    {course.title}
                  </span>
                  <span className="text-sm text-gray-600">
                    {course.progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getProgressColor(course.progress)}`}
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{course.completedLessons} / {course.totalLessons} lessons</span>
                  <span>Due: {course.dueDate}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Achievements */}
        {progress?.achievements && progress.achievements.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Achievements</h4>
            <div className="flex flex-wrap gap-2">
              {progress.achievements.map((achievement, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 bg-yellow-50 border border-yellow-200 rounded-full px-3 py-1"
                >
                  <Trophy className="h-4 w-4 text-yellow-600" />
                  <span className="text-xs font-medium text-yellow-800">
                    {achievement.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default ProgressTracker;