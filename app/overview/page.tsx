import prisma from '@/lib/prisma'
import { OverviewWorkspace } from '@/components/overview/OverviewWorkspace'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function OverviewPage() {
  const shipments = await prisma.shipment.findMany({
    select: {
      id: true,
      reference_box: true,
      country: true,
      status: true,
    },
    orderBy: { created_at: 'desc' }
  })
  
  const boxes = await prisma.box.findMany({
    select: {
      id: true,
      reference: true,
      tracking_number: true,
      country: true,
      shipment: {
        select: {
          reference_box: true
        }
      }
    },
    orderBy: { created_at: 'desc' }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Overview</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">Cross-reference all shipments and boxes.</p>
      </div>

      <OverviewWorkspace initialShipments={shipments} initialBoxes={boxes} />
    </div>
  )
}
