"use client";

import { GraduationCap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface LearnStudioButtonProps {
  hasAccess: boolean;
  enrollmentCount?: number;
  className?: string;
}

export function LearnStudioButton({ 
  hasAccess, 
  enrollmentCount = 0,
  className 
}: LearnStudioButtonProps) {
  if (!hasAccess) return null;

  return (
    <Link 
      href="https://learn.psychedelicinstitute.com.au/dashboard" 
      target="_blank"
      className={className}
    >
      <Button className="bg-[#22C55E] hover:bg-[#16A34A] text-white gap-2">
        <GraduationCap className="h-4 w-4" />
        Access Your Courses
        {enrollmentCount > 0 && (
          <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
            {enrollmentCount}
          </span>
        )}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </Link>
  );
}

// Smaller variant for cards/inline use
export function LearnStudioLink({ className }: { className?: string }) {
  return (
    <Link 
      href="https://learn.psychedelicinstitute.com.au/dashboard"
      target="_blank"
      className={`inline-flex items-center gap-1 text-sm text-[#22C55E] hover:text-[#16A34A] font-medium ${className}`}
    >
      <GraduationCap className="h-4 w-4" />
      Access courses
      <ArrowRight className="h-3 w-3" />
    </Link>
  );
}
