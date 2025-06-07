import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home    from './pages/Home/Home';
import Login   from './pages/Login/Login';
import SignUp  from './pages/SignUp/SignUp';
import Profile from './pages/Profile/Profile';  // ← new import

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/"          element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Home />} />
        <Route path="/profile"   element={<Profile />} />   
        <Route path="/login"     element={<Login />} />
        <Route path="/signup"    element={<SignUp />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
