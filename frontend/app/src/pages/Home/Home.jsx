import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import ScholarshipCard from '../../components/Cards/ScholarshipCard';
import Recommendations from '../../components/Recommendation';

const Scholarships = () => {
  const [scholarships, setScholarships] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const fetchUserInfo = async () => {
    try {
      const response = await axiosInstance.get('/get-user');
      if (response.data && response.data.user) {
        setUserInfo(response.data.user);

      }
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
      }
    }
  };

  const fetchScholarships = async () => {
    try {
      const response = await axiosInstance.get('/get-all-scholarships');
      if (response.data && response.data.scholarships) {
        setScholarships(response.data.scholarships);
      }
    } catch (error) {
      setError('Failed to fetch scholarships. Please try again later.');
    }
  };

  useEffect(() => {
    fetchUserInfo();

    // fetchScholarships(); // temporarily commented since you're using sentiment-based recommendations
  }, []);

              console.log(userInfo);


  return (
    <>
      <Navbar userInfo={userInfo} />

      {userInfo ? (
        <Recommendations userEmail={userInfo.email} />
      ) : (
        <p className="text-center mt-8 text-gray-500">Loading recommendations...</p>
      )}
    </>
  );
};

export default Scholarships;
