import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import ScholarshipCard from '../../components/Cards/ScholarshipCard';

const Scholarships = () => {
  const [scholarships, setScholarships] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(9);

  const navigate = useNavigate();

  // Fetch logged-in user info
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

  // Fetch paginated scholarships
  const fetchScholarships = async (page = 1) => {
    try {
      const response = await axiosInstance.get(`/get-all-scholarships?page=${page}&limit=${limit}`);
      if (response.data && response.data.scholarships) {
        setScholarships(response.data.scholarships);
        setCurrentPage(response.data.currentPage);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      setError('Failed to fetch scholarships. Please try again later.');
    }
  };

  // Fetch user and scholarships on mount
  useEffect(() => {
    fetchUserInfo();
    fetchScholarships(currentPage);
  }, [currentPage]);

  return (
    <>
      <Navbar userInfo={userInfo} />

      <div className="container mx-auto mt-8">
        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <p className="col-span-3 text-center">No scholarships found.</p>
          )}
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center mt-8 space-x-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Previous
          </button>

          <span className="self-center">Page {currentPage} of {totalPages}</span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
};

export default Scholarships;