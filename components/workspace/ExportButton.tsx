'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Download } from 'lucide-react'
import { format } from 'date-fns'

type ExportButtonProps = {
  type: 'shipments' | 'boxes'
  country: string // Name of country or "All"
  data: any[]
}

export function ExportButton({ type, country, data }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false)

  async function handleExport() {
    setExporting(true)
    try {
      // Dynamic import to avoid loading exceljs on initial page render
      const ExcelJS = await import('exceljs')
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet(type === 'shipments' ? 'Shipments' : 'Boxes')

      // Set headers and columns definitions
      if (type === 'shipments') {
        worksheet.columns = [
          { header: 'Tracking Number', key: 'trackingNumber' },
          { header: 'Reference Box', key: 'referenceBox' },
          { header: 'Sender Name', key: 'senderName' },
          { header: 'Recipient Name', key: 'recipientName' },
          { header: 'Recipient Phone', key: 'recipientPhone' },
          { header: 'Recipient Address', key: 'recipientAddress' },
          { header: 'Postal Code', key: 'postalCode' },
          { header: 'Country', key: 'country' },
          { header: 'Departure Date', key: 'departureDate' },
          { header: 'Arrival Date', key: 'arrivalDate' },
          { header: 'Status', key: 'status' },
          { header: 'Price (USD)', key: 'price' }
        ]

        // Add data
        data.forEach(item => {
          const trkNumbers = item.boxes 
            ? item.boxes.map((b: any) => b.tracking_number).filter(Boolean).join(', ') 
            : ''
          
          worksheet.addRow({
            trackingNumber: trkNumbers || '—',
            referenceBox: item.reference_box || '',
            senderName: item.sender_name || '',
            recipientName: item.recipient_name || '',
            recipientPhone: item.recipient_phone || '',
            recipientAddress: item.recipient_address || '',
            postalCode: item.recipient_postal_code || '',
            country: item.country || '',
            departureDate: item.departure_date ? new Date(item.departure_date) : null,
            arrivalDate: item.arrival_date ? new Date(item.arrival_date) : null,
            status: (item.status || '').replace('_', ' ').toUpperCase(),
            price: item.price != null ? Number(item.price) : 0
          })
        })
      } else {
        // Boxes export
        worksheet.columns = [
          { header: 'Box Reference', key: 'boxReference' },
          { header: 'Weight (kg)', key: 'weight' },
          { header: 'Content', key: 'content' },
          { header: 'Country', key: 'country' },
          { header: 'Linked Shipment Tracking Number (or — if none)', key: 'shipmentTracking' },
          { header: 'Sender Name', key: 'senderName' },
          { header: 'Price (USD)', key: 'price' }
        ]

        data.forEach(item => {
          worksheet.addRow({
            boxReference: item.reference || '',
            weight: item.weight != null ? Number(item.weight) : null,
            content: item.content || '',
            country: item.country || '',
            shipmentTracking: item.shipment ? (item.shipment.reference_box || 'Linked') : '—',
            senderName: item.sender_name || '',
            price: item.price != null ? Number(item.price) : null
          })
        })
      }

      // Freeze header row
      worksheet.views = [{ state: 'frozen', ySplit: 1 }]

      // Format Header Row
      const headerRow = worksheet.getRow(1)
      headerRow.font = { bold: true, name: 'Calibri', size: 11 }
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFEAEAEA' } // Light gray background
        }
        cell.alignment = { vertical: 'middle', horizontal: 'left' }
      })
      headerRow.height = 25

      // Format cells
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return // Skip header

        // Style data cells
        row.eachCell((cell, colNumber) => {
          // Set thin border/padding and alignments
          cell.alignment = { vertical: 'middle', horizontal: 'left' }
        })

        // Apply column-specific formatting
        if (type === 'shipments') {
          // Departure date (col 9), Arrival date (col 10)
          const depCell = row.getCell(9)
          if (depCell.value) {
            depCell.numFmt = 'dd/mm/yyyy'
          }
          const arrCell = row.getCell(10)
          if (arrCell.value) {
            arrCell.numFmt = 'dd/mm/yyyy'
          }
          // Price (col 12)
          const priceCell = row.getCell(12)
          priceCell.numFmt = '#,##0.00'
        } else {
          // Weight (col 2)
          const weightCell = row.getCell(2)
          if (weightCell.value !== null) {
            weightCell.numFmt = '#,##0.00'
          }
          // Price (col 7)
          const priceCell = row.getCell(7)
          if (priceCell.value !== null) {
            priceCell.numFmt = '#,##0.00'
          }
        }
      })

      // Auto-fit Columns width
      worksheet.columns.forEach((column) => {
        let maxLength = 0
        column.eachCell!({ includeEmpty: true }, (cell) => {
          const value = cell.value
          let length = 0
          if (value instanceof Date) {
            length = 10 // DD/MM/YYYY length
          } else if (value !== null && value !== undefined) {
            length = value.toString().length
          }
          if (length > maxLength) {
            maxLength = length
          }
        })
        column.width = maxLength < 12 ? 12 : maxLength + 4
      })

      // Generate buffer and trigger download
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = window.URL.createObjectURL(blob)
      
      const dateStr = format(new Date(), 'yyyy-MM-dd')
      const cleanCountry = country.replace(/[^a-zA-Z0-9]/g, '_')
      const fileName = type === 'shipments'
        ? `Shipments_${cleanCountry}_${dateStr}.xlsx`
        : `Boxes_${cleanCountry}_${dateStr}.xlsx`

      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Excel export error:', err)
      alert('An error occurred during Excel export.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <Button onClick={handleExport} disabled={exporting} variant="outline" className="flex items-center gap-1.5">
      <Download className="h-4 w-4" />
      {exporting ? 'Exporting...' : 'Export to Excel'}
    </Button>
  )
}
