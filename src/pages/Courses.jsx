import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { coursesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Plus,
  Users,
  Clock,
  Star
} from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Courses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const categories = ['Web Development', 'Mobile Development', 'Data Science', 'Design', 'Business', 'Other'];
  const difficulties = ['beginner', 'intermediate', 'advanced'];

  useEffect(() => {
    fetchCourses();
  }, [searchTerm, selectedCategory, selectedDifficulty, currentPage]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      let response;
      if (user?.role === 'student') {
        // For students, fetch all published courses
        response = await coursesAPI.getAll({
          search: searchTerm,
          category: selectedCategory,
          difficulty: selectedDifficulty,
          page: currentPage,
          limit: 12
        });
      } else {
        // For instructors and admins, fetch their courses
        response = await coursesAPI.getMyCourses();
        // Filter based on search and other criteria
        let filteredCourses = response.courses;
        
        if (searchTerm) {
          filteredCourses = filteredCourses.filter(course =>
            course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.description.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        if (selectedCategory) {
          filteredCourses = filteredCourses.filter(course =>
            course.category === selectedCategory
          );
        }
        
        if (selectedDifficulty) {
          filteredCourses = filteredCourses.filter(course =>
            course.difficulty === selectedDifficulty
          );
        }
        
        response = {
          courses: filteredCourses,
          totalPages: 1,
          currentPage: 1,
          total: filteredCourses.length
        };
      }
      
      setCourses(response.courses);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch courses:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      await coursesAPI.enroll(courseId);
      // Refresh courses to show enrollment status
      fetchCourses();
    } catch (error) {
      console.error('Failed to enroll in course:', error.message);
    }
  };

  const CourseCard = ({ course }) => {
    const isEnrolled = course.enrolledStudents?.some(
      enrollment => enrollment.student === user?.id
    );

    return (
      <Card className="overflow-hidden" hover>
        <div className="aspect-w-16 aspect-h-9">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-48 object-cover"
            />
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-blue-600" />
            </div>
          )}
        </div>
        
        <div className="p-6">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
              {course.title}
            </h3>
            <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
              {course.difficulty}
            </span>
          </div>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {course.description}
          </p>
          
          <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                <span>{course.enrolledStudents?.length || 0}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{course.duration} weeks</span>
              </div>
            </div>
            <span className="text-gray-700 font-medium">
              ${course.price || 'Free'}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Instructor</p>
              <p className="text-sm font-medium text-gray-900">
                {course.instructor?.firstName} {course.instructor?.lastName}
              </p>
            </div>
            
            <div className="flex space-x-2">
              <Link to={`/courses/${course._id}`}>
                <Button size="sm" variant="outline">
                  View
                </Button>
              </Link>
              
              {user?.role === 'student' && !isEnrolled && (
                <Button 
                  size="sm"
                  onClick={() => handleEnroll(course._id)}
                >
                  Enroll
                </Button>
              )}
              
              {user?.role === 'student' && isEnrolled && (
                <Button size="sm" variant="success">
                  Enrolled
                </Button>
              )}
              
              {(user?.role === 'instructor' && course.instructor?._id === user?.id) && (
                <Link to={`/courses/${course._id}/edit`}>
                  <Button size="sm" variant="secondary">
                    Edit
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  if (loading) {
    return <LoadingSpinner text="Loading courses..." />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {user?.role === 'student' ? 'Discover Courses' : 'My Courses'}
          </h1>
          <p className="text-gray-600 mt-1">
            {user?.role === 'student' 
              ? 'Explore our wide range of courses and start learning today'
              : 'Manage your courses and track student progress'
            }
          </p>
        </div>
        
        {(user?.role === 'instructor' || user?.role === 'admin') && (
          <Link to="/courses/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Course
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
          >
            <option value="">All Levels</option>
            {difficulties.map(difficulty => (
              <option key={difficulty} value={difficulty}>
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </option>
            ))}
          </select>
          
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('');
              setSelectedDifficulty('');
              setCurrentPage(1);
            }}
          >
            <Filter className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        </div>
      </Card>

      {/* Courses Grid */}
      {courses.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {user?.role === 'student' ? 'No courses found' : 'No courses created yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {user?.role === 'student' 
              ? 'Try adjusting your search criteria or browse all available courses'
              : 'Start creating courses to share your knowledge with students'
            }
          </p>
          {user?.role === 'student' ? (
            <Button onClick={() => {
              setSearchTerm('');
              setSelectedCategory('');
              setSelectedDifficulty('');
            }}>
              Browse All Courses
            </Button>
          ) : (
            <Link to="/courses/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Course
              </Button>
            </Link>
          )}
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center space-x-2">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </Button>
              
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button
                    key={i + 1}
                    variant={currentPage === i + 1 ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
              
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Courses;