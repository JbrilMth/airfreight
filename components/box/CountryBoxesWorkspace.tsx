'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import Link from 'next/link';
import { EditBoxDialog } from '@/components/box/EditBoxDialog';
import { DeleteBoxButton } from '@/components/box/DeleteBoxButton';
import { SearchInput, PaginationControls } from '@/components/workspace/TableControls';

interface Box {
  id: string;
  reference: string;
  tracking_number: string | null;
  content: string;
  sender_name: string;
  weight: number | null;
  price: number | null;
  country: string;
  shipment_id: string | null;
  shipment: { id: string; reference_box: string } | null;
}

export function CountryBoxesWorkspace({
  initialBoxes,
  country,
  shipmentsForCountry,
  allSenders,
}: {
  initialBoxes: Box[];
  country: string;
  shipmentsForCountry: { id: string; reference_box: string }[];
  allSenders: string[];
}) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 25;

  const filteredBoxes = initialBoxes.filter((b) => {
    const term = search.toLowerCase();
    const linkedShipmentRef = b.shipment?.reference_box || 'unlinked';
    return (
      b.reference.toLowerCase().includes(term) ||
      (b.tracking_number || '').toLowerCase().includes(term) ||
      b.content.toLowerCase().includes(term) ||
      b.sender_name.toLowerCase().includes(term) ||
      linkedShipmentRef.toLowerCase().includes(term) ||
      (b.weight != null && String(b.weight).includes(term)) ||
      (b.price != null && String(b.price).includes(term))
    );
  });

  const totalPages = Math.ceil(filteredBoxes.length / PAGE_SIZE);
  const startIndex = (page - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedBoxes = filteredBoxes.slice(startIndex, endIndex);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Search Filter Input */}
      <div className="flex justify-end">
        <SearchInput
          value={search}
          onChange={handleSearchChange}
          placeholder="Search boxes..."
        />
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-6 py-3">Reference</th>
                  <th className="px-6 py-3">Tracking #</th>
                  <th className="px-6 py-3">Content</th>
                  <th className="px-6 py-3">Sender</th>
                  <th className="px-6 py-3">Weight</th>
                  <th className="px-6 py-3">Price (RMB)</th>
                  <th className="px-6 py-3">Linked Shipment</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {paginatedBoxes.length > 0 ? (
                  paginatedBoxes.map((box) => (
                    <tr
                      key={box.id}
                      className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-50">
                        {box.reference}
                      </td>
                      <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400 font-mono text-xs">
                        {box.tracking_number || '—'}
                      </td>
                      <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300 max-w-[200px] truncate">
                        {box.content}
                      </td>
                      <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">
                        {box.sender_name}
                      </td>
                      <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                        {box.weight != null ? `${box.weight} kg` : '—'}
                      </td>
                      <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-50">
                        {box.price != null
                          ? `¥${box.price.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}`
                          : '—'}
                      </td>
                      <td className="px-6 py-4 text-zinc-550 dark:text-zinc-405">
                        {box.shipment ? (
                          <Link
                            href={`/shipments/${encodeURIComponent(country)}/${box.shipment.id}`}
                            className="text-blue-600 hover:underline font-medium"
                          >
                            {box.shipment.reference_box}
                          </Link>
                        ) : (
                          <span className="italic text-zinc-400">Unlinked</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <EditBoxDialog
                            box={box}
                            availableShipments={shipmentsForCountry}
                            senders={allSenders}
                          />
                          <DeleteBoxButton id={box.id} country={country} />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-zinc-500">
                      No boxes found for {country}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="block md:hidden divide-y divide-zinc-200 dark:divide-zinc-800">
            {paginatedBoxes.length > 0 ? (
              paginatedBoxes.map((box) => (
                <div key={box.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                        {box.reference}
                      </h3>
                      <p className="text-xs text-zinc-500 font-mono">
                        {box.tracking_number || 'No Tracking #'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-zinc-100 dark:border-zinc-900">
                    <div>
                      <span className="text-zinc-500 block">Sender</span>
                      <span className="font-medium text-zinc-850 dark:text-zinc-200">
                        {box.sender_name}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Weight</span>
                      <span className="font-medium text-zinc-850 dark:text-zinc-200">
                        {box.weight != null ? `${box.weight} kg` : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Price</span>
                      <span className="font-medium text-zinc-850 dark:text-zinc-200">
                        {box.price != null ? `¥${box.price.toLocaleString()}` : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Shipment</span>
                      <span className="font-medium text-zinc-850 dark:text-zinc-200">
                        {box.shipment ? (
                          <Link
                            href={`/shipments/${encodeURIComponent(country)}/${box.shipment.id}`}
                            className="text-blue-600 hover:underline"
                          >
                            {box.shipment.reference_box}
                          </Link>
                        ) : (
                          <span className="italic text-zinc-400">Unlinked</span>
                        )}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-zinc-500 block">Content</span>
                      <span className="text-zinc-700 dark:text-zinc-300 break-words">
                        {box.content}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <div className="flex-1 min-h-[44px]">
                      <EditBoxDialog
                        box={box}
                        availableShipments={shipmentsForCountry}
                        senders={allSenders}
                        triggerClassName="w-full flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-2.5 text-sm font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900 min-h-[44px]"
                      />
                    </div>
                    <div className="flex-1 min-h-[44px]">
                      <DeleteBoxButton
                        id={box.id}
                        country={country}
                        triggerClassName="w-full flex items-center justify-center rounded-lg border border-red-200 dark:border-red-950/30 bg-red-50/50 dark:bg-red-950/10 py-2.5 text-sm font-semibold text-red-655 hover:bg-red-50 dark:hover:bg-red-950/20 min-h-[44px]"
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-zinc-550 text-sm">
                No boxes found matching the query.
              </div>
            )}
          </div>

          <PaginationControls
            currentPage={page}
            totalPages={totalPages}
            totalItems={filteredBoxes.length}
            startIndex={startIndex}
            endIndex={endIndex}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
