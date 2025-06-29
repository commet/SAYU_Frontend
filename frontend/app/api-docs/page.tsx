'use client';

import { useState } from 'react';
import { Copy, ExternalLink, Key, Zap, Globe, DollarSign } from 'lucide-react';

export default function APIDocsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedCode, setCopiedCode] = useState('');

  const copyToClipboard = (code: string, label: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(label);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            SAYU API Documentation
          </h1>
          <p className="text-lg text-muted-foreground">
            Integrate SAYU's art personality analysis into your applications
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b">
          {[
            { id: 'overview', label: 'Overview', icon: Globe },
            { id: 'free', label: 'Free API', icon: Zap },
            { id: 'premium', label: 'Premium API', icon: Key },
            { id: 'pricing', label: 'Pricing', icon: DollarSign }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-all ${
                activeTab === id
                  ? 'bg-primary text-primary-foreground border-b-2 border-primary'
                  : 'hover:bg-secondary'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="bg-card border rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4">Why Use SAYU API?</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">🎨 Art Personality Analysis</h3>
                  <p className="text-sm text-muted-foreground">
                    Get detailed personality insights based on art preferences
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">🤖 AI-Powered Recommendations</h3>
                  <p className="text-sm text-muted-foreground">
                    Generate personalized art and exhibition recommendations
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">📊 Behavioral Insights</h3>
                  <p className="text-sm text-muted-foreground">
                    Access deep analytics on art viewing patterns
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">🌍 Global Art Database</h3>
                  <p className="text-sm text-muted-foreground">
                    Tap into curated artworks from museums worldwide
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card border rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4">Quick Start</h2>
              <div className="space-y-4">
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="font-mono text-sm">
                    <span className="text-blue-600">GET</span> {process.env.NEXT_PUBLIC_API_URL}/api/public/personality-types
                  </p>
                  <button
                    onClick={() => copyToClipboard(`curl ${process.env.NEXT_PUBLIC_API_URL}/api/public/personality-types`, 'curl-basic')}
                    className="mt-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    {copiedCode === 'curl-basic' ? 'Copied!' : 'Copy cURL'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'free' && (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <h2 className="text-xl font-bold text-green-800 mb-2">Free Tier</h2>
              <p className="text-green-700">100 requests per 15 minutes • No API key required</p>
            </div>

            {/* Get Personality Types */}
            <div className="bg-card border rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Get Personality Types</h3>
              <div className="space-y-4">
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="font-mono text-sm mb-2">
                    <span className="text-green-600">GET</span> /api/public/personality-types
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Returns all 16 SAYU personality types with descriptions
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Example Response:</h4>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">
{`{
  "success": true,
  "data": {
    "VISIONARY": {
      "description": "Big picture thinker who sees art as transformative",
      "traits": ["innovative", "abstract", "future-focused"],
      "artPreferences": ["contemporary", "conceptual", "experimental"]
    },
    "EXPLORER": {
      "description": "Adventurous spirit seeking new artistic frontiers",
      "traits": ["curious", "experimental", "diverse"],
      "artPreferences": ["mixed-media", "global-art", "emerging-artists"]
    }
  }
}`}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(`curl ${process.env.NEXT_PUBLIC_API_URL}/api/public/personality-types`, 'personality-types')}
                    className="mt-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    {copiedCode === 'personality-types' ? 'Copied!' : 'Copy cURL'}
                  </button>
                </div>
              </div>
            </div>

            {/* Basic Analysis */}
            <div className="bg-card border rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Basic Personality Analysis</h3>
              <div className="space-y-4">
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="font-mono text-sm mb-2">
                    <span className="text-blue-600">POST</span> /api/public/analyze-basic
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Get basic personality analysis (limited features)
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Request Body:</h4>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">
{`{
  "responses": [
    "I prefer innovative and experimental art",
    "새로운 스타일의 작품에 관심이 많다",
    "Art should challenge conventional thinking"
  ]
}`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Example cURL:</h4>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">
{`curl -X POST ${process.env.NEXT_PUBLIC_API_URL}/api/public/analyze-basic \\
  -H "Content-Type: application/json" \\
  -d '{"responses": ["I prefer innovative art", "새로운 스타일 선호"]}'`}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(`curl -X POST ${process.env.NEXT_PUBLIC_API_URL}/api/public/analyze-basic -H "Content-Type: application/json" -d '{"responses": ["I prefer innovative art", "새로운 스타일 선호"]}'`, 'basic-analysis')}
                    className="mt-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    {copiedCode === 'basic-analysis' ? 'Copied!' : 'Copy cURL'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'premium' && (
          <div className="space-y-6">
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
              <h2 className="text-xl font-bold text-purple-800 mb-2">Premium API</h2>
              <p className="text-purple-700">1,000 requests per 15 minutes • API key required</p>
            </div>

            {/* Full Analysis */}
            <div className="bg-card border rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Full Personality Analysis</h3>
              <div className="space-y-4">
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="font-mono text-sm mb-2">
                    <span className="text-blue-600">POST</span> /api/public/analyze
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Complete personality analysis with detailed insights
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Headers:</h4>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs">
{`X-API-Key: sayu_your_api_key_here`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Example cURL:</h4>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">
{`curl -X POST ${process.env.NEXT_PUBLIC_API_URL}/api/public/analyze \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: sayu_your_api_key_here" \\
  -d '{"responses": [...], "userId": "optional_user_id"}'`}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(`curl -X POST ${process.env.NEXT_PUBLIC_API_URL}/api/public/analyze -H "Content-Type: application/json" -H "X-API-Key: sayu_your_api_key_here" -d '{"responses": [...], "userId": "optional_user_id"}'`, 'full-analysis')}
                    className="mt-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    {copiedCode === 'full-analysis' ? 'Copied!' : 'Copy cURL'}
                  </button>
                </div>
              </div>
            </div>

            {/* Get API Key */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">Get Your API Key</h3>
              <p className="text-yellow-700 mb-4">
                Contact us to get your premium API key for advanced features
              </p>
              <a
                href="mailto:contact@sayu.art?subject=API Key Request"
                className="inline-flex items-center gap-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Request API Key
              </a>
            </div>
          </div>
        )}

        {activeTab === 'pricing' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Free Tier */}
              <div className="bg-card border rounded-xl p-6">
                <h3 className="text-lg font-bold mb-2">Free Tier</h3>
                <p className="text-3xl font-bold text-green-600 mb-4">$0</p>
                <ul className="space-y-2 text-sm">
                  <li>✅ 100 requests per 15 minutes</li>
                  <li>✅ Basic personality analysis</li>
                  <li>✅ Personality type information</li>
                  <li>❌ No detailed insights</li>
                  <li>❌ No recommendations</li>
                </ul>
                <button className="w-full mt-4 bg-secondary text-secondary-foreground py-2 rounded-lg">
                  Start Free
                </button>
              </div>

              {/* Developer Tier */}
              <div className="bg-card border-2 border-purple-500 rounded-xl p-6 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white px-3 py-1 rounded-full text-xs">
                  Most Popular
                </div>
                <h3 className="text-lg font-bold mb-2">Developer</h3>
                <p className="text-3xl font-bold text-purple-600 mb-4">$29/mo</p>
                <ul className="space-y-2 text-sm">
                  <li>✅ 10,000 requests per month</li>
                  <li>✅ Full personality analysis</li>
                  <li>✅ Art recommendations</li>
                  <li>✅ Behavioral insights</li>
                  <li>✅ Email support</li>
                </ul>
                <button className="w-full mt-4 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700">
                  Get API Key
                </button>
              </div>

              {/* Enterprise Tier */}
              <div className="bg-card border rounded-xl p-6">
                <h3 className="text-lg font-bold mb-2">Enterprise</h3>
                <p className="text-3xl font-bold text-blue-600 mb-4">Custom</p>
                <ul className="space-y-2 text-sm">
                  <li>✅ Unlimited requests</li>
                  <li>✅ All features</li>
                  <li>✅ Custom endpoints</li>
                  <li>✅ SLA guarantee</li>
                  <li>✅ Priority support</li>
                </ul>
                <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                  Contact Sales
                </button>
              </div>
            </div>

            {/* Usage Examples */}
            <div className="bg-card border rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Use Cases</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">🖼️ Art Platforms</h4>
                  <p className="text-sm text-muted-foreground">
                    Integrate personality-based recommendations into your art marketplace
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">🏛️ Museums</h4>
                  <p className="text-sm text-muted-foreground">
                    Create personalized visitor experiences and exhibition guides
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">🤖 AI Applications</h4>
                  <p className="text-sm text-muted-foreground">
                    Add art personality context to chatbots and AI assistants
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">📱 Mobile Apps</h4>
                  <p className="text-sm text-muted-foreground">
                    Build art discovery apps with deep personalization
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}