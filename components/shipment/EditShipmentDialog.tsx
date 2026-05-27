'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { updateShipment } from '@/app/actions/shipments'
import clsx from 'clsx'

type Shipment = {
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
}

export function EditShipmentDialog({ 
  shipment, 
  senders = [],
  triggerClassName
}: { 
  shipment: Shipment
  senders?: string[]
  triggerClassName?: string
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const formatDateForInput = (d: Date) => {
    const date = new Date(d)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    await updateShipment(shipment.id, formData)
    setLoading(false)
    setOpen(false)
  }

  return (
    <>
      <Button 
        variant="outline" 
        onClick={() => setOpen(true)}
        className={clsx(triggerClassName || "h-8 px-2 text-xs md:text-sm md:h-9 md:px-3")}
      >
        Edit Shipment
      </Button>
      
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-lg dark:bg-zinc-950 border dark:border-zinc-800 text-left my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-zinc-900 dark:text-zinc-50">Edit Shipment</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="hidden" name="country" value={shipment.country} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Reference *</label>
                  <Input name="reference_box" required defaultValue={shipment.reference_box} className="h-11 md:h-10" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Sender Name *</label>
                  <Input name="sender_name" required list="senders-list-edit" placeholder="Select or type sender" defaultValue={shipment.sender_name} className="h-11 md:h-10" />
                  <datalist id="senders-list-edit">
                    {senders.map(s => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Recipient Name *</label>
                  <Input name="recipient_name" required defaultValue={shipment.recipient_name} className="h-11 md:h-10" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Recipient Phone *</label>
                  <Input name="recipient_phone" required defaultValue={shipment.recipient_phone} className="h-11 md:h-10" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Recipient Address *</label>
                  <Input name="recipient_address" required defaultValue={shipment.recipient_address} className="h-11 md:h-10" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Postal Code *</label>
                  <Input name="recipient_postal_code" required defaultValue={shipment.recipient_postal_code} className="h-11 md:h-10" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Departure Date *</label>
                  <Input type="date" name="departure_date" required defaultValue={formatDateForInput(shipment.departure_date)} className="h-11 md:h-10" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Arrival Date *</label>
                  <Input type="date" name="arrival_date" required defaultValue={formatDateForInput(shipment.arrival_date)} className="h-11 md:h-10" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Total Weight (kg) *</label>
                  <Input type="number" step="0.01" name="weight" required defaultValue={shipment.weight} className="h-11 md:h-10" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Total Price (RMB) *</label>
                  <Input type="number" step="0.01" name="price" required defaultValue={shipment.price} className="h-11 md:h-10" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Status *</label>
                <select 
                  name="status" 
                  className="flex h-11 md:h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50" 
                  required 
                  defaultValue={shipment.status}
                >
                  <option value="info_received">Info Received</option>
                  <option value="in_transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" className="min-h-[44px] sm:min-h-[36px]" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" className="min-h-[44px] sm:min-h-[36px]" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
