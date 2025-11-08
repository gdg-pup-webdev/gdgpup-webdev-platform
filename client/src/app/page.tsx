import React from "react";

const page = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/test`);
  const data = await res.json();
  return (
    <>
      <div>Home page</div>
      <div>{JSON.stringify(data)}</div>
    </>
  );
};

export default page;
