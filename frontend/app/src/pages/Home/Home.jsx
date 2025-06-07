import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import Recommendations from '../../components/Recommendation';

const Scholarships  = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUserInfo = async () => {
    try {
      const response = await axiosInstance.get('/get-user');
      if (response.data?.user) {
        setUserInfo(response.data.user);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userInfo={userInfo} />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find Your Perfect Scholarship
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              Discover personalized scholarship opportunities tailored to your profile and academic goals
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {userInfo ? (
          <>
            {/* Welcome Section */}
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome back, {userInfo.fullname}!
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Ready to explore new scholarship opportunities? We've curated the best matches based on your profile.
              </p>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white rounded-xl shadow-md p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
                <div className="text-gray-600">Available Scholarships</div>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">15</div>
                <div className="text-gray-600">Perfect Matches</div>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">₹2.5L</div>
                <div className="text-gray-600">Average Award</div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Recommended For You
              </h3>
              <Recommendations userEmail={userInfo.email} />
            </div>

            {/* Features Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Matching</h3>
                <p className="text-gray-600">
                  Our AI-powered algorithm finds scholarships that perfectly match your profile
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Quick Apply</h3>
                <p className="text-gray-600">
                  Apply to multiple scholarships with just a few clicks using your saved profile
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
            <p className="mt-6 text-gray-600">
              Loading your personalized recommendations...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Scholarships ;