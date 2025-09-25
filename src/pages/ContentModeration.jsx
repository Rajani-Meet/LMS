import React, { useState, useEffect } from 'react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { moderationAPI } from '../services/api';
import { Flag, Eye, Check, X, AlertTriangle, MessageSquare } from 'lucide-react';

const ContentModeration = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchReports();
    }
  }, [user, filter]);

  const fetchReports = async () => {
    try {
      const response = await moderationAPI.getReports({ status: filter });
      setReports(response.reports);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReportAction = async (reportId, action, reason = '') => {
    try {
      await moderationAPI.handleReport(reportId, { action, reason });
      setShowModal(false);
      setSelectedReport(null);
      fetchReports();
    } catch (error) {
      console.error('Failed to handle report:', error);
    }
  };

  const getReportTypeIcon = (type) => {
    switch (type) {
      case 'inappropriate_content':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'spam':
        return <Flag className="h-5 w-5 text-orange-500" />;
      case 'harassment':
        return <MessageSquare className="h-5 w-5 text-purple-500" />;
      default:
        return <Flag className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      resolved: 'bg-blue-100 text-blue-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Content Moderation</h1>
        <div className="flex items-center space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="pending">Pending Reports</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="resolved">Resolved</option>
            <option value="all">All Reports</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Flag className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">45</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <X className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Eye className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">65</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Reports List */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Content Reports</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {reports.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500">No reports found for the selected filter.</p>
            </div>
          ) : (
            reports.map((report) => (
              <div key={report._id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getReportTypeIcon(report.type)}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {report.title || 'Content Report'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Reported by: {report.reporter?.name} • {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {report.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(report.status)}
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setSelectedReport(report);
                        setShowModal(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Review
                    </Button>
                  </div>
                </div>

                {report.content && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Reported Content:</strong> {report.content.substring(0, 200)}
                      {report.content.length > 200 && '...'}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Review Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedReport(null);
        }}
        title="Review Content Report"
        size="large"
      >
        {selectedReport && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Report Type
                </label>
                <div className="flex items-center space-x-2">
                  {getReportTypeIcon(selectedReport.type)}
                  <span className="text-sm capitalize">
                    {selectedReport.type.replace('_', ' ')}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                {getStatusBadge(selectedReport.status)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reporter
              </label>
              <p className="text-sm text-gray-900">
                {selectedReport.reporter?.name} ({selectedReport.reporter?.email})
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Report Description
              </label>
              <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                {selectedReport.description}
              </p>
            </div>

            {selectedReport.content && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reported Content
                </label>
                <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                  <p className="text-sm text-gray-900">{selectedReport.content}</p>
                </div>
              </div>
            )}

            {selectedReport.evidence && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Evidence/Screenshots
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {selectedReport.evidence.map((item, index) => (
                    <img
                      key={index}
                      src={item.url}
                      alt={`Evidence ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                  ))}
                </div>
              </div>
            )}

            {selectedReport.status === 'pending' && (
              <div className="flex justify-end space-x-3">
                <Button
                  variant="danger"
                  onClick={() => handleReportAction(selectedReport._id, 'approve', 'Content violates community guidelines')}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Approve Report
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleReportAction(selectedReport._id, 'reject', 'Content does not violate guidelines')}
                >
                  <X className="h-4 w-4 mr-1" />
                  Reject Report
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ContentModeration;