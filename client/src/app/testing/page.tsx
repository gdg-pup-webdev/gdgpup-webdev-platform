"use client";

import React from "react";

const TestingPage = () => {
  const handleApiRequest = async () => {
    const result = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/announcements`
    );
    const data = await result.json();
    console.log(data);
  };

  return (
    <>
      <div>TestingPage</div>
      <button
        onClick={handleApiRequest}
        className="p-2 border rounded-2xl bg-blue-200"
      >
        Test API Request
      </button>
    </>
  );
};

export default TestingPage;
