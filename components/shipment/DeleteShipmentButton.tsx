'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { deleteShipment } from '@/app/actions/shipments'
import { Trash2 } from 'lucide-react'
import clsx from 'clsx'

export function DeleteShipmentButton({ 
  id, 
  country,
  className
}: { 
  id: string
  country: string
  className?: string
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this shipment? All linked boxes will be unlinked.')) {
      return
    }

    setLoading(true)
    await deleteShipment(id, country)
    setLoading(false)
    router.push(`/shipments/${encodeURIComponent(country)}`)
  }

  return (
    <Button 
      variant="destructive" 
      onClick={handleDelete} 
      disabled={loading}
      className={clsx("min-h-[44px] sm:min-h-[36px]", className)}
    >
      <Trash2 className="mr-2 h-4 w-4" />
      {loading ? 'Deleting...' : 'Delete Shipment'}
    </Button>
  )
}
