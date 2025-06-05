import React, { useEffect, useState } from "react";
import axios from "axios";

const Recommendations = ({ userEmail }) => {
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    if (!userEmail) return;

    axios
      .get(`http://localhost:8000/api/recommendations?email=${userEmail}`)
      .then((res) => setRecommendations(res.data))
      .catch((err) => console.error("Error loading recommendations:", err));
  }, [userEmail]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Top Scholarship Recommendations</h2>
      {recommendations.map((rec, index) => (
        <div key={index} className="border rounded p-4 mb-2 shadow">
          <h3 className="font-semibold text-lg">{rec.name}</h3>
          <p><strong>Award:</strong> {rec.award}</p>
          <p><strong>Eligibility:</strong> {rec.eligibility}</p>
          <a href={rec.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
            Apply Here
          </a>
          {/* <p className="text-sm text-gray-500">Match Score: {rec.score}</p> */}
        </div>
      ))}
    </div>
  );
};

export default Recommendations;
