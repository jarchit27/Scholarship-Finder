import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import ScholarshipCard from '../../components/Cards/ScholarshipCard';

const Scholarships = () => {
  const [scholarships, setScholarships] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Fetch logged-in user info
  const fetchUserInfo = async () => {
    try {
      const response = await axiosInstance.get('/get-user');
              console.log(response);

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

  // Fetch all scholarships
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
    fetchScholarships();
  }, []);

  return (
    <>
      <Navbar userInfo={userInfo} />

      <div className="container mx-auto mt-8">
        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="grid grid-cols-3 gap-6">
          {scholarships.length > 0 ? (
            scholarships.map((scholarship) => (
              <ScholarshipCard
                key={scholarship._id}
                name={scholarship.name}
                award={scholarship.award}
                deadline={scholarship.deadline}
                eligibility={scholarship.eligibility}
                link={scholarship.link}
              />
            ))
          ) : (
            <p>No scholarships found.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default Scholarships;
