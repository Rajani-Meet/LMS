import React, { useState, useEffect } from 'react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { auditAPI } from '../services/api';
import { Activity, User, Calendar, Filter, Download, Eye } from 'lucide-react';

const AuditLogs = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: '',
    resource: '',
    userId: '',
    dateRange: '7'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchLogs();
  }, [filters, pagination.page]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      };
      
      const response = await auditAPI.getLogs(params);
      setLogs(response.logs);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    const icons = {
      CREATE: '➕',
      UPDATE: '✏️',
      DELETE: '🗑️',
      LOGIN: '🔐',
      LOGOUT: '🚪',
      ENROLL: '📚',
      SUBMIT: '📤',
      GRADE: '📊'
    };
    return icons[action] || '📋';
  };

  const getActionColor = (action) => {
    const colors = {
      CREATE: 'text-green-600 bg-green-100',
      UPDATE: 'text-blue-600 bg-blue-100',
      DELETE: 'text-red-600 bg-red-100',
      LOGIN: 'text-purple-600 bg-purple-100',
      LOGOUT: 'text-gray-600 bg-gray-100',
      ENROLL: 'text-indigo-600 bg-indigo-100',
      SUBMIT: 'text-orange-600 bg-orange-100',
      GRADE: 'text-yellow-600 bg-yellow-100'
    };
    return colors[action] || 'text-gray-600 bg-gray-100';
  };

  const exportLogs = async () => {
    try {
      const response = await auditAPI.exportLogs(filters);
      const blob = new Blob([response], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export logs:', error);
    }
  };

  if (user?.role !== 'admin' && user?.role !== 'instructor') {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Access denied. Insufficient privileges.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
        <div className="flex items-center space-x-3">
          <Button onClick={exportLogs} variant="secondary">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-medium">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Action
            </label>
            <select
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="LOGIN">Login</option>
              <option value="LOGOUT">Logout</option>
              <option value="ENROLL">Enroll</option>
              <option value="SUBMIT">Submit</option>
              <option value="GRADE">Grade</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Resource
            </label>
            <select
              value={filters.resource}
              onChange={(e) => setFilters({ ...filters, resource: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Resources</option>
              <option value="USER">User</option>
              <option value="COURSE">Course</option>
              <option value="LECTURE">Lecture</option>
              <option value="ASSIGNMENT">Assignment</option>
              <option value="QUIZ">Quiz</option>
              <option value="NOTIFICATION">Notification</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1">Last 24 hours</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button
              onClick={() => setFilters({ action: '', resource: '', userId: '', dateRange: '7' })}
              variant="secondary"
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Logs Table */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Activity Log</h3>
          <p className="text-sm text-gray-500">
            Showing {logs.length} of {pagination.total} entries
          </p>
        </div>

        {loading ? (
          <div className="p-8">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {logs.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No audit logs found for the selected filters.</p>
              </div>
            ) : (
              logs.map((log) => (
                <div key={log._id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${getActionColor(log.action)}`}>
                        <span className="text-sm">{getActionIcon(log.action)}</span>
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                            {log.action}
                          </span>
                          <span className="text-sm text-gray-500">{log.resource}</span>
                        </div>
                        
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {log.user?.name || 'Unknown User'} 
                          <span className="text-gray-500 font-normal">
                            {' '}performed {log.action.toLowerCase()} on {log.resource.toLowerCase()}
                          </span>
                        </p>
                        
                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                          <span className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {log.user?.email}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(log.createdAt).toLocaleString()}
                          </span>
                          {log.ipAddress && (
                            <span>IP: {log.ipAddress}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {log.details && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            // Show details modal
                            alert(JSON.stringify(log.details, null, 2));
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Page {pagination.page} of {pagination.pages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page === pagination.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AuditLogs;