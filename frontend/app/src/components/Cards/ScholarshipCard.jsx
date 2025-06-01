import React from 'react';

const ScholarshipCard = ({ name, award, deadline, eligibility, link }) => {
  return (
    <div className="bg-white shadow-md rounded-2xl p-5 m-4 w-full max-w-md">
      <h2 className="text-xl font-semibold text-blue-600 mb-2">{name}</h2>
      {award && <p><strong>Award:</strong> {award}</p>}
      {deadline && (
        <p><strong>Date:</strong> {deadline}</p>
      )}
      {eligibility && <p><strong>Eligibility:</strong> {eligibility}</p>}
      {link && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-3 text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg"
        >
          Apply Now
        </a>
      )}
    </div>
  );
};

export default ScholarshipCard;
