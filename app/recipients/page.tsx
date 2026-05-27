import prisma from '@/lib/prisma'
import { RecipientsList } from '@/components/recipient/RecipientsList'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function RecipientsPage() {
  // Fetch recipients and shipments to compute counts and combined pricing
  const recipients = await prisma.recipient.findMany({
    orderBy: { name: 'asc' }
  })

  const shipments = await prisma.shipment.findMany({
    include: {
      boxes: true
    }
  })

  // Map recipients to their stats
  const recipientStats = recipients.map(recipient => {
    const recipientShipments = shipments.filter(
      s => s.recipient_name.trim().toLowerCase() === recipient.name.trim().toLowerCase()
    )
    const recipientBoxes = recipientShipments.flatMap(s => s.boxes)
    
    const totalShipments = recipientShipments.length
    const totalBoxes = recipientBoxes.length
    
    const shipmentPriceSum = recipientShipments.reduce((acc, s) => acc + s.price, 0)
    const boxPriceSum = recipientBoxes.reduce((acc, b) => acc + (b.price ?? 0), 0)
    const totalCombinedPrice = shipmentPriceSum + boxPriceSum

    return {
      id: recipient.id,
      name: recipient.name,
      totalShipments,
      totalBoxes,
      totalCombinedPrice
    }
  })

  return <RecipientsList recipients={recipientStats} />
}
