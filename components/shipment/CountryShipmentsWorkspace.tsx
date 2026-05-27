'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { format } from 'date-fns';
import Link from 'next/link';
import { SearchInput, PaginationControls } from '@/components/workspace/TableControls';

interface Shipment {
  id: string;
  reference_box: string;
  sender_name: string;
  recipient_name: string;
  status: string;
  departure_date: Date | string;
  arrival_date: Date | string;
  weight: number;
  price: number;
  boxes: any[];
}

export function CountryShipmentsWorkspace({
  initialShipments,
  country,
}: {
  initialShipments: Shipment[];
  country: string;
}) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 25;

  const filteredShipments = initialShipments.filter((s) => {
    const term = search.toLowerCase();
    return (
      s.reference_box.toLowerCase().includes(term) ||
      s.sender_name.toLowerCase().includes(term) ||
      s.recipient_name.toLowerCase().includes(term) ||
      s.status.toLowerCase().includes(term) ||
      String(s.weight).includes(term) ||
      String(s.price).includes(term)
    );
  });

  const totalPages = Math.ceil(filteredShipments.length / PAGE_SIZE);
  const startIndex = (page - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedShipments = filteredShipments.slice(startIndex, endIndex);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const formatDateSafely = (dateVal: Date | string) => {
    try {
      const d = typeof dateVal === 'string' ? new Date(dateVal) : dateVal;
      return format(d, 'dd MMM yyyy');
    } catch (e) {
      return '—';
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Input Filter */}
      <div className="flex justify-end">
        <SearchInput
          value={search}
          onChange={handleSearchChange}
          placeholder="Search shipments..."
        />
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-6 py-3">Reference</th>
                  <th className="px-6 py-3">Sender</th>
                  <th className="px-6 py-3">Recipient</th>
                  <th className="px-6 py-3">Boxes</th>
                  <th className="px-6 py-3">Dates</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Weight</th>
                  <th className="px-6 py-3">Price (RMB)</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {paginatedShipments.length > 0 ? (
                  paginatedShipments.map((shipment) => (
                    <tr
                      key={shipment.id}
                      className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-50">
                        {shipment.reference_box}
                      </td>
                      <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">
                        {shipment.sender_name}
                      </td>
                      <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">
                        {shipment.recipient_name}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2 py-1 rounded-full font-medium">
                          {shipment.boxes.length}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col text-xs text-zinc-500">
                          <span>Dep: {formatDateSafely(shipment.departure_date)}</span>
                          <span>Arr: {formatDateSafely(shipment.arrival_date)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            shipment.status === 'delivered'
                              ? 'success'
                              : shipment.status === 'in_transit'
                              ? 'warning'
                              : 'default'
                          }
                        >
                          {shipment.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                        {shipment.weight} kg
                      </td>
                      <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-50">
                        ¥{shipment.price.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/shipments/${encodeURIComponent(country)}/${shipment.id}`}
                          className="inline-flex items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 min-h-[36px] min-w-[60px]"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-zinc-500">
                      No shipments found for {country}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card list */}
          <div className="block md:hidden divide-y divide-zinc-200 dark:divide-zinc-800">
            {paginatedShipments.length > 0 ? (
              paginatedShipments.map((shipment) => (
                <div key={shipment.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                        {shipment.reference_box}
                      </h3>
                      <p className="text-xs text-zinc-500">Sender: {shipment.sender_name}</p>
                    </div>
                    <Badge
                      variant={
                        shipment.status === 'delivered'
                          ? 'success'
                          : shipment.status === 'in_transit'
                          ? 'warning'
                          : 'default'
                      }
                    >
                      {shipment.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-zinc-100 dark:border-zinc-900">
                    <div>
                      <span className="text-zinc-500 block">Recipient</span>
                      <span className="font-medium text-zinc-850 dark:text-zinc-200">
                        {shipment.recipient_name}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Boxes Count</span>
                      <span className="font-medium text-zinc-850 dark:text-zinc-200">
                        {shipment.boxes.length}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Departure</span>
                      <span className="font-medium text-zinc-850 dark:text-zinc-200">
                        {formatDateSafely(shipment.departure_date)}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Arrival</span>
                      <span className="font-medium text-zinc-850 dark:text-zinc-200">
                        {formatDateSafely(shipment.arrival_date)}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Weight</span>
                      <span className="font-medium text-zinc-850 dark:text-zinc-200">
                        {shipment.weight} kg
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Price</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        ¥{shipment.price.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link
                      href={`/shipments/${encodeURIComponent(country)}/${shipment.id}`}
                      className="w-full flex items-center justify-center rounded-lg border border-zinc-250 dark:border-zinc-850 bg-white dark:bg-zinc-950 py-2.5 text-sm font-semibold text-zinc-800 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900 min-h-[44px]"
                    >
                      View Shipment Details
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-zinc-550 text-sm">
                No shipments found matching the query.
              </div>
            )}
          </div>

          <PaginationControls
            currentPage={page}
            totalPages={totalPages}
            totalItems={filteredShipments.length}
            startIndex={startIndex}
            endIndex={endIndex}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
