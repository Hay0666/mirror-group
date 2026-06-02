import { useState } from 'react'
import { useFlowStore } from '@/store/flowStore'
import { Button } from '@/components/ui/Button'
import { SliderInput } from '@/components/ui/SliderInput'
import { X } from 'lucide-react'
import type { ScreenCategory } from '@/types'

const SCREEN_CATEGORIES: ScreenCategory[] = ['Onboarding', 'Feature', 'Paywall', 'Error', 'Success']

export function NodeEditPanel() {
  const { nodes, editingNodeId, setEditingNode, updateNode } = useFlowStore()
  const node = nodes.find((n) => n.id === editingNodeId)
  const [localData, setLocalData] = useState(node?.data ?? {})

  if (!editingNodeId || !node) return null

  const currentData = node.data

  const patch = (updates: Partial<typeof currentData>) => {
    updateNode(editingNodeId, updates)
  }

  return (
    <div id="node-edit-panel" className="absolute right-2 top-16 z-20 w-72 bg-slate-mid border border-wire rounded-[2px] shadow-xl">
      <div className="flex items-center justify-between px-3 py-2 border-b border-wire">
        <span className="font-mono text-xs font-bold tracking-[0.08em] uppercase text-data">Edit Node</span>
        <button onClick={() => setEditingNode(null)} className="text-ghost hover:text-data transition-colors">
          <X size={14} />
        </button>
      </div>

      <div className="p-3 flex flex-col gap-3">
        <div>
          <label className="font-mono text-[10px] tracking-[0.08em] uppercase text-ghost block mb-1">Name</label>
          <input
            type="text"
            value={currentData.label}
            onChange={(e) => patch({ label: e.target.value })}
            className="w-full bg-void border border-wire text-data font-mono text-xs px-2 py-1.5 rounded-[2px] focus:border-ghost outline-none"
          />
        </div>

        <div>
          <label className="font-mono text-[10px] tracking-[0.08em] uppercase text-ghost block mb-1">Description</label>
          <textarea
            value={currentData.description ?? ''}
            onChange={(e) => patch({ description: e.target.value })}
            rows={2}
            className="w-full bg-void border border-wire text-data font-mono text-xs px-2 py-1.5 rounded-[2px] focus:border-ghost outline-none resize-none"
          />
        </div>

        {node.type === 'screen' && (
          <>
            <div>
              <label className="font-mono text-[10px] tracking-[0.08em] uppercase text-ghost block mb-1">Category</label>
              <select
                value={currentData.screenCategory ?? 'Feature'}
                onChange={(e) => patch({ screenCategory: e.target.value as ScreenCategory })}
                className="w-full bg-void border border-wire text-data font-mono text-xs px-2 py-1.5 rounded-[2px] focus:border-ghost outline-none"
              >
                {SCREEN_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-mono text-[10px] tracking-[0.08em] uppercase text-ghost block mb-1">Expected Action</label>
              <input
                type="text"
                value={currentData.expectedAction ?? ''}
                onChange={(e) => patch({ expectedAction: e.target.value })}
                className="w-full bg-void border border-wire text-data font-mono text-xs px-2 py-1.5 rounded-[2px] focus:border-ghost outline-none"
              />
            </div>
          </>
        )}

        {node.type === 'decision' && (
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="font-mono text-[10px] tracking-[0.08em] uppercase text-success block mb-1">Yes Label</label>
              <input
                type="text"
                value={currentData.yesLabel ?? 'YES'}
                onChange={(e) => patch({ yesLabel: e.target.value })}
                className="w-full bg-void border border-success/40 text-data font-mono text-xs px-2 py-1.5 rounded-[2px] focus:border-success outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="font-mono text-[10px] tracking-[0.08em] uppercase text-signal block mb-1">No Label</label>
              <input
                type="text"
                value={currentData.noLabel ?? 'NO'}
                onChange={(e) => patch({ noLabel: e.target.value })}
                className="w-full bg-void border border-signal/40 text-data font-mono text-xs px-2 py-1.5 rounded-[2px] focus:border-signal outline-none"
              />
            </div>
          </div>
        )}

        {node.type === 'end' && (
          <div>
            <label className="font-mono text-[10px] tracking-[0.08em] uppercase text-ghost block mb-1">Variant</label>
            <div className="flex gap-2">
              <button
                onClick={() => patch({ endVariant: 'success' })}
                className={`flex-1 py-1.5 font-mono text-xs rounded-[2px] border transition-colors ${currentData.endVariant === 'success' ? 'bg-success/20 border-success text-success' : 'bg-void border-wire text-ghost hover:border-success'}`}
              >
                Success
              </button>
              <button
                onClick={() => patch({ endVariant: 'drop-off' })}
                className={`flex-1 py-1.5 font-mono text-xs rounded-[2px] border transition-colors ${currentData.endVariant === 'drop-off' ? 'bg-signal/20 border-signal text-signal' : 'bg-void border-wire text-ghost hover:border-signal'}`}
              >
                Drop-off
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
