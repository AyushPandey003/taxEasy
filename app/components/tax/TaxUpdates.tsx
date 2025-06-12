'use client';

import { useState, useEffect } from 'react';
import { fetchAllTaxUpdates } from '../../lib/actions/tax-data-actions';
import { TaxUpdate } from '../../lib/scraper';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Skeleton } from "../../components/ui/skeleton";
import { Calendar, ExternalLink, AlertCircle, Filter } from 'lucide-react';

export default function TaxUpdates() {
  const [updates, setUpdates] = useState<TaxUpdate[]>([]);
  const [filteredUpdates, setFilteredUpdates] = useState<TaxUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Map of sources to their badge colors for visual distinction
  const sourceColors: Record<string, string> = {
    'Income Tax Department (Notifications)': 'bg-blue-700 text-white',
    'Income Tax Department (Circulars)': 'bg-blue-600 text-white',
    'CBIC (GST Notifications)': 'bg-purple-700 text-white',
    'News API': 'bg-green-700 text-white',
    'GNews API': 'bg-green-600 text-white',
    'Economic Times (ET Wealth)': 'bg-amber-700 text-white',
    'LiveMint (Personal Finance)': 'bg-orange-700 text-white',
    'LiveMint RSS (Money)': 'bg-orange-600 text-white',
    'ClearTax Blog': 'bg-rose-700 text-white',
  };

  // Default color for unknown sources
  const defaultBadgeColor = 'bg-slate-700 text-white';

  useEffect(() => {
    async function loadTaxUpdates() {
      try {
        setLoading(true);
        const data = await fetchAllTaxUpdates();
        if (Array.isArray(data)) {
          setUpdates(data);
          setFilteredUpdates(data);
        } else {
          throw new Error('Unexpected response format');
        }
      } catch (err) {
        setError('Failed to load tax updates. Please try again later.');
        console.error('Error loading tax updates:', err);
      } finally {
        setLoading(false);
      }
    }

    loadTaxUpdates();
  }, []);

  useEffect(() => {
    // Filter updates based on active tab and search term
    let filtered = [...updates];

    // Apply tab filter
    if (activeTab !== 'all') {
      filtered = filtered.filter(update => {
        const source = update.source.toLowerCase();
        if (activeTab === 'income-tax') {
          return source.includes('income tax');
        } else if (activeTab === 'gst') {
          return source.includes('gst') || source.includes('cbic');
        } else if (activeTab === 'news') {
          return source.includes('news') || source.includes('economic') || 
                 source.includes('livemint') || source.includes('rss');
        }
        return true;
      });
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(update => 
        update.title.toLowerCase().includes(term) || 
        update.summary.toLowerCase().includes(term)
      );
    }

    setFilteredUpdates(filtered);
  }, [activeTab, searchTerm, updates]);

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString; // If parsing fails, return the original string
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllTaxUpdates();
      if (Array.isArray(data)) {
        setUpdates(data);
        setFilteredUpdates(data);
      } else {
        console.error('Unexpected response format on refresh:', data);
        setError('Failed to refresh tax updates due to unexpected data format.');
      }
    } catch {
        setError('Failed to refresh tax updates. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="w-full p-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-red-100">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="mb-2 text-xl font-medium text-gray-900 dark:text-white">{error}</h3>
        <Button onClick={handleRefresh} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Tax Updates
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mt-1">
            Latest tax laws, notifications, and news from various sources
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search updates..."
              className="pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search tax updates"
            />
            <span className="absolute right-3 top-2.5 text-gray-500">
              <Filter className="h-4 w-4" />
            </span>
          </div>
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            disabled={loading}
            aria-label="Refresh tax updates"
          >
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Updates</TabsTrigger>
          <TabsTrigger value="income-tax">Income Tax</TabsTrigger>
          <TabsTrigger value="gst">GST</TabsTrigger>
          <TabsTrigger value="news">News</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          {renderUpdates()}
        </TabsContent>
        <TabsContent value="income-tax" className="mt-0">
          {renderUpdates()}
        </TabsContent>
        <TabsContent value="gst" className="mt-0">
          {renderUpdates()}
        </TabsContent>
        <TabsContent value="news" className="mt-0">
          {renderUpdates()}
        </TabsContent>
      </Tabs>
    </div>
  );

  function renderUpdates() {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </CardFooter>
            </Card>
          ))}
        </div>
      );
    }

    if (filteredUpdates.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-lg text-gray-700 dark:text-gray-300">
            No tax updates found matching your criteria.
          </p>
          {searchTerm && (
            <Button 
              onClick={() => setSearchTerm('')} 
              variant="outline" 
              className="mt-4"
            >
              Clear Search
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUpdates.map((update, index) => (
          <Card 
            key={`${update.source}-${index}`} 
            className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full"
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start gap-2">
                <Badge 
                  className={sourceColors[update.source] || defaultBadgeColor}
                  aria-label={`Source: ${update.source}`}
                >
                  {update.source}
                </Badge>
                <div className="flex items-center text-gray-700 text-sm">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>{formatDate(update.date)}</span>
                </div>
              </div>
              <CardTitle className="text-xl mt-2 text-gray-900 dark:text-white line-clamp-2">
                {update.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-gray-700 dark:text-gray-300 line-clamp-3">
                {update.summary}
              </p>
            </CardContent>
            <CardFooter className="pt-2 border-t border-gray-100 dark:border-gray-800">
              <a 
                href={update.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium inline-flex items-center"
                aria-label={`Read more about ${update.title}`}
              >
                Read more <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }
} 