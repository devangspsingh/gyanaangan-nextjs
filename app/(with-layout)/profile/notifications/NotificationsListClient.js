'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getNotifications } from '@/services/apiService'; // Still needed for pagination
import { useNotification } from '@/context/NotificationContext'; // Import useNotification
import { BellRingIcon, CalendarDaysIcon, ExternalLinkIcon, EyeIcon, TagIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 10;
// LOCAL_STORAGE_READ_NOTIFICATIONS_KEY and helpers are now in NotificationContext

const getImportanceStyles = (importance) => {
  switch (importance?.toLowerCase()) {
    case 'high':
      return {
        iconColor: 'text-red-500',
        borderColor: 'border-red-500/50 hover:border-red-500/70',
        bgColorClass: 'bg-red-500/10',
      };
    case 'medium':
      return {
        iconColor: 'text-yellow-500',
        borderColor: 'border-yellow-500/50 hover:border-yellow-500/70',
        bgColorClass: 'bg-yellow-500/10',
      };
    case 'low':
    default:
      return {
        iconColor: 'text-primary', // Using primary for low/default
        borderColor: 'border-stone-700 hover:border-primary/30',
        bgColorClass: 'bg-stone-800/70',
      };
  }
};

const NotificationCard = ({ notification, onNotificationClick, isRead }) => {
  const styles = getImportanceStyles(notification.importance);
  const hasContent = notification?.content && notification?.content?.trim() !== "";
  const hasUrl = notification.url && notification.url.trim() !== "";

  return (
    <button
      onClick={() => onNotificationClick(notification)}
      className={`relative w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl p-5 shadow-lg border ${styles.borderColor} ${styles.bgColorClass} backdrop-blur-sm transition-all duration-300`}
      aria-label={`View details for notification: ${notification.title}`}
    >
      {!isRead && (
        <span className="absolute top-3 right-3 block h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-offset-1 ring-offset-current ring-primary animate-pulse" title="Unread"></span>
      )}
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 pt-1">
          <BellRingIcon className={`h-6 w-6 ${styles.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0"> {/* Added min-w-0 for proper truncation */}
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold text-white truncate pr-2">{notification.title}</h3>
            <div className="flex-shrink-0 flex items-center space-x-1.5">
              {hasContent && <EyeIcon className="h-4 w-4 text-gray-400" title="Contains message" />}
              {hasUrl && <ExternalLinkIcon className="h-4 w-4 text-gray-400" title="Contains link" />}
            </div>
          </div>

          {hasContent ? (
            <p className="text-gray-300 mt-1 text-sm leading-relaxed line-clamp-2">{notification.content}</p>
          ) : hasUrl ? (
            <p className="text-gray-400 mt-1 text-sm italic">This notification contains a link for more details.</p>
          ) : (
            <p className="text-gray-400 mt-1 text-sm italic">No additional details provided in summary.</p>
          )}

          <div className="mt-3 space-y-1.5">
            {/* {notification.tags && notification.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 items-center">
                <TagIcon className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                {notification?.tags && (
                  <span className="text-xs bg-stone-700/50 text-gray-400 px-2 py-0.5 rounded-full">
                    {notification.tags}
                  </span>
                )}
              </div>
            )} */}
            <div className="text-xs text-gray-500 flex items-center">
              <CalendarDaysIcon className="h-3.5 w-3.5 mr-1.5" />
              <span>Posted: {new Date(notification.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
};


const NotificationSkeleton = () => (
  <div className="bg-stone-800 p-5 rounded-xl shadow animate-pulse">
    <div className="flex items-start space-x-3">
        <div className="h-6 w-6 bg-gray-700 rounded-full"></div>
        <div className="flex-grow">
            <div className="h-5 bg-gray-700 rounded w-3/4 mb-2.5"></div>
            <div className="h-3 bg-gray-700 rounded w-full mb-1.5"></div>
            <div className="h-3 bg-gray-700 rounded w-full mb-3"></div>
            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
        </div>
    </div>
  </div>
);


export default function NotificationsListClient() {
  const { 
    markNotificationAsRead, 
    readNotificationIds: contextReadNotificationIds, 
    refreshNotifications 
  } = useNotification();
  
  const [notifications, setNotifications] = useState([]);
  const [currentPage, setCurrentPage] = useState(0); // Start at 0, page 1 will be the first loaded
  const [hasNextPage, setHasNextPage] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false); // Renamed from loading to loadingMore for clarity
  const [error, setError] = useState(null);

  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const observer = useRef();

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    setIsDrawerOpen(true);
    if (!contextReadNotificationIds.has(notification.id)) {
      markNotificationAsRead(notification.id);
    }
  };

  // Renamed to loadMoreNotifications, specifically for IntersectionObserver pagination
  const loadMoreNotifications = useCallback(async () => {
    // Guard against multiple calls or when no more pages
    if (loadingMore || !hasNextPage) return;

    setLoadingMore(true);
    setError(null);
    const nextPageToLoad = currentPage + 1;

    try {
      const response = await getNotifications(nextPageToLoad, PAGE_SIZE);
      if (response.error) {
        throw new Error(response.data?.detail || 'Failed to load notifications.');
      }
      setNotifications(prevNotifications => [...prevNotifications, ...response.data.results]);
      setCurrentPage(nextPageToLoad);
      setHasNextPage(!!response.data.next);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      console.error("Error loading more notifications:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [currentPage, hasNextPage, loadingMore]); // Dependencies for loading subsequent pages

  // useEffect for initial load (page 1)
  useEffect(() => {
    const fetchInitialNotifications = async () => {
      // Ensure this doesn't run if already loading or if initial page (e.g. page 1) has been loaded
      if (loadingMore || currentPage !== 0) return; 

      setLoadingMore(true);
      setError(null);
      try {
        const response = await getNotifications(1, PAGE_SIZE); // Fetch page 1
        if (response.error) {
          throw new Error(response.data?.detail || 'Failed to load initial notifications.');
        }
        setNotifications(response.data.results);
        setCurrentPage(1); // Set current page to 1
        setHasNextPage(!!response.data.next);
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
        console.error("Error loading initial notifications:", err);
      } finally {
        setLoadingMore(false);
      }
    };

    fetchInitialNotifications();
    if (refreshNotifications) { // Conditionally call if refreshNotifications is defined
        refreshNotifications(); 
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshNotifications]); // Runs once on mount or if refreshNotifications changes.
                              // currentPage is intentionally not a dep here to prevent re-fetch on its change by this effect.


  const lastNotificationElementRef = useCallback(node => {
    if (loadingMore || !hasNextPage) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage) { // Added hasNextPage check here too for safety
        loadMoreNotifications();
      }
    });
    if (node) observer.current.observe(node);
  }, [loadingMore, hasNextPage, loadMoreNotifications]);

  // Initial loading state (before any notifications are fetched, or if currentPage is 0)
  if (currentPage === 0 && loadingMore) { 
    return (
        <div className="space-y-4 max-w-2xl mx-auto">
            {Array.from({ length: 5 }).map((_, index) => (
                <NotificationSkeleton key={`initial_skel_${index}`} />
            ))}
        </div>
    );
  }
  
  if (notifications.length === 0 && !loadingMore && !error) {
    return <p className="text-center text-gray-400 text-lg py-10 max-w-2xl mx-auto">No notifications available at the moment.</p>;
  }

  if (error && notifications.length === 0) {
    return <p className="text-center text-red-500 py-10 max-w-2xl mx-auto">{error}</p>;
  }

  return (
    <>
      <div className="space-y-4 max-w-2xl mx-auto">
        {notifications.map((notification, index) => {
          const card = (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onNotificationClick={handleNotificationClick}
              isRead={contextReadNotificationIds.has(notification.id)} // Use context's read IDs
            />
          );
          if (notifications.length === index + 1) {
            return <div ref={lastNotificationElementRef} key={`wrapper-${notification.id}`}>{card}</div>;
          }
          return card;
        })}
        {loadingMore && currentPage > 0 && ( // Show loading skeletons only when paginating
          Array.from({ length: 3 }).map((_, index) => (
            <NotificationSkeleton key={`loading_skel_${index}`} />
          ))
        )}
        {!loadingMore && !hasNextPage && notifications.length > 0 && (
          <p className="text-center text-gray-500 py-4">You&apos;ve seen all notifications.</p>
        )}
        {error && notifications.length > 0 && <p className="text-center text-red-500 py-4">{error}</p>}
      </div>

      {selectedNotification && (
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerContent className="bg-stone-900 border-stone-800 text-gray-100">
            <div className="mx-auto w-full max-w-md p-4">
              <DrawerHeader className="text-left">
                <DrawerTitle className="text-2xl font-semibold text-white">{selectedNotification.title}</DrawerTitle>
                {selectedNotification.content && selectedNotification.content.trim() !== "" && (
                  <DrawerDescription className="text-gray-400 mt-2 whitespace-pre-wrap leading-relaxed">
                    {selectedNotification.content}
                  </DrawerDescription>
                )}
              </DrawerHeader>
              <DrawerFooter className="pt-4">
                {selectedNotification.url && selectedNotification.url.trim() !== "" && (
                  <Button asChild className="w-full bg-primary text-primary-dark hover:bg-primary/90">
                    <Link href={selectedNotification.url} target="_blank" rel="noopener noreferrer" onClick={() => setIsDrawerOpen(false)}>
                      Visit Page <ExternalLinkIcon className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
                <DrawerClose asChild>
                  <Button variant="outline" className="w-full mt-2 border-stone-700 hover:bg-stone-800">
                    Close
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
}
