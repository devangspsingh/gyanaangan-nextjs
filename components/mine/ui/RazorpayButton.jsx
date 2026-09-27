'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function RazorpayButton({ buttonId = 'pl_SkRvaNApeOAmRk', autoOpen = true }) {
  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = '';
    setIsLoading(true);

    const form = document.createElement('form');
    form.className = 'razorpay-form-wrapper';
    container.appendChild(form);

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/payment-button.js';
    script.setAttribute('data-payment_button_id', buttonId);
    script.async = true;

    let hasTriggeredAutoOpen = false;

    const triggerAutoOpen = (btn) => {
      if (!autoOpen || hasTriggeredAutoOpen) return;
      hasTriggeredAutoOpen = true;
      setTimeout(() => {
        btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      }, 400);
    };

    // Watch for the button mounting inside the form
    const observer = new MutationObserver(() => {
      const btn = form.querySelector('.PaymentButton, .razorpay-payment-button a, .razorpay-payment-button button');
      if (btn) {
        setIsLoading(false);
        triggerAutoOpen(btn);
      }
    });

    observer.observe(form, { childList: true, subtree: true });

    script.onload = () => {
      setTimeout(() => {
        setIsLoading(false);
        const btn = form.querySelector('.PaymentButton, .razorpay-payment-button a, .razorpay-payment-button button');
        if (btn) triggerAutoOpen(btn);
      }, 200);
    };

    script.onerror = () => {
      setIsLoading(false);
    };

    form.appendChild(script);

    return () => {
      observer.disconnect();
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [buttonId, autoOpen]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[64px] w-full">
      {isLoading && (
        <div className="flex items-center gap-2.5 text-sm text-orange-400 py-3 animate-pulse">
          <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
          <span className="font-medium">Loading secure payment options...</span>
        </div>
      )}
      <div 
        ref={containerRef} 
        className="flex justify-center items-center w-full transition-all duration-300 [&_.PaymentButton]:!scale-110 sm:[&_.PaymentButton]:!scale-125 [&_.PaymentButton]:!shadow-2xl [&_.PaymentButton]:hover:!scale-115 sm:[&_.PaymentButton]:hover:!scale-130 [&_.PaymentButton]:!transition-transform py-3"
      />
    </div>
  );
}

