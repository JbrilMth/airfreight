import { PageHeaderSkeleton, CardGridSkeleton, TableSkeleton } from '@/components/ui/Skeleton'

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <CardGridSkeleton count={4} />
      <div className="grid gap-4 md:grid-cols-2">
        <TableSkeleton rows={3} cols={2} />
      </div>
    </div>
  )
}
