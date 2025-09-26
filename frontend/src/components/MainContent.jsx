import React from 'react';

const MainContent = ({ joinCode, setJoinCode, onCreateMeeting, onJoinMeeting }) => {
  const handleJoinSubmit = (e) => {
    e.preventDefault();
    if (joinCode.trim()) {
      onJoinMeeting();
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-normal text-gray-900 mb-4">
            Video calls and meetings for everyone
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Connect, collaborate, and celebrate from anywhere with VibeMeet
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          {/* New Meeting Button */}
          <button
            onClick={onCreateMeeting}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center gap-3"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            New meeting
          </button>

          {/* Join Meeting Form */}
          <div className="flex items-center gap-3">
            <form onSubmit={handleJoinSubmit} className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter a code or link"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="w-64 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <svg 
                  className="absolute right-3 top-3.5 h-4 w-4 text-gray-400" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a2 2 0 012-2z" />
                </svg>
              </div>
              <button
                type="submit"
                disabled={!joinCode.trim()}
                className="px-6 py-3 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-all duration-200 disabled:text-gray-400 disabled:hover:bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        {/* Illustration/Hero Image Placeholder */}
        <div className="relative">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-12 mx-auto max-w-lg">
            <div className="flex items-center justify-center">
              <div className="relative">
                {/* Main Circle */}
                <div className="w-32 h-32 bg-white rounded-full shadow-lg flex items-center justify-center">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" stroke="#4285f4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                
                {/* Floating Icons */}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                
                <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                    <path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-sm text-gray-500">
          <p>Learn more about VibeMeet</p>
        </div>
      </div>
    </div>
  );
};

export default MainContent;
