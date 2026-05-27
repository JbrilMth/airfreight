'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function ensureRecipientExists(name: string) {
  if (!name || !name.trim()) return
  const trimmed = name.trim()
  await prisma.recipient.upsert({
    where: { name: trimmed },
    update: {},
    create: { name: trimmed }
  }).catch(() => {
    // Ignore potential race conditions
  })
}

export async function createRecipient(formData: FormData) {
  const name = formData.get('name') as string
  if (!name || !name.trim()) return

  await prisma.recipient.create({
    data: { name: name.trim() }
  })

  revalidatePath('/recipients')
  revalidatePath('/operations')
}

export async function updateRecipient(id: string, formData: FormData) {
  const newName = (formData.get('name') as string)?.trim()
  if (!newName) return

  // Find the old recipient first to get the old name
  const oldRecipient = await prisma.recipient.findUnique({
    where: { id }
  })

  if (!oldRecipient) return

  // Start a transaction to update both the Recipient table and the linked fields in Shipment
  await prisma.$transaction(async (tx) => {
    // 1. Update Recipient table name
    await tx.recipient.update({
      where: { id },
      data: { name: newName }
    })

    // 2. Update Shipment table
    await tx.shipment.updateMany({
      where: { recipient_name: oldRecipient.name },
      data: { recipient_name: newName }
    })
  })

  revalidatePath('/recipients')
  revalidatePath(`/recipients/${encodeURIComponent(newName)}`)
  revalidatePath('/shipments')
  revalidatePath('/boxes')
  revalidatePath('/operations')
}

export async function deleteRecipient(id: string) {
  const recipient = await prisma.recipient.findUnique({
    where: { id }
  })

  if (!recipient) return { error: 'Recipient not found.' }

  // Check if recipient has any linked shipments or boxes
  const linkedShipmentsCount = await prisma.shipment.count({
    where: { recipient_name: recipient.name }
  })

  const linkedBoxesCount = await prisma.box.count({
    where: {
      shipment: {
        recipient_name: recipient.name
      }
    }
  })

  if (linkedShipmentsCount > 0 || linkedBoxesCount > 0) {
    return {
      error: `Cannot delete recipient "${recipient.name}" because they have ${linkedShipmentsCount} linked shipment(s) and ${linkedBoxesCount} linked box(es).`
    }
  }

  await prisma.recipient.delete({
    where: { id }
  })

  revalidatePath('/recipients')
  revalidatePath('/operations')
  return { success: true }
}
