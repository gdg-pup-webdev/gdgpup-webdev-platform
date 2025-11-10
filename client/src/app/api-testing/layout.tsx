"use client"; 
import React from "react";
import { Navbar } from "./_components/Navbar";

type Props = {
  children: React.ReactNode;
};

export const Layout = ({ children }: Props) => {

  return (
    <>
      <Navbar/>
      <div className="w-full flex flex-col"> 

        {children}
      </div>
    </>
  );
};
 
export default Layout