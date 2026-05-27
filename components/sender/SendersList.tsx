'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Plus, Edit2, Trash2, AlertTriangle, PlaneTakeoff, Box, Coins } from 'lucide-react'
import { createSender, updateSender, deleteSender } from '@/app/actions/senders'

type SenderStat = {
  id: string
  name: string
  totalShipments: number
  totalBoxes: number
  totalCombinedPrice: number
}

export function SendersList({ senders }: { senders: SenderStat[] }) {
  const router = useRouter()
  
  // Modals state
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [warningOpen, setWarningOpen] = useState(false)
  
  const [activeSender, setActiveSender] = useState<SenderStat | null>(null)
  const [senderNameInput, setSenderNameInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Create Sender submit
  async function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!senderNameInput.trim()) return
    
    setLoading(true)
    setErrorMsg('')
    try {
      const formData = new FormData()
      formData.append('name', senderNameInput)
      await createSender(formData)
      setCreateOpen(false)
      setSenderNameInput('')
      router.refresh()
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create sender.')
    } finally {
      setLoading(false)
    }
  }

  // Edit Sender submit
  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!activeSender || !senderNameInput.trim()) return
    
    setLoading(true)
    setErrorMsg('')
    try {
      const formData = new FormData()
      formData.append('name', senderNameInput)
      await updateSender(activeSender.id, formData)
      setEditOpen(false)
      setActiveSender(null)
      setSenderNameInput('')
      router.refresh()
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update sender.')
    } finally {
      setLoading(false)
    }
  }

  // Edit button click
  function handleEditClick(sender: SenderStat, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setActiveSender(sender)
    setSenderNameInput(sender.name)
    setErrorMsg('')
    setEditOpen(true)
  }

  // Delete button click
  async function handleDeleteClick(sender: SenderStat, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    
    if (sender.totalShipments > 0 || sender.totalBoxes > 0) {
      setActiveSender(sender)
      setWarningOpen(true)
      return
    }

    if (!confirm(`Are you sure you want to delete sender "${sender.name}"?`)) {
      return
    }

    setLoading(true)
    try {
      const res = await deleteSender(sender.id)
      if (res && res.error) {
        alert(res.error)
      } else {
        router.refresh()
      }
    } catch (err) {
      alert('An error occurred while deleting.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Senders</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">Manage logistics workspaces by sender.</p>
        </div>
        <Button 
          onClick={() => { setSenderNameInput(''); setErrorMsg(''); setCreateOpen(true); }} 
          className="flex items-center min-h-[44px] sm:min-h-[36px]"
        >
          <Plus className="mr-2 h-4 w-4" /> Create Sender
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {senders.map((sender) => (
          <Link key={sender.id} href={`/senders/${encodeURIComponent(sender.name)}`}>
            <Card className="hover:border-zinc-300 transition-all cursor-pointer dark:hover:border-zinc-700 relative group overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-bold pr-16 truncate text-zinc-900 dark:text-zinc-50">{sender.name}</CardTitle>
                <div className="absolute right-4 top-4 flex items-center space-x-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleEditClick(sender, e)}
                    className="p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-50 min-h-[44px] min-w-[44px] flex items-center justify-center sm:min-h-[32px] sm:min-w-[32px]"
                    title="Edit Name"
                  >
                    <Edit2 className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteClick(sender, e)}
                    className="p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 text-zinc-500 hover:text-red-655 min-h-[44px] min-w-[44px] flex items-center justify-center sm:min-h-[32px] sm:min-w-[32px]"
                    title="Delete Sender"
                  >
                    <Trash2 className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-2">
                <div className="flex items-center text-sm text-zinc-600 dark:text-zinc-400">
                  <PlaneTakeoff className="h-4 w-4 mr-2 text-zinc-400" />
                  <span>{sender.totalShipments} Shipments</span>
                </div>
                <div className="flex items-center text-sm text-zinc-600 dark:text-zinc-400">
                  <Box className="h-4 w-4 mr-2 text-zinc-400" />
                  <span>{sender.totalBoxes} Boxes</span>
                </div>
                <div className="flex items-center text-sm font-semibold text-zinc-900 dark:text-zinc-50 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                  <Coins className="h-4 w-4 mr-2 text-blue-600" />
                  <span>¥{sender.totalCombinedPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}

        {senders.length === 0 && (
          <div className="col-span-full py-12 text-center text-zinc-500 border rounded-xl border-dashed border-zinc-200 dark:border-zinc-800">
            No senders found. Click "Create Sender" to register a new sender workspace.
          </div>
        )}
      </div>

      {/* Create Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg dark:bg-zinc-950 border dark:border-zinc-800 text-left my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-zinc-900 dark:text-zinc-50">Create New Sender</h2>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Sender Name *</label>
                <Input
                  value={senderNameInput}
                  onChange={(e) => setSenderNameInput(e.target.value)}
                  placeholder="e.g. Acme Corp, John Smith"
                  required
                  autoFocus
                  className="h-11 md:h-10"
                />
              </div>

              {errorMsg && (
                <p className="text-xs font-medium text-red-655">{errorMsg}</p>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" className="min-h-[44px] sm:min-h-[36px]" onClick={() => setCreateOpen(false)}>Cancel</Button>
                <Button type="submit" className="min-h-[44px] sm:min-h-[36px]" disabled={loading}>
                  {loading ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editOpen && activeSender && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg dark:bg-zinc-950 border dark:border-zinc-800 text-left my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-zinc-900 dark:text-zinc-50">Rename Sender</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Sender Name *</label>
                <Input
                  value={senderNameInput}
                  onChange={(e) => setSenderNameInput(e.target.value)}
                  placeholder="e.g. Acme Corp, John Smith"
                  required
                  autoFocus
                  className="h-11 md:h-10"
                />
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Renaming will automatically update all associated shipments and boxes.
                </p>
              </div>

              {errorMsg && (
                <p className="text-xs font-medium text-red-655">{errorMsg}</p>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" className="min-h-[44px] sm:min-h-[36px]" onClick={() => setEditOpen(false)}>Cancel</Button>
                <Button type="submit" className="min-h-[44px] sm:min-h-[36px]" disabled={loading}>
                  {loading ? 'Saving...' : 'Rename'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Warning Modal (Blocked Deletion) */}
      {warningOpen && activeSender && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg dark:bg-zinc-950 border dark:border-zinc-800 text-left my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center space-x-3 text-red-655 mb-4">
              <AlertTriangle className="h-6 w-6 flex-shrink-0" />
              <h2 className="text-xl font-bold">Deletion Blocked</h2>
            </div>
            <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
              <p>
                The sender <strong className="text-zinc-900 dark:text-zinc-50">"{activeSender.name}"</strong> cannot be deleted.
              </p>
              <p>
                This sender is currently linked to:
              </p>
              <ul className="list-disc pl-5 space-y-1 font-medium text-zinc-800 dark:text-zinc-200">
                <li>{activeSender.totalShipments} linked shipment(s)</li>
                <li>{activeSender.totalBoxes} linked box(es)</li>
              </ul>
              <p className="pt-2 text-xs text-zinc-500">
                To delete this sender, you must first assign these shipments and boxes to another sender, or delete them.
              </p>
            </div>
            <div className="flex justify-end pt-6">
              <Button onClick={() => setWarningOpen(false)} className="min-h-[44px] sm:min-h-[36px]">Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
