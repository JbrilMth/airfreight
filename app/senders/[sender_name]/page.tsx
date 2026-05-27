import prisma from '@/lib/prisma'
import { SenderWorkspace } from '@/components/sender/SenderWorkspace'
import { getSenders } from '@/app/actions/shipments'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function SenderDetailPage({ params }: { params: Promise<{ sender_name: string }> }) {
  const { sender_name } = await params
  const decodedSenderName = decodeURIComponent(sender_name)

  // Verify the sender exists in our database
  const senderExists = await prisma.sender.findUnique({
    where: { name: decodedSenderName }
  })

  if (!senderExists) {
    notFound()
  }

  const shipments = await prisma.shipment.findMany({
    where: {
      sender_name: decodedSenderName
    },
    include: {
      boxes: true
    },
    orderBy: {
      created_at: 'desc'
    }
  })

  const boxes = await prisma.box.findMany({
    where: {
      sender_name: decodedSenderName
    },
    orderBy: {
      created_at: 'desc'
    }
  })

  const allSenders = await getSenders()

  // Fetch all shipments to allow linking boxes in the Edit Box dialog
  const allShipments = await prisma.shipment.findMany({
    select: {
      id: true,
      reference_box: true
    }
  })

  return (
    <SenderWorkspace
      senderName={decodedSenderName}
      shipments={shipments}
      boxes={boxes}
      allSenders={allSenders}
      availableShipmentsForBoxes={allShipments}
    />
  )
}
