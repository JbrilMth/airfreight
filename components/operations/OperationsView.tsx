'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { SearchInput } from '@/components/workspace/TableControls'
import { Users, UserCheck, PlaneTakeoff, Box, Coins, MapPin } from 'lucide-react'

type SenderStat = {
  name: string
  totalShipments: number
  shipmentsList: {
    id: string
    trackingNumbers: string
    recipientAddress: string
    country: string
  }[]
  totalBoxes: number
  totalCombinedPrice: number
}

type RecipientStat = {
  name: string
  recipientAddress: string
  totalShipments: number
  shipmentsList: {
    id: string
    trackingNumbers: string
    senderName: string
    country: string
  }[]
  totalBoxes: number
  totalCombinedPrice: number
}

type OperationsViewProps = {
  senders: SenderStat[]
  recipients: RecipientStat[]
}

export function OperationsView({ senders, recipients }: OperationsViewProps) {
  const [senderQuery, setSenderQuery] = useState('')
  const [recipientQuery, setRecipientQuery] = useState('')

  const filteredSenders = senders.filter(s => 
    s.name.toLowerCase().includes(senderQuery.toLowerCase()) ||
    s.shipmentsList.some(sh => 
      sh.trackingNumbers.toLowerCase().includes(senderQuery.toLowerCase()) ||
      sh.recipientAddress.toLowerCase().includes(senderQuery.toLowerCase())
    )
  )

  const filteredRecipients = recipients.filter(r => 
    r.name.toLowerCase().includes(recipientQuery.toLowerCase()) ||
    r.recipientAddress.toLowerCase().includes(recipientQuery.toLowerCase()) ||
    r.shipmentsList.some(sh => 
      sh.trackingNumbers.toLowerCase().includes(recipientQuery.toLowerCase()) ||
      sh.senderName.toLowerCase().includes(recipientQuery.toLowerCase())
    )
  )

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Operations Overview</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">
          Read-only dashboard displaying detailed operations stats per sender and recipient.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Senders Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Sender Activity</h2>
            </div>
            <SearchInput
              value={senderQuery}
              onChange={setSenderQuery}
              placeholder="Search senders or shipments..."
            />
          </div>

          <Card className="overflow-hidden">
            <CardContent className="p-0">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th className="px-4 py-3">Sender Name</th>
                      <th className="px-4 py-3">Shipments ({filteredSenders.reduce((a, s) => a + s.totalShipments, 0)})</th>
                      <th className="px-4 py-3 min-w-[280px]">Shipment Details (Tracking & Destination)</th>
                      <th className="px-4 py-3">Boxes</th>
                      <th className="px-4 py-3 text-right">Combined Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {filteredSenders.length > 0 ? (
                      filteredSenders.map((sender) => (
                        <tr key={sender.name} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                          <td className="px-4 py-4 font-semibold text-zinc-900 dark:text-zinc-50 vertical-top align-top">
                            <Link href={`/senders/${encodeURIComponent(sender.name)}`} className="hover:underline text-blue-600">
                              {sender.name}
                            </Link>
                          </td>
                          <td className="px-4 py-4 text-zinc-600 dark:text-zinc-400 font-medium vertical-top align-top">
                            {sender.totalShipments}
                          </td>
                          <td className="px-4 py-4 text-zinc-700 dark:text-zinc-300 vertical-top align-top">
                            {sender.shipmentsList.length > 0 ? (
                              <div className="space-y-3">
                                {sender.shipmentsList.map((ship, idx) => (
                                  <div key={ship.id} className="text-xs space-y-1 bg-zinc-50 dark:bg-zinc-900 p-2 rounded-lg border dark:border-zinc-800">
                                    <div className="font-mono text-blue-600 dark:text-blue-400">
                                      <Link href={`/shipments/${encodeURIComponent(ship.country)}/${ship.id}`} className="hover:underline">
                                        #{ship.trackingNumbers}
                                      </Link>
                                    </div>
                                    <div className="flex items-center text-zinc-500 dark:text-zinc-400">
                                      <MapPin className="h-3 w-3 mr-1" />
                                      <span className="truncate max-w-[240px]" title={ship.recipientAddress}>
                                        {ship.recipientAddress}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-zinc-400 dark:text-zinc-500">—</span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-zinc-600 dark:text-zinc-400 vertical-top align-top">
                            {sender.totalBoxes}
                          </td>
                          <td className="px-4 py-4 font-semibold text-zinc-900 dark:text-zinc-50 text-right vertical-top align-top">
                            ¥{sender.totalCombinedPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                          No active senders found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card list View */}
              <div className="block md:hidden divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredSenders.length > 0 ? (
                  filteredSenders.map((sender) => (
                    <div key={sender.name} className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-zinc-900 dark:text-zinc-50">
                          <Link href={`/senders/${encodeURIComponent(sender.name)}`} className="text-blue-600 hover:underline">
                            {sender.name}
                          </Link>
                        </h3>
                        <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
                          ¥{sender.totalCombinedPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-zinc-500 block">Total Shipments</span>
                          <span className="font-medium text-zinc-850 dark:text-zinc-200">{sender.totalShipments}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block">Total Boxes</span>
                          <span className="font-medium text-zinc-850 dark:text-zinc-200">{sender.totalBoxes}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-900">
                        <span className="text-zinc-500 text-xs block mb-2">Shipment Details:</span>
                        {sender.shipmentsList.length > 0 ? (
                          <div className="space-y-2">
                            {sender.shipmentsList.map((ship) => (
                              <div key={ship.id} className="text-xs p-2 bg-zinc-50 dark:bg-zinc-900 rounded-lg border dark:border-zinc-800 space-y-1">
                                <div className="font-mono font-medium text-blue-600 dark:text-blue-400">
                                  <Link href={`/shipments/${encodeURIComponent(ship.country)}/${ship.id}`} className="hover:underline">
                                    #{ship.trackingNumbers}
                                  </Link>
                                </div>
                                <div className="text-zinc-500 dark:text-zinc-400 flex items-center">
                                  <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                                  <span>{ship.recipientAddress}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-zinc-400 dark:text-zinc-500 text-xs">—</span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-zinc-500 text-sm">
                    No active senders found.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recipients Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Recipient Activity</h2>
            </div>
            <SearchInput
              value={recipientQuery}
              onChange={setRecipientQuery}
              placeholder="Search recipients..."
            />
          </div>

          <Card className="overflow-hidden">
            <CardContent className="p-0">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th className="px-4 py-3">Recipient Name</th>
                      <th className="px-4 py-3 max-w-[180px]">Main Address</th>
                      <th className="px-4 py-3">Shipments ({filteredRecipients.reduce((a, r) => a + r.totalShipments, 0)})</th>
                      <th className="px-4 py-3 min-w-[280px]">Shipment Details (Tracking & Sender)</th>
                      <th className="px-4 py-3">Boxes</th>
                      <th className="px-4 py-3 text-right">Combined Spend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {filteredRecipients.length > 0 ? (
                      filteredRecipients.map((recipient) => (
                        <tr key={recipient.name} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                          <td className="px-4 py-4 font-semibold text-zinc-900 dark:text-zinc-50 vertical-top align-top">
                            <Link href={`/recipients/${encodeURIComponent(recipient.name)}`} className="hover:underline text-blue-600">
                              {recipient.name}
                            </Link>
                          </td>
                          <td className="px-4 py-4 text-zinc-500 dark:text-zinc-400 text-xs max-w-[180px] truncate vertical-top align-top" title={recipient.recipientAddress}>
                            {recipient.recipientAddress}
                          </td>
                          <td className="px-4 py-4 text-zinc-600 dark:text-zinc-400 font-medium vertical-top align-top">
                            {recipient.totalShipments}
                          </td>
                          <td className="px-4 py-4 text-zinc-700 dark:text-zinc-300 vertical-top align-top">
                            {recipient.shipmentsList.length > 0 ? (
                              <div className="space-y-3">
                                {recipient.shipmentsList.map((ship, idx) => (
                                  <div key={ship.id} className="text-xs space-y-1 bg-zinc-50 dark:bg-zinc-900 p-2 rounded-lg border dark:border-zinc-800">
                                    <div className="font-mono text-blue-600 dark:text-blue-400">
                                      <Link href={`/shipments/${encodeURIComponent(ship.country)}/${ship.id}`} className="hover:underline">
                                        #{ship.trackingNumbers}
                                      </Link>
                                    </div>
                                    <div className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                                      Sent by: <span className="font-medium">{ship.senderName}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-zinc-400 dark:text-zinc-500">—</span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-zinc-600 dark:text-zinc-400 vertical-top align-top">
                            {recipient.totalBoxes}
                          </td>
                          <td className="px-4 py-4 font-semibold text-zinc-900 dark:text-zinc-50 text-right vertical-top align-top">
                            ¥{recipient.totalCombinedPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                          No active recipients found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card list View */}
              <div className="block md:hidden divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredRecipients.length > 0 ? (
                  filteredRecipients.map((recipient) => (
                    <div key={recipient.name} className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-zinc-900 dark:text-zinc-50">
                          <Link href={`/recipients/${encodeURIComponent(recipient.name)}`} className="text-blue-600 hover:underline">
                            {recipient.name}
                          </Link>
                        </h3>
                        <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
                          ¥{recipient.totalCombinedPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div className="text-xs text-zinc-500 bg-zinc-50 dark:bg-zinc-900 p-2 rounded-lg border dark:border-zinc-800">
                        <span className="block text-zinc-400 text-[10px] uppercase font-bold mb-0.5">Address</span>
                        <span>{recipient.recipientAddress}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-zinc-500 block">Total Shipments</span>
                          <span className="font-medium text-zinc-850 dark:text-zinc-200">{recipient.totalShipments}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block">Total Boxes</span>
                          <span className="font-medium text-zinc-850 dark:text-zinc-200">{recipient.totalBoxes}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-900">
                        <span className="text-zinc-500 text-xs block mb-2">Shipment Details:</span>
                        {recipient.shipmentsList.length > 0 ? (
                          <div className="space-y-2">
                            {recipient.shipmentsList.map((ship) => (
                              <div key={ship.id} className="text-xs p-2 bg-zinc-50 dark:bg-zinc-900 rounded-lg border dark:border-zinc-800 space-y-1">
                                <div className="font-mono font-medium text-blue-600 dark:text-blue-400">
                                  <Link href={`/shipments/${encodeURIComponent(ship.country)}/${ship.id}`} className="hover:underline">
                                    #{ship.trackingNumbers}
                                  </Link>
                                </div>
                                <div className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                                  Sent by: <span className="font-medium text-zinc-700 dark:text-zinc-300">{ship.senderName}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-zinc-400 dark:text-zinc-500 text-xs">—</span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-zinc-500 text-sm">
                    No active recipients found.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}
