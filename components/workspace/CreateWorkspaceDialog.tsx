'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function CreateWorkspaceDialog({ type }: { type: 'shipments' | 'boxes' }) {
  const [open, setOpen] = useState(false)
  const [country, setCountry] = useState('')
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!country.trim()) return
    
    // Redirect to the newly initiated workspace
    router.push(`/${type}/${encodeURIComponent(country.trim())}`)
    setOpen(false)
    setCountry('')
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>Initiate Workspace</Button>
      
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg dark:bg-zinc-950 border dark:border-zinc-800">
            <h2 className="text-xl font-bold mb-4">Initiate New Workspace</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Destination Country</label>
                <Input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. France, Japan"
                  required
                  autoFocus
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit">Initiate</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
