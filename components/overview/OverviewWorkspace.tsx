'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SearchInput, PaginationControls } from '@/components/workspace/TableControls';

interface Shipment {
  id: string;
  reference_box: string;
  country: string;
  status: string;
}

interface Box {
  id: string;
  reference: string;
  tracking_number: string | null;
  country: string;
  shipment: { reference_box: string } | null;
}

export function OverviewWorkspace({
  initialShipments,
  initialBoxes,
}: {
  initialShipments: Shipment[];
  initialBoxes: Box[];
}) {
  // Shipments State
  const [shipmentsSearch, setShipmentsSearch] = useState('');
  const [shipmentsPage, setShipmentsPage] = useState(1);

  // Boxes State
  const [boxesSearch, setBoxesSearch] = useState('');
  const [boxesPage, setBoxesPage] = useState(1);

  const PAGE_SIZE = 25;

  // Filter Shipments
  const filteredShipments = initialShipments.filter((s) => {
    const term = shipmentsSearch.toLowerCase();
    return (
      s.reference_box.toLowerCase().includes(term) ||
      s.country.toLowerCase().includes(term) ||
      s.status.toLowerCase().includes(term)
    );
  });

  // Filter Boxes
  const filteredBoxes = initialBoxes.filter((b) => {
    const term = boxesSearch.toLowerCase();
    const linkedShipmentRef = b.shipment?.reference_box || 'unlinked';
    return (
      b.reference.toLowerCase().includes(term) ||
      (b.tracking_number || '').toLowerCase().includes(term) ||
      b.country.toLowerCase().includes(term) ||
      linkedShipmentRef.toLowerCase().includes(term)
    );
  });

  // Paginate Shipments
  const totalShipmentsPages = Math.ceil(filteredShipments.length / PAGE_SIZE);
  const shipmentsStartIndex = (shipmentsPage - 1) * PAGE_SIZE;
  const shipmentsEndIndex = shipmentsStartIndex + PAGE_SIZE;
  const paginatedShipments = filteredShipments.slice(shipmentsStartIndex, shipmentsEndIndex);

  // Paginate Boxes
  const totalBoxesPages = Math.ceil(filteredBoxes.length / PAGE_SIZE);
  const boxesStartIndex = (boxesPage - 1) * PAGE_SIZE;
  const boxesEndIndex = boxesStartIndex + PAGE_SIZE;
  const paginatedBoxes = filteredBoxes.slice(boxesStartIndex, boxesEndIndex);

  const handleShipmentsSearchChange = (val: string) => {
    setShipmentsSearch(val);
    setShipmentsPage(1);
  };

  const handleBoxesSearchChange = (val: string) => {
    setBoxesSearch(val);
    setBoxesPage(1);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Shipments Column */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">All Shipments</h2>
          <SearchInput
            value={shipmentsSearch}
            onChange={handleShipmentsSearchChange}
            placeholder="Search shipments..."
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
                    <th className="px-6 py-3">Country</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {paginatedShipments.length > 0 ? (
                    paginatedShipments.map((s) => (
                      <tr key={s.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-50">{s.reference_box}</td>
                        <td className="px-6 py-4 text-zinc-600 dark:text-zinc-300">{s.country}</td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={
                              s.status === 'delivered'
                                ? 'success'
                                : s.status === 'in_transit'
                                ? 'warning'
                                : 'default'
                            }
                          >
                            {s.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-zinc-500">
                        No shipments found matching the query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="block md:hidden divide-y divide-zinc-200 dark:divide-zinc-800">
              {paginatedShipments.length > 0 ? (
                paginatedShipments.map((s) => (
                  <div key={s.id} className="p-4 space-y-2.5">
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-50 text-sm">
                        {s.reference_box}
                      </span>
                      <Badge
                        variant={
                          s.status === 'delivered'
                            ? 'success'
                            : s.status === 'in_transit'
                            ? 'warning'
                            : 'default'
                        }
                      >
                        {s.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
                      <span>Country</span>
                      <span className="font-medium text-zinc-900 dark:text-zinc-200">{s.country}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-zinc-500 text-sm">
                  No shipments found matching the query.
                </div>
              )}
            </div>

            <PaginationControls
              currentPage={shipmentsPage}
              totalPages={totalShipmentsPages}
              totalItems={filteredShipments.length}
              startIndex={shipmentsStartIndex}
              endIndex={shipmentsEndIndex}
              onPageChange={setShipmentsPage}
            />
          </CardContent>
        </Card>
      </div>

      {/* Boxes Column */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">All Boxes</h2>
          <SearchInput
            value={boxesSearch}
            onChange={handleBoxesSearchChange}
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
                    <th className="px-6 py-3">Country</th>
                    <th className="px-6 py-3">Linked Shipment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {paginatedBoxes.length > 0 ? (
                    paginatedBoxes.map((b) => (
                      <tr key={b.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-50">{b.reference}</td>
                        <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400 font-mono text-xs">
                          {b.tracking_number || '—'}
                        </td>
                        <td className="px-6 py-4 text-zinc-600 dark:text-zinc-300">{b.country}</td>
                        <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">
                          {b.shipment ? b.shipment.reference_box : <span className="italic text-zinc-400">Unlinked</span>}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">
                        No boxes found matching the query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="block md:hidden divide-y divide-zinc-200 dark:divide-zinc-800">
              {paginatedBoxes.length > 0 ? (
                paginatedBoxes.map((b) => (
                  <div key={b.id} className="p-4 space-y-2 text-sm">
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-50">{b.reference}</span>
                      <span className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-300">
                        {b.tracking_number || 'No Tracking #'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-y-1.5 text-xs pt-1">
                      <span className="text-zinc-500 dark:text-zinc-400">Country</span>
                      <span className="text-right font-medium text-zinc-900 dark:text-zinc-200">{b.country}</span>
                      
                      <span className="text-zinc-500 dark:text-zinc-400">Shipment</span>
                      <span className="text-right font-medium text-zinc-900 dark:text-zinc-200">
                        {b.shipment ? b.shipment.reference_box : <span className="italic text-zinc-400">Unlinked</span>}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-zinc-500 text-sm">
                  No boxes found matching the query.
                </div>
              )}
            </div>

            <PaginationControls
              currentPage={boxesPage}
              totalPages={totalBoxesPages}
              totalItems={filteredBoxes.length}
              startIndex={boxesStartIndex}
              endIndex={boxesEndIndex}
              onPageChange={setBoxesPage}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
