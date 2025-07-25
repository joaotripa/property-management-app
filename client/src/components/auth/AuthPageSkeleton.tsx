import React from "react";

const AuthPageSkeleton = () => {
  return (
    <div className="flex flex-col gap-8 items-center w-full max-w-md mx-auto animate-pulse py-10">
      <div className="h-8 w-2/3 bg-gray-200 rounded mb-6" />
      <div className="w-full bg-white rounded-2xl shadow p-6 flex flex-col gap-6">
        <div className="h-5 w-1/3 bg-gray-200 rounded mb-2" />
        <div className="h-10 w-full bg-gray-200 rounded-2xl mb-4" />
        <div className="h-5 w-1/3 bg-gray-200 rounded mb-2" />
        <div className="h-10 w-full bg-gray-200 rounded-2xl mb-4" />
        <div className="h-10 w-full bg-gray-200 rounded-2xl mb-2" />
        <div className="h-5 w-1/2 bg-gray-200 rounded mx-auto mt-2" />
      </div>
      <div className="h-4 w-1/2 bg-gray-200 rounded mt-6" />
    </div>
  );
};

export default AuthPageSkeleton;
