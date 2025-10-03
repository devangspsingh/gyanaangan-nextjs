'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  WhatsappShareButton,
  TelegramShareButton,
} from 'react-share';
import {
  ShareIcon,
  ClipboardIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function ShareButtons({ post }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const title = post.title;
  const description = post.excerpt || post.meta_description || '';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <span className="flex items-center text-gray-400">
        <ShareIcon className="h-5 w-5 mr-2" />
        Share:
      </span>

      <TooltipProvider>
        <div className="flex flex-wrap gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <FacebookShareButton url={url} quote={title} className="hover:opacity-80">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-9 w-9 border-stone-600"
                >
                  <svg className="h-4 w-4 text-[#1877f2]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396v8.01Z" />
                  </svg>
                </Button>
              </FacebookShareButton>
            </TooltipTrigger>
            <TooltipContent>Share on Facebook</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <TwitterShareButton url={url} title={title} className="hover:opacity-80">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-9 w-9 border-stone-600"
                >
                  <svg className="h-4 w-4 text-[#1DA1F2]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 5.8a8.49 8.49 0 0 1-2.36.64 4.13 4.13 0 0 0 1.81-2.27 8.21 8.21 0 0 1-2.61 1 4.1 4.1 0 0 0-7 3.74 11.64 11.64 0 0 1-8.45-4.29 4.16 4.16 0 0 0-.55 2.07 4.09 4.09 0 0 0 1.82 3.41 4.05 4.05 0 0 1-1.86-.51v.05a4.1 4.1 0 0 0 3.3 4 4.1 4.1 0 0 1-1.86.07 4.11 4.11 0 0 0 3.83 2.84A8.22 8.22 0 0 1 3 18.34a11.57 11.57 0 0 0 6.29 1.85c7.55 0 11.67-6.25 11.67-11.67v-.53A8.43 8.43 0 0 0 23 5.8Z" />
                  </svg>
                </Button>
              </TwitterShareButton>
            </TooltipTrigger>
            <TooltipContent>Share on Twitter</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <LinkedinShareButton url={url} title={title} summary={description} className="hover:opacity-80">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-9 w-9 border-stone-600"
                >
                  <svg className="h-4 w-4 text-[#0077b5]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6.5 8C7.32843 8 8 7.32843 8 6.5C8 5.67157 7.32843 5 6.5 5C5.67157 5 5 5.67157 5 6.5C5 7.32843 5.67157 8 6.5 8Z" />
                    <path d="M5 10C5 9.44772 5.44772 9 6 9H7C7.55228 9 8 9.44771 8 10V19C8 19.5523 7.55228 20 7 20H6C5.44772 20 5 19.5523 5 19V10Z" />
                    <path d="M11 19V10C11 9.44771 11.4477 9 12 9H13C13.5523 9 14 9.44771 14 10V10.5C14.8467 9.54077 16.0714 9 17.5 9C20.5376 9 23 11.4624 23 14.5V19C23 19.5523 22.5523 20 22 20H21C20.4477 20 20 19.5523 20 19V14.5C20 13.1193 18.8807 12 17.5 12C16.1193 12 15 13.1193 15 14.5V19C15 19.5523 14.5523 20 14 20H12C11.4477 20 11 19.5523 11 19Z" />
                  </svg>
                </Button>
              </LinkedinShareButton>
            </TooltipTrigger>
            <TooltipContent>Share on LinkedIn</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <WhatsappShareButton url={url} title={title} className="hover:opacity-80">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-9 w-9 border-stone-600"
                >
                  <svg className="h-4 w-4 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                </Button>
              </WhatsappShareButton>
            </TooltipTrigger>
            <TooltipContent>Share on WhatsApp</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                className="h-9 w-9 border-stone-600"
                onClick={handleCopyLink}
              >
                {copied ? (
                  <CheckIcon className="h-4 w-4 text-green-500" />
                ) : (
                  <ClipboardIcon className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy Link</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
}
