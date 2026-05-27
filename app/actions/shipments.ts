'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { ensureSenderExists } from './senders'
import { ensureRecipientExists } from './recipients'

export async function getSenders() {
  const shipments = await prisma.shipment.findMany({ select: { sender_name: true } })
  const boxes = await prisma.box.findMany({ select: { sender_name: true } })
  const senders = new Set<string>()
  shipments.forEach(s => {
    if (s.sender_name) senders.add(s.sender_name)
  })
  boxes.forEach(b => {
    if (b.sender_name) senders.add(b.sender_name)
  })
  return Array.from(senders).sort()
}

export async function createShipment(formData: FormData) {
  const reference_box = formData.get('reference_box') as string
  const sender_name = formData.get('sender_name') as string
  const recipient_name = formData.get('recipient_name') as string
  const recipient_phone = formData.get('recipient_phone') as string
  const recipient_address = formData.get('recipient_address') as string
  const recipient_postal_code = formData.get('recipient_postal_code') as string
  const country = formData.get('country') as string
  const departure_date = new Date(formData.get('departure_date') as string)
  const arrival_date = new Date(formData.get('arrival_date') as string)
  const status = formData.get('status') as string
  const price = parseFloat(formData.get('price') as string || '0')
  const weight = parseFloat(formData.get('weight') as string || '0')

  // Auto-create sender if not exists
  if (sender_name) {
    await ensureSenderExists(sender_name)
  }

  // Auto-create recipient if not exists
  if (recipient_name) {
    await ensureRecipientExists(recipient_name)
  }

  await prisma.shipment.create({
    data: {
      reference_box,
      sender_name,
      recipient_name,
      recipient_phone,
      recipient_address,
      recipient_postal_code,
      country,
      departure_date,
      arrival_date,
      status,
      price,
      weight,
    },
  })

  revalidatePath('/shipments')
  revalidatePath(`/shipments/${encodeURIComponent(country)}`)
  revalidatePath('/dashboard')
  revalidatePath('/overview')
  revalidatePath('/senders')
  revalidatePath('/recipients')
  revalidatePath('/operations')
}

export async function updateShipment(id: string, formData: FormData) {
  const reference_box = formData.get('reference_box') as string
  const sender_name = formData.get('sender_name') as string
  const recipient_name = formData.get('recipient_name') as string
  const recipient_phone = formData.get('recipient_phone') as string
  const recipient_address = formData.get('recipient_address') as string
  const recipient_postal_code = formData.get('recipient_postal_code') as string
  const country = formData.get('country') as string
  const departure_date = new Date(formData.get('departure_date') as string)
  const arrival_date = new Date(formData.get('arrival_date') as string)
  const status = formData.get('status') as string
  const price = parseFloat(formData.get('price') as string || '0')
  const weight = parseFloat(formData.get('weight') as string || '0')

  // Auto-create sender if not exists
  if (sender_name) {
    await ensureSenderExists(sender_name)
  }

  // Auto-create recipient if not exists
  if (recipient_name) {
    await ensureRecipientExists(recipient_name)
  }

  await prisma.shipment.update({
    where: { id },
    data: {
      reference_box,
      sender_name,
      recipient_name,
      recipient_phone,
      recipient_address,
      recipient_postal_code,
      country,
      departure_date,
      arrival_date,
      status,
      price,
      weight,
    },
  })

  revalidatePath('/shipments')
  revalidatePath(`/shipments/${encodeURIComponent(country)}`)
  revalidatePath(`/shipments/${encodeURIComponent(country)}/${id}`)
  revalidatePath('/dashboard')
  revalidatePath('/overview')
  revalidatePath('/senders')
  revalidatePath('/recipients')
  revalidatePath(`/recipients/${encodeURIComponent(recipient_name)}`)
  revalidatePath('/operations')
}

export async function deleteShipment(id: string, country: string) {
  // Fetch shipment to get recipient name before deletion for path revalidation
  const shipment = await prisma.shipment.findUnique({
    where: { id },
    select: { recipient_name: true }
  })

  await prisma.box.updateMany({
    where: { shipment_id: id },
    data: { shipment_id: null }
  })

  await prisma.shipment.delete({
    where: { id },
  })

  revalidatePath('/shipments')
  revalidatePath(`/shipments/${encodeURIComponent(country)}`)
  revalidatePath('/dashboard')
  revalidatePath('/overview')
  revalidatePath('/senders')
  revalidatePath('/recipients')
  if (shipment) {
    revalidatePath(`/recipients/${encodeURIComponent(shipment.recipient_name)}`)
  }
  revalidatePath('/operations')
}
