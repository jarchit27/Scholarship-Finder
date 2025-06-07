import React, { useEffect, useState } from "react";
import axios from "axios";

const Recommendations = ({ userEmail }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userEmail) {
      setLoading(false);
      return;
    }

    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          `http://localhost:8000/api/recommendations?email=${userEmail}`
        );
        setRecommendations(response.data);
      } catch (err) {
        console.error("Error loading recommendations:", err);
        setError("Failed to load recommendations. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [userEmail]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-2xl font-bold text-gray-900 mb-6">
          Top Scholarship Recommendations
        </div>
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <div className="text-red-600 text-lg font-semibold mb-2">
          Oops! Something went wrong
        </div>
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!recommendations.length) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No Recommendations Yet
        </h3>
        <p className="text-gray-600">
          Complete your profile to get personalized scholarship recommendations
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((rec, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-100"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 flex-1 pr-4">
                {rec.name}
              </h3>
              {rec.score && (
                <div className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  <span className="text-green-600 mr-1">★</span>
                  {Math.round(rec.score)}% Match
                </div>
              )}
            </div>

            {/* Award Amount */}
            <div className="mb-3">
              <span className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                💰 {rec.award}
              </span>
            </div>

            
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Deadline:
              {/* 
              <p className="text-gray-600 text-sm leading-relaxed"> */}
                {rec.deadline}
                </h4>
              {/* </p> */}
            </div>


            {/* Eligibility */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Eligibility Requirements:
              </h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                {rec.eligibility}
              </p>
            </div>

            {/* Apply Button */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <a
                href={rec.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Apply Now
                <svg
                  className="ml-2 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Recommendations;