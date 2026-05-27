import prisma from '@/lib/prisma'
import { RecipientWorkspace } from '@/components/recipient/RecipientWorkspace'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function RecipientDetailPage({ params }: { params: Promise<{ recipient_name: string }> }) {
  const { recipient_name } = await params
  const decodedRecipientName = decodeURIComponent(recipient_name)

  // Verify the recipient exists in our database
  const recipientExists = await prisma.recipient.findUnique({
    where: { name: decodedRecipientName }
  })

  if (!recipientExists) {
    notFound()
  }

  // Get shipments for this recipient
  const shipments = await prisma.shipment.findMany({
    where: {
      recipient_name: decodedRecipientName
    },
    include: {
      boxes: true
    },
    orderBy: {
      created_at: 'desc'
    }
  })

  // Get boxes for this recipient (linked via shipment.recipient_name)
  const boxes = await prisma.box.findMany({
    where: {
      shipment: {
        recipient_name: decodedRecipientName
      }
    },
    orderBy: {
      created_at: 'desc'
    }
  })

  // Get all recipients list for shipment edit dropdowns
  const recipientsList = await prisma.recipient.findMany({
    select: { name: true },
    orderBy: { name: 'asc' }
  })
  const allRecipients = recipientsList.map(r => r.name)

  // Get all senders list for shipment edit dropdowns
  const sendersList = await prisma.sender.findMany({
    select: { name: true },
    orderBy: { name: 'asc' }
  })
  const allSenders = sendersList.map(s => s.name)

  // Fetch all shipments to allow linking boxes in the Edit Box dialog
  const allShipments = await prisma.shipment.findMany({
    select: {
      id: true,
      reference_box: true
    }
  })

  return (
    <RecipientWorkspace
      recipientName={decodedRecipientName}
      shipments={shipments}
      boxes={boxes}
      allRecipients={allRecipients}
      allSenders={allSenders}
      availableShipmentsForBoxes={allShipments}
    />
  )
}
