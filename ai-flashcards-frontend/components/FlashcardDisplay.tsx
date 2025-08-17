import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { FaSave, FaEdit, FaTags, FaGraduationCap } from 'react-icons/fa';

type Difficulty = 'easy' | 'medium' | 'hard';

interface Flashcard {
  question: string;
  answer: string;
}

interface FlashcardSaveData extends Flashcard {
  subject: string;
  difficulty: Difficulty;
  tags: string[];
}

interface FlashcardDisplayProps {
  flashcards: Flashcard[];
  onSave: (data: FlashcardSaveData) => Promise<void> | void;
}

const FlashcardDisplay: React.FC<FlashcardDisplayProps> = ({ flashcards, onSave }) => {
  const [formData, setFormData] = useState({
    subject: '',
    difficulty: 'medium' as Difficulty,
    tags: ''
  });

  const cardColors = [
    'bg-gradient-to-r from-blue-100 to-blue-50',
    'bg-gradient-to-r from-green-100 to-green-50',
    'bg-gradient-to-r from-purple-100 to-purple-50',
    'bg-gradient-to-r from-yellow-100 to-yellow-50',
    'bg-gradient-to-r from-pink-100 to-pink-50'
  ];

  const handleSaveClick = (card: Flashcard) => {
    Swal.fire({
      title: 'Save Flashcard',
      html: `
        <div class="text-left">
          <div class="mb-4">
            <label class="block text-gray-700 mb-2">Question</label>
            <div class="p-2 bg-gray-100 rounded">${card.question}</div>
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 mb-2">Answer</label>
            <div class="p-2 bg-gray-100 rounded">${card.answer}</div>
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 mb-2">Subject</label>
            <input 
              id="swal-subject" 
              class="swal2-input" 
              placeholder="e.g. Artificial Intelligence"
              value="${formData.subject}"
            >
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 mb-2">Difficulty</label>
            <div class="flex space-x-4">
              <label class="inline-flex items-center">
                <input type="radio" name="difficulty" value="easy" ${formData.difficulty === 'easy' ? 'checked' : ''} class="form-radio">
                <span class="ml-2">Easy</span>
              </label>
              <label class="inline-flex items-center">
                <input type="radio" name="difficulty" value="medium" ${formData.difficulty === 'medium' ? 'checked' : ''} class="form-radio">
                <span class="ml-2">Medium</span>
              </label>
              <label class="inline-flex items-center">
                <input type="radio" name="difficulty" value="hard" ${formData.difficulty === 'hard' ? 'checked' : ''} class="form-radio">
                <span class="ml-2">Hard</span>
              </label>
            </div>
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 mb-2">Tags (comma separated)</label>
            <input 
              id="swal-tags" 
              class="swal2-input" 
              placeholder="e.g. machine-learning, basics, concepts"
              value="${formData.tags}"
            >
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Save',
      cancelButtonText: 'Cancel',
      preConfirm: () => {
        return {
          question: card.question,
          answer: card.answer,
          subject: (document.getElementById('swal-subject') as HTMLInputElement).value,
          difficulty: (document.querySelector('input[name="difficulty"]:checked') as HTMLInputElement).value as Difficulty,
          tags: (document.getElementById('swal-tags') as HTMLInputElement).value
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag)
        };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        onSave(result.value as FlashcardSaveData);
      }
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {flashcards.map((card, index) => (
        <div 
          key={index} 
          className={`${cardColors[index % cardColors.length]} rounded-xl shadow-md p-6 border border-gray-200 transition-all hover:shadow-lg`}
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Flashcard #{index + 1}</h3>
            <button
              onClick={() => handleSaveClick(card)}
              className="text-indigo-600 hover:text-indigo-800 transition-colors"
              title="Save flashcard"
            >
              <FaSave className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center text-sm text-gray-500 mb-1">
                <FaEdit className="mr-2" />
                <span>Question</span>
              </div>
              <p className="text-gray-700">{card.question}</p>
            </div>
            
            <div>
              <div className="flex items-center text-sm text-gray-500 mb-1">
                <FaGraduationCap className="mr-2" />
                <span>Answer</span>
              </div>
              <p className="text-gray-700">{card.answer}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

interface GeneratedFlashcardsSectionProps {
  generatedFlashcards: Flashcard[];
}

const GeneratedFlashcardsSection: React.FC<GeneratedFlashcardsSectionProps> = ({ generatedFlashcards }) => {
  const handleSaveFlashcard = async (flashcardData: FlashcardSaveData) => {
    try {
      const response = await fetch('/api/v1/flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(flashcardData)
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      await Swal.fire({
        title: 'Success!',
        text: 'Flashcard saved successfully',
        icon: 'success',
        confirmButtonColor: '#3085d6',
      });
    } catch (error) {
      await Swal.fire({
        title: 'Error',
        text: error instanceof Error ? error.message : 'Failed to save flashcard',
        icon: 'error',
        confirmButtonColor: '#3085d6',
      });
    }
  };

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Generated Flashcards</h2>
      {generatedFlashcards.length > 0 ? (
        <FlashcardDisplay 
          flashcards={generatedFlashcards} 
          onSave={handleSaveFlashcard} 
        />
      ) : (
        <p className="text-gray-500">No flashcards generated yet</p>
      )}
    </div>
  );
};

export { FlashcardDisplay, GeneratedFlashcardsSection };
export type { Flashcard, FlashcardSaveData };