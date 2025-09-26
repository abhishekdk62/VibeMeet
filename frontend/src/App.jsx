import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import LandingPage from "./pages/LandingPage";
import VideoCall from "./pages/VideoCall";
import { GoogleOAuthProvider } from "@react-oauth/google";

function App() {
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  useEffect(() => {
  console.log('Current origin:', window.location.origin);
  console.log('Google Client ID:', GOOGLE_CLIENT_ID);
}, []);

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <Router>
      <div className="App">
        <Routes>
          <Route path="/dashboard" element={<LandingPage />} />

          <Route path="/call/:meetingId" element={<VideoCall />} />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
