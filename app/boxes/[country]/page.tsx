import prisma from '@/lib/prisma'
import { CreateBoxDialog } from '@/components/box/CreateBoxDialog'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { getSenders } from '@/app/actions/shipments'
import { SenderFilter } from '@/components/workspace/SenderFilter'
import { ExportButton } from '@/components/workspace/ExportButton'
import { CountryBoxesWorkspace } from '@/components/box/CountryBoxesWorkspace'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function CountryBoxesPage({
  params,
  searchParams
}: {
  params: Promise<{ country: string }>
  searchParams: Promise<{ sender?: string }>
}) {
  const { country } = await params
  const { sender } = await searchParams
  const decodedCountry = decodeURIComponent(country)
  
  const allSenders = await getSenders()

  const boxes = await prisma.box.findMany({
    where: { 
      country: decodedCountry,
      ...(sender ? { sender_name: sender } : {})
    },
    include: { shipment: true },
    orderBy: { created_at: 'desc' }
  })
  
  const shipmentsForCountry = await prisma.shipment.findMany({
    where: { country: decodedCountry },
    select: { id: true, reference_box: true }
  })

  // Get senders specific to this country for the filter
  const countryShipments = await prisma.shipment.findMany({
    where: { country: decodedCountry },
    select: { sender_name: true }
  })
  const countryBoxes = await prisma.box.findMany({
    where: { country: decodedCountry },
    select: { sender_name: true }
  })
  const countrySendersSet = new Set<string>()
  countryShipments.forEach(s => countrySendersSet.add(s.sender_name))
  countryBoxes.forEach(b => countrySendersSet.add(b.sender_name))
  const countrySenders = Array.from(countrySendersSet).sort()

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/boxes" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{decodedCountry} Boxes</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">Boxes destined for {decodedCountry}.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-zinc-50 p-4 rounded-xl border dark:bg-zinc-900/50 dark:border-zinc-800">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold">All Boxes</h2>
          <SenderFilter senders={countrySenders} />
        </div>
        <div className="flex items-center gap-2">
          <ExportButton type="boxes" country={decodedCountry} data={boxes} />
          <CreateBoxDialog 
            country={decodedCountry} 
            availableShipments={shipmentsForCountry} 
            senders={allSenders}
          />
        </div>
      </div>

      <CountryBoxesWorkspace 
        initialBoxes={boxes} 
        country={decodedCountry}
        shipmentsForCountry={shipmentsForCountry}
        allSenders={allSenders}
      />
    </div>
  )
}
