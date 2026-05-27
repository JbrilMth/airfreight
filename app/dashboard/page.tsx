import prisma from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { PlaneTakeoff, Box, Coins, MapPin } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardPage() {
  const shipments = await prisma.shipment.findMany({
    include: { boxes: true }
  })
  const boxes = await prisma.box.findMany()

  // Aggregations
  const totalShipments = shipments.length
  const totalBoxes = boxes.length
  // Shipment value is always manual. Add value of unlinked boxes that have a price.
  const totalValue = shipments.reduce((acc, s) => acc + s.price, 0) + boxes.filter(b => !b.shipment_id && b.price != null).reduce((acc, b) => acc + (b.price ?? 0), 0)

  // Countries
  const countryMap = new Map<string, { shipments: number, boxes: number }>()
  
  shipments.forEach(s => {
    const data = countryMap.get(s.country) || { shipments: 0, boxes: 0 }
    data.shipments++
    countryMap.set(s.country, data)
  })
  boxes.forEach(b => {
    const data = countryMap.get(b.country) || { shipments: 0, boxes: 0 }
    data.boxes++
    countryMap.set(b.country, data)
  })

  const countries = Array.from(countryMap.entries()).map(([name, stats]) => ({
    name,
    ...stats
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Dashboard</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">Overview of all air freight shipments and boxes.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shipments</CardTitle>
            <PlaneTakeoff className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalShipments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Boxes</CardTitle>
            <Box className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBoxes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Countries</CardTitle>
            <MapPin className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{countries.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <Coins className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>By Country</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {countries.sort((a, b) => b.shipments - a.shipments).map((country) => (
                <div key={country.name} className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{country.name}</p>
                    <p className="text-sm text-zinc-500">{country.shipments} shipments, {country.boxes} boxes</p>
                  </div>
                </div>
              ))}
              {countries.length === 0 && (
                <p className="text-sm text-zinc-500 text-center py-4">No data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
