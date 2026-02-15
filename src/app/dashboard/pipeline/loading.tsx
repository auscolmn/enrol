import { Skeleton } from '@/components/ui/skeleton';

export default function PipelineLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-5 w-48" />
      </div>

      {/* Pipeline Columns */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex-shrink-0 w-72">
            {/* Stage Header */}
            <div className="flex items-center gap-2 mb-3 px-1">
              <Skeleton className="w-3 h-3 rounded-full" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-8 ml-auto rounded-full" />
            </div>

            {/* Column */}
            <div className="bg-gray-100 rounded-lg p-3 min-h-[500px] space-y-3">
              {[1, 2, 3].slice(0, Math.max(1, 4 - i)).map((j) => (
                <div key={j} className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="flex items-start gap-2">
                    <Skeleton className="w-4 h-4" />
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </div>
                      <Skeleton className="h-4 w-40" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
