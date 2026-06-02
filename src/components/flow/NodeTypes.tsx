import { Handle, Position, type NodeProps } from 'reactflow'
import { motion } from 'framer-motion'
import { Monitor } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import type { FlowNodeData, FrictionSeverity } from '@/types'
import { useFlowStore } from '@/store/flowStore'

function frictionBorderClass(score?: number): string {
  if (!score) return 'border-wire'
  if (score >= 70) return 'border-signal animate-pulse-signal'
  if (score >= 40) return 'border-caution'
  return 'border-success'
}

export function ScreenNode({ id, data, selected }: NodeProps<FlowNodeData>) {
  const setEditingNode = useFlowStore((s) => s.setEditingNode)
  const score = data.simulatedFrictionScore
  const hasFriction = score != null

  return (
    <div
      onDoubleClick={() => setEditingNode(id)}
      className={cn(
        'bg-slate-mid border rounded-[2px] min-w-[180px] cursor-pointer select-none transition-all',
        selected ? 'border-data shadow-lg' : hasFriction ? frictionBorderClass(score) : 'border-wire',
        'hover:border-ghost',
      )}
    >
      <Handle type="target" position={Position.Left} className="!bg-wire !border-ghost !w-2 !h-2 !rounded-[1px]" />
      <div className="px-3 py-2 flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Monitor size={10} className="text-ghost shrink-0" />
            {data.screenCategory && (
              <Badge variant="neutral" className="text-[8px] px-1 py-0">
                {data.screenCategory}
              </Badge>
            )}
          </div>
          {hasFriction && (
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                'font-mono text-[9px] font-bold tabular-nums px-1 rounded-[2px]',
                score! >= 70 ? 'bg-signal/20 text-signal' : score! >= 40 ? 'bg-caution/20 text-caution' : 'bg-success/20 text-success',
              )}
            >
              {score}
            </motion.div>
          )}
        </div>
        <span className="font-mono font-bold text-xs text-data leading-tight">{data.label}</span>
        {data.description && (
          <span className="font-sans text-[10px] text-ghost leading-tight line-clamp-2">{data.description}</span>
        )}
      </div>
      <Handle type="source" position={Position.Right} className="!bg-wire !border-ghost !w-2 !h-2 !rounded-[1px]" />
    </div>
  )
}

export function DecisionNode({ id, data, selected }: NodeProps<FlowNodeData>) {
  const setEditingNode = useFlowStore((s) => s.setEditingNode)
  return (
    <div
      onDoubleClick={() => setEditingNode(id)}
      className={cn(
        'bg-slate-mid border rounded-[2px] min-w-[160px] cursor-pointer select-none transition-all relative',
        selected ? 'border-data' : 'border-caution/60',
        'hover:border-caution',
      )}
    >
      <Handle type="target" position={Position.Left} className="!bg-wire !border-ghost !w-2 !h-2 !rounded-[1px]" />
      <div className="px-3 py-2 flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[8px] tracking-[0.08em] uppercase text-caution border border-caution/50 px-1 rounded-[2px]">DECISION</span>
        </div>
        <span className="font-mono font-bold text-xs text-data">{data.label}</span>
        <div className="flex gap-2 mt-1">
          <span className="font-mono text-[9px] text-success">✓ {data.yesLabel ?? 'YES'}</span>
          <span className="font-mono text-[9px] text-signal">✗ {data.noLabel ?? 'NO'}</span>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="yes"
        style={{ top: '35%' }}
        className="!bg-success !border-success !w-2 !h-2 !rounded-[1px]"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="no"
        style={{ top: '65%' }}
        className="!bg-signal !border-signal !w-2 !h-2 !rounded-[1px]"
      />
    </div>
  )
}

export function FrictionNode({ data }: NodeProps<FlowNodeData>) {
  const severity = data.frictionSeverity ?? 'warning'
  return (
    <div className="bg-void border-2 border-signal border-dashed rounded-[2px] min-w-[160px] select-none">
      <div className="px-3 py-2 flex flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <span className="text-signal text-xs">⚠</span>
          <span className="font-mono text-[8px] tracking-[0.08em] uppercase text-signal">FRICTION DETECTED</span>
        </div>
        <span className="font-mono font-bold text-xs text-data">{data.label}</span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] tabular-nums text-signal font-bold">{data.frictionScore ?? 0}</span>
          <Badge variant={severity as FrictionSeverity}>{severity.toUpperCase()}</Badge>
        </div>
      </div>
    </div>
  )
}

export function EndNode({ id, data, selected }: NodeProps<FlowNodeData>) {
  const setEditingNode = useFlowStore((s) => s.setEditingNode)
  const isSuccess = data.endVariant === 'success'
  return (
    <div
      onDoubleClick={() => setEditingNode(id)}
      className={cn(
        'bg-slate-mid border-2 rounded-[2px] min-w-[140px] cursor-pointer select-none transition-all',
        selected ? 'border-data' : isSuccess ? 'border-success' : 'border-signal',
      )}
    >
      <Handle type="target" position={Position.Left} className="!bg-wire !border-ghost !w-2 !h-2 !rounded-[1px]" />
      <div className="px-3 py-2 flex flex-col gap-1">
        <span className={cn('font-mono text-[8px] tracking-[0.08em] uppercase', isSuccess ? 'text-success' : 'text-signal')}>
          {isSuccess ? '✓ CONVERTED' : '✗ DROP-OFF'}
        </span>
        <span className="font-mono font-bold text-xs text-data">{data.label}</span>
      </div>
    </div>
  )
}
