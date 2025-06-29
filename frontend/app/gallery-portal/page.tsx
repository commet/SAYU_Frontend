'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { EmotionalButton, EmotionalCard } from '@/components/emotional/EmotionalCard';
import { Upload, Calendar, Users, MapPin, Check, ArrowRight } from 'lucide-react';
import '@/styles/emotional-palette.css';

interface GallerySubmission {
  galleryInfo: {
    name: string;
    city: string;
    country: string;
    website: string;
    instagram: string;
    type: string;
    size: string;
    specialization: string[];
  };
  currentExhibitions: Array<{
    title: string;
    artists: string[];
    startDate: string;
    endDate: string;
    description: string;
    personalityMatch: string[];
  }>;
  upcomingExhibitions: Array<{
    title: string;
    artists: string[];
    startDate: string;
    endDate: string;
    description: string;
    personalityMatch: string[];
  }>;
  representedArtists: Array<{
    name: string;
    website: string;
    instagram: string;
    brief: string;
  }>;
}

export default function GalleryPortalPage() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<GallerySubmission>({
    galleryInfo: {
      name: '',
      city: '',
      country: '',
      website: '',
      instagram: '',
      type: '',
      size: '',
      specialization: []
    },
    currentExhibitions: [{
      title: '',
      artists: [],
      startDate: '',
      endDate: '',
      description: '',
      personalityMatch: []
    }],
    upcomingExhibitions: [],
    representedArtists: [{
      name: '',
      website: '',
      instagram: '',
      brief: ''
    }]
  });

  const handleSubmit = async () => {
    // In production, would submit to API
    console.log('Submitting gallery data:', formData);
    setSubmitted(true);
  };

  const updateGalleryInfo = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      galleryInfo: {
        ...prev.galleryInfo,
        [field]: value
      }
    }));
  };

  const addSpecialization = (spec: string) => {
    if (!formData.galleryInfo.specialization.includes(spec)) {
      updateGalleryInfo('specialization', [...formData.galleryInfo.specialization, spec]);
    } else {
      updateGalleryInfo('specialization', 
        formData.galleryInfo.specialization.filter(s => s !== spec)
      );
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen gradient-dawn flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-12 max-w-2xl w-full text-center shadow-dream"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 bg-[hsl(var(--journey-amber))] rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Check className="w-10 h-10 text-white" />
          </motion.div>
          
          <h1 className="text-3xl font-serif mb-4 text-[hsl(var(--journey-midnight))]">
            Thank You for Joining SAYU!
          </h1>
          
          <p className="text-lg text-[hsl(var(--journey-twilight))] mb-8">
            Your gallery submission has been received. We'll review it carefully and 
            get back to you within 48 hours.
          </p>
          
          <p className="text-sm text-[hsl(var(--journey-twilight))] opacity-70">
            In the meantime, explore how SAYU connects art lovers with galleries like yours 
            through personalized discovery.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--gallery-white))]">
      {/* Header */}
      <header className="bg-white shadow-gentle">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-serif text-[hsl(var(--journey-midnight))]">
            Gallery Partnership Portal
          </h1>
          <p className="text-[hsl(var(--journey-twilight))] mt-2">
            Help art lovers discover your space and exhibitions
          </p>
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center space-x-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                i <= step 
                  ? 'bg-[hsl(var(--journey-amber))] text-white' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {i}
              </div>
              {i < 4 && (
                <div className={`w-20 h-1 ml-2 ${
                  i < step ? 'bg-[hsl(var(--journey-amber))]' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-4 pb-20">
        <AnimatePresence mode="wait">
          {/* Step 1: Gallery Info */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <EmotionalCard className="p-8">
                <h2 className="text-2xl font-serif mb-6 text-[hsl(var(--journey-midnight))]">
                  <MapPin className="inline-block w-6 h-6 mr-2" />
                  About Your Gallery
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Gallery Name *</label>
                    <input
                      type="text"
                      value={formData.galleryInfo.name}
                      onChange={(e) => updateGalleryInfo('name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[hsl(var(--journey-amber))]"
                      placeholder="Gallery Name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">City *</label>
                    <input
                      type="text"
                      value={formData.galleryInfo.city}
                      onChange={(e) => updateGalleryInfo('city', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[hsl(var(--journey-amber))]"
                      placeholder="New York, London, Seoul..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Website</label>
                    <input
                      type="url"
                      value={formData.galleryInfo.website}
                      onChange={(e) => updateGalleryInfo('website', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[hsl(var(--journey-amber))]"
                      placeholder="https://yourgallery.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Instagram</label>
                    <input
                      type="text"
                      value={formData.galleryInfo.instagram}
                      onChange={(e) => updateGalleryInfo('instagram', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[hsl(var(--journey-amber))]"
                      placeholder="@yourgallery"
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <label className="block text-sm font-medium mb-2">Gallery Type</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['Commercial', 'Non-profit', 'Museum', 'Alternative'].map(type => (
                      <button
                        key={type}
                        onClick={() => updateGalleryInfo('type', type.toLowerCase())}
                        className={`px-4 py-2 rounded-full border transition-all ${
                          formData.galleryInfo.type === type.toLowerCase()
                            ? 'bg-[hsl(var(--journey-amber))] text-white border-[hsl(var(--journey-amber))]'
                            : 'border-gray-300 hover:border-[hsl(var(--journey-amber))]'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="mt-6">
                  <label className="block text-sm font-medium mb-2">Specialization</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['Contemporary', 'Modern', 'Classical', 'Photography', 'Digital Art', 'Sculpture'].map(spec => (
                      <button
                        key={spec}
                        onClick={() => addSpecialization(spec)}
                        className={`px-4 py-2 rounded-full border transition-all ${
                          formData.galleryInfo.specialization.includes(spec)
                            ? 'bg-[hsl(var(--journey-dusty-rose))] text-white border-[hsl(var(--journey-dusty-rose))]'
                            : 'border-gray-300 hover:border-[hsl(var(--journey-dusty-rose))]'
                        }`}
                      >
                        {spec}
                      </button>
                    ))}
                  </div>
                </div>
              </EmotionalCard>
              
              <div className="flex justify-end">
                <EmotionalButton
                  onClick={() => setStep(2)}
                  variant="primary"
                  disabled={!formData.galleryInfo.name || !formData.galleryInfo.city}
                >
                  Next: Exhibitions
                  <ArrowRight className="w-4 h-4 ml-2" />
                </EmotionalButton>
              </div>
            </motion.div>
          )}

          {/* Step 2: Current Exhibitions */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <EmotionalCard className="p-8">
                <h2 className="text-2xl font-serif mb-6 text-[hsl(var(--journey-midnight))]">
                  <Calendar className="inline-block w-6 h-6 mr-2" />
                  Current & Upcoming Exhibitions
                </h2>
                
                <p className="text-sm text-[hsl(var(--journey-twilight))] mb-6">
                  Help us match your exhibitions with the right audience by sharing what's on view
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Exhibition Title</label>
                    <input
                      type="text"
                      value={formData.currentExhibitions[0].title}
                      onChange={(e) => {
                        const updated = [...formData.currentExhibitions];
                        updated[0].title = e.target.value;
                        setFormData(prev => ({ ...prev, currentExhibitions: updated }));
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[hsl(var(--journey-amber))]"
                      placeholder="Exhibition Title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Featured Artists</label>
                    <input
                      type="text"
                      placeholder="Artist names, separated by commas"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[hsl(var(--journey-amber))]"
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Start Date</label>
                      <input
                        type="date"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[hsl(var(--journey-amber))]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">End Date</label>
                      <input
                        type="date"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[hsl(var(--journey-amber))]"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Who would enjoy this exhibition?
                    </label>
                    <p className="text-xs text-[hsl(var(--journey-twilight))] mb-2">
                      Select the types of art lovers who would connect with this show
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        'Emotional Explorers',
                        'Technical Appreciators',
                        'Social Connectors',
                        'Quiet Contemplators',
                        'Adventure Seekers',
                        'Traditional Lovers'
                      ].map(type => (
                        <button
                          key={type}
                          className="px-3 py-2 text-sm rounded-full border border-gray-300 hover:border-[hsl(var(--journey-amber))] transition-all"
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </EmotionalCard>
              
              <div className="flex justify-between">
                <EmotionalButton
                  onClick={() => setStep(1)}
                  variant="ghost"
                >
                  Back
                </EmotionalButton>
                <EmotionalButton
                  onClick={() => setStep(3)}
                  variant="primary"
                >
                  Next: Artists
                  <ArrowRight className="w-4 h-4 ml-2" />
                </EmotionalButton>
              </div>
            </motion.div>
          )}

          {/* Step 3: Artists */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <EmotionalCard className="p-8">
                <h2 className="text-2xl font-serif mb-6 text-[hsl(var(--journey-midnight))]">
                  <Users className="inline-block w-6 h-6 mr-2" />
                  Your Artists
                </h2>
                
                <p className="text-sm text-[hsl(var(--journey-twilight))] mb-6">
                  We'll only show names and links - no images without permission
                </p>
                
                <div className="space-y-6">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Artist Name</label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[hsl(var(--journey-amber))]"
                          placeholder="Artist Name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Instagram</label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[hsl(var(--journey-amber))]"
                          placeholder="@artisthandle"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium mb-2">Brief Description</label>
                      <textarea
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[hsl(var(--journey-amber))]"
                        rows={2}
                        placeholder="A brief introduction to the artist's work..."
                      />
                    </div>
                  </div>
                  
                  <button className="text-[hsl(var(--journey-amber))] text-sm font-medium">
                    + Add Another Artist
                  </button>
                </div>
              </EmotionalCard>
              
              <div className="flex justify-between">
                <EmotionalButton
                  onClick={() => setStep(2)}
                  variant="ghost"
                >
                  Back
                </EmotionalButton>
                <EmotionalButton
                  onClick={() => setStep(4)}
                  variant="primary"
                >
                  Next: Review
                  <ArrowRight className="w-4 h-4 ml-2" />
                </EmotionalButton>
              </div>
            </motion.div>
          )}

          {/* Step 4: Review & Submit */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <EmotionalCard className="p-8">
                <h2 className="text-2xl font-serif mb-6 text-[hsl(var(--journey-midnight))]">
                  <Check className="inline-block w-6 h-6 mr-2" />
                  Review & Submit
                </h2>
                
                <div className="space-y-4 text-sm">
                  <div className="p-4 bg-[hsl(var(--gallery-pearl))] rounded-lg">
                    <h3 className="font-medium mb-2">Gallery Information</h3>
                    <p>{formData.galleryInfo.name}</p>
                    <p className="text-[hsl(var(--journey-twilight))]">
                      {formData.galleryInfo.city}, {formData.galleryInfo.country}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-[hsl(var(--gallery-pearl))] rounded-lg">
                    <h3 className="font-medium mb-2">What Happens Next?</h3>
                    <ul className="space-y-2 text-[hsl(var(--journey-twilight))]">
                      <li>• We'll review your submission within 48 hours</li>
                      <li>• Once approved, your gallery will appear in personalized recommendations</li>
                      <li>• You'll receive a dashboard to update exhibitions and artists</li>
                      <li>• Art lovers matching your exhibitions will discover your space</li>
                    </ul>
                  </div>
                </div>
              </EmotionalCard>
              
              <div className="flex justify-between">
                <EmotionalButton
                  onClick={() => setStep(3)}
                  variant="ghost"
                >
                  Back
                </EmotionalButton>
                <EmotionalButton
                  onClick={handleSubmit}
                  variant="primary"
                  className="bg-[hsl(var(--journey-amber))]"
                >
                  Submit for Review
                  <Upload className="w-4 h-4 ml-2" />
                </EmotionalButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}