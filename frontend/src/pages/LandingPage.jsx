import React, { useState, useEffect } from "react";
import MainContent from "../components/MainContent";
import AccountModal from "../components/AccountModal";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import {
  createMeeting,
  getMeetings,
  joinMeeting,
} from "../services/meetingService";
import toast from "react-hot-toast";
import { User } from "lucide-react";

const LandingPage = () => {
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userInitial, setUserInitial] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        const initial = user.firstName
          ? user.firstName.charAt(0).toUpperCase()
          : user.email
          ? user.email.charAt(0).toUpperCase()
          : "";
        setUserInitial(initial);
      } catch {
        setUserInitial("");
      }
    }
  }, [showAccountModal]);

  const closeSidebar = () => {
    setSidebarOpen(false);
  };
const [meetings,setMeetings]=useState([])
  const handleCreateMeeting = async () => {
    try {
      const userJson = localStorage.getItem("user");
      if (!userJson) {
        toast.error("Please login first");
        return;
      }
      const user = userJson ? JSON.parse(userJson) : {};
      const userName =
        `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
        user.email ||
        "Host";
      console.log("creating meeting");

      const res = await createMeeting({
        title: `${userName}'s Meeting`,
      });
      console.log("Meeting created:", res);
      navigate(`/call/${res.meetingId}`);
    } catch (error) {
      console.error("Error creating meeting:", error);
      toast.error("Failed to create meeting. Please try again");
    }
  };
  const getUserMeetings = async () => {
    try {
      const userJson = localStorage.getItem("user");
      const user = JSON.parse(userJson);
      console.log(userJson);
      const data = await getMeetings(user._id);
      setMeetings(data)
      console.log(data);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    const userJson = localStorage.getItem("user");
    if (userJson) {
      getUserMeetings();
    }
  }, []);

  const handleJoinMeeting = async () => {
    try {
      const userJson = localStorage.getItem("user");
      if (!userJson) {
        toast.error("Please login first");

        return;
      }
      const res = await joinMeeting(joinCode);
      console.log(res);
      navigate(`/call/${joinCode}`);
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    }
    console.log("Joining meeting with code:", joinCode);
  };

  const handleAccountClick = () => {
    setShowAccountModal(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("auth");
    localStorage.removeItem("user");
    setShowAccountModal(false);
    setUserInitial("");
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-white flex relative">
      {/* Backdrop for sidebar when open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 bg-opacity-50 z-40"
          onClick={closeSidebar}
        />
      )}

      {/* Hamburger menu button always visible */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 fixed top-4 left-4 z-50"
        aria-label="Toggle sidebar"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {sidebarOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ width: "280px" }}
        aria-hidden={!sidebarOpen}
      >
        {sidebarOpen && <Sidebar
        meetings={meetings}
        closeSidebar={closeSidebar} />}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-lg">
              {/* Logo SVG or image */}
            </div>
            <span className="text-xl font-medium text-gray-900">VibeMeet</span>
          </div>

          {/* Account Button */}
          <button
            onClick={handleAccountClick}
            className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-medium hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            aria-label="Open account modal"
          >
            {userInitial || <User />}
          </button>
        </header>

        <MainContent
          joinCode={joinCode}
          setJoinCode={setJoinCode}
          onCreateMeeting={handleCreateMeeting}
          onJoinMeeting={handleJoinMeeting}
        />
      </div>

      {/* Account modal */}
      {showAccountModal && (
        <AccountModal
          onClose={() => setShowAccountModal(false)}
          onLogout={handleLogout}
          getUserMeetings={getUserMeetings}
        />
      )}
    </div>
  );
};

export default LandingPage;
