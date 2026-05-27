'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ChevronLeft, PlaneTakeoff, Box, Coins } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EditShipmentDialog } from '@/components/shipment/EditShipmentDialog'
import { EditBoxDialog } from '@/components/box/EditBoxDialog'
import { deleteShipment } from '@/app/actions/shipments'
import { deleteBox } from '@/app/actions/boxes'
import { SearchInput, PaginationControls } from '@/components/workspace/TableControls'

type BoxType = {
  id: string
  reference: string
  tracking_number: string | null
  weight: number | null
  content: string
  price: number | null
  country: string
  sender_name: string
  shipment_id: string | null
}

type ShipmentType = {
  id: string
  reference_box: string
  sender_name: string
  recipient_name: string
  recipient_phone: string
  recipient_address: string
  recipient_postal_code: string
  country: string
  departure_date: Date
  arrival_date: Date
  status: string
  price: number
  weight: number
  boxes: BoxType[]
}

type RecipientWorkspaceProps = {
  recipientName: string
  shipments: ShipmentType[]
  boxes: BoxType[]
  allRecipients: string[]
  allSenders: string[]
  availableShipmentsForBoxes: { id: string, reference_box: string }[]
}

export function RecipientWorkspace({
  recipientName,
  shipments,
  boxes,
  allRecipients,
  allSenders,
  availableShipmentsForBoxes
}: RecipientWorkspaceProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'shipments' | 'boxes'>('shipments')
  const [loading, setLoading] = useState<string | null>(null)

  // Search & Pagination States
  const [shipmentsSearch, setShipmentsSearch] = useState('')
  const [shipmentsPage, setShipmentsPage] = useState(1)

  const [boxesSearch, setBoxesSearch] = useState('')
  const [boxesPage, setBoxesPage] = useState(1)

  const PAGE_SIZE = 25

  // Compute stats
  const totalShipments = shipments.length
  const totalBoxes = boxes.length
  // Total spend = shipments prices + boxes prices that are NOT linked to any shipment (to avoid double counting)
  const totalSpend = shipments.reduce((acc, s) => acc + s.price, 0) + boxes.filter(b => !b.shipment_id).reduce((acc, b) => acc + (b.price ?? 0), 0)

  // Filter Shipments
  const filteredShipments = shipments.filter((s) => {
    const term = shipmentsSearch.toLowerCase()
    const trkNumbers = s.boxes.map((b) => b.tracking_number).filter(Boolean).join(', ').toLowerCase()
    return (
      s.reference_box.toLowerCase().includes(term) ||
      s.country.toLowerCase().includes(term) ||
      s.sender_name.toLowerCase().includes(term) ||
      s.status.toLowerCase().includes(term) ||
      trkNumbers.includes(term) ||
      String(s.price).includes(term)
    )
  })

  // Filter Boxes
  const filteredBoxes = boxes.filter((b) => {
    const term = boxesSearch.toLowerCase()
    return (
      b.reference.toLowerCase().includes(term) ||
      (b.tracking_number || '').toLowerCase().includes(term) ||
      b.content.toLowerCase().includes(term) ||
      b.country.toLowerCase().includes(term) ||
      (b.price != null && String(b.price).includes(term)) ||
      (b.weight != null && String(b.weight).includes(term))
    )
  })

  // Paginate Shipments
  const totalShipmentsPages = Math.ceil(filteredShipments.length / PAGE_SIZE)
  const shipmentsStartIndex = (shipmentsPage - 1) * PAGE_SIZE
  const shipmentsEndIndex = shipmentsStartIndex + PAGE_SIZE
  const paginatedShipments = filteredShipments.slice(shipmentsStartIndex, shipmentsEndIndex)

  // Paginate Boxes
  const totalBoxesPages = Math.ceil(filteredBoxes.length / PAGE_SIZE)
  const boxesStartIndex = (boxesPage - 1) * PAGE_SIZE
  const boxesEndIndex = boxesStartIndex + PAGE_SIZE
  const paginatedBoxes = filteredBoxes.slice(boxesStartIndex, boxesEndIndex)

  const handleShipmentsSearchChange = (val: string) => {
    setShipmentsSearch(val)
    setShipmentsPage(1)
  }

  const handleBoxesSearchChange = (val: string) => {
    setBoxesSearch(val)
    setBoxesPage(1)
  }

  // Delete Shipment handler
  async function handleDeleteShipment(id: string, country: string) {
    if (!confirm('Are you sure you want to delete this shipment? All linked boxes will be unlinked.')) {
      return
    }
    setLoading(id)
    try {
      await deleteShipment(id, country)
      router.refresh()
    } catch (err) {
      alert('Failed to delete shipment')
    } finally {
      setLoading(null)
    }
  }

  // Delete Box handler
  async function handleDeleteBox(id: string, country: string) {
    if (!confirm('Are you sure you want to delete this box?')) {
      return
    }
    setLoading(id)
    try {
      await deleteBox(id, country)
      router.refresh()
    } catch (err) {
      alert('Failed to delete box')
    } finally {
      setLoading(null)
    }
  }

  const formatDateSafely = (dateVal: Date | string) => {
    try {
      const d = typeof dateVal === 'string' ? new Date(dateVal) : dateVal
      return format(d, 'dd MMM yyyy')
    } catch (e) {
      return '—'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/recipients" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{recipientName} Workspace</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">Manage shipments and boxes for this recipient.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Total Shipments</CardTitle>
            <PlaneTakeoff className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{totalShipments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Total Boxes</CardTitle>
            <Box className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{totalBoxes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Total Spend</CardTitle>
            <Coins className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              ¥{totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs selector */}
      <div className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('shipments')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'shipments'
                ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500'
                : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300 dark:text-zinc-400 dark:hover:text-zinc-300'
            }`}
          >
            Shipments ({totalShipments})
          </button>
          <button
            onClick={() => setActiveTab('boxes')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'boxes'
                ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500'
                : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300 dark:text-zinc-400 dark:hover:text-zinc-300'
            }`}
          >
            Boxes ({totalBoxes})
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === 'shipments' ? (
        <div className="space-y-4">
          <div className="flex justify-end">
            <SearchInput
              value={shipmentsSearch}
              onChange={handleShipmentsSearchChange}
              placeholder="Search shipments..."
            />
          </div>
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th className="px-6 py-3">Tracking Number</th>
                      <th className="px-6 py-3">Country</th>
                      <th className="px-6 py-3">Sender Name</th>
                      <th className="px-6 py-3">Departure Date</th>
                      <th className="px-6 py-3">Arrival Date</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Price</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {paginatedShipments.length > 0 ? (
                      paginatedShipments.map((s) => {
                        const trkNumbers = s.boxes
                          .map((b) => b.tracking_number)
                          .filter(Boolean)
                          .join(', ')

                        return (
                          <tr key={s.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                            <td className="px-6 py-4 font-medium text-blue-600 hover:underline">
                              <Link href={`/shipments/${encodeURIComponent(s.country)}/${s.id}`}>
                                {trkNumbers || s.reference_box || '—'}
                              </Link>
                            </td>
                            <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{s.country}</td>
                            <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{s.sender_name}</td>
                            <td className="px-6 py-4 text-zinc-650 dark:text-zinc-400">{formatDateSafely(s.departure_date)}</td>
                            <td className="px-6 py-4 text-zinc-650 dark:text-zinc-400">{formatDateSafely(s.arrival_date)}</td>
                            <td className="px-6 py-4">
                              <Badge variant={s.status === 'delivered' ? 'success' : s.status === 'in_transit' ? 'warning' : 'default'}>
                                {s.status.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-50">
                              ¥{s.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end space-x-1">
                                <EditShipmentDialog shipment={s} senders={allSenders} />
                                <Button
                                  variant="ghost"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-2"
                                  disabled={loading === s.id}
                                  onClick={() => handleDeleteShipment(s.id, s.country)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td colSpan={8} className="px-6 py-8 text-center text-zinc-500">
                          No shipments found for this recipient.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card list */}
              <div className="block md:hidden divide-y divide-zinc-200 dark:divide-zinc-800">
                {paginatedShipments.length > 0 ? (
                  paginatedShipments.map((s) => {
                    const trkNumbers = s.boxes
                      .map((b) => b.tracking_number)
                      .filter(Boolean)
                      .join(', ')

                    return (
                      <div key={s.id} className="p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="space-y-0.5">
                            <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                              <Link href={`/shipments/${encodeURIComponent(s.country)}/${s.id}`} className="text-blue-600 hover:underline">
                                {trkNumbers || s.reference_box || '—'}
                              </Link>
                            </h3>
                            <p className="text-xs text-zinc-500 font-mono">
                              Ref: {s.reference_box}
                            </p>
                          </div>
                          <Badge variant={s.status === 'delivered' ? 'success' : s.status === 'in_transit' ? 'warning' : 'default'}>
                            {s.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-zinc-100 dark:border-zinc-900">
                          <div>
                            <span className="text-zinc-500 block">Country</span>
                            <span className="font-medium text-zinc-850 dark:text-zinc-200">{s.country}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block">Sender</span>
                            <span className="font-medium text-zinc-850 dark:text-zinc-200">{s.sender_name}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block">Departure</span>
                            <span className="font-medium text-zinc-850 dark:text-zinc-200">{formatDateSafely(s.departure_date)}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block">Arrival</span>
                            <span className="font-medium text-zinc-850 dark:text-zinc-200">{formatDateSafely(s.arrival_date)}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-zinc-500 block">Price</span>
                            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                              ¥{s.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <div className="flex-1 min-h-[44px]">
                            <EditShipmentDialog 
                              shipment={s} 
                              senders={allSenders} 
                              triggerClassName="w-full flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-2.5 text-sm font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900 min-h-[44px]"
                            />
                          </div>
                          <div className="flex-1 min-h-[44px]">
                            <Button
                              variant="ghost"
                              className="w-full flex items-center justify-center rounded-lg border border-red-200 dark:border-red-950/30 bg-red-50/50 dark:bg-red-950/10 py-2.5 text-sm font-semibold text-red-655 hover:bg-red-50 dark:hover:bg-red-950/20 min-h-[44px]"
                              disabled={loading === s.id}
                              onClick={() => handleDeleteShipment(s.id, s.country)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="p-8 text-center text-zinc-500 text-sm">
                    No shipments found matching the query.
                  </div>
                )}
              </div>

              <PaginationControls
                currentPage={shipmentsPage}
                totalPages={totalShipmentsPages}
                totalItems={filteredShipments.length}
                startIndex={shipmentsStartIndex}
                endIndex={shipmentsEndIndex}
                onPageChange={setShipmentsPage}
              />
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end">
            <SearchInput
              value={boxesSearch}
              onChange={handleBoxesSearchChange}
              placeholder="Search boxes..."
            />
          </div>
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th className="px-6 py-3">Reference</th>
                      <th className="px-6 py-3">Weight (kg)</th>
                      <th className="px-6 py-3">Content</th>
                      <th className="px-6 py-3">Country</th>
                      <th className="px-6 py-3">Price</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {paginatedBoxes.length > 0 ? (
                      paginatedBoxes.map((b) => (
                        <tr key={b.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                          <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-50">{b.reference}</td>
                          <td className="px-6 py-4 text-zinc-650 dark:text-zinc-400">{b.weight != null ? `${b.weight} kg` : '—'}</td>
                          <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300 max-w-[250px] truncate">{b.content}</td>
                          <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{b.country}</td>
                          <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-50">
                            {b.price != null ? `¥${b.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <EditBoxDialog
                                box={b}
                                availableShipments={availableShipmentsForBoxes}
                                senders={allSenders}
                              />
                              <Button
                                variant="ghost"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-2"
                                disabled={loading === b.id}
                                onClick={() => handleDeleteBox(b.id, b.country)}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                          No boxes found for this recipient.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card list */}
              <div className="block md:hidden divide-y divide-zinc-200 dark:divide-zinc-800">
                {paginatedBoxes.length > 0 ? (
                  paginatedBoxes.map((b) => (
                    <div key={b.id} className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-0.5">
                          <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                            {b.reference}
                          </h3>
                          <p className="text-xs text-zinc-500 font-mono">
                            {b.tracking_number || 'No Tracking #'}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-zinc-100 dark:border-zinc-900">
                        <div>
                          <span className="text-zinc-500 block">Weight</span>
                          <span className="font-medium text-zinc-850 dark:text-zinc-200">
                            {b.weight != null ? `${b.weight} kg` : '—'}
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block">Country</span>
                          <span className="font-medium text-zinc-850 dark:text-zinc-200">{b.country}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block">Price</span>
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                            {b.price != null ? `¥${b.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-zinc-500 block">Content</span>
                          <span className="text-zinc-700 dark:text-zinc-300 break-words">{b.content}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <div className="flex-1 min-h-[44px]">
                          <EditBoxDialog
                            box={b}
                            availableShipments={availableShipmentsForBoxes}
                            senders={allSenders}
                            triggerClassName="w-full flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-2.5 text-sm font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900 min-h-[44px]"
                          />
                        </div>
                        <div className="flex-1 min-h-[44px]">
                          <Button
                            variant="ghost"
                            className="w-full flex items-center justify-center rounded-lg border border-red-200 dark:border-red-950/30 bg-red-50/50 dark:bg-red-950/10 py-2.5 text-sm font-semibold text-red-655 hover:bg-red-50 dark:hover:bg-red-950/20 min-h-[44px]"
                            disabled={loading === b.id}
                            onClick={() => handleDeleteBox(b.id, b.country)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-zinc-500 text-sm">
                    No boxes found matching the query.
                  </div>
                )}
              </div>

              <PaginationControls
                currentPage={boxesPage}
                totalPages={totalBoxesPages}
                totalItems={filteredBoxes.length}
                startIndex={boxesStartIndex}
                endIndex={boxesEndIndex}
                onPageChange={setBoxesPage}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
