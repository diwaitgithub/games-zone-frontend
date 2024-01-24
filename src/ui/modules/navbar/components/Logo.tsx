import React from "react";

export const Logo = () => {
  return (
    <a href={process.env.NEXT_PUBLIC_BASE_URL as string} className="flex items-center">
      <img src={`${process?.env?.NEXT_PUBLIC_BASE_URL}favicon.ico`} className="h-8 mr-3" alt="Logo" />
      <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
        Games Zone
      </span>
    </a>
  );
};
