'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { ensureSenderExists } from './senders'

export async function createBox(formData: FormData) {
  const reference = formData.get('reference') as string
  const tracking_number = (formData.get('tracking_number') as string) || null
  const content = formData.get('content') as string
  const country = formData.get('country') as string
  const sender_name = formData.get('sender_name') as string
  const shipment_id_raw = formData.get('shipment_id') as string | null
  const shipment_id = shipment_id_raw ? shipment_id_raw : null

  // Weight and price are optional
  const weightRaw = formData.get('weight') as string
  const priceRaw = formData.get('price') as string
  const weight = weightRaw && weightRaw.trim() !== '' ? parseFloat(weightRaw) : null
  const price = priceRaw && priceRaw.trim() !== '' ? parseFloat(priceRaw) : null

  // Auto-create sender if not exists
  if (sender_name) {
    await ensureSenderExists(sender_name)
  }

  await prisma.box.create({
    data: {
      reference,
      tracking_number,
      weight,
      content,
      price,
      country,
      sender_name,
      shipment_id,
    },
  })

  revalidatePath('/boxes')
  revalidatePath(`/boxes/${encodeURIComponent(country)}`)
  revalidatePath('/dashboard')
  revalidatePath('/overview')
  revalidatePath('/senders')
}

export async function updateBox(id: string, formData: FormData) {
  const reference = formData.get('reference') as string
  const tracking_number = (formData.get('tracking_number') as string) || null
  const content = formData.get('content') as string
  const country = formData.get('country') as string
  const sender_name = formData.get('sender_name') as string
  const shipment_id_raw = formData.get('shipment_id') as string | null
  const shipment_id = shipment_id_raw ? shipment_id_raw : null

  // Weight and price are optional
  const weightRaw = formData.get('weight') as string
  const priceRaw = formData.get('price') as string
  const weight = weightRaw && weightRaw.trim() !== '' ? parseFloat(weightRaw) : null
  const price = priceRaw && priceRaw.trim() !== '' ? parseFloat(priceRaw) : null

  // Auto-create sender if not exists
  if (sender_name) {
    await ensureSenderExists(sender_name)
  }

  await prisma.box.update({
    where: { id },
    data: {
      reference,
      tracking_number,
      weight,
      content,
      price,
      country,
      sender_name,
      shipment_id,
    },
  })

  revalidatePath('/boxes')
  revalidatePath(`/boxes/${encodeURIComponent(country)}`)
  revalidatePath('/dashboard')
  revalidatePath('/overview')
  revalidatePath('/senders')
}

export async function updateBoxLink(id: string, shipment_id: string | null, country: string) {
  await prisma.box.update({
    where: { id },
    data: { shipment_id },
  })

  revalidatePath('/boxes')
  revalidatePath(`/boxes/${encodeURIComponent(country)}`)
  if (shipment_id) {
    revalidatePath(`/shipments/${encodeURIComponent(country)}/${shipment_id}`)
  }
  revalidatePath('/dashboard')
  revalidatePath('/overview')
  revalidatePath('/senders')
}

export async function deleteBox(id: string, country: string) {
  await prisma.box.delete({
    where: { id },
  })

  revalidatePath('/boxes')
  revalidatePath(`/boxes/${encodeURIComponent(country)}`)
  revalidatePath('/dashboard')
  revalidatePath('/overview')
  revalidatePath('/senders')
}
