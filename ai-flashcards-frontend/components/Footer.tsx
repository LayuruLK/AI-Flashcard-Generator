"use client";

import React from 'react';
import { FiGithub, FiTwitter, FiLinkedin, FiMail, FiRss } from 'react-icons/fi';
import { FaBrain, FaRegLightbulb } from 'react-icons/fa';
import { RiFlashlightFill } from 'react-icons/ri';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-indigo-900 to-blue-900 text-white mt-16">
      {/* Waves decoration */}
      <div className="w-full overflow-hidden">
        <svg 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none" 
          className="w-full h-16"
        >
          <path 
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
            opacity=".25" 
            className="fill-current text-indigo-800"
          ></path>
          <path 
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" 
            opacity=".5" 
            className="fill-current text-indigo-700"
          ></path>
          <path 
            d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" 
            className="fill-current text-indigo-600"
          ></path>
        </svg>
      </div>

      {/* Main footer content */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand/About column */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <RiFlashlightFill className="h-8 w-8 text-blue-300" />
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-indigo-300">
                FlashGenius
              </span>
            </div>
            <p className="text-blue-100">
              AI-powered flashcard generator to supercharge your learning and memory retention.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="text-blue-200 hover:text-white transition-colors">
                <FiGithub className="h-5 w-5" />
              </a>
              <a href="#" className="text-blue-200 hover:text-white transition-colors">
                <FiTwitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-blue-200 hover:text-white transition-colors">
                <FiLinkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-blue-100 hover:text-white transition-colors flex items-center">
                  <span className="w-1 h-1 bg-blue-300 rounded-full mr-2"></span>
                  Dashboard
                </a>
              </li>
              <li>
                <a href="#" className="text-blue-100 hover:text-white transition-colors flex items-center">
                  <span className="w-1 h-1 bg-blue-300 rounded-full mr-2"></span>
                  Create Flashcards
                </a>
              </li>
              <li>
                <a href="#" className="text-blue-100 hover:text-white transition-colors flex items-center">
                  <span className="w-1 h-1 bg-blue-300 rounded-full mr-2"></span>
                  Study Mode
                </a>
              </li>
              <li>
                <a href="#" className="text-blue-100 hover:text-white transition-colors flex items-center">
                  <span className="w-1 h-1 bg-blue-300 rounded-full mr-2"></span>
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-blue-100 hover:text-white transition-colors flex items-center">
                  <span className="w-1 h-1 bg-blue-300 rounded-full mr-2"></span>
                  Learning Tips
                </a>
              </li>
              <li>
                <a href="#" className="text-blue-100 hover:text-white transition-colors flex items-center">
                  <span className="w-1 h-1 bg-blue-300 rounded-full mr-2"></span>
                  Spaced Repetition Guide
                </a>
              </li>
              <li>
                <a href="#" className="text-blue-100 hover:text-white transition-colors flex items-center">
                  <span className="w-1 h-1 bg-blue-300 rounded-full mr-2"></span>
                  API Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-blue-100 hover:text-white transition-colors flex items-center">
                  <span className="w-1 h-1 bg-blue-300 rounded-full mr-2"></span>
                  Help Center
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Stay Updated</h3>
            <p className="text-blue-100 mb-4">
              Subscribe to our newsletter for learning tips and updates.
            </p>
            <form className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="px-4 py-2 rounded-l-md focus:outline-none text-gray-800 w-full"
                required
              />
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r-md transition-colors"
              >
                <FiMail className="h-5 w-5" />
              </button>
            </form>
            <div className="mt-4 flex items-center text-blue-200 text-sm">
              <FaBrain className="mr-2" />
              <span>Powered by AI • Optimized for learning</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-blue-700 my-8"></div>

        {/* Bottom row */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 text-blue-200 mb-4 md:mb-0">
            <FaRegLightbulb />
            <span>Illuminate your learning journey</span>
          </div>
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm">
            <a href="#" className="text-blue-100 hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-blue-100 hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-blue-100 hover:text-white transition-colors">
              Cookie Policy
            </a>
            <span className="text-blue-300">© {new Date().getFullYear()} FlashGenius</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;