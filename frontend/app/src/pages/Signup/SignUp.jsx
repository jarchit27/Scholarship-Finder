import React, { useState } from 'react';
import PasswordInput from '../../components/Inputs/PasswordInput';
import { Link, useNavigate } from 'react-router-dom';
import { validateEmail } from '../../utils/helper';
import axiosInstance from '../../utils/axiosInstance';

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');

  // Education fields
  const [qualification, setQualification] = useState('');
  const [institution, setInstitution] = useState('');
  const [yearOfPassing, setYearOfPassing] = useState('');
  const [scoreType, setScoreType] = useState('');
  const [scoreValue, setScoreValue] = useState('');

  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();

    // Basic validations
    if (!name) return setError("Please enter your name.");
    if (!validateEmail(email)) return setError("Please enter a valid email address.");
    if (!password) return setError("Please enter your password.");
    if (!gender) return setError("Please select your gender.");
    if (!address) return setError("Please enter your address.");

    setError('');

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
        setError(response.data.message);
        return;
      }

      if (response.data?.accessToken) {
        localStorage.setItem("token", response.data.accessToken);
        navigate("/dashboard");
      }

    } catch (error) {
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  return (
    <div className="flex  justify-center mt-28">
      <div className="w-96 border rounded bg-white px-7 py-10">
        <form onSubmit={handleSignUp}>
          <h4 className="text-2xl mb-7">Sign Up</h4>
          <input
            type="text"
            placeholder="Full Name"
            className="input-box"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="text"
            placeholder="Email"
            className="input-box"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <select
            className="input-box"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <PasswordInput 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            type="text"
            placeholder="Address"
            className="input-box"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <h5 className="mt-4 mb-2 font-semibold text-gray-700">Education Details</h5>

          <input
            type="text"
            placeholder="Qualification (e.g. B.Tech)"
            className="input-box"
            value={qualification}
            onChange={(e) => setQualification(e.target.value)}
          />

          <input
            type="text"
            placeholder="Institution Name"
            className="input-box"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
          />

          <input
            type="number"
            placeholder="Year of Passing"
            className="input-box"
            value={yearOfPassing}
            onChange={(e) => setYearOfPassing(e.target.value)}
          />

          <select
            className="input-box"
            value={scoreType}
            onChange={(e) => setScoreType(e.target.value)}
          >
            <option value="">Select Score Type</option>
            <option value="CGPA">CGPA</option>
            <option value="Percentage">Percentage</option>
          </select>

          <input
            type="text"
            placeholder="Score Value"
            className="input-box"
            value={scoreValue}
            onChange={(e) => setScoreValue(e.target.value)}
          />

          {error && <p className="text-red-500 text-xs pb-1">{error}</p>}

          <button type="submit" className="btn-primary">
            Create Account
          </button>

          <p className="text-sm text-center mt-4">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-blue-600 underline">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
