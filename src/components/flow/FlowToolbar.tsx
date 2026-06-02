import { useState } from 'react'
import { useFlowStore } from '@/store/flowStore'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import {
  MousePointer2,
  Monitor,
  GitFork,
  Flag,
  Trash2,
  LayoutGrid,
  XCircle,
} from 'lucide-react'
import { TooltipPanel } from '@/components/ui/misc'
import { telemetry } from '@/lib/telemetry'
import { v4 as uuidv4 } from 'uuid'
import type { FlowNode, NodeType } from '@/types'
import { useSimulationStore } from '@/store/simulationStore'

type Tool = 'select' | 'screen' | 'decision' | 'end'

interface FlowToolbarProps {
  onAutoLayout: () => void
}

export function FlowToolbar({ onAutoLayout }: FlowToolbarProps) {
  const [activeTool, setActiveTool] = useState<Tool>('select')
  const { nodes, edges, addNode, deleteNode, selectedNodeId, clearCanvas } = useFlowStore()
  const status = useSimulationStore((s) => s.status)
  const isReadOnly = status === 'RUNNING'

  const addNodeType = (type: NodeType, label: string) => {
    if (isReadOnly) return
    const newNode: FlowNode = {
      id: uuidv4(),
      type,
      position: { x: 200 + Math.random() * 200, y: 100 + nodes.length * 100 },
      data: {
        label,
        screenCategory: type === 'screen' ? 'Feature' : undefined,
        endVariant: type === 'end' ? 'success' : undefined,
        yesLabel: type === 'decision' ? 'YES' : undefined,
        noLabel: type === 'decision' ? 'NO' : undefined,
      },
    }
    addNode(newNode)
    telemetry.flowNodeAdded(type, nodes.length + 1)
    setActiveTool('select')
  }

  const tools = [
    {
      id: 'select' as Tool,
      icon: MousePointer2,
      label: 'Select',
      action: () => setActiveTool('select'),
    },
    {
      id: 'screen' as Tool,
      icon: Monitor,
      label: 'Add Screen',
      action: () => addNodeType('screen', 'New Screen'),
    },
    {
      id: 'decision' as Tool,
      icon: GitFork,
      label: 'Add Decision',
      action: () => addNodeType('decision', 'Decision Point'),
    },
    {
      id: 'end' as Tool,
      icon: Flag,
      label: 'Add End',
      action: () => addNodeType('end', 'End'),
    },
  ]

  return (
    <div id="flow-toolbar" className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-1 bg-slate-mid border border-wire rounded-[2px] p-1 shadow-lg">
      {tools.map((tool) => (
        <TooltipPanel key={tool.id} content={tool.label}>
          <button
            id={tool.id === 'screen' ? 'toolbar-add-screen' : tool.id === 'decision' ? 'toolbar-add-decision' : tool.id === 'end' ? 'toolbar-add-end' : undefined}
            onClick={tool.action}
            disabled={isReadOnly}
            className={cn(
              'w-9 h-9 flex items-center justify-center rounded-[2px] transition-colors border-l-2',
              activeTool === tool.id
                ? 'border-l-signal bg-signal/10 text-signal'
                : 'border-l-transparent text-ghost hover:text-data hover:bg-slate-light',
              isReadOnly && 'opacity-30 cursor-not-allowed',
            )}
          >
            <tool.icon size={16} />
          </button>
        </TooltipPanel>
      ))}

      <div className="h-px bg-wire my-1" />

      <TooltipPanel content="Delete Selected">
        <button
          onClick={() => selectedNodeId && deleteNode(selectedNodeId)}
          disabled={!selectedNodeId || isReadOnly}
          className="w-9 h-9 flex items-center justify-center rounded-[2px] transition-colors border-l-2 border-l-transparent text-ghost hover:text-signal hover:bg-signal/10 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Trash2 size={16} />
        </button>
      </TooltipPanel>

      <TooltipPanel content="Auto-Layout">
        <button
          onClick={onAutoLayout}
          disabled={isReadOnly}
          className="w-9 h-9 flex items-center justify-center rounded-[2px] transition-colors border-l-2 border-l-transparent text-ghost hover:text-data hover:bg-slate-light disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <LayoutGrid size={16} />
        </button>
      </TooltipPanel>

      <TooltipPanel content="Clear Canvas">
        <button
          onClick={() => {
            if (isReadOnly) return
            const n = nodes.length
            const e = edges.length
            clearCanvas()
            telemetry.canvasCleared(n, e)
          }}
          disabled={isReadOnly}
          className="w-9 h-9 flex items-center justify-center rounded-[2px] transition-colors border-l-2 border-l-transparent text-ghost hover:text-signal hover:bg-signal/10 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <XCircle size={16} />
        </button>
      </TooltipPanel>
    </div>
  )
}
