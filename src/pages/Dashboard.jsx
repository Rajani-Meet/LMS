import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI, coursesAPI } from '../services/api';
import { 
  BookOpen, 
  Users, 
  Award, 
  TrendingUp, 
  Clock,
  Plus,
  Calendar,
  BarChart3
} from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, coursesResponse] = await Promise.all([
        analyticsAPI.getDashboardStats(),
        coursesAPI.getMyCourses()
      ]);
      
      setStats(statsResponse.stats);
      setCourses(coursesResponse.courses.slice(0, 6)); // Show only 6 recent courses
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const renderStudentDashboard = () => (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Enrolled Courses</p>
              <p className="text-2xl font-semibold text-gray-900">{courses.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Award className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">
                {courses.filter(c => c.enrolledStudents?.some(e => e.progress >= 100)).length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">In Progress</p>
              <p className="text-2xl font-semibold text-gray-900">
                {courses.filter(c => c.enrolledStudents?.some(e => e.progress > 0 && e.progress < 100)).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* My Courses */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
          <Link to="/courses">
            <Button variant="outline">View All</Button>
          </Link>
        </div>

        {courses.length === 0 ? (
          <Card className="p-8 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
            <p className="text-gray-500 mb-4">Start your learning journey by enrolling in a course</p>
            <Link to="/courses">
              <Button>Browse Courses</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course._id} className="p-6" hover>
                <Link to={`/courses/${course._id}`}>
                  <div className="mb-4">
                    {course.thumbnail && (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-32 object-cover rounded-md"
                      />
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{course.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{course.category}</span>
                    <span className="text-sm font-medium text-blue-600">{course.difficulty}</span>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderInstructorDashboard = () => (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">My Courses</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.myCourses || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Students</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.totalStudents || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Award className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Assignments</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.totalAssignments || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Quizzes</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.totalQuizzes || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/courses/create">
            <Button className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Create Course
            </Button>
          </Link>
          <Link to="/assignments/create">
            <Button variant="secondary" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              New Assignment
            </Button>
          </Link>
          <Link to="/quizzes/create">
            <Button variant="secondary" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Create Quiz
            </Button>
          </Link>
        </div>
      </Card>

      {/* My Courses */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
          <Link to="/courses">
            <Button variant="outline">Manage All</Button>
          </Link>
        </div>

        {courses.length === 0 ? (
          <Card className="p-8 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses created yet</h3>
            <p className="text-gray-500 mb-4">Create your first course to start teaching</p>
            <Link to="/courses/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Course
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course._id} className="p-6" hover>
                <Link to={`/courses/${course._id}`}>
                  <div className="mb-4">
                    {course.thumbnail && (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-32 object-cover rounded-md"
                      />
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{course.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {course.enrolledStudents?.length || 0} students
                    </span>
                    <span className={`text-sm font-medium ${course.isPublished ? 'text-green-600' : 'text-orange-600'}`}>
                      {course.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderAdminDashboard = () => (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.totalUsers || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BookOpen className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Courses</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.totalCourses || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Courses</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.activeCourses || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Award className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Assignments</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.totalAssignments || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* User breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Distribution</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Students</span>
              <span className="font-semibold text-blue-600">{stats?.totalStudents || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Instructors</span>
              <span className="font-semibold text-green-600">{stats?.totalInstructors || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total</span>
              <span className="font-semibold text-gray-900">{stats?.totalUsers || 0}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link to="/users" className="block">
              <Button variant="outline" className="w-full">
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Button>
            </Link>
            <Link to="/courses" className="block">
              <Button variant="outline" className="w-full">
                <BookOpen className="h-4 w-4 mr-2" />
                Manage Courses
              </Button>
            </Link>
            <Link to="/analytics" className="block">
              <Button variant="outline" className="w-full">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {getGreeting()}, {user?.firstName}!
            </h1>
            <p className="text-blue-100">
              Welcome back to your {user?.role} dashboard
            </p>
          </div>
          <div className="hidden md:block">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-200" />
              <span className="text-blue-100">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Role-specific dashboard */}
      {user?.role === 'student' && renderStudentDashboard()}
      {user?.role === 'instructor' && renderInstructorDashboard()}
      {user?.role === 'admin' && renderAdminDashboard()}
    </div>
  );
};

export default Dashboard;