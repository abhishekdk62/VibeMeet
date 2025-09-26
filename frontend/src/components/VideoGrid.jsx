import React from 'react';
import { MicOff, VideoOff } from 'lucide-react';

const VideoGrid = ({ participants, isScreenSharing, onParticipantClick }) => {
  const getGridClass = (count) => {
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    if (count <= 4) return 'grid-cols-2 grid-rows-2';
    if (count <= 6) return 'grid-cols-3 grid-rows-2';
    if (count <= 9) return 'grid-cols-3 grid-rows-3';
    return 'grid-cols-4 grid-rows-3';
  };

  return (
    <div className="h-full w-full p-2">
      <div className={`grid gap-2 h-full w-full ${getGridClass(participants.length)}`}>
        {participants.map((participant) => (
          <div
            key={participant.id}
            className="relative bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all duration-200 min-h-0 min-w-0"
            onClick={() => onParticipantClick(participant)}
          >
            {participant.isVideoOn && participant.stream ? (
              <video
                autoPlay
                playsInline
                muted={participant.isCurrentUser}
                className="w-full h-full object-cover rounded-lg"
                ref={(videoRef) => {
                  if (videoRef && participant.stream) {
                    videoRef.srcObject = participant.stream;
                  }
                }}
              />
            ) : (
              <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                <div className="text-center">
                  <div className={`bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2 ${
                    participants.length <= 4 ? 'w-16 h-16' : 
                    participants.length <= 9 ? 'w-12 h-12' : 'w-8 h-8'
                  }`}>
                    <span className={`text-white font-medium ${
                      participants.length <= 4 ? 'text-xl' : 
                      participants.length <= 9 ? 'text-lg' : 'text-sm'
                    }`}>
                      {participant.avatar}
                    </span>
                  </div>
                  <div className={`text-white ${
                    participants.length <= 4 ? 'text-sm' : 'text-xs'
                  }`}>
                    Camera off
                  </div>
                </div>
              </div>
            )}

            {/* Screen sharing indicator */}
            {participant.isCurrentUser && isScreenSharing && (
              <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 z-10">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                Screen + Camera
              </div>
            )}

            {/* Host Badge */}
            {participant.isHost && (
              <div className="absolute top-2 right-2 bg-yellow-600 text-white px-2 py-1 rounded text-xs z-10">
                👑 Host
              </div>
            )}

            {/* Participant Name */}
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
              {participant.name}
              {participant.isCurrentUser && ' (You)'}
            </div>

            {/* Status indicators */}
            <div className="absolute bottom-2 right-2 flex gap-1">
              {participant.isMuted && (
                <div className="bg-red-600 p-1 rounded">
                  <MicOff size={12} className="text-white" />
                </div>
              )}
              {!participant.isVideoOn && (
                <div className="bg-red-600 p-1 rounded">
                  <VideoOff size={12} className="text-white" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoGrid;
