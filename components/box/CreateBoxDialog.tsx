'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createBox } from '@/app/actions/boxes'

type Shipment = {
  id: string
  reference_box: string
}

export function CreateBoxDialog({ 
  country, 
  availableShipments, 
  senders = [] 
}: { 
  country: string
  availableShipments: Shipment[]
  senders?: string[]
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    if (!formData.get('country')) formData.set('country', country)
    
    if (formData.get('shipment_id') === '') {
      formData.delete('shipment_id')
    }

    await createBox(formData)
    setLoading(false)
    setOpen(false)
  }

  return (
    <>
      <Button 
        onClick={() => setOpen(true)}
        className="min-h-[44px] sm:min-h-[36px]"
      >
        Create Box
      </Button>
      
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg dark:bg-zinc-950 border dark:border-zinc-800 text-left my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-zinc-900 dark:text-zinc-50">Create New Box to {country}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="hidden" name="country" value={country} />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Box Reference *</label>
                  <Input name="reference" required placeholder="e.g. BX-001" className="h-11 md:h-10" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Tracking Number</label>
                  <Input name="tracking_number" placeholder="Optional" className="h-11 md:h-10" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Sender Name *</label>
                <Input name="sender_name" required list="senders-box-list" placeholder="Select or type sender" className="h-11 md:h-10" />
                <datalist id="senders-box-list">
                  {senders.map(s => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Content Description *</label>
                <Input name="content" required placeholder="Electronics, Clothing, etc." className="h-11 md:h-10" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Weight (kg)</label>
                  <Input type="number" step="0.01" name="weight" placeholder="Optional" className="h-11 md:h-10" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Price (RMB)</label>
                  <Input type="number" step="0.01" name="price" placeholder="Optional" className="h-11 md:h-10" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Link to Shipment (Optional)</label>
                <select 
                  name="shipment_id" 
                  className="flex h-11 md:h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50" 
                  defaultValue=""
                >
                  <option value="">-- No linked shipment --</option>
                  {availableShipments.map(s => (
                    <option key={s.id} value={s.id}>{s.reference_box}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" className="min-h-[44px] sm:min-h-[36px]" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" className="min-h-[44px] sm:min-h-[36px]" disabled={loading}>
                  {loading ? 'Saving...' : 'Create Box'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
