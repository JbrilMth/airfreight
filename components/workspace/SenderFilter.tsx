'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export function SenderFilter({ senders = [] }: { senders: string[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSender = searchParams.get('sender') || ''

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value
    const params = new URLSearchParams(window.location.search)
    if (val) {
      params.set('sender', val)
    } else {
      params.delete('sender')
    }
    router.push(`${window.location.pathname}?${params.toString()}`)
  }

  return (
    <div className="flex items-center space-x-2">
      <label className="text-sm font-medium text-zinc-500">Filter by Sender:</label>
      <select
        value={currentSender}
        onChange={handleChange}
        className="flex h-9 rounded-md border border-zinc-200 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <option value="">-- All Senders --</option>
        {senders.map((sender) => (
          <option key={sender} value={sender}>
            {sender}
          </option>
        ))}
      </select>
    </div>
  )
}
