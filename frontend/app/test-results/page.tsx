'use client';

import { useState } from 'react';
import { getArtworkMatchingForPersonality } from '@/data/personality-artwork-matching-2025';

// Test component to verify our new 2025 matching system
export default function TestResultsPage() {
  const [selectedType, setSelectedType] = useState('LAEF');
  
  const personalityTypes = [
    'LAEF', 'LAEC', 'LAMF', 'LAMC',
    'LREF', 'LREC', 'LRMF', 'LRMC', 
    'SAEF', 'SAEC', 'SAMF', 'SAMC',
    'SREF', 'SREC', 'SRMF', 'SRMC'
  ];

  const matching = getArtworkMatchingForPersonality(selectedType);

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-3xl font-bold mb-8">Famous Artworks Test - 2025 System</h1>
      
      {/* Type Selector */}
      <div className="mb-8">
        <label className="block text-lg font-medium mb-4">Select Personality Type:</label>
        <select 
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="p-2 border rounded-md text-lg"
        >
          {personalityTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Results Display */}
      {matching && (
        <div className="space-y-8">
          <div className="bg-gray-100 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Matching Rationale:</h2>
            <p className="text-gray-700">{matching.matchingRationale}</p>
          </div>

          {/* Primary Match */}
          <div className="border-2 border-purple-200 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-purple-800 mb-2">
              Primary Match: {matching.primary.name}
            </h3>
            <p className="text-sm text-gray-600 mb-2">{matching.primary.period} - {matching.primary.style}</p>
            
            <div className="bg-white p-4 rounded border">
              <h4 className="font-semibold">Key Artwork: {matching.primary.keyArtwork.title}</h4>
              {matching.primary.keyArtwork.year && (
                <p className="text-sm text-gray-500">({matching.primary.keyArtwork.year})</p>
              )}
              <p className="mt-2 text-gray-700">{matching.primary.keyArtwork.description}</p>
              <p className="mt-2 text-sm italic text-purple-600">{matching.primary.keyArtwork.personalityResonance}</p>
            </div>
            
            <p className="mt-4 text-gray-600">{matching.primary.personalityAlignment}</p>
          </div>

          {/* Secondary Match */}
          <div className="border-2 border-blue-200 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-blue-800 mb-2">
              Secondary Match: {matching.secondary.name}
            </h3>
            <p className="text-sm text-gray-600 mb-2">{matching.secondary.period} - {matching.secondary.style}</p>
            
            <div className="bg-white p-4 rounded border">
              <h4 className="font-semibold">Key Artwork: {matching.secondary.keyArtwork.title}</h4>
              {matching.secondary.keyArtwork.year && (
                <p className="text-sm text-gray-500">({matching.secondary.keyArtwork.year})</p>
              )}
              <p className="mt-2 text-gray-700">{matching.secondary.keyArtwork.description}</p>
              <p className="mt-2 text-sm italic text-blue-600">{matching.secondary.keyArtwork.personalityResonance}</p>
            </div>
            
            <p className="mt-4 text-gray-600">{matching.secondary.personalityAlignment}</p>
          </div>

          {/* Tertiary Match */}
          <div className="border-2 border-green-200 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-green-800 mb-2">
              Hidden Gem: {matching.tertiary.name}
            </h3>
            <p className="text-sm text-gray-600 mb-2">{matching.tertiary.period} - {matching.tertiary.style}</p>
            
            <div className="bg-white p-4 rounded border">
              <h4 className="font-semibold">Key Artwork: {matching.tertiary.keyArtwork.title}</h4>
              {matching.tertiary.keyArtwork.year && (
                <p className="text-sm text-gray-500">({matching.tertiary.keyArtwork.year})</p>
              )}
              <p className="mt-2 text-gray-700">{matching.tertiary.keyArtwork.description}</p>
              <p className="mt-2 text-sm italic text-green-600">{matching.tertiary.keyArtwork.personalityResonance}</p>
            </div>
            
            <p className="mt-4 text-gray-600">{matching.tertiary.personalityAlignment}</p>
          </div>

          {/* Famous Works Summary */}
          <div className="bg-yellow-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Famous Works Featured:</h3>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span className="font-medium">{matching.primary.keyArtwork.title}</span>
                <span className="text-gray-600">by {matching.primary.name}</span>
              </li>
              <li className="flex justify-between">
                <span className="font-medium">{matching.secondary.keyArtwork.title}</span>
                <span className="text-gray-600">by {matching.secondary.name}</span>
              </li>
              <li className="flex justify-between">
                <span className="font-medium">{matching.tertiary.keyArtwork.title}</span>
                <span className="text-gray-600">by {matching.tertiary.name}</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}