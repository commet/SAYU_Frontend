import React, { useState } from 'react';
import MacOSDock from '@/components/ui/mac-os-dock';

// SAYU-themed app data with art and creativity icons
const sampleApps = [
  { 
    id: 'gallery', 
    name: 'Gallery', 
    icon: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=256&h=256&fit=crop' 
  },
  { 
    id: 'art-profile', 
    name: 'Art Profile', 
    icon: 'https://images.unsplash.com/photo-1572947650440-e8a97ef053b2?w=256&h=256&fit=crop' 
  },
  { 
    id: 'exhibition', 
    name: 'Exhibition', 
    icon: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=256&h=256&fit=crop' 
  },
  { 
    id: 'community', 
    name: 'Community', 
    icon: 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=256&h=256&fit=crop' 
  },
  { 
    id: 'emotions', 
    name: 'Emotions', 
    icon: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=256&h=256&fit=crop' 
  },
  { 
    id: 'apt-test', 
    name: 'APT Test', 
    icon: 'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=256&h=256&fit=crop' 
  },
  { 
    id: 'artists', 
    name: 'Artists', 
    icon: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=256&h=256&fit=crop' 
  },
  { 
    id: 'challenge', 
    name: 'Daily Challenge', 
    icon: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=256&h=256&fit=crop' 
  },
  { 
    id: 'settings', 
    name: 'Settings', 
    icon: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=256&h=256&fit=crop' 
  },
];

const DockDemo: React.FC = () => {
  const [openApps, setOpenApps] = useState<string[]>(['gallery', 'art-profile']);

  const handleAppClick = (appId: string) => {
    console.log('App clicked:', appId);
    
    // Toggle app in openApps array
    setOpenApps(prev => 
      prev.includes(appId) 
        ? prev.filter(id => id !== appId)
        : [...prev, appId]
    );
  };

  return (
    <div style={{ 
      height: '100vh', 
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      {/* The Dock Component */}
      <MacOSDock
        apps={sampleApps}
        onAppClick={handleAppClick}
        openApps={openApps}
      />
    </div>
  );
};

export default DockDemo;