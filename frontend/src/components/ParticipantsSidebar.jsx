import React, { useState } from 'react';

const ParticipantsSidebar = ({ participants, currentUser, onClose, onParticipantAction }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);

  const handleActionClick = (participantId, action) => {
    onParticipantAction(participantId, action);
    setActiveDropdown(null);
  };

  const toggleDropdown = (participantId) => {
    setActiveDropdown(activeDropdown === participantId ? null : participantId);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Participants ({participants.length})
        </h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Participants List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          {participants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200 relative"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                  {participant.avatar}
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {participant.name}
                    {participant.isCurrentUser && ' (You)'}
                    {participant.isHost && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Host
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {participant.isMuted ? (
                        <>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-red-600">
                            <path d="M16 8v-2a4 4 0 00-8 0v2m8 0v6a4 4 0 01-8 0v-6m8 0H8m8 0h2m-10 0H6"/>
                            <path d="M3 3l18 18"/>
                          </svg>
                          <span className="text-red-600">Muted</span>
                        </>
                      ) : (
                        <>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-green-600">
                            <path d="M12 1a4 4 0 014 4v6a4 4 0 01-8 0V5a4 4 0 014-4z"/>
                            <path d="M19 10v1a7 7 0 01-14 0v-1"/>
                          </svg>
                          <span className="text-green-600">Unmuted</span>
                        </>
                      )}
                    </div>
                    {!participant.isVideoOn && (
                      <div className="flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-gray-400">
                          <path d="M3.707 2.293a1 1 0 00-1.414 1.414l18 18a1 1 0 001.414-1.414l-18-18z"/>
                          <path d="M21 7a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h16a1 1 0 001-1V7z"/>
                        </svg>
                        <span className="text-gray-400">Camera off</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Host Actions */}
              {currentUser?.isHost && !participant.isCurrentUser && (
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown(participant.id)}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {activeDropdown === participant.id && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      <div className="py-1">
                        {/* Mute/Unmute */}
                        <button
                          onClick={() => handleActionClick(participant.id, participant.isMuted ? 'unmute' : 'mute')}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          {participant.isMuted ? (
                            <>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-green-600">
                                <path d="M12 1a4 4 0 014 4v6a4 4 0 01-8 0V5a4 4 0 014-4z"/>
                                <path d="M19 10v1a7 7 0 01-14 0v-1"/>
                              </svg>
                              Unmute
                            </>
                          ) : (
                            <>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-red-600">
                                <path d="M16 8v-2a4 4 0 00-8 0v2m8 0v6a4 4 0 01-8 0v-6m8 0H8m8 0h2m-10 0H6"/>
                                <path d="M3 3l18 18"/>
                              </svg>
                              Mute
                            </>
                          )}
                        </button>

                        {/* Turn Camera On/Off */}
                        <button
                          onClick={() => handleActionClick(participant.id, participant.isVideoOn ? 'disableVideo' : 'enableVideo')}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          {participant.isVideoOn ? (
                            <>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-red-600">
                                <path d="M3.707 2.293a1 1 0 00-1.414 1.414l18 18a1 1 0 001.414-1.414l-18-18z"/>
                                <path d="M21 7a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h16a1 1 0 001-1V7z"/>
                              </svg>
                              Turn Camera Off
                            </>
                          ) : (
                            <>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-green-600">
                                <path d="M21 7a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h16a1 1 0 001-1V7z"/>
                              </svg>
                              Turn Camera On
                            </>
                          )}
                        </button>

                        <div className="border-t border-gray-100 my-1"></div>

                        {/* Remove from Meeting */}
                        <button
                          onClick={() => handleActionClick(participant.id, 'remove')}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 13H5v-2h14v2z"/>
                          </svg>
                          Remove from Meeting
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {activeDropdown && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setActiveDropdown(null)}
        />
      )}
    </div>
  );
};

export default ParticipantsSidebar;
