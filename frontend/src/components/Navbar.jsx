import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md fixed w-full z-50 top-0 left-0">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <img
            src="/logo.png" // place your logo in public folder
            alt="Dashboard Logo"
            className="w-10 h-10 rounded-full"
          />
          <h1 className="text-xl font-semibold text-gray-800">dsPortfolio</h1>
        </div>

        {/* Menu button for mobile */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-800 focus:outline-none"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Nav Links */}
        <div
          className={`${
            isOpen ? "block" : "hidden"
          } md:flex md:items-center md:space-x-8 absolute md:static bg-white md:bg-transparent top-16 left-0 w-full md:w-auto shadow-md md:shadow-none px-6 md:px-0`}
        >
          <Link
            to="/"
            className="block md:inline-block py-2 text-gray-700 hover:text-blue-600 font-medium"
          >
            Home
          </Link>
          <Link
            to="/about"
            className="block md:inline-block py-2 text-gray-700 hover:text-blue-600 font-medium"
          >
            About
          </Link>
          <Link
            to="/projects"
            className="block md:inline-block py-2 text-gray-700 hover:text-blue-600 font-medium"
          >
            Projects
          </Link>
          <Link
            to="/contact"
            className="block md:inline-block py-2 text-gray-700 hover:text-blue-600 font-medium"
          >
            Contact
          </Link>

          {/* Signup/Login */}
          <Link
            to="/signup"
            className="block md:inline-block mt-3 md:mt-0 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
