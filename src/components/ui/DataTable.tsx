import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ChevronUp, ChevronDown } from 'lucide-react'

export interface DataTableColumn<T> {
  key: keyof T
  label: string
  render?: (value: T[keyof T], row: T) => React.ReactNode
  sortable?: boolean
  mono?: boolean
  align?: 'left' | 'right' | 'center'
}

interface DataTableProps<T extends { id?: string }> {
  columns: DataTableColumn<T>[]
  rows: T[]
  onRowClick?: (row: T) => void
  selectedId?: string
  className?: string
  emptyMessage?: string
}

export function DataTable<T extends { id?: string }>({
  columns,
  rows,
  onRowClick,
  selectedId,
  className,
  emptyMessage = 'No data.',
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const sorted = sortKey
    ? [...rows].sort((a, b) => {
        const av = a[sortKey]
        const bv = b[sortKey]
        if (av == null) return 1
        if (bv == null) return -1
        const cmp = av < bv ? -1 : av > bv ? 1 : 0
        return sortDir === 'asc' ? cmp : -cmp
      })
    : rows

  const handleSort = (key: keyof T) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }

  return (
    <div className={cn('w-full overflow-auto', className)}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-wire">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                onClick={() => col.sortable && handleSort(col.key)}
                className={cn(
                  'font-mono text-[10px] tracking-[0.08em] uppercase text-ghost py-2 px-3 text-left whitespace-nowrap',
                  col.sortable && 'cursor-pointer hover:text-data select-none',
                  col.align === 'right' && 'text-right',
                  col.align === 'center' && 'text-center',
                )}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {col.sortable && sortKey === col.key && (
                    sortDir === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-8 text-center font-mono text-xs text-ghost">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sorted.map((row, i) => {
              const isSelected = row.id != null && row.id === selectedId
              return (
                <tr
                  key={row.id ?? i}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    'border-b border-wire/50 transition-colors',
                    i % 2 === 0 ? 'bg-slate-deep' : 'bg-slate-mid',
                    isSelected && 'border-l-2 border-l-signal bg-signal/5',
                    onRowClick && 'cursor-pointer hover:bg-slate-light',
                  )}
                >
                  {columns.map((col) => {
                    const val = row[col.key]
                    return (
                      <td
                        key={String(col.key)}
                        className={cn(
                          'py-2 px-3 text-data',
                          col.mono && 'font-mono tabular-nums text-xs',
                          col.align === 'right' && 'text-right',
                          col.align === 'center' && 'text-center',
                        )}
                      >
                        {col.render ? col.render(val, row) : String(val ?? '—')}
                      </td>
                    )
                  })}
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
