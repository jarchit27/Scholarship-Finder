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
  BookOpen
} from 'lucide-react';
import Navbar from '../../components/Navbar/Navbar';

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({
    fullname: "John Doe",
    email: "john.doe@gmail.com",
    gender: "Male",
    address: "123 Main Street, New York, NY 10001",
    education: {
      qualification: "B.Tech Computer Science",
      institution: "MIT Institute of Technology",
      yearOfPassing: 2024,
      scoreType: "CGPA",
      scoreValue: "8.5"
    },
    createdAt: "2024-01-15T10:30:00Z"
  });

  const [editedUser, setEditedUser] = useState({ ...user });

  const handleEdit = () => {
    setIsEditing(true);
    setEditedUser({ ...user });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedUser({ ...user });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUser({ ...editedUser });
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
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
      setEditedUser(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const displayData = isEditing ? editedUser : user;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
              <Navbar />

      {/* Header */}
      {/* <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Scholarships</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user.fullname.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <span className="text-sm text-gray-600 hidden sm:block">View profile</span>
            </div>
          </div>
        </div>
      </div> */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Profile Card */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Profile Header */}
              <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 px-6 py-8">
                <div className="text-center">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-3xl font-bold text-blue-600">
                        {displayData.fullname.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
                      <Camera className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <h2 className="mt-4 text-xl font-bold text-white">{displayData.fullname}</h2>
                  <p className="text-blue-100">{displayData.email}</p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="px-6 py-4 bg-gray-50">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">15</div>
                    <div className="text-xs text-gray-600">Perfect Matches</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">8</div>
                    <div className="text-xs text-gray-600">Applied</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">₹2.5L</div>
                    <div className="text-xs text-gray-600">Potential</div>
                  </div>
                </div>
              </div>

              {/* Member Since */}
              <div className="px-6 py-4 border-t">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  Member since {formatDate(user.createdAt)}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                  <Target className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="text-blue-700 font-medium">Find Scholarships</span>
                </button>
                <button className="w-full flex items-center px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                  <Trophy className="w-5 h-5 text-green-600 mr-3" />
                  <span className="text-green-700 font-medium">My Applications</span>
                </button>
                <button className="w-full flex items-center px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                  <BookOpen className="w-5 h-5 text-purple-600 mr-3" />
                  <span className="text-purple-700 font-medium">Resources</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl shadow-lg">
              {/* Header */}
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
                {/* Personal Information */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-600" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={displayData.fullname}
                          onChange={(e) => handleInputChange('fullname', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <div className="flex items-center px-4 py-3 bg-gray-50 rounded-lg">
                          <User className="w-4 h-4 mr-2 text-gray-500" />
                          {displayData.fullname}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={displayData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <div className="flex items-center px-4 py-3 bg-gray-50 rounded-lg">
                          <Mail className="w-4 h-4 mr-2 text-gray-500" />
                          {displayData.email}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                      {isEditing ? (
                        <select
                          value={displayData.gender}
                          onChange={(e) => handleInputChange('gender', e.target.value)}
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

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                      {isEditing ? (
                        <textarea
                          value={displayData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          rows="3"
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

                {/* Education Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <GraduationCap className="w-5 h-5 mr-2 text-blue-600" />
                    Education Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Qualification</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={displayData.education.qualification}
                          onChange={(e) => handleInputChange('education.qualification', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-lg">
                          {displayData.education.qualification || 'Not specified'}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Institution</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={displayData.education.institution}
                          onChange={(e) => handleInputChange('education.institution', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-lg">
                          {displayData.education.institution || 'Not specified'}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Year of Passing</label>
                      {isEditing ? (
                        <input
                          type="number"
                          value={displayData.education.yearOfPassing}
                          onChange={(e) => handleInputChange('education.yearOfPassing', parseInt(e.target.value))}
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

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Score Type</label>
                      {isEditing ? (
                        <select
                          value={displayData.education.scoreType}
                          onChange={(e) => handleInputChange('education.scoreType', e.target.value)}
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

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Score Value</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={displayData.education.scoreValue}
                          onChange={(e) => handleInputChange('education.scoreValue', e.target.value)}
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