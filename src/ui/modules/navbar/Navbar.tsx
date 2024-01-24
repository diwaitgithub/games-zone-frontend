"use client";
import React, { useState } from "react";
import Hamburger from "./components/Hamburger";
import { Logo } from "./components/Logo";
import Menu from "./Menu";
import { useScroll } from "@/lib/hooks/useScroll";

const Navbar = () => {
  const [displayMenu, setDisplayMenu] = useState(false);
  const { Y: scrollPosition } = useScroll();

  return (
    <nav className={`z-10 ${scrollPosition > 2 ? 'sticky top-0 opacity-80 shadow-none' : 'relative'} w-full border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 rounded-lg shadow-md transition-opacity duration-300`}>
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <Logo />
        <Hamburger handleClick={() => setDisplayMenu(!displayMenu)} />
        <div
          className={` ${displayMenu ? "block" : "hidden"} w-full md:block md:w-auto`}
        >
          <Menu />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
