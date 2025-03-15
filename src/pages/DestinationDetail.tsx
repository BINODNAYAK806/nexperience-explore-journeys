
import React from 'react';
import { useParams } from 'react-router-dom';

const DestinationDetail = () => {
  const { id } = useParams();
  
  return (
    <div className="container-custom py-12">
      <h1 className="text-3xl font-bold mb-6">Destination Details</h1>
      <p>Showing details for destination ID: {id}</p>
      {/* More destination content will be added later */}
    </div>
  );
};

export default DestinationDetail;
