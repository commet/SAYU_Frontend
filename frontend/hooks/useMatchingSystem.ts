import { useState, useEffect, useCallback } from 'react';
import { matchingAPI } from '@/lib/supabase/matching-api';
import { useUser } from '@supabase/auth-helpers-react';
import toast from 'react-hot-toast';
import { ExhibitionMatch, InteractionPrompt, SharedCollection } from '@/types/art-persona-matching';

export function useExhibitionMatches(exhibitionId?: string) {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMatches = useCallback(async () => {
    try {
      setLoading(true);
      const data = await matchingAPI.getExhibitionMatches(exhibitionId);
      setMatches(data);
    } catch (err) {
      setError(err as Error);
      toast.error('매칭 목록을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  }, [exhibitionId]);

  useEffect(() => {
    fetchMatches();

    // 실시간 구독
    if (exhibitionId) {
      const subscription = matchingAPI.subscribeToMatches(exhibitionId, (payload) => {
        console.log('Match update:', payload);
        fetchMatches(); // 간단하게 다시 불러오기
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [exhibitionId, fetchMatches]);

  const createMatch = async (matchData: Omit<ExhibitionMatch, 'id'>) => {
    try {
      const newMatch = await matchingAPI.createExhibitionMatch(matchData);
      toast.success('매칭이 생성되었습니다!');
      fetchMatches(); // 목록 새로고침
      return newMatch;
    } catch (err) {
      toast.error('매칭 생성에 실패했습니다');
      throw err;
    }
  };

  const applyToMatch = async (matchId: string) => {
    try {
      const updatedMatch = await matchingAPI.applyToMatch(matchId);
      toast.success('매칭 신청이 완료되었습니다!');
      fetchMatches();
      return updatedMatch;
    } catch (err) {
      toast.error('매칭 신청에 실패했습니다');
      throw err;
    }
  };

  return {
    matches,
    loading,
    error,
    createMatch,
    applyToMatch,
    refetch: fetchMatches
  };
}

export function useArtworkInteractions(artworkId?: string) {
  const [interactions, setInteractions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useUser();

  const fetchInteractions = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await matchingAPI.getArtworkInteractions(artworkId);
      setInteractions(data);
    } catch (err) {
      console.error('Failed to fetch interactions:', err);
    } finally {
      setLoading(false);
    }
  }, [artworkId, user]);

  useEffect(() => {
    fetchInteractions();

    // 실시간 구독
    if (artworkId) {
      const subscription = matchingAPI.subscribeToInteractions(artworkId, (payload) => {
        if (payload.eventType === 'INSERT') {
          setInteractions(prev => [...prev, payload.new]);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [artworkId, fetchInteractions]);

  const sendInteraction = async (interaction: Omit<InteractionPrompt, 'id' | 'createdAt'>) => {
    try {
      const newInteraction = await matchingAPI.saveArtworkInteraction(interaction);
      toast.success('메시지가 전송되었습니다');
      return newInteraction;
    } catch (err) {
      toast.error('메시지 전송에 실패했습니다');
      throw err;
    }
  };

  return {
    interactions,
    loading,
    sendInteraction
  };
}

export function useSharedCollections() {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCollections = useCallback(async () => {
    try {
      setLoading(true);
      const data = await matchingAPI.getSharedCollections();
      setCollections(data);
    } catch (err) {
      console.error('Failed to fetch collections:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const createCollection = async (collection: Omit<SharedCollection, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newCollection = await matchingAPI.createSharedCollection(collection);
      toast.success('컬렉션이 생성되었습니다!');
      fetchCollections();
      return newCollection;
    } catch (err) {
      toast.error('컬렉션 생성에 실패했습니다');
      throw err;
    }
  };

  return {
    collections,
    loading,
    createCollection,
    refetch: fetchCollections
  };
}

export function useAPTCompatibility(user1Id: string, user2Id: string) {
  const [compatibility, setCompatibility] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user1Id || !user2Id) return;

    const fetchCompatibility = async () => {
      try {
        setLoading(true);
        const data = await matchingAPI.calculateAPTCompatibility(user1Id, user2Id);
        setCompatibility(data);
      } catch (err) {
        console.error('Failed to calculate compatibility:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompatibility();
  }, [user1Id, user2Id]);

  return { compatibility, loading };
}

export function usePrivacyLevel() {
  const [updating, setUpdating] = useState(false);

  const updatePrivacyLevel = async (level: number, revealedInfo: string[]) => {
    try {
      setUpdating(true);
      await matchingAPI.updatePrivacyLevel(level, revealedInfo);
      toast.success('프라이버시 설정이 업데이트되었습니다');
    } catch (err) {
      toast.error('설정 업데이트에 실패했습니다');
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  return { updatePrivacyLevel, updating };
}