"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiFileText, FiFile, FiDownload, FiChevronDown, FiChevronUp, FiTrash2, FiCopy, FiShare2, FiClock } from 'react-icons/fi';
import { FaFilePdf, FaFileAlt, FaRegStar, FaStar } from 'react-icons/fa';
import { BsFiletypeDoc, BsFiletypeDocx, BsFiletypePpt, BsFiletypeXlsx } from 'react-icons/bs';
import { RiFlashlightFill } from 'react-icons/ri';
import Navbar from '../../../components/Navbar';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from '../../../components/Footer';

interface Flashcard {
  _id: string;
  question: string;
  answer: string;
  isStarred?: boolean;
}

interface FlashcardHistory {
  _id: string;
  userId: string;
  originalContent: string;
  fileUrl: string | null;
  fileType: string | null;
  flashcards: Flashcard[];
  requestedAt: string;
  title?: string;
  tags?: string[];
}

const FlashcardHistoryPage = () => {
  const [history, setHistory] = useState<FlashcardHistory[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<FlashcardHistory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<'recent' | 'oldest' | 'mostCards' | 'leastCards'>('recent');
  const [isEditingTitle, setIsEditingTitle] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'starred'>('all');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [currentSharedItem, setCurrentSharedItem] = useState<FlashcardHistory | null>(null);
  const [shareEmail, setShareEmail] = useState('');

  // Fetch history data
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        const response = await fetch(`http://localhost:5000/api/v1/flashcardshistory/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch history');
        
        const data = await response.json();
        // Add default titles if not present
        const processedData = data.data.map((item: FlashcardHistory) => ({
          ...item,
          title: item.title || `Flashcard Set ${new Date(item.requestedAt).toLocaleDateString()}`,
          tags: item.tags || []
        }));
        setHistory(processedData);
        setFilteredHistory(processedData);
      } catch (error) {
        console.error('Error fetching history:', error);
        toast.error('Failed to load flashcard history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let results = [...history];
    
    // Apply search filter
    if (searchQuery) {
      results = results.filter(item =>
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.originalContent.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.flashcards.some(fc =>
          fc.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          fc.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
    
    // Apply file type filter
    if (fileTypeFilter !== 'all') {
      results = results.filter(item => item.fileType === fileTypeFilter);
    }
    
    // Apply tag filter
    if (selectedTags.length > 0) {
      results = results.filter(item => 
        item.tags && selectedTags.some(tag => item.tags?.includes(tag))
      );
    }
    
    // Apply starred filter
    if (activeTab === 'starred') {
      results = results.filter(item => 
        item.flashcards.some(fc => fc.isStarred)
      );
    }
    
    // Apply sorting
    switch (sortOption) {
      case 'recent':
        results.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
        break;
      case 'oldest':
        results.sort((a, b) => new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime());
        break;
      case 'mostCards':
        results.sort((a, b) => b.flashcards.length - a.flashcards.length);
        break;
      case 'leastCards':
        results.sort((a, b) => a.flashcards.length - b.flashcards.length);
        break;
    }
    
    setFilteredHistory(results);
  }, [searchQuery, fileTypeFilter, history, selectedTags, sortOption, activeTab]);

  // Get all unique tags from history
  const allTags = Array.from(new Set(history.flatMap(item => item.tags || [])));

  const toggleExpand = useCallback((id: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCards(newExpanded);
  }, [expandedCards]);

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

  const downloadContent = (content: string, fileName: string) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${fileName}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Download started!');
  };

  const downloadFlashcards = (flashcards: Flashcard[], fileName: string) => {
    const content = flashcards.map(fc => `Q: ${fc.question}\nA: ${fc.answer}`).join('\n\n');
    downloadContent(content, fileName);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.info('Copied to clipboard!');
  };

  const toggleStar = async (historyId: string, flashcardId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/v1/flashcards/${flashcardId}/star`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to update star status');
      
      setHistory(prev => prev.map(item => {
        if (item._id === historyId) {
          return {
            ...item,
            flashcards: item.flashcards.map(fc => {
              if (fc._id === flashcardId) {
                return { ...fc, isStarred: !fc.isStarred };
              }
              return fc;
            })
          };
        }
        return item;
      }))
      
      toast.success('Flashcard updated!');
    } catch (error) {
      console.error('Error toggling star:', error);
      toast.error('Failed to update flashcard');
    }
  };

  const deleteHistoryItem = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this flashcard set?')) return;
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/v1/flashcardshistory/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to delete history item');
      
      setHistory(prev => prev.filter(item => item._id !== id));
      toast.success('Flashcard set deleted!');
    } catch (error) {
      console.error('Error deleting history item:', error);
      toast.error('Failed to delete flashcard set');
    }
  };

  const startEditingTitle = (id: string, currentTitle: string) => {
    setIsEditingTitle(id);
    setNewTitle(currentTitle);
  };

  const saveTitle = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/v1/flashcardshistory/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: newTitle })
      });
      
      if (!response.ok) throw new Error('Failed to update title');
      
      setHistory(prev => prev.map(item => {
        if (item._id === id) {
          return { ...item, title: newTitle };
        }
        return item;
      }));
      
      setIsEditingTitle(null);
      toast.success('Title updated!');
    } catch (error) {
      console.error('Error updating title:', error);
      toast.error('Failed to update title');
    }
  };

  const addTag = async (id: string, tag: string) => {
    if (!tag.trim()) return;
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/v1/flashcardshistory/${id}/tags`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tag })
      });
      
      if (!response.ok) throw new Error('Failed to add tag');
      
      setHistory(prev => prev.map(item => {
        if (item._id === id) {
          return { 
            ...item, 
            tags: [...(item.tags || []), tag] 
          };
        }
        return item;
      }));
      
      toast.success('Tag added!');
    } catch (error) {
      console.error('Error adding tag:', error);
      toast.error('Failed to add tag');
    }
  };

  const removeTag = async (id: string, tag: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/v1/flashcardshistory/${id}/tags`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tag })
      });
      
      if (!response.ok) throw new Error('Failed to remove tag');
      
      setHistory(prev => prev.map(item => {
        if (item._id === id) {
          return { 
            ...item, 
            tags: item.tags?.filter(t => t !== tag) || [] 
          };
        }
        return item;
      }));
      
      toast.success('Tag removed!');
    } catch (error) {
      console.error('Error removing tag:', error);
      toast.error('Failed to remove tag');
    }
  };

  const openShareModal = (item: FlashcardHistory) => {
    setCurrentSharedItem(item);
    setIsShareModalOpen(true);
  };

  const handleShare = async () => {
    if (!shareEmail || !currentSharedItem) return;
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/v1/flashcardshistory/${currentSharedItem._id}/share`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: shareEmail })
      });
      
      if (!response.ok) throw new Error('Failed to share flashcard set');
      
      toast.success(`Flashcard set shared with ${shareEmail}!`);
      setIsShareModalOpen(false);
      setShareEmail('');
    } catch (error) {
      console.error('Error sharing flashcard set:', error);
      toast.error('Failed to share flashcard set');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
        <Navbar />
        <div className="flex-grow flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700">Loading your flashcard history...</h2>
            <p className="text-gray-500 mt-2">This may take a moment</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
      <Navbar />
      
      {/* Share Modal */}
      {isShareModalOpen && currentSharedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Share Flashcard Set</h3>
            <p className="text-gray-600 mb-2">Sharing: <span className="font-medium">{currentSharedItem.title}</span></p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Email</label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter email address"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsShareModalOpen(false);
                  setShareEmail('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleShare}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                Share
              </button>
            </div>
          </div>
        </div>
      )}
      
      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500">
              Your Flashcard History
            </h1>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Review, organize, and manage all your generated flashcards in one place
            </p>
          </div>

          {/* Filters and Controls */}
          <div className="bg-white shadow-xl rounded-2xl p-6 mb-8 border border-gray-100">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400 text-lg" />
                </div>
                <input
                  type="text"
                  placeholder="Search by title, content or flashcards..."
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {/* File Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by file type</label>
                <select
                  className="block w-full pl-3 pr-10 py-3 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-xl shadow-sm"
                  value={fileTypeFilter}
                  onChange={(e) => setFileTypeFilter(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="pdf">PDF</option>
                  <option value="txt">Text File</option>
                  <option value="md">Markdown</option>
                  <option value="doc">Word Document</option>
                  <option value="ppt">PowerPoint</option>
                  <option value="xlsx">Excel</option>
                  <option value="null">Direct Text</option>
                </select>
              </div>
              
              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
                <select
                  className="block w-full pl-3 pr-10 py-3 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-xl shadow-sm"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as any)}
                >
                  <option value="recent">Most Recent</option>
                  <option value="oldest">Oldest First</option>
                  <option value="mostCards">Most Flashcards</option>
                  <option value="leastCards">Fewest Flashcards</option>
                </select>
              </div>
            </div>
            
            {/* Tags Filter */}
            {allTags.length > 0 && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by tags</label>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        if (selectedTags.includes(tag)) {
                          setSelectedTags(selectedTags.filter(t => t !== tag));
                        } else {
                          setSelectedTags([...selectedTags, tag]);
                        }
                      }}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedTags.includes(tag) 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                  {selectedTags.length > 0 && (
                    <button
                      onClick={() => setSelectedTags([])}
                      className="px-3 py-1 rounded-full text-sm font-medium text-gray-600 hover:text-indigo-600"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </div>
            )}
            
            {/* Tabs */}
            <div className="mt-6 border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'all'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  All Flashcards
                </button>
                <button
                  onClick={() => setActiveTab('starred')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'starred'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Starred Items
                </button>
              </nav>
            </div>
          </div>

          {/* Results count */}
          <div className="mb-6 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold">{filteredHistory.length}</span> of <span className="font-semibold">{history.length}</span> sets
            </div>
            {selectedTags.length > 0 && (
              <div className="text-sm text-indigo-600">
                Filtering by: {selectedTags.join(', ')}
              </div>
            )}
          </div>

          {/* History List */}
          {filteredHistory.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                <FiFileText className="w-full h-full" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No flashcard sets found</h3>
              <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                {searchQuery 
                  ? 'Try adjusting your search or filters to find what you\'re looking for' 
                  : 'Your generated flashcard sets will appear here'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFileTypeFilter('all');
                    setSelectedTags([]);
                  }}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Reset all filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredHistory.map((item) => (
                <div key={item._id} className="bg-white shadow-lg overflow-hidden rounded-2xl border border-gray-100 transition-all hover:shadow-xl">
                  {/* Header */}
                  <div className="px-6 py-5 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center space-x-4 flex-grow min-w-0">
                      <div className="flex-shrink-0">
                        {getFileIcon(item.fileType)}
                      </div>
                      <div className="min-w-0 flex-grow">
                        {isEditingTitle === item._id ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              className="flex-grow px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              value={newTitle}
                              onChange={(e) => setNewTitle(e.target.value)}
                              autoFocus
                            />
                            <button
                              onClick={() => saveTitle(item._id)}
                              className="px-2 py-1 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setIsEditingTitle(null)}
                              className="px-2 py-1 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 group">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {item.title}
                            </h3>
                            <button
                              onClick={() => startEditingTitle(item._id, item.title || '')}
                              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-indigo-600"
                              title="Edit title"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          </div>
                        )}
                        <div className="flex items-center mt-1 text-sm text-gray-500">
                          <FiClock className="mr-1" />
                          <span>{new Date(item.requestedAt).toLocaleString()}</span>
                          <span className="mx-2">•</span>
                          <span>{item.flashcards.length} flashcards</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3 flex-shrink-0">
                      <button
                        onClick={() => downloadFlashcards(item.flashcards, item.title || `flashcards-${item._id}`)}
                        className="text-gray-400 hover:text-indigo-600 transition-colors"
                        title="Download flashcards"
                      >
                        <FiDownload className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => openShareModal(item)}
                        className="text-gray-400 hover:text-indigo-600 transition-colors"
                        title="Share"
                      >
                        <FiShare2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => deleteHistoryItem(item._id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <FiTrash2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => toggleExpand(item._id)}
                        className="flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
                      >
                        {expandedCards.has(item._id) ? (
                          <>
                            <span>Collapse</span>
                            <FiChevronUp className="ml-1 h-4 w-4" />
                          </>
                        ) : (
                          <>
                            <span>Expand</span>
                            <FiChevronDown className="ml-1 h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {/* Expanded Content */}
                  {expandedCards.has(item._id) && (
                    <div className="px-6 py-4 space-y-6">
                      {/* Tags */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Tags</h3>
                        <div className="flex flex-wrap gap-2 items-center">
                          {item.tags?.map(tag => (
                            <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                              {tag}
                              <button
                                onClick={() => removeTag(item._id, tag)}
                                className="ml-1.5 inline-flex text-indigo-400 hover:text-indigo-600"
                              >
                                <span className="sr-only">Remove tag</span>
                                <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                                  <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                                </svg>
                              </button>
                            </span>
                          ))}
                          <input
                            type="text"
                            placeholder="Add a tag..."
                            className="text-xs px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                addTag(item._id, e.currentTarget.value.trim());
                                e.currentTarget.value = '';
                              }
                            }}
                          />
                        </div>
                      </div>
                      
                      {/* Original Content */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-sm font-medium text-gray-700">Original Content</h3>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => copyToClipboard(item.originalContent)}
                              className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
                            >
                              <FiCopy className="mr-1 h-3 w-3" /> Copy
                            </button>
                            {item.fileUrl ? (
                              <a 
                                href={item.fileUrl} 
                                download
                                className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
                              >
                                <FiDownload className="mr-1 h-3 w-3" /> Download Original
                              </a>
                            ) : (
                              <button
                                onClick={() => downloadContent(item.originalContent, `${item.title}-original`)}
                                className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
                              >
                                <FiDownload className="mr-1 h-3 w-3" /> Download
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-60 overflow-y-auto">
                          <pre className="text-gray-700 whitespace-pre-wrap font-sans text-sm">
                            {item.originalContent}
                          </pre>
                        </div>
                      </div>
                      
                      {/* Flashcards */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-sm font-medium text-gray-700">
                            Generated Flashcards ({item.flashcards.length})
                          </h3>
                          <button
                            onClick={() => copyToClipboard(
                              item.flashcards.map(fc => `Q: ${fc.question}\nA: ${fc.answer}`).join('\n\n')
                            )}
                            className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
                          >
                            <FiCopy className="mr-1 h-3 w-3" /> Copy All
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {item.flashcards.map((flashcard) => (
                            <div 
                              key={flashcard._id} 
                              className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors relative group"
                            >
                              <button
                                onClick={() => toggleStar(item._id, flashcard._id)}
                                className="absolute top-2 right-2 text-gray-300 hover:text-yellow-500 transition-colors"
                                title={flashcard.isStarred ? "Unstar this flashcard" : "Star this flashcard"}
                              >
                                {flashcard.isStarred ? (
                                  <FaStar className="text-yellow-400 text-lg" />
                                ) : (
                                  <FaRegStar className="text-lg group-hover:opacity-70" />
                                )}
                              </button>
                              
                              <div className="font-medium text-gray-800 mb-2 pr-6">Q: {flashcard.question}</div>
                              <div className="text-gray-600 pl-4 border-l-2 border-indigo-200">A: {flashcard.answer}</div>
                              
                              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 flex space-x-1">
                                <button
                                  onClick={() => copyToClipboard(`Q: ${flashcard.question}\nA: ${flashcard.answer}`)}
                                  className="text-gray-400 hover:text-indigo-600 p-1"
                                  title="Copy flashcard"
                                >
                                  <FiCopy className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
    <Footer/>
    </>
  );
};

export default FlashcardHistoryPage;