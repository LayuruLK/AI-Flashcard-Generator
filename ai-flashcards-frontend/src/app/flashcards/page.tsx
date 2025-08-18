"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { FaSearch, FaTrash, FaDownload, FaFilter, FaTimes } from 'react-icons/fa';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Navbar from '../../../components/Navbar';
import { toPng, toJpeg, toBlob } from 'html-to-image';

type Difficulty = 'easy' | 'medium' | 'hard';

interface Flashcard {
    _id: string;
    question: string;
    answer: string;
    subject: string;
    difficulty: Difficulty;
    tags: string[];
    createdAt: string;
    updatedAt: string;
}

const SavedFlashcardsPage = () => {
    const router = useRouter();
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [filteredFlashcards, setFilteredFlashcards] = useState<Flashcard[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        subject: '',
        difficulty: '',
        tag: '',
        dateFrom: '',
        dateTo: '',
    });
    const [showFilters, setShowFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const cardsPerPage = 9;

    // Check authentication
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const userId = localStorage.getItem('userId');

        if (!token || !userId) {
            Swal.fire({
                title: 'Access Denied',
                text: 'Please login to view your flashcards',
                icon: 'warning',
                confirmButtonText: 'Login',
            }).then(() => {
                router.push('/login');
            });
        } else {
            fetchFlashcards();
        }
    }, []);

    const fetchFlashcards = async () => {
        try {
            const userId = localStorage.getItem('userId');
            const token = localStorage.getItem('authToken');

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/flashcards/user/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch flashcards');

            const data = await response.json();
            setFlashcards(data.data);
            setFilteredFlashcards(data.data);
            setLoading(false);
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: error instanceof Error ? error.message : 'Failed to load flashcards',
                icon: 'error',
            });
            setLoading(false);
        }
    };

    // Apply filters and search
    useEffect(() => {
        let results = [...flashcards];

        // Apply search query
        if (searchQuery) {
            results = results.filter(card =>
                card.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                card.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                card.subject.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply filters
        if (filters.subject) {
            results = results.filter(card =>
                card.subject.toLowerCase().includes(filters.subject.toLowerCase())
            );
        }

        if (filters.difficulty) {
            results = results.filter(card =>
                card.difficulty === filters.difficulty
            );
        }

        if (filters.tag) {
            results = results.filter(card =>
                card.tags.some(tag => tag.toLowerCase().includes(filters.tag.toLowerCase()))
            );
        }

        if (filters.dateFrom) {
            results = results.filter(card =>
                new Date(card.createdAt) >= new Date(filters.dateFrom)
            );
        }

        if (filters.dateTo) {
            results = results.filter(card =>
                new Date(card.createdAt) <= new Date(filters.dateTo)
            );
        }

        setFilteredFlashcards(results);
        setCurrentPage(1);
    }, [searchQuery, filters, flashcards]);

    const handleDelete = async (id: string) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('authToken');
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/flashcards/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) throw new Error('Failed to delete flashcard');

                setFlashcards(flashcards.filter(card => card._id !== id));
                Swal.fire(
                    'Deleted!',
                    'Your flashcard has been deleted.',
                    'success'
                );
            } catch (error) {
                Swal.fire({
                    title: 'Error',
                    text: error instanceof Error ? error.message : 'Failed to delete flashcard',
                    icon: 'error',
                });
            }
        }
    };

    const handleDownload = async (card: Flashcard) => {
        // Create a temporary div to render the flashcard for capture
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'fixed';
        tempDiv.style.left = '-9999px';
        tempDiv.style.width = '600px';
        tempDiv.style.padding = '24px';
        tempDiv.style.backgroundColor = 'white';
        tempDiv.style.borderRadius = '12px';
        tempDiv.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
        tempDiv.style.border = '1px solid #e5e7eb';

        // Use template literals for the flashcard content
        tempDiv.innerHTML = `
    <div style="font-family: 'Inter', sans-serif; max-width: 100%;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <span style="display: inline-flex; align-items: center; padding: 4px 12px; border-radius: 9999px; 
          background-color: ${card.difficulty === 'easy' ? '#d1fae5' :
                card.difficulty === 'medium' ? '#fef3c7' : '#fee2e2'};
          color: ${card.difficulty === 'easy' ? '#065f46' :
                card.difficulty === 'medium' ? '#92400e' : '#991b1b'};
          font-size: 14px; font-weight: 500;">
          ${card.difficulty.charAt(0).toUpperCase() + card.difficulty.slice(1)}
        </span>
        <div style="font-size: 14px; color: #6b7280;">
          ${new Date(card.createdAt).toLocaleDateString()}
        </div>
      </div>
      
      <h3 style="font-size: 24px; font-weight: 700; color: #111827; margin-bottom: 20px;">
        ${card.question}
      </h3>
      
      <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; 
           padding: 16px; margin-bottom: 20px; min-height: 100px;">
        <p style="font-size: 18px; color: #374151; line-height: 1.5;">
          ${card.answer}
        </p>
      </div>
      
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div style="font-weight: 600; color: #4b5563;">${card.subject}</div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end;">
          ${card.tags.map(tag => `
            <span style="display: inline-flex; align-items: center; padding: 4px 10px; 
                  border-radius: 9999px; background-color: #e0e7ff; color: #4338ca; 
                  font-size: 12px; font-weight: 500;">
              ${tag}
            </span>
          `).join('')}
        </div>
      </div>
    </div>
  `;

        // Add to DOM
        document.body.appendChild(tempDiv);

        // Wait for fonts and images to load
        await new Promise(resolve => setTimeout(resolve, 100));

        try {
            const result = await Swal.fire({
                title: 'Download Options',
                html: `
        <div class="text-left">
          <div class="mb-4">
            <label class="block text-gray-700 mb-2">Format</label>
            <select id="download-format" class="swal2-select">
              <option value="png">PNG (High Quality)</option>
              <option value="jpeg">JPEG (Smaller File)</option>
            </select>
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 mb-2">Quality (JPEG only)</label>
            <input 
              id="download-quality" 
              type="range" 
              min="0.1" 
              max="1" 
              step="0.1" 
              value="0.92" 
              class="swal2-input"
              disabled
            >
          </div>
        </div>
      `,
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: 'Download',
                preConfirm: () => {
                    const format = (document.getElementById('download-format') as HTMLSelectElement).value;
                    const quality = parseFloat((document.getElementById('download-quality') as HTMLInputElement).value);
                    return { format, quality };
                },
                didOpen: () => {
                    const formatSelect = document.getElementById('download-format') as HTMLSelectElement;
                    const qualitySlider = document.getElementById('download-quality') as HTMLInputElement;

                    formatSelect.addEventListener('change', (e) => {
                        qualitySlider.disabled = (e.target as HTMLSelectElement).value !== 'jpeg';
                    });
                }
            });

            if (result.isConfirmed) {
                const { format, quality } = result.value;

                // Show loading indicator
                Swal.fire({
                    title: 'Generating Image',
                    html: 'Please wait while we prepare your download...',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                // Ensure the element is visible for capture
                tempDiv.style.left = '0';
                tempDiv.style.top = '0';
                tempDiv.style.zIndex = '9999';

                let dataUrl: string;
                if (format === 'png') {
                    dataUrl = await toPng(tempDiv, {
                        quality: 1,
                        pixelRatio: 3, // Higher quality
                        backgroundColor: 'white',
                        cacheBust: true
                    });
                } else {
                    dataUrl = await toJpeg(tempDiv, {
                        quality: quality,
                        pixelRatio: 2,
                        backgroundColor: 'white',
                        cacheBust: true
                    });
                }

                // Create download link
                const link = document.createElement('a');
                link.download = `flashcard-${card.subject.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${format}`;
                link.href = dataUrl;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // Clean up
                document.body.removeChild(tempDiv);

                Swal.fire(
                    'Download Complete!',
                    'Your flashcard has been downloaded.',
                    'success'
                );
            } else {
                document.body.removeChild(tempDiv);
            }
        } catch (error) {
            document.body.removeChild(tempDiv);
            Swal.fire(
                'Error',
                'Failed to generate flashcard image. Please try again.',
                'error'
            );
            console.error('Download error:', error);
        }
    };

    const resetFilters = () => {
        setFilters({
            subject: '',
            difficulty: '',
            tag: '',
            dateFrom: '',
            dateTo: '',
        });
        setSearchQuery('');
    };

    // Pagination logic
    const indexOfLastCard = currentPage * cardsPerPage;
    const indexOfFirstCard = indexOfLastCard - cardsPerPage;
    const currentCards = filteredFlashcards.slice(indexOfFirstCard, indexOfLastCard);
    const totalPages = Math.ceil(filteredFlashcards.length / cardsPerPage);

    const cardColors = [
        'bg-gradient-to-br from-blue-100 to-blue-50',
        'bg-gradient-to-br from-green-100 to-green-50',
        'bg-gradient-to-br from-purple-100 to-purple-50',
        'bg-gradient-to-br from-yellow-100 to-yellow-50',
        'bg-gradient-to-br from-pink-100 to-pink-50',
        'bg-gradient-to-br from-indigo-100 to-indigo-50',
        'bg-gradient-to-br from-red-100 to-red-50',
        'bg-gradient-to-br from-teal-100 to-teal-50',
        'bg-gradient-to-br from-orange-100 to-orange-50',
    ];

    const difficultyColors = {
        easy: 'bg-green-100 text-green-800',
        medium: 'bg-yellow-100 text-yellow-800',
        hard: 'bg-red-100 text-red-800',
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                            Your Saved Flashcards
                        </h1>
                        <p className="mt-3 text-xl text-gray-500">
                            Review, organize, and study your knowledge
                        </p>
                    </div>

                    {/* Search and Filter Bar */}
                    <div className="mb-6 bg-white p-4 rounded-lg shadow">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                            <div className="relative flex-grow">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaSearch className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search flashcards..."
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <FaFilter className="mr-2" />
                                Filters
                            </button>
                            <button
                                onClick={resetFilters}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <FaTimes className="mr-2" />
                                Reset
                            </button>
                        </div>

                        {/* Filter Panel */}
                        {showFilters && (
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Subject</label>
                                    <input
                                        type="text"
                                        placeholder="Filter by subject"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        value={filters.subject}
                                        onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Difficulty</label>
                                    <select
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        value={filters.difficulty}
                                        onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                                    >
                                        <option value="">All Difficulties</option>
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Tag</label>
                                    <input
                                        type="text"
                                        placeholder="Filter by tag"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        value={filters.tag}
                                        onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">From Date</label>
                                    <input
                                        type="date"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        value={filters.dateFrom}
                                        onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">To Date</label>
                                    <input
                                        type="date"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        value={filters.dateTo}
                                        onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Flashcards Grid */}
                    {filteredFlashcards.length === 0 ? (
                        <div className="text-center py-12">
                            <h3 className="text-lg font-medium text-gray-900">No flashcards found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {flashcards.length === 0 ? 'You have no saved flashcards yet.' : 'Try adjusting your search or filters.'}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {currentCards.map((card, index) => (
                                    <div
                                        key={card._id}
                                        className={`${cardColors[index % cardColors.length]} rounded-xl shadow-lg overflow-hidden border border-gray-200 transform transition-all hover:scale-105 hover:shadow-xl`}
                                    >
                                        <div className="p-6 h-full flex flex-col">
                                            <div className="flex justify-between items-start mb-3">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${difficultyColors[card.difficulty]}`}>
                                                    {card.difficulty}
                                                </span>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleDownload(card)}
                                                        className="text-gray-500 hover:text-indigo-600"
                                                        title="Download"
                                                    >
                                                        <FaDownload className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(card._id)}
                                                        className="text-gray-500 hover:text-red-600"
                                                        title="Delete"
                                                    >
                                                        <FaTrash className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex-grow">
                                                <h3 className="text-lg font-bold text-gray-800 mb-3">{card.question}</h3>
                                                <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                                                    <p className="text-gray-700">{card.answer}</p>
                                                </div>
                                            </div>

                                            <div className="mt-auto">
                                                <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
                                                    <span className="font-medium text-gray-700">{card.subject}</span>
                                                    <span>{new Date(card.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                    {card.tags.map((tag, i) => (
                                                        <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="mt-8 flex items-center justify-between">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <FiChevronLeft className="mr-2" />
                                        Previous
                                    </button>
                                    <span className="text-sm text-gray-700">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                        <FiChevronRight className="ml-2" />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default SavedFlashcardsPage;