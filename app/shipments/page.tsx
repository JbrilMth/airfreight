import prisma from '@/lib/prisma'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { PlaneTakeoff, MapPin } from 'lucide-react'
import { CreateWorkspaceDialog } from '@/components/workspace/CreateWorkspaceDialog'
import { ExportButton } from '@/components/workspace/ExportButton'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ShipmentsPage() {
  const shipments = await prisma.shipment.findMany({
    include: { boxes: true },
    orderBy: { created_at: 'desc' }
  })
  
  const countryMap = new Map<string, number>()
  shipments.forEach(s => {
    countryMap.set(s.country, (countryMap.get(s.country) || 0) + 1)
  })

  const countries = Array.from(countryMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Shipment Workspaces</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">Manage shipments grouped by destination country.</p>
        </div>
        <div className="flex items-center space-x-2">
          <ExportButton type="shipments" country="All" data={shipments} />
          <CreateWorkspaceDialog type="shipments" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {countries.map(country => (
          <Link key={country.name} href={`/shipments/${encodeURIComponent(country.name)}`}>
            <Card className="hover:border-zinc-300 transition-colors cursor-pointer dark:hover:border-zinc-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-semibold">{country.name}</CardTitle>
                <MapPin className="h-4 w-4 text-zinc-500" />
              </CardHeader>
              <CardContent>
                <div className="text-sm text-zinc-500 mt-2 flex items-center">
                  <PlaneTakeoff className="h-4 w-4 mr-2" />
                  {country.count} Shipments
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {countries.length === 0 && (
          <div className="col-span-full py-12 text-center text-zinc-500 border rounded-xl border-dashed border-zinc-200 dark:border-zinc-800">
            No country workspaces found. Try initiating a workspace to get started.
          </div>
        )}
      </div>
    </div>
  )
}
