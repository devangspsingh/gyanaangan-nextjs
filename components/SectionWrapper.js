import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/20/solid';

export default function SectionWrapper({ id, title, description, linkHref, linkText, children }) {
  return (
    <section id={id} className="py-12 md:py-16">
      <div className="px-4 mx-auto max-w-screen-xl z-10 relative">
        <div>
          <h2 className="text-2xl md:text-4xl font-heading-section font-extrabold text-primary">{title}</h2>
          <p className="my-4 text-lg font-body-desc font-medium text-secondary">{description}</p>
        </div>
        {children}
        {linkHref && linkText && (
          <div className="mt-8">
            <Link href={linkHref} className="text-primary-light text-lg hover:underline font-medium flex items-center gap-2 group">
              {linkText}
              <ArrowRightIcon className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
