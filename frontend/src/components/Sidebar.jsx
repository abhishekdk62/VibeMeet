import React, { useState } from 'react';

const Sidebar = ({meetings, closeSidebar }) => {
  const [activeTab, setActiveTab] = useState('history');

  // Mock call history data
  const callHistory = [
    {
      id: 1,
      title: 'Team Standup',
      participants: ['John', 'Sarah', 'Mike'],
      date: '2025-09-25',
      time: '10:30 AM',
      duration: '45 min'
    },
    {
      id: 2,
      title: 'Project Review',
      participants: ['Alice', 'Bob', 'Carol', 'David'],
      date: '2025-09-24',
      time: '2:00 PM',
      duration: '1h 20min'
    },
    {
      id: 3,
      title: 'Client Meeting',
      participants: ['Emma', 'Frank'],
      date: '2025-09-23',
      time: '11:00 AM',
      duration: '30 min'
    },
    {
      id: 4,
      title: 'Design Review',
      participants: ['Grace', 'Henry', 'Ivy'],
      date: '2025-09-22',
      time: '4:30 PM',
      duration: '55 min'
    }
  ];

  const handleCallClick = (call) => {
    console.log('Clicked call:', call);
    // Close sidebar on mobile when item is clicked
    if (closeSidebar) {
      closeSidebar();
    }
  };

  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex bg-white rounded-lg p-1">
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
              activeTab === 'history'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              History
            </div>
          </button>
       
        </div>
      </div>

      {/* Sidebar Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'history' ? (
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Recent Meets</h3>
            <div className="space-y-3">
            {meetings.map((meeting) => {
  const created = new Date(meeting.createdAt);
  const updated = new Date(meeting.updatedAt);

  return (
    <div
      key={meeting._id}
      onClick={() => handleCallClick(meeting)}
      className="bg-white rounded-lg p-3 border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200 cursor-pointer"
    >
      {/* Date at the top */}
      <div className="text-xs text-gray-500 mb-1">
        {created.toLocaleDateString(undefined, {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })}
      </div>

      {/* Title and status */}
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-900 truncate">
          {meeting.title}
        </h4>
        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
          {meeting.status}
        </span>
      </div>

      {/* Participants */}
      <div className="text-xs text-gray-600 mb-1">
        {meeting.participants.length} participant
        {meeting.participants.length > 1 ? 's' : ''}
      </div>

      {/* Start and End time */}
      <div className="text-xs text-gray-500">
        {created.toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
        })}{' '}
        -{' '}
        {updated.toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </div>
    </div>
  );
})}

            </div>
          </div>
        ) : (
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Upcoming Meetings</h3>
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-gray-500 mt-2">No upcoming meetings</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
