'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { updateBoxLink } from '@/app/actions/boxes'

type UnlinkedBox = {
  id: string
  reference: string
  content: string
}

export function LinkBoxSelector({
  shipmentId,
  country,
  unlinkedBoxes,
}: {
  shipmentId: string
  country: string
  unlinkedBoxes: UnlinkedBox[]
}) {
  const [selectedBoxId, setSelectedBoxId] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLink() {
    if (!selectedBoxId) return
    setLoading(true)
    await updateBoxLink(selectedBoxId, shipmentId, country)
    setSelectedBoxId('')
    setLoading(false)
  }

  if (unlinkedBoxes.length === 0) {
    return <p className="text-sm text-zinc-500">No unlinked boxes available for {country}.</p>
  }

  return (
    <div className="flex items-center space-x-2">
      <select
        value={selectedBoxId}
        onChange={(e) => setSelectedBoxId(e.target.value)}
        className="flex h-10 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <option value="">-- Select box to link --</option>
        {unlinkedBoxes.map((box) => (
          <option key={box.id} value={box.id}>
            {box.reference} ({box.content})
          </option>
        ))}
      </select>
      <Button onClick={handleLink} disabled={!selectedBoxId || loading}>
        {loading ? 'Linking...' : 'Link Box'}
      </Button>
    </div>
  )
}

export function UnlinkBoxButton({
  boxId,
  country,
}: {
  boxId: string
  country: string
}) {
  const [loading, setLoading] = useState(false)

  async function handleUnlink() {
    if (!confirm('Are you sure you want to unlink this box?')) return
    setLoading(true)
    await updateBoxLink(boxId, null, country)
    setLoading(false)
  }

  return (
    <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-2" onClick={handleUnlink} disabled={loading}>
      {loading ? 'Unlinking...' : 'Unlink'}
    </Button>
  )
}
