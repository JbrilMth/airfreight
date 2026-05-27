import { PageHeaderSkeleton, TableSkeleton } from '@/components/ui/Skeleton'

export default function SenderDetailLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <TableSkeleton rows={8} cols={7} />
    </div>
  )
}
