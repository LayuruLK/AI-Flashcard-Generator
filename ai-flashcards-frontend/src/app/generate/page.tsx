"use client";

import React, { useState, useRef, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { FiUpload, FiFileText, FiClipboard } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Navbar from '../../../components/Navbar';
import Swal from 'sweetalert2';
import { FlashcardDisplay } from '../../../components/FlashcardDisplay';
import Footer from '../../../components/Footer';

const FlashcardGenerator = () => {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
    const [textInput, setTextInput] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [generatedFlashcards, setGeneratedFlashcards] = useState<any[]>([]);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));

            // Auto-switch to upload tab when file is selected
            setActiveTab('upload');
        }
    };

    const handlePaste = async () => {
        try {
            const clipboardText = await navigator.clipboard.readText();
            setTextInput(clipboardText);
            setActiveTab('paste');
            toast.success('Pasted text from clipboard!');
        } catch (err) {
            toast.error('Failed to access clipboard. Please paste manually.');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const userId = localStorage.getItem('userId');

        // Check authentication
        const token = localStorage.getItem('authToken');
        if (!token) {
            const result = await Swal.fire({
                title: 'Login Required',
                text: 'You need to login to generate flashcards',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Login',
                cancelButtonText: 'Cancel',
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
            });

            if (result.isConfirmed) {
                router.push('/login');
            }
            return;
        }

        // Validate input
        if (!selectedFile && !textInput.trim()) {
            await Swal.fire({
                title: 'Input Required',
                text: 'Please provide either a file or text input',
                icon: 'warning',
                confirmButtonColor: '#3085d6',
            });
            return;
        }

        setIsGenerating(true);

        // Show loading alert and store the instance
        let loadingAlert: any;
        try {
            loadingAlert = Swal.fire({
                title: 'Generating Flashcards',
                html: 'Please wait while we process your content...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const formData = new FormData();

            if (selectedFile) {
                formData.append('resource', selectedFile);
            }

            if (textInput.trim() && !selectedFile) {
                formData.append('text', textInput);
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/flashcards/generate-from-resource/${userId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to generate flashcards');
            }

            const result = await response.json();
            setGeneratedFlashcards(result.generatedFlashcards);

            // Close loading alert before showing success
            await Swal.close();

            await Swal.fire({
                title: 'Success!',
                text: 'Flashcards generated successfully!',
                icon: 'success',
                confirmButtonColor: '#3085d6',
            });
        } catch (error) {
            console.error('Generation error:', error);

            // Close loading alert before showing error
            await Swal.close();

            await Swal.fire({
                title: 'Error',
                text: error instanceof Error ? error.message : 'Failed to generate flashcards',
                icon: 'error',
                confirmButtonColor: '#3085d6',
            });
        } finally {
            setIsGenerating(false);

            // Ensure loading alert is closed in case of any unexpected issues
            if (loadingAlert) {
                await Swal.close();
            }
        }
    };

    const resetForm = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setTextInput('');
        setGeneratedFlashcards([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSaveFlashcard = async (flashcardData: any) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/flashcards`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                },
                body: JSON.stringify(flashcardData),
            });

            if (!response.ok) throw new Error(await response.text());

            await Swal.fire({
                title: 'Saved!',
                text: 'Flashcard added to your collection',
                icon: 'success',
            });
        } catch (error) {
            await Swal.fire({
                title: 'Error',
                text: error instanceof Error ? error.message : 'Save failed',
                icon: 'error',
            });
        }
    };

    return (
        <>
            <Navbar />
            <div className="max-w-4xl mx-auto p-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Generate Flashcards</h1>

                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="flex border-b border-gray-200 mb-6">
                        <button
                            className={`py-2 px-4 font-medium ${activeTab === 'upload' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
                            onClick={() => setActiveTab('upload')}
                        >
                            <FiUpload className="inline mr-2" />
                            Upload File
                        </button>
                        <button
                            className={`py-2 px-4 font-medium ${activeTab === 'paste' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
                            onClick={() => setActiveTab('paste')}
                        >
                            <FiFileText className="inline mr-2" />
                            Paste Text
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {activeTab === 'upload' && (
                            <div className="space-y-4">
                                <div
                                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-400 transition-colors"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept=".pdf,.txt,.md"
                                        className="hidden"
                                    />
                                    <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-600">
                                        {selectedFile ? selectedFile.name : 'Click to upload PDF, TXT, or MD file'}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Supports: PDF, TXT, Markdown files
                                    </p>
                                </div>

                                {previewUrl && (
                                    <div className="mt-4">
                                        <h3 className="text-sm font-medium text-gray-700 mb-2">File Preview</h3>
                                        <div className="border border-gray-200 rounded p-4 max-h-40 overflow-y-auto">
                                            {selectedFile?.type === 'application/pdf' ? (
                                                <p className="text-sm text-gray-600">PDF content will be processed for text extraction</p>
                                            ) : (
                                                <pre className="text-sm text-gray-600 whitespace-pre-wrap">{textInput}</pre>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'paste' && (
                            <div className="space-y-4">
                                <div className="relative">
                                    <textarea
                                        rows={8}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Paste your text here..."
                                        value={textInput}
                                        onChange={(e) => setTextInput(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={handlePaste}
                                        className="absolute right-2 top-2 bg-gray-100 hover:bg-gray-200 p-2 rounded-md text-gray-600"
                                        title="Paste from clipboard"
                                    >
                                        <FiClipboard />
                                    </button>
                                </div>
                                <p className="text-sm text-gray-500">
                                    The AI will analyze your text and generate flashcards automatically.
                                </p>
                            </div>
                        )}

                        <div className="mt-6 flex justify-between">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Reset
                            </button>
                            <button
                                type="submit"
                                disabled={isGenerating || (!selectedFile && !textInput.trim())}
                                className={`px-4 py-2 rounded-md text-sm font-medium text-white ${isGenerating || (!selectedFile && !textInput.trim()) ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                            >
                                {isGenerating ? 'Generating...' : 'Generate Flashcards'}
                            </button>
                        </div>
                    </form>

                    {/* Add the flashcard display section */}
                    {generatedFlashcards.length > 0 && (
                        <div className="mt-12">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Generated Flashcards</h2>
                            <FlashcardDisplay
                                flashcards={generatedFlashcards}
                                onSave={handleSaveFlashcard}
                            />
                        </div>
                    )}
                </div>

                {/* {generatedFlashcards.length > 0 && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Generated Flashcards</h2>
                        <div className="space-y-4">
                            {generatedFlashcards.map((card, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="font-medium text-gray-800 mb-2">Question: {card.question}</div>
                                    <div className="text-gray-600">Answer: {card.answer}</div>
                                    {card.explanation && (
                                        <div className="text-sm text-gray-500 mt-1">Explanation: {card.explanation}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="mt-6">
                            <button
                                onClick={() => {
                                    // Implement save functionality here
                                    toast.success('Flashcards saved to your collection!');
                                }}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                            >
                                Save Flashcards
                            </button>
                        </div>
                    </div>
                )} */}
            </div>
            <Footer/>
        </>
    );

};

export default FlashcardGenerator;