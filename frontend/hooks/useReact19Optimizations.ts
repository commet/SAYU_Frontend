'use client';

import { 
  use, 
  useTransition, 
  useDeferredValue, 
  useOptimistic,
  startTransition,
  useState,
  useCallback,
  useRef,
  useEffect
} from 'react';

// React 19 use() hook을 활용한 데이터 fetching 훅
export function useAsyncData<T>(promise: Promise<T>) {
  return use(promise);
}

// 낙관적 업데이트를 위한 커스텀 훅
export function useOptimisticState<T>(
  initialState: T,
  updateFn?: (currentState: T, optimisticValue: T) => T
) {
  const [optimisticState, addOptimistic] = useOptimistic(
    initialState,
    updateFn || ((current, optimisticValue) => optimisticValue)
  );

  const [isPending, startTransition] = useTransition();

  const updateOptimistic = useCallback((value: T) => {
    startTransition(() => {
      addOptimistic(value);
    });
  }, [addOptimistic]);

  return {
    optimisticState,
    updateOptimistic,
    isPending
  };
}

// 부드러운 상태 전환을 위한 훅
export function useSmoothTransition<T>(initialValue: T) {
  const [state, setState] = useState(initialValue);
  const [isPending, startTransition] = useTransition();
  const deferredState = useDeferredValue(state);

  const updateState = useCallback((newState: T) => {
    startTransition(() => {
      setState(newState);
    });
  }, []);

  return {
    state: deferredState,
    updateState,
    isPending,
    isTransitioning: state !== deferredState
  };
}

// 검색/필터링을 위한 디퍼드 훅
export function useDeferredSearch(query: string, delay: number = 300) {
  const [deferredQuery, setDeferredQuery] = useState(query);
  const deferredValue = useDeferredValue(deferredQuery);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDeferredQuery(query);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query, delay]);

  return {
    deferredQuery: deferredValue,
    isSearching: query !== deferredValue
  };
}

// 리스트 업데이트를 위한 낙관적 훅
export function useOptimisticList<T extends { id: string | number }>(
  initialList: T[]
) {
  const [optimisticList, addOptimisticUpdate] = useOptimistic(
    initialList,
    (currentList, { action, item }: { action: 'add' | 'update' | 'delete'; item: T | string | number }) => {
      switch (action) {
        case 'add':
          return [...currentList, item as T];
        case 'update':
          return currentList.map(existingItem => 
            existingItem.id === (item as T).id ? item as T : existingItem
          );
        case 'delete':
          return currentList.filter(existingItem => existingItem.id !== item);
        default:
          return currentList;
      }
    }
  );

  const [isPending, startTransition] = useTransition();

  const addItem = useCallback((item: T) => {
    startTransition(() => {
      addOptimisticUpdate({ action: 'add', item });
    });
  }, [addOptimisticUpdate]);

  const updateItem = useCallback((item: T) => {
    startTransition(() => {
      addOptimisticUpdate({ action: 'update', item });
    });
  }, [addOptimisticUpdate]);

  const deleteItem = useCallback((id: string | number) => {
    startTransition(() => {
      addOptimisticUpdate({ action: 'delete', item: id });
    });
  }, [addOptimisticUpdate]);

  return {
    optimisticList,
    addItem,
    updateItem,
    deleteItem,
    isPending
  };
}

// 폼 상태를 위한 낙관적 훅
export function useOptimisticForm<T extends Record<string, any>>(
  initialValues: T
) {
  const [optimisticValues, addOptimisticUpdate] = useOptimistic(
    initialValues,
    (currentValues, { field, value }: { field: keyof T; value: any }) => ({
      ...currentValues,
      [field]: value
    })
  );

  const [isPending, startTransition] = useTransition();

  const updateField = useCallback((field: keyof T, value: any) => {
    startTransition(() => {
      addOptimisticUpdate({ field, value });
    });
  }, [addOptimisticUpdate]);

  const resetForm = useCallback(() => {
    startTransition(() => {
      Object.keys(initialValues).forEach(key => {
        addOptimisticUpdate({ field: key as keyof T, value: initialValues[key] });
      });
    });
  }, [addOptimisticUpdate, initialValues]);

  return {
    values: optimisticValues,
    updateField,
    resetForm,
    isPending
  };
}

// 무한 스크롤을 위한 React 19 최적화 훅
export function useOptimizedInfiniteScroll<T>(
  fetchMore: (page: number) => Promise<T[]>,
  initialData: T[] = []
) {
  const [data, setData] = useState(initialData);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isPending, startTransition] = useTransition();
  
  // 낙관적 업데이트로 로딩 상태 개선
  const [optimisticData, addOptimisticData] = useOptimistic(
    data,
    (currentData, newItems: T[]) => [...currentData, ...newItems]
  );

  const loadMore = useCallback(async () => {
    if (isPending || !hasMore) return;

    startTransition(async () => {
      try {
        const newItems = await fetchMore(page);
        
        if (newItems.length === 0) {
          setHasMore(false);
          return;
        }

        // 낙관적 업데이트
        addOptimisticData(newItems);
        
        // 실제 상태 업데이트
        setData(prev => [...prev, ...newItems]);
        setPage(prev => prev + 1);
      } catch (error) {
        console.error('Failed to load more:', error);
      }
    });
  }, [fetchMore, page, isPending, hasMore, addOptimisticData]);

  return {
    data: optimisticData,
    loadMore,
    isPending,
    hasMore
  };
}

// 탭 전환을 위한 부드러운 전환 훅
export function useSmoothTabs<T extends string>(
  initialTab: T,
  tabs: T[]
) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isPending, startTransition] = useTransition();
  const deferredTab = useDeferredValue(activeTab);

  const changeTab = useCallback((newTab: T) => {
    if (tabs.includes(newTab)) {
      startTransition(() => {
        setActiveTab(newTab);
      });
    }
  }, [tabs]);

  return {
    activeTab: deferredTab,
    changeTab,
    isPending,
    isTransitioning: activeTab !== deferredTab
  };
}

// 실시간 검색을 위한 React 19 최적화 훅
export function useOptimizedSearch<T>(
  searchFn: (query: string) => Promise<T[]>,
  initialResults: T[] = []
) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(initialResults);
  const [isPending, startTransition] = useTransition();
  
  // 검색어 디퍼링으로 불필요한 요청 방지
  const deferredQuery = useDeferredValue(query);
  
  // 낙관적 결과 표시
  const [optimisticResults, addOptimisticResults] = useOptimistic(
    results,
    (currentResults, newResults: T[]) => newResults
  );

  // 검색 실행
  useEffect(() => {
    if (!deferredQuery.trim()) {
      setResults(initialResults);
      return;
    }

    startTransition(async () => {
      try {
        const searchResults = await searchFn(deferredQuery);
        
        // 낙관적 업데이트
        addOptimisticResults(searchResults);
        
        // 실제 결과 업데이트
        setResults(searchResults);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      }
    });
  }, [deferredQuery, searchFn, initialResults, addOptimisticResults]);

  const updateQuery = useCallback((newQuery: string) => {
    setQuery(newQuery);
  }, []);

  return {
    query,
    updateQuery,
    results: optimisticResults,
    isPending,
    isSearching: query !== deferredQuery
  };
}

// 데이터 mutation을 위한 낙관적 훅
export function useOptimisticMutation<TData, TError = Error>(
  mutationFn: (variables: any) => Promise<TData>,
  options?: {
    onSuccess?: (data: TData) => void;
    onError?: (error: TError) => void;
    optimisticUpdate?: (variables: any) => TData;
  }
) {
  const [data, setData] = useState<TData | null>(null);
  const [error, setError] = useState<TError | null>(null);
  const [isPending, startTransition] = useTransition();

  const [optimisticData, addOptimisticUpdate] = useOptimistic(
    data,
    (currentData, newData: TData) => newData
  );

  const mutate = useCallback(async (variables: any) => {
    startTransition(async () => {
      try {
        setError(null);
        
        // 낙관적 업데이트
        if (options?.optimisticUpdate) {
          const optimisticResult = options.optimisticUpdate(variables);
          addOptimisticUpdate(optimisticResult);
        }

        // 실제 mutation 실행
        const result = await mutationFn(variables);
        
        setData(result);
        options?.onSuccess?.(result);
      } catch (err) {
        const error = err as TError;
        setError(error);
        options?.onError?.(error);
      }
    });
  }, [mutationFn, options, addOptimisticUpdate]);

  return {
    data: optimisticData,
    error,
    isPending,
    mutate
  };
}

// 커스텀 Suspense 데이터 훅
export function useSuspenseQuery<T>(
  queryKey: string,
  queryFn: () => Promise<T>,
  options?: {
    staleTime?: number;
    cacheTime?: number;
  }
) {
  const cacheRef = useRef(new Map<string, { data: T; timestamp: number }>());
  const promiseRef = useRef<Promise<T> | null>(null);

  const getCachedData = () => {
    const cached = cacheRef.current.get(queryKey);
    if (!cached) return null;

    const isStale = options?.staleTime 
      ? Date.now() - cached.timestamp > options.staleTime
      : false;

    return isStale ? null : cached.data;
  };

  const cachedData = getCachedData();
  
  if (cachedData) {
    return cachedData;
  }

  if (!promiseRef.current) {
    promiseRef.current = queryFn().then(data => {
      cacheRef.current.set(queryKey, {
        data,
        timestamp: Date.now()
      });
      promiseRef.current = null;
      return data;
    });
  }

  // React 19 use() hook으로 Promise suspend
  return use(promiseRef.current);
}