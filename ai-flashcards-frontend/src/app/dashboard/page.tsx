"use client";

import React, { useState } from 'react';
import { FiPlus, FiFileText, FiFile, FiDownload, FiBarChart2, FiClock, FiStar } from 'react-icons/fi';
import { FaFilePdf, FaFileAlt, FaRegLightbulb } from 'react-icons/fa';
import { RiFlashlightFill } from 'react-icons/ri';
import { BsFiletypeDoc, BsFiletypeDocx, BsFiletypePpt, BsFiletypeXlsx } from 'react-icons/bs';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

const Dashboard = () => {
  // Sample data - replace with your actual data
  const [stats, setStats] = useState({
    totalFlashcards: 1243,
    totalSets: 28,
    recentActivity: [
      { id: 1, title: "Biology Chapter 3", date: "2 hours ago", count: 42 },
      { id: 2, title: "History Midterm", date: "1 day ago", count: 35 },
      { id: 3, title: "Chemistry Formulas", date: "3 days ago", count: 28 }
    ],
    starredSets: [
      { id: 4, title: "Spanish Vocabulary", count: 120 },
      { id: 5, title: "Machine Learning Terms", count: 85 }
    ]
  });

  const [activeTab, setActiveTab] = useState<'create' | 'recent' | 'starred'>('create');

  const getFileIcon = (fileType: string | null) => {
    if (!fileType) return <RiFlashlightFill className="text-indigo-500 text-xl" />;
    switch (fileType.toLowerCase()) {
      case 'pdf': return <FaFilePdf className="text-red-500 text-xl" />;
      case 'txt': return <FaFileAlt className="text-green-500 text-xl" />;
      case 'md': return <FiFileText className="text-purple-500 text-xl" />;
      case 'doc': return <BsFiletypeDoc className="text-blue-500 text-xl" />;
      case 'docx': return <BsFiletypeDocx className="text-blue-600 text-xl" />;
      case 'ppt': return <BsFiletypePpt className="text-orange-500 text-xl" />;
      case 'xlsx': return <BsFiletypeXlsx className="text-green-600 text-xl" />;
      default: return <FiFile className="text-gray-500 text-xl" />;
    }
  };

  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Flashcard Dashboard</h1>
              <p className="mt-2 text-gray-600">Welcome back! Here's your learning overview</p>
            </div>
            <button className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
              <FiPlus className="mr-2" />
              New Flashcard Set
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                  <RiFlashlightFill className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Flashcards</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{stats.totalFlashcards}</div>
                  </dd>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                  <FiFileText className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">Flashcard Sets</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{stats.totalSets}</div>
                  </dd>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                  <FiStar className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">Starred Sets</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{stats.starredSets.length}</div>
                  </dd>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('create')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'create'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Create New
            </button>
            <button
              onClick={() => setActiveTab('recent')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'recent'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Recent Activity
            </button>
            <button
              onClick={() => setActiveTab('starred')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'starred'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Starred Sets
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'create' && (
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Flashcards</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Upload File */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors cursor-pointer">
                  <FiFile className="mx-auto h-12 w-12 text-gray-400" />
                  <h4 className="mt-2 text-sm font-medium text-gray-900">Upload File</h4>
                  <p className="mt-1 text-xs text-gray-500">PDF, DOCX, TXT, or other text formats</p>
                </div>

                {/* Paste Text */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors cursor-pointer">
                  <FiFileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h4 className="mt-2 text-sm font-medium text-gray-900">Paste Text</h4>
                  <p className="mt-1 text-xs text-gray-500">Directly input your study material</p>
                </div>

                {/* AI Suggestions */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors cursor-pointer">
                  <FaRegLightbulb className="mx-auto h-12 w-12 text-gray-400" />
                  <h4 className="mt-2 text-sm font-medium text-gray-900">AI Suggestions</h4>
                  <p className="mt-1 text-xs text-gray-500">Let our AI recommend flashcards</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'recent' && (
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {stats.recentActivity.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-indigo-100 rounded-md p-2">
                        <RiFlashlightFill className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="ml-4">
                        <h4 className="text-sm font-medium text-gray-900">{item.title}</h4>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <FiClock className="mr-1" />
                          <span>{item.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-3">{item.count} cards</span>
                      <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'starred' && (
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Starred Flashcard Sets</h3>
              {stats.starredSets.length === 0 ? (
                <div className="text-center py-8">
                  <FiStar className="mx-auto h-12 w-12 text-gray-400" />
                  <h4 className="mt-2 text-sm font-medium text-gray-900">No starred sets</h4>
                  <p className="mt-1 text-xs text-gray-500">Star important sets to access them quickly</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stats.starredSets.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-yellow-100 rounded-md p-2">
                          <FiStar className="h-5 w-5 text-yellow-500" />
                        </div>
                        <div className="ml-4">
                          <h4 className="text-sm font-medium text-gray-900">{item.title}</h4>
                          <div className="text-xs text-gray-500 mt-1">{item.count} flashcards</div>
                        </div>
                      </div>
                      <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                        Study
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Study Section */}
        <div className="mt-8 bg-white shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Study</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-indigo-50 transition-colors">
                <div className="bg-indigo-100 rounded-full p-3 mb-2">
                  <RiFlashlightFill className="h-6 w-6 text-indigo-600" />
                </div>
                <span className="text-sm font-medium text-gray-900">All Flashcards</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-green-50 transition-colors">
                <div className="bg-green-100 rounded-full p-3 mb-2">
                  <FiBarChart2 className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-900">Due for Review</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-yellow-50 transition-colors">
                <div className="bg-yellow-100 rounded-full p-3 mb-2">
                  <FiStar className="h-6 w-6 text-yellow-600" />
                </div>
                <span className="text-sm font-medium text-gray-900">Starred Cards</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-purple-50 transition-colors">
                <div className="bg-purple-100 rounded-full p-3 mb-2">
                  <FiClock className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-gray-900">Recent Mistakes</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
    <Footer/>
    </>
  );
};

export default Dashboard;