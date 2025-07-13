'use client';

import React, { useState } from 'react';
import { FollowList } from '@/components/follow/FollowList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export default function FollowersPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>('followers');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold">팔로우 목록</h1>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'followers' | 'following')}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="followers">팔로워</TabsTrigger>
            <TabsTrigger value="following">팔로잉</TabsTrigger>
          </TabsList>

          <TabsContent value="followers">
            <FollowList userId={userId} type="followers" />
          </TabsContent>

          <TabsContent value="following">
            <FollowList userId={userId} type="following" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}