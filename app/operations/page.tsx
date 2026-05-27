import prisma from '@/lib/prisma'
import { OperationsView } from '@/components/operations/OperationsView'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function OperationsPage() {
  const senders = await prisma.sender.findMany({
    orderBy: { name: 'asc' }
  })
  
  const recipients = await prisma.recipient.findMany({
    orderBy: { name: 'asc' }
  })

  const shipments = await prisma.shipment.findMany({
    include: {
      boxes: true
    }
  })

  const boxes = await prisma.box.findMany()

  // 1. Senders Section data
  const senderStats = senders.map(sender => {
    const senderShipments = shipments.filter(
      s => s.sender_name.trim().toLowerCase() === sender.name.trim().toLowerCase()
    )
    const senderBoxes = boxes.filter(
      b => b.sender_name.trim().toLowerCase() === sender.name.trim().toLowerCase()
    )

    const shipmentsList = senderShipments.map(s => {
      const trackingNumbers = s.boxes
        .map(b => b.tracking_number)
        .filter(Boolean)
        .join(', ')
      return {
        id: s.id,
        trackingNumbers: trackingNumbers || '—',
        recipientAddress: s.recipient_address,
        country: s.country
      }
    })

    const totalShipments = senderShipments.length
    const totalBoxes = senderBoxes.length

    const shipmentPriceSum = senderShipments.reduce((acc, s) => acc + s.price, 0)
    const boxPriceSum = senderBoxes.reduce((acc, b) => acc + (b.price ?? 0), 0)
    const totalCombinedPrice = shipmentPriceSum + boxPriceSum

    return {
      name: sender.name,
      totalShipments,
      shipmentsList,
      totalBoxes,
      totalCombinedPrice
    }
  }).sort((a, b) => b.totalShipments - a.totalShipments)

  // 2. Recipients Section data
  const recipientStats = recipients.map(recipient => {
    const recipientShipments = shipments.filter(
      s => s.recipient_name.trim().toLowerCase() === recipient.name.trim().toLowerCase()
    )
    const recipientBoxes = recipientShipments.flatMap(s => s.boxes)

    // Gather unique recipient addresses from their shipments
    const uniqueAddresses = Array.from(
      new Set(recipientShipments.map(s => s.recipient_address).filter(Boolean))
    )
    const recipientAddress = uniqueAddresses.join('; ') || 'No shipments'

    const shipmentsList = recipientShipments.map(s => {
      const trackingNumbers = s.boxes
        .map(b => b.tracking_number)
        .filter(Boolean)
        .join(', ')
      return {
        id: s.id,
        trackingNumbers: trackingNumbers || '—',
        senderName: s.sender_name,
        country: s.country
      }
    })

    const totalShipments = recipientShipments.length
    const totalBoxes = recipientBoxes.length

    const shipmentPriceSum = recipientShipments.reduce((acc, s) => acc + s.price, 0)
    const boxPriceSum = recipientBoxes.reduce((acc, b) => acc + (b.price ?? 0), 0)
    const totalCombinedPrice = shipmentPriceSum + boxPriceSum

    return {
      name: recipient.name,
      recipientAddress,
      totalShipments,
      shipmentsList,
      totalBoxes,
      totalCombinedPrice
    }
  }).sort((a, b) => b.totalShipments - a.totalShipments)

  return (
    <OperationsView
      senders={senderStats}
      recipients={recipientStats}
    />
  )
}
