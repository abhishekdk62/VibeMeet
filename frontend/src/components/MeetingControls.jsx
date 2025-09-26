import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  ScreenShare,
  MoreVertical,
  Users,
  MessageCircle,
  PhoneOff
} from 'lucide-react';

const MeetingControls = ({
  currentUser,
  isScreenSharing,
  onMuteToggle,
  onVideoToggle,
  onScreenShare,
  onParticipantsToggle,
  onChatToggle,
  onLeaveCall,
  participantCount,
  meetingCode = "nsp-eijq-cdj",
    unreadMessages = 0 // Add this prop

}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (!currentUser) {
    return (
      <div className="bg-black px-6 py-4 flex items-center justify-center">
        <div className="text-white text-sm">Loading controls...</div>
      </div>
    );
  }

  return (
    <div className="bg-black px-6 py-4 flex items-center justify-between">
      {/* Left Side - Current Time & Meeting Code */}
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className="text-white text-sm font-medium">
          {formatTime(currentTime)} | {meetingCode}
        </div>
      </div>

      {/* Center - Main Controls */}
      <div className="flex items-center gap-4 justify-center">
        {/* Microphone */}
        <button
          onClick={onMuteToggle}
          disabled={!currentUser}
          className={`relative p-3 rounded-full transition-all duration-200 ${
            currentUser.isMuted
              ? 'bg-red-200 hover:bg-red-300'
              : 'bg-gray-700 hover:bg-gray-600'
          } ${!currentUser ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={currentUser.isMuted ? "Unmute" : "Mute"}
        >
          {currentUser.isMuted ? (
            <MicOff size={20} className="text-red-600" />
          ) : (
            <Mic size={20} className="text-white" />
          )}
        </button>

        {/* Video */}
        <button
          onClick={onVideoToggle}
          disabled={!currentUser}
          className={`relative p-3 rounded-full transition-all duration-200 ${
            !currentUser.isVideoOn
              ? 'bg-red-200 hover:bg-red-300'
              : 'bg-gray-700 hover:bg-gray-600'
          } ${!currentUser ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={!currentUser.isVideoOn ? "Turn on camera" : "Turn off camera"}
        >
          {!currentUser.isVideoOn ? (
            <VideoOff size={20} className="text-red-600" />
          ) : (
            <Video size={20} className="text-white" />
          )}
        </button>

        {/* Screen Share */}
        <button
          onClick={onScreenShare}
          className={`relative p-3 rounded-full transition-all duration-200 ${
            isScreenSharing
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-gray-700 hover:bg-gray-600'
          }`}
          title={isScreenSharing ? "Stop sharing screen + camera" : "Share screen + camera"}
        >
          <ScreenShare size={20} className="text-white" />
          {isScreenSharing && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          )}
        </button>

        {/* More Options */}
        <button className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 transition-all duration-200">
          <MoreVertical size={20} className="text-white" />
        </button>

        {/* Leave Call */}
        <button
          onClick={onLeaveCall}
          className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-full text-white font-medium transition-all duration-200"
        >
          <PhoneOff size={20} className="text-white" />
        </button>
      </div>

      {/* Right Side - User List & Chat */}
      <div className="flex items-center gap-4 justify-end min-w-0 flex-1">
        {/* Participants */}
        <button
          onClick={onParticipantsToggle}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-full transition-all duration-200"
        >
          <Users size={20} className="text-white" />
          <span className="text-white text-sm font-medium">{participantCount}</span>
        </button>

        {/* Chat */}
        <button
          onClick={onChatToggle}
          className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 transition-all duration-200"
        >
          <MessageCircle size={20} className="text-white" />
             {unreadMessages > 0 && (
      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center">
        {unreadMessages > 99 ? '99+' : unreadMessages}
      </div>
    )}
        </button>
      </div>
    </div>
  );
};

export default MeetingControls;
