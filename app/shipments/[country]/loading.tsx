import { PageHeaderSkeleton, TableSkeleton } from '@/components/ui/Skeleton'

export default function CountryShipmentsLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <TableSkeleton rows={10} cols={8} />
    </div>
  )
}
