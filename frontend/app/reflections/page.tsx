'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { PenTool, Users, TrendingUp, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReflectionsList from '@/components/exhibition/ReflectionsList';
import ReflectionForm from '@/components/exhibition/ReflectionForm';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUser } from '@/hooks/use-user';
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/modal';

export default function ReflectionsPage() {
  const { language } = useLanguage();
  const { user } = useUser();
  const [showNewReflection, setShowNewReflection] = useState(false);
  const [activeTab, setActiveTab] = useState('my-reflections');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">
            {language === 'ko' ? '나의 전시 성찰' : 'My Exhibition Reflections'}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {language === 'ko'
              ? '전시를 관람하며 느낀 감정과 생각을 기록하고, 다른 사람들과 공유해보세요.'
              : 'Record your thoughts and emotions from exhibitions, and share them with others.'}
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm p-6 text-center"
          >
            <PenTool className="w-8 h-8 text-primary mx-auto mb-3" />
            <div className="text-3xl font-bold mb-1">12</div>
            <div className="text-sm text-muted-foreground">
              {language === 'ko' ? '작성한 성찰' : 'Reflections Written'}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm p-6 text-center"
          >
            <Users className="w-8 h-8 text-primary mx-auto mb-3" />
            <div className="text-3xl font-bold mb-1">5</div>
            <div className="text-sm text-muted-foreground">
              {language === 'ko' ? '공유한 성찰' : 'Shared Reflections'}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm p-6 text-center"
          >
            <TrendingUp className="w-8 h-8 text-primary mx-auto mb-3" />
            <div className="text-3xl font-bold mb-1">320</div>
            <div className="text-sm text-muted-foreground">
              {language === 'ko' ? '획득한 포인트' : 'Points Earned'}
            </div>
          </motion.div>
        </div>

        {/* Action Button */}
        <div className="text-center mb-8">
          <Button
            size="lg"
            onClick={() => setShowNewReflection(true)}
            className="gap-2"
          >
            <Plus className="w-5 h-5" />
            {language === 'ko' ? '새 성찰 작성하기' : 'Write New Reflection'}
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="my-reflections">
              {language === 'ko' ? '나의 성찰' : 'My Reflections'}
            </TabsTrigger>
            <TabsTrigger value="public-feed">
              {language === 'ko' ? '공개 성찰' : 'Public Feed'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-reflections" className="space-y-6">
            <ReflectionsList userId={user?.id} />
          </TabsContent>

          <TabsContent value="public-feed" className="space-y-6">
            <ReflectionsList showPublicFeed />
          </TabsContent>
        </Tabs>
      </div>

      {/* New Reflection Modal */}
      <Modal
        open={showNewReflection}
        onOpenChange={setShowNewReflection}
      >
        <ModalContent>
          <ModalHeader>
            <ModalTitle>{language === 'ko' ? '새 성찰 작성' : 'New Reflection'}</ModalTitle>
          </ModalHeader>
        <ReflectionForm
          exhibitionName=""
          onComplete={() => {
            setShowNewReflection(false);
            // Refresh the list
            window.location.reload();
          }}
        />
        </ModalContent>
      </Modal>
    </div>
  );
}