// src/pages/Profile/Profile.jsx
import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  MapPin,
  GraduationCap,
  Calendar,
  Award,
  Edit3,
  Save,
  X,
  Camera,
  Trophy,
  Target,
  BookOpen,
  Home
} from 'lucide-react';
import Navbar from '../../components/Navbar/Navbar';
import axiosInstance from '../../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const [isEditing, setIsEditing]   = useState(false);
  const [loading, setLoading]       = useState(false);
  const [user, setUser]             = useState(null);
  const [editedUser, setEditedUser] = useState(null);

  const navigate = useNavigate();

  const fetchUserInfo = async () => {
    try {
      const response = await axiosInstance.get('/get-user');
      if (response.data?.user) {
        setUser(response.data.user);
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

  const handleEdit = () => {
    setIsEditing(true);
    setEditedUser(user);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedUser(user);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.put('/update-user', editedUser);
      if (!res.data.error) {
        setUser(res.data.user);
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        throw new Error(res.data.message);
      }
    } catch (err) {
      console.error('Update failed:', err);
      alert('Error updating profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setEditedUser(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setEditedUser(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const formatDate = iso =>
    new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

  if (!user) {
    return (
      <div>
        <Navbar />
        <p className="p-8 text-center">Loading profile...</p>
      </div>
    );
  }

  const displayData = isEditing ? editedUser : user;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar userInfo={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Home Button */}
        <div className="mb-6">
          <button
            onClick={handleGoHome}
            className="flex items-center px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-md border"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Profile Card (left) */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 px-6 py-8">
                <div className="text-center">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-3xl font-bold text-blue-600">
                        {displayData.fullname.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    {/* <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"> */}
                      {/* <Camera className="w-4 h-4 text-gray-600" /> */}
                    {/* </button> */}
                  </div>
                  <h2 className="mt-4 text-xl font-bold text-white">{displayData.fullname}</h2>
                  <p className="text-blue-100">{displayData.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content (right) */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl shadow-lg">
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
                {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCancel}
                      className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </div>

              <div className="px-6 py-6">
                {/* Personal Info */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-600" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={displayData.fullname}
                          onChange={e => handleInputChange('fullname', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <div className="flex items-center px-4 py-3 bg-gray-50 rounded-lg">
                          <User className="w-4 h-4 mr-2 text-gray-500" />
                          {displayData.fullname}
                        </div>
                      )}
                    </div>
                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={displayData.email}
                          onChange={e => handleInputChange('email', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <div className="flex items-center px-4 py-3 bg-gray-50 rounded-lg">
                          <Mail className="w-4 h-4 mr-2 text-gray-500" />
                          {displayData.email}
                        </div>
                      )}
                    </div>
                    {/* Gender */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender
                      </label>
                      {isEditing ? (
                        <select
                          value={displayData.gender}
                          onChange={e => handleInputChange('gender', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-lg">
                          {displayData.gender}
                        </div>
                      )}
                    </div>
                    {/* Address */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      {isEditing ? (
                        <textarea
                          rows="3"
                          value={displayData.address}
                          onChange={e => handleInputChange('address', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <div className="flex items-start px-4 py-3 bg-gray-50 rounded-lg">
                          <MapPin className="w-4 h-4 mr-2 text-gray-500 mt-0.5" />
                          {displayData.address}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Education Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <GraduationCap className="w-5 h-5 mr-2 text-blue-600" />
                    Education Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Qualification */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Qualification
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={displayData.education.qualification || ''}
                          onChange={e => handleInputChange('education.qualification', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-lg">
                          {displayData.education.qualification || 'Not specified'}
                        </div>
                      )}
                    </div>
                    {/* Institution */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Institution
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={displayData.education.institution || ''}
                          onChange={e => handleInputChange('education.institution', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-lg">
                          {displayData.education.institution || 'Not specified'}
                        </div>
                      )}
                    </div>
                    {/* Year of Passing */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Year of Passing
                      </label>
                      {isEditing ? (
                        <input
                          type="number"
                          value={displayData.education.yearOfPassing || ''}
                          onChange={e => handleInputChange('education.yearOfPassing', parseInt(e.target.value) || '')}
                          min="2000"
                          max="2030"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <div className="flex items-center px-4 py-3 bg-gray-50 rounded-lg">
                          <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                          {displayData.education.yearOfPassing || 'Not specified'}
                        </div>
                      )}
                    </div>
                    {/* Score Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Score Type
                      </label>
                      {isEditing ? (
                        <select
                          value={displayData.education.scoreType || ''}
                          onChange={e => handleInputChange('education.scoreType', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select Score Type</option>
                          <option value="CGPA">CGPA</option>
                          <option value="Percentage">Percentage</option>
                        </select>
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-lg">
                          {displayData.education.scoreType || 'Not specified'}
                        </div>
                      )}
                    </div>
                    {/* Score Value */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Score Value
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={displayData.education.scoreValue || ''}
                          onChange={e => handleInputChange('education.scoreValue', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <div className="flex items-center px-4 py-3 bg-gray-50 rounded-lg">
                          <Award className="w-4 h-4 mr-2 text-gray-500" />
                          {displayData.education.scoreValue || 'Not specified'}
                          {displayData.education.scoreType && (
                            <span className="ml-1 text-gray-500">
                              {displayData.education.scoreType === 'CGPA' ? '/10' : '%'}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;