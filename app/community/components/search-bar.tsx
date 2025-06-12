'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

interface SearchBarProps {
  defaultValue?: string;
}

export default function SearchBar({ defaultValue = '' }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState(defaultValue);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    const encodedQuery = encodeURIComponent(searchQuery.trim());
    router.push(`/community/search?q=${encodedQuery}`);
  };

  return (
    <form onSubmit={handleSearch} className="flex w-full max-w-xl">
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search questions..."
          className="w-full pl-10 pr-4 py-3 rounded-l-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button 
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-r-lg font-medium"
      >
        Search
      </button>
    </form>
  );
} 