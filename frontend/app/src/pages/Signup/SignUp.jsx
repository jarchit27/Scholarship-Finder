import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateEmail } from '../../utils/helper';
import axiosInstance from '../../utils/axiosInstance';
import { Eye, EyeOff, ArrowRight, AlertCircle, Users, Award } from 'lucide-react';

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Education fields
  const [qualification, setQualification] = useState('');
  const [institution, setInstitution] = useState('');
  const [yearOfPassing, setYearOfPassing] = useState('');
  const [scoreType, setScoreType] = useState('');
  const [scoreValue, setScoreValue] = useState('');

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

const handleSignUp = async (e) => {
  e.preventDefault();

  // Input validations
  if (!name.trim()) return setError("Please enter your name.");
  if (!validateEmail(email)) return setError("Please enter a valid email address.");
  if (!password) return setError("Please enter your password.");
  if (!gender) return setError("Please select your gender.");
  if (!address.trim()) return setError("Please enter your address.");
  if (!qualification.trim()) return setError("Please enter your qualification.");
  if (!institution.trim()) return setError("Please enter your institution name.");
  if (!yearOfPassing) return setError("Please enter your year of passing.");
  if (!scoreType) return setError("Please select your score type.");
  if (!scoreValue.trim()) return setError("Please enter your score.");

  setError(null);

  try {
    const response = await axiosInstance.post("/create-account", {
      fullname: name,
      email,
      password,
      gender,
      address,
      education: {
        qualification,
        institution,
        yearOfPassing,
        scoreType,
        scoreValue,
      },
    });

    if (response.data?.error) {
      return setError(response.data.message || "Something went wrong.");
    }

    if (response.data?.accessToken) {
      localStorage.setItem("token", response.data.accessToken);
      navigate("/dashboard");
    }
  } catch (err) {
    const message = err.response?.data?.message || "An unexpected error occurred.";
    setError(message);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-4 py-16 lg:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Join Our Community
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto">
              Create your account and discover personalized scholarship opportunities
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Form Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                <div className="p-6 md:p-8 lg:p-10">
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
                    <p className="text-gray-600">Fill in your details to get started</p>
                  </div>

                  <div onSubmit={handleSignUp} className="space-y-8">
                    {/* Personal Information Section */}
                    <div className="space-y-6">
                      <div className="border-l-4 border-blue-500 pl-4">
                        <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="name"
                            type="text"
                            placeholder="Enter your full name"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email Address <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* <div className="grid md:grid-cols-2 gap-6"> */}
                        <div className="space-y-2">
                          <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                            Gender <span className="text-red-500">*</span>
                          </label>
                          <select
                            id="gender"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 bg-white"
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                          >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                          Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a strong password"
                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                          Address <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          id="address"
                          placeholder="Enter your full address"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 resize-none"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          rows="3"
                        />
                      </div>
                    </div>

                    {/* Education Information Section */}
                    <div className="space-y-6">
                      <div className="border-l-4 border-purple-500 pl-4">
                        <h3 className="text-xl font-semibold text-gray-900">Education Details</h3>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label htmlFor="qualification" className="block text-sm font-medium text-gray-700">
                            Qualification
                          </label>
                          <input
                            id="qualification"
                            type="text"
                            placeholder="e.g., B.Tech, MBA, M.Sc"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                            value={qualification}
                            onChange={(e) => setQualification(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="institution" className="block text-sm font-medium text-gray-700">
                            Institution Name
                          </label>
                          <input
                            id="institution"
                            type="text"
                            placeholder="Enter your institution name"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                            value={institution}
                            onChange={(e) => setInstitution(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label htmlFor="yearOfPassing" className="block text-sm font-medium text-gray-700">
                            Year of Passing
                          </label>
                          <input
                            id="yearOfPassing"
                            type="number"
                            placeholder="2024"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                            value={yearOfPassing}
                            onChange={(e) => setYearOfPassing(e.target.value)}
                            min="2000"
                            max="2030"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="scoreType" className="block text-sm font-medium text-gray-700">
                            Score Type
                          </label>
                          <select
                            id="scoreType"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 bg-white"
                            value={scoreType}
                            onChange={(e) => setScoreType(e.target.value)}
                          >
                            <option value="">Select Score Type</option>
                            <option value="CGPA">CGPA</option>
                            <option value="Percentage">Percentage</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="scoreValue" className="block text-sm font-medium text-gray-700">
                            Score Value
                          </label>
                          <input
                            id="scoreValue"
                            type="text"
                            placeholder="Enter your score"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                            value={scoreValue}
                            onChange={(e) => setScoreValue(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
                        <span className="text-red-700 text-sm">{error}</span>
                      </div>
                    )}

                    <button 
                      type="button"
                      onClick={handleSignUp}
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      <span>{isLoading ? 'Creating Account...' : 'Create Account'}</span>
                      {!isLoading && <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />}
                    </button>
                    <div className="text-center">
                      <p className="text-gray-600">
                        Already have an account?{" "}
                        <button 
                          type="button"
                          onClick={() => navigate('/login')}
                          className="text-blue-600 hover:text-blue-700 font-medium transition-colors underline"
                        >
                          Sign In
                        </button>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Award className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-gray-900">50+</div>
                      <div className="text-gray-600">Available Scholarships</div>
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm">
                    Access to a wide range of scholarship opportunities tailored to your profile.
                  </p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Users className="text-green-600" size={24} />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-gray-900">₹2.5L</div>
                      <div className="text-gray-600">Average Award</div>
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm">
                    Our members have received substantial financial support for their education.
                  </p>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;