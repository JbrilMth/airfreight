import { PageHeaderSkeleton, CardGridSkeleton } from '@/components/ui/Skeleton'

export default function BoxesLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <CardGridSkeleton count={8} />
    </div>
  )
}
