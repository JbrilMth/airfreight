import prisma from '@/lib/prisma'
import { SendersList } from '@/components/sender/SendersList'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function SendersPage() {
  // Fetch senders, shipments, and boxes to compute counts and combined pricing
  const senders = await prisma.sender.findMany({
    orderBy: { name: 'asc' }
  })

  const shipments = await prisma.shipment.findMany({
    select: { sender_name: true, price: true }
  })

  const boxes = await prisma.box.findMany({
    select: { sender_name: true, price: true }
  })

  // Map senders to their stats
  const senderStats = senders.map(sender => {
    const senderShipments = shipments.filter(s => s.sender_name.trim().toLowerCase() === sender.name.trim().toLowerCase())
    const senderBoxes = boxes.filter(b => b.sender_name.trim().toLowerCase() === sender.name.trim().toLowerCase())
    
    const totalShipments = senderShipments.length
    const totalBoxes = senderBoxes.length
    
    const shipmentPriceSum = senderShipments.reduce((acc, s) => acc + s.price, 0)
    const boxPriceSum = senderBoxes.reduce((acc, b) => acc + (b.price ?? 0), 0)
    const totalCombinedPrice = shipmentPriceSum + boxPriceSum

    return {
      id: sender.id,
      name: sender.name,
      totalShipments,
      totalBoxes,
      totalCombinedPrice
    }
  })

  return <SendersList senders={senderStats} />
}
