import React, { useState } from 'react';
import Card from './Card';
import Button from './Button';
import Modal from './Modal';
import { Mail, Send, Users, User, Bell } from 'lucide-react';

const EmailNotifications = ({ isOpen, onClose, recipients = [] }) => {
  const [emailData, setEmailData] = useState({
    subject: '',
    message: '',
    recipientType: 'selected', // 'all', 'students', 'instructors', 'selected'
    priority: 'normal'
  });
  const [sending, setSending] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    
    try {
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert(`Email sent successfully to ${recipients.length} recipients!`);
      onClose();
      setEmailData({
        subject: '',
        message: '',
        recipientType: 'selected',
        priority: 'normal'
      });
    } catch (error) {
      console.error('Failed to send email:', error);
      alert('Failed to send email. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const getRecipientCount = () => {
    switch (emailData.recipientType) {
      case 'all': return 'All users';
      case 'students': return 'All students';
      case 'instructors': return 'All instructors';
      case 'selected': return `${recipients.length} selected users`;
      default: return '0 users';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Send Email Notification" size="large">
      <form onSubmit={handleSend} className="space-y-6">
        {/* Recipients */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recipients
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="recipientType"
                value="selected"
                checked={emailData.recipientType === 'selected'}
                onChange={(e) => setEmailData({ ...emailData, recipientType: e.target.value })}
                className="text-blue-600"
              />
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm">Selected Users ({recipients.length})</span>
            </label>

            <label className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="recipientType"
                value="students"
                checked={emailData.recipientType === 'students'}
                onChange={(e) => setEmailData({ ...emailData, recipientType: e.target.value })}
                className="text-blue-600"
              />
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm">All Students</span>
            </label>

            <label className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="recipientType"
                value="instructors"
                checked={emailData.recipientType === 'instructors'}
                onChange={(e) => setEmailData({ ...emailData, recipientType: e.target.value })}
                className="text-blue-600"
              />
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm">All Instructors</span>
            </label>

            <label className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="recipientType"
                value="all"
                checked={emailData.recipientType === 'all'}
                onChange={(e) => setEmailData({ ...emailData, recipientType: e.target.value })}
                className="text-blue-600"
              />
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm">All Users</span>
            </label>
          </div>
          
          <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-700">
            📧 Will send to: {getRecipientCount()}
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority
          </label>
          <select
            value={emailData.priority}
            onChange={(e) => setEmailData({ ...emailData, priority: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="low">Low Priority</option>
            <option value="normal">Normal Priority</option>
            <option value="high">High Priority</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subject
          </label>
          <input
            type="text"
            value={emailData.subject}
            onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
            placeholder="Enter email subject..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message
          </label>
          <textarea
            value={emailData.message}
            onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
            placeholder="Enter your message..."
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            You can use basic HTML formatting in your message.
          </p>
        </div>

        {/* Email Templates */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quick Templates
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setEmailData({
                ...emailData,
                subject: 'New Assignment Posted',
                message: 'A new assignment has been posted for your course. Please check your dashboard for details and submission requirements.'
              })}
            >
              Assignment Notification
            </Button>
            
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setEmailData({
                ...emailData,
                subject: 'Course Update',
                message: 'There has been an important update to your course. Please log in to view the latest information and materials.'
              })}
            >
              Course Update
            </Button>
            
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setEmailData({
                ...emailData,
                subject: 'Reminder: Upcoming Deadline',
                message: 'This is a friendly reminder about an upcoming deadline. Please ensure you complete your tasks on time.'
              })}
            >
              Deadline Reminder
            </Button>
            
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setEmailData({
                ...emailData,
                subject: 'System Maintenance Notice',
                message: 'We will be performing scheduled maintenance on the system. Please save your work and expect brief interruptions during this time.'
              })}
            >
              Maintenance Notice
            </Button>
          </div>
        </div>

        {/* Preview */}
        <Card className="p-4 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Mail className="h-4 w-4 mr-1" />
            Email Preview
          </h4>
          <div className="space-y-2 text-sm">
            <div><strong>To:</strong> {getRecipientCount()}</div>
            <div><strong>Priority:</strong> {emailData.priority}</div>
            <div><strong>Subject:</strong> {emailData.subject || 'No subject'}</div>
            <div className="border-t pt-2">
              <strong>Message:</strong>
              <div className="mt-1 p-2 bg-white rounded border text-gray-700">
                {emailData.message || 'No message content'}
              </div>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={sending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={sending || !emailData.subject || !emailData.message}
            className="flex items-center space-x-2"
          >
            {sending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Send Email</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EmailNotifications;