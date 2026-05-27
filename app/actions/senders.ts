'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function ensureSenderExists(name: string) {
  if (!name || !name.trim()) return
  const trimmed = name.trim()
  await prisma.sender.upsert({
    where: { name: trimmed },
    update: {},
    create: { name: trimmed }
  }).catch(() => {
    // Ignore potential race conditions
  })
}

export async function createSender(formData: FormData) {
  const name = formData.get('name') as string
  if (!name || !name.trim()) return

  await prisma.sender.create({
    data: { name: name.trim() }
  })

  revalidatePath('/senders')
}

export async function updateSender(id: string, formData: FormData) {
  const newName = (formData.get('name') as string)?.trim()
  if (!newName) return

  // Find the old sender first to get the old name
  const oldSender = await prisma.sender.findUnique({
    where: { id }
  })

  if (!oldSender) return

  // Start a transaction to update both the Sender table and the linked fields in Box/Shipment
  await prisma.$transaction(async (tx) => {
    // 1. Update Sender table name
    await tx.sender.update({
      where: { id },
      data: { name: newName }
    })

    // 2. Update Shipment table
    await tx.shipment.updateMany({
      where: { sender_name: oldSender.name },
      data: { sender_name: newName }
    })

    // 3. Update Box table
    await tx.box.updateMany({
      where: { sender_name: oldSender.name },
      data: { sender_name: newName }
    })
  })

  revalidatePath('/senders')
  revalidatePath(`/senders/${encodeURIComponent(newName)}`)
  revalidatePath('/shipments')
  revalidatePath('/boxes')
}

export async function deleteSender(id: string) {
  const sender = await prisma.sender.findUnique({
    where: { id }
  })

  if (!sender) return { error: 'Sender not found.' }

  // Check if sender has any linked shipments or boxes
  const linkedShipmentsCount = await prisma.shipment.count({
    where: { sender_name: sender.name }
  })

  const linkedBoxesCount = await prisma.box.count({
    where: { sender_name: sender.name }
  })

  if (linkedShipmentsCount > 0 || linkedBoxesCount > 0) {
    return {
      error: `Cannot delete sender "${sender.name}" because they have ${linkedShipmentsCount} linked shipment(s) and ${linkedBoxesCount} linked box(es).`
    }
  }

  await prisma.sender.delete({
    where: { id }
  })

  revalidatePath('/senders')
  return { success: true }
}
