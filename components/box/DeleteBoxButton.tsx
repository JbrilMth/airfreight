'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { deleteBox } from '@/app/actions/boxes'
import clsx from 'clsx'

export function DeleteBoxButton({ 
  id, 
  country,
  triggerClassName
}: { 
  id: string
  country: string
  triggerClassName?: string
}) {
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this box?')) return
    setLoading(true)
    await deleteBox(id, country)
    setLoading(false)
  }

  return (
    <Button 
      variant="ghost" 
      className={clsx(triggerClassName || "text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-2")} 
      onClick={handleDelete} 
      disabled={loading}
    >
      {loading ? 'Deleting...' : 'Delete'}
    </Button>
  )
}
