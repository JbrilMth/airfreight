'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createShipment } from '@/app/actions/shipments'

export function CreateShipmentDialog({ country, senders = [] }: { country: string, senders?: string[] }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    if (!formData.get('country')) formData.set('country', country)
    await createShipment(formData)
    setLoading(false)
    setOpen(false)
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="min-h-[44px] sm:min-h-[36px]">
        Create Shipment
      </Button>
      
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-lg dark:bg-zinc-950 border dark:border-zinc-800 text-left my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-zinc-900 dark:text-zinc-50">Create New Shipment to {country}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="hidden" name="country" value={country} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Reference *</label>
                  <Input name="reference_box" required placeholder="e.g. SHP-001" className="h-11 md:h-10" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Sender Name *</label>
                  <Input name="sender_name" required list="senders-list-create" placeholder="Select or type sender" className="h-11 md:h-10" />
                  <datalist id="senders-list-create">
                    {senders.map(s => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Recipient Name *</label>
                  <Input name="recipient_name" required className="h-11 md:h-10" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Recipient Phone *</label>
                  <Input name="recipient_phone" required className="h-11 md:h-10" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Recipient Address *</label>
                  <Input name="recipient_address" required className="h-11 md:h-10" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Postal Code *</label>
                  <Input name="recipient_postal_code" required className="h-11 md:h-10" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Departure Date *</label>
                  <Input type="date" name="departure_date" required className="h-11 md:h-10" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Arrival Date *</label>
                  <Input type="date" name="arrival_date" required className="h-11 md:h-10" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Total Weight (kg) *</label>
                  <Input type="number" step="0.01" name="weight" required placeholder="0.00" className="h-11 md:h-10" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Total Price (RMB) *</label>
                  <Input type="number" step="0.01" name="price" required placeholder="0.00" className="h-11 md:h-10" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Status *</label>
                <select 
                  name="status" 
                  className="flex h-11 md:h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50" 
                  required 
                  defaultValue="info_received"
                >
                  <option value="info_received">Info Received</option>
                  <option value="in_transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" className="min-h-[44px] sm:min-h-[36px]" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" className="min-h-[44px] sm:min-h-[36px]" disabled={loading}>
                  {loading ? 'Saving...' : 'Create Shipment'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
