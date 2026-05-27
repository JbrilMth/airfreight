import { PageHeaderSkeleton, TableSkeleton } from '@/components/ui/Skeleton'

export default function OverviewLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-4">
          <TableSkeleton rows={8} cols={3} />
        </div>
        <div className="space-y-4">
          <TableSkeleton rows={8} cols={4} />
        </div>
      </div>
    </div>
  )
}
