'use client';

import ReactMarkdown from 'react-markdown';

interface NarrativeBlockProps {
  content: string;
}

export function NarrativeBlock({ content }: NarrativeBlockProps) {
  return (
    <div className="font-narrative text-body-lg text-text-primary/90 leading-relaxed max-w-3xl">
      <ReactMarkdown
        components={{
          p: ({ children }) => (
            <p className="mb-6 first:mt-0">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-text-primary">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-accent-amber-bright">{children}</em>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-accent-amber pl-4 my-6 italic text-text-secondary">
              {children}
            </blockquote>
          ),
          h3: ({ children }) => (
            <h3 className="font-sans text-heading-3 font-semibold text-text-primary mt-8 mb-4">{children}</h3>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
