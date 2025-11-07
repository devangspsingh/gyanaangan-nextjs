'use client';

import { useState, useEffect } from 'react';
import { getMySubscriptions, toggleSpecialPageSubscription, toggleSubjectSubscription } from '@/services/apiService';
import { BookOpen, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';
import { BellIcon as BellOutlineIcon } from '@heroicons/react/24/outline';

export default function MySubscriptions() {
  const { isAuthenticated } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unsubscribing, setUnsubscribing] = useState({});

  useEffect(() => {
    if (isAuthenticated) {
      fetchSubscriptions();
    }
  }, [isAuthenticated]);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const response = await getMySubscriptions();
      if (!response.error) {
        setSubscriptions(response.data.results || response.data || []);
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async (subscription) => {
    const subscriptionKey = `${subscription.id}`;
    setUnsubscribing({ ...unsubscribing, [subscriptionKey]: true });

    try {
      let response;

      if (subscription.special_page) {
        response = await toggleSpecialPageSubscription(subscription.special_page.id);
      } else if (subscription.subject) {
        response = await toggleSubjectSubscription(subscription.subject.id);
      }

      if (!response.error) {
        toast.success('Unsubscribed successfully!');
        // Remove the subscription from the list
        setSubscriptions(subscriptions.filter(sub => sub.id !== subscription.id));
      } else {
        toast.error(response.data?.error || 'Failed to unsubscribe');
      }
    } catch (error) {
      console.error('Error unsubscribing:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setUnsubscribing({ ...unsubscribing, [subscriptionKey]: false });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow">
        <BellOutlineIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600 dark:text-gray-400">
          Please login to view your subscriptions
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow">
        <BellOutlineIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No Subscriptions Yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Subscribe to courses and subjects to receive updates about new resources
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <BellSolidIcon className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          My Subscriptions
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subscriptions.map((subscription) => {
          const isUnsubscribing = unsubscribing[`${subscription.id}`];

          return (
            <div
              key={subscription.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 border border-gray-200 dark:border-gray-700"
            >
              {subscription.special_page && (
                <>
                  <div className="flex items-start justify-between mb-2">
                    <GraduationCap className="w-6 h-6 text-blue-500 shrink-0" />
                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                      Course
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {subscription.special_page.stream.name} - {subscription.special_page.year.name}
                  </h3>
                  <p className="text-sm text-gray-300 font-bold  mb-2">
                    {subscription.special_page.course.name}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <Link
                      href={`/${subscription.special_page.course.slug}/${subscription.special_page.stream.slug}/${subscription.special_page.year.slug}`}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View Page →
                    </Link>
                    <button
                      onClick={() => handleUnsubscribe(subscription)}
                      disabled={isUnsubscribing}
                      className="p-1.5 text-white/80 hover:text-primary transition rounded-full hover:bg-white/10"
                      aria-label="Unsubscribe"
                      title="Unsubscribe"
                    >
                      {isUnsubscribing ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-current"></div>
                      ) : (
                        <BellSolidIcon className="size-6 text-primary" />
                      )}
                    </button>
                  </div>
                </>
              )}

              {subscription.subject && (
                <>
                  <div className="flex items-start justify-between mb-2">
                    <BookOpen className="w-6 h-6 text-green-500 shrink-0" />
                    <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                      Subject
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {subscription.subject.name}
                  </h3>
                  <div className="flex items-center justify-between mt-3">
                    <Link
                      href={`/subjects/${subscription.subject.slug}`}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View Subject →
                    </Link>
                    <button
                      onClick={() => handleUnsubscribe(subscription)}
                      disabled={isUnsubscribing}
                      className="p-1.5 text-white/80 hover:text-primary transition rounded-full hover:bg-white/10"
                      aria-label="Unsubscribe"
                      title="Unsubscribe"
                    >
                      {isUnsubscribing ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-current"></div>
                      ) : (
                        <BellSolidIcon className="size-6 text-primary" />
                      )}
                    </button>
                  </div>
                </>
              )}

              {subscription.course && !subscription.special_page && (
                <>
                  <div className="flex items-start justify-between mb-2">
                    <GraduationCap className="w-6 h-6 text-purple-500 shrink-0" />
                    <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
                      Course
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {subscription.course.name}
                  </h3>
                  <div className="flex items-center justify-between mt-3">
                    <Link
                      href={`/${subscription.course.slug}`}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View Course →
                    </Link>
                    <button
                      onClick={() => handleUnsubscribe(subscription)}
                      disabled={isUnsubscribing}
                      className="p-1.5 text-white/80 hover:text-primary transition rounded-full hover:bg-white/10"
                      aria-label="Unsubscribe"
                      title="Unsubscribe"
                    >
                      {isUnsubscribing ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-current"></div>
                      ) : (
                        <BellSolidIcon className="size-6 text-primary" />
                      )}
                    </button>
                  </div>
                </>
              )}

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                Subscribed on {new Date(subscription.created_at).toLocaleDateString()}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
