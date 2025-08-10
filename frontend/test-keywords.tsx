// Simple test component to verify keywords implementation
import { personalityDescriptions } from './data/personality-descriptions';

export default function TestKeywords() {
  console.log('LRMF data:', personalityDescriptions.LRMF);
  console.log('LRMF keywords:', personalityDescriptions.LRMF?.keywords);
  console.log('LRMF keywords_ko:', personalityDescriptions.LRMF?.keywords_ko);
  
  console.log('SAEF data:', personalityDescriptions.SAEF);
  console.log('SAEF keywords:', personalityDescriptions.SAEF?.keywords);
  console.log('SAEF keywords_ko:', personalityDescriptions.SAEF?.keywords_ko);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Keywords Test</h1>
      
      {/* Test LRMF */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">LRMF - 자유로운 분석가</h2>
        {personalityDescriptions.LRMF?.keywords && (
          <div className="flex flex-wrap gap-2">
            {personalityDescriptions.LRMF.keywords.map((keyword, index) => (
              <span key={index} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                {keyword}
              </span>
            ))}
          </div>
        )}
        {personalityDescriptions.LRMF?.keywords_ko && (
          <div className="flex flex-wrap gap-2 mt-2">
            {personalityDescriptions.LRMF.keywords_ko.map((keyword, index) => (
              <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {keyword}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Test SAEF */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">SAEF - 감정의 물결</h2>
        {personalityDescriptions.SAEF?.keywords && (
          <div className="flex flex-wrap gap-2">
            {personalityDescriptions.SAEF.keywords.map((keyword, index) => (
              <span key={index} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                {keyword}
              </span>
            ))}
          </div>
        )}
        {personalityDescriptions.SAEF?.keywords_ko && (
          <div className="flex flex-wrap gap-2 mt-2">
            {personalityDescriptions.SAEF.keywords_ko.map((keyword, index) => (
              <span key={index} className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">
                {keyword}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}