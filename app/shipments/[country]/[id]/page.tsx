import prisma from '@/lib/prisma'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'
import { ChevronLeft, Package, User, MapPin, Calendar, CheckCircle, Weight } from 'lucide-react'
import { format } from 'date-fns'
import { EditShipmentDialog } from '@/components/shipment/EditShipmentDialog'
import { DeleteShipmentButton } from '@/components/shipment/DeleteShipmentButton'
import { LinkBoxSelector, UnlinkBoxButton } from '@/components/shipment/ManageBoxLink'
import { CreateBoxInsideShipmentDialog } from '@/components/shipment/CreateBoxInsideShipmentDialog'
import { getSenders } from '@/app/actions/shipments'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ShipmentDetailPage({ params }: { params: Promise<{ country: string, id: string }> }) {
  const { country, id } = await params
  const decodedCountry = decodeURIComponent(country)
  
  const shipment = await prisma.shipment.findUnique({
    where: { id },
    include: { boxes: true }
  })

  if (!shipment) {
    return <div className="text-zinc-500 py-12 text-center">Shipment not found.</div>
  }

  const senders = await getSenders()

  const unlinkedBoxes = await prisma.box.findMany({
    where: {
      country: decodedCountry,
      shipment_id: null
    },
    select: {
      id: true,
      reference: true,
      content: true
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href={`/shipments/${encodeURIComponent(decodedCountry)}`} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{shipment.reference_box}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="default" className="text-xs">
              Sender: {shipment.sender_name}
            </Badge>
            <Badge variant={shipment.status === 'delivered' ? 'success' : shipment.status === 'in_transit' ? 'warning' : 'default'} className="text-xs">
              {shipment.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </div>
        <div className="ml-auto flex items-center space-x-2">
          <EditShipmentDialog shipment={shipment} senders={senders} />
          <DeleteShipmentButton id={shipment.id} country={decodedCountry} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><User className="mr-2 h-5 w-5" /> Participants</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-zinc-500">Sender</p>
              <p className="font-medium">{shipment.sender_name}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-500">Recipient</p>
              <p className="font-medium">{shipment.recipient_name}</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{shipment.recipient_phone}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><MapPin className="mr-2 h-5 w-5" /> Location & Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-zinc-500">Destination Address</p>
              <p className="font-medium">{shipment.recipient_address}</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{shipment.country}, {shipment.recipient_postal_code}</p>
            </div>
            <div className="flex space-x-8">
              <div>
                <p className="text-sm text-zinc-500">Departure</p>
                <p className="font-medium flex items-center"><Calendar className="mr-1 h-3 w-3" /> {format(shipment.departure_date, 'dd MMM yyyy')}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-500">Expected Arrival</p>
                <p className="font-medium flex items-center"><CheckCircle className="mr-1 h-3 w-3" /> {format(shipment.arrival_date, 'dd MMM yyyy')}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <div>
                <p className="text-sm text-zinc-500">Total Weight</p>
                <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                  {shipment.weight.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg
                </p>
              </div>
              <div>
                <p className="text-sm text-zinc-500">Total Price</p>
                <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                  ¥{shipment.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold flex items-center mb-1"><Package className="mr-2 h-5 w-5" /> Boxes in this Shipment</h2>
          <p className="text-sm text-zinc-500">Create boxes directly or link existing unlinked boxes.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <CreateBoxInsideShipmentDialog shipmentId={shipment.id} country={decodedCountry} defaultSender={shipment.sender_name} />
          <LinkBoxSelector shipmentId={shipment.id} country={decodedCountry} unlinkedBoxes={unlinkedBoxes} />
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-6 py-3">Reference</th>
                  <th className="px-6 py-3">Tracking #</th>
                  <th className="px-6 py-3">Content</th>
                  <th className="px-6 py-3">Weight (kg)</th>
                  <th className="px-6 py-3">Sender</th>
                  <th className="px-6 py-3">Box Price</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {shipment.boxes.map(box => (
                  <tr key={box.id} className="border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                    <td className="px-6 py-4 font-medium">{box.reference}</td>
                    <td className="px-6 py-4 text-zinc-500">{box.tracking_number || '—'}</td>
                    <td className="px-6 py-4">{box.content}</td>
                    <td className="px-6 py-4">{box.weight != null ? `${box.weight} kg` : '—'}</td>
                    <td className="px-6 py-4">{box.sender_name}</td>
                    <td className="px-6 py-4 font-medium">
                      {box.price != null 
                        ? `¥${box.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                        : '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <UnlinkBoxButton boxId={box.id} country={decodedCountry} />
                    </td>
                  </tr>
                ))}
                {shipment.boxes.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-zinc-500">
                      No boxes in this shipment yet. Add one above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
