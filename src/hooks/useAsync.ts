import {useEffect, useRef, useState} from 'react';
import {debounce} from 'lodash';
import {FetchFunctions, Item} from '../types';

const useAsync = (debounceDelay: number, fetchFunctions?: FetchFunctions) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [hasResults, setHasResults] = useState<boolean>(false);

  const fetchQuery = async (item: Item, query: string, callback?: (data: any) => void) => {
    if (item.value && fetchFunctions) {
      setIsLoading(true);
      try {
        const data = item.value ? await fetchFunctions[item.value](query) : [];
        item.subItems = data || [];
        if (callback) callback(data);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const debouncedFunctionRef = useRef<ReturnType<typeof debounce> | null>(null);
  const fetchDebounceOnQuery = (item: Item, query: string, callback?: (data: any) => void) => {
    const itemDebounceDelay = item.debounceDelay ?? debounceDelay; // Use per-item debounce if available

    debouncedFunctionRef.current?.cancel();

    console.log(`Debouncing fetch for item: ${item.value}, query: ${query}, delay: ${itemDebounceDelay}`)
    const debouncedFetch = debounce(fetchQuery, itemDebounceDelay);
    debouncedFunctionRef.current = debouncedFetch;
    debouncedFetch(item, query, callback);
  };

  const fetchInitial = async (item: Item) => {
    if (item.value && fetchFunctions) {
      setIsLoading(true);
      try {
        const data = item.value ? await fetchFunctions[item.value]() : [];
        item.subItems = data || [];
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup: cancel any pending debounce calls
      debouncedFunctionRef.current?.cancel();
    };
  }, []);


  return {
    isLoading,
    isSearching,
    hasResults,
    fetchDebounceOnQuery,
    fetchInitial,
    setIsSearching,
    setHasResults,
  };
};

export default useAsync;
