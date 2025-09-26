import React, { useEffect, useRef } from "react";

const ParticipantActions = ({ participant, onAction, onClose }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/30 bg-opacity-50 z-50 flex items-center justify-center">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-80 p-0 overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
              {participant.avatar}
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{participant.name}</h3>
              <p className="text-sm text-gray-500">
                Participant actions
                {participant.isHost && " • Host"}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="py-2">
          {/* Audio Control */}
          <button
            onClick={() =>
              onAction(
                participant.id,
                participant.isMuted ? "unmute" : "mute"
              )
            }
            className="w-full px-6 py-3 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center gap-3"
          >
            {participant.isMuted ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-green-600">
                <path
                  d="M12 2a4 4 0 00-4 4v6a4 4 0 008 0V6a4 4 0 00-4-4zM19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-red-600">
                <path
                  d="M17 8l-12 12m12-12v6a4 4 0 01-8 0m8-6V8a4 4 0 00-8 0v2m8 0H8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            <span className={participant.isMuted ? "text-green-600" : "text-red-600"}>
              {participant.isMuted ? "Unmute participant" : "Mute participant"}
            </span>
          </button>

          {/* Video Control */}
          <button
            onClick={() =>
              onAction(
                participant.id,
                participant.isVideoOn ? "disableVideo" : "enableVideo"
              )
            }
            className="w-full px-6 py-3 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center gap-3"
          >
            {participant.isVideoOn ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-red-600">
                <path
                  d="M16 16l-4-4m4 4l4-4m-4 4V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2h9zM3 3l18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-green-600">
                <path
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            <span className={!participant.isVideoOn ? "text-green-600" : "text-red-600"}>
              {participant.isVideoOn ? "Turn off camera" : "Turn on camera"}
            </span>
          </button>

          <div className="border-t border-gray-100 my-2"></div>

          {/* Remove from call */}
          <button
            onClick={() => onAction(participant.id, "remove")}
            className="w-full px-6 py-3 text-left hover:bg-red-50 text-red-600 transition-colors duration-200 flex items-center gap-3"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Remove from call
          </button>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParticipantActions;
