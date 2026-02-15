'use client';

import { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';

interface FormCardActionsProps {
  slug: string;
}

export function FormCardActions({ slug }: FormCardActionsProps) {
  const [copied, setCopied] = useState(false);
  
  const publicUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/f/${slug}`
    : `/f/${slug}`;

  const copyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(publicUrl, '_blank');
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={copyLink}
        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
        title="Copy form link"
      >
        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
      </button>
      <button
        onClick={openLink}
        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
        title="Open form"
      >
        <ExternalLink className="w-4 h-4" />
      </button>
    </div>
  );
}
