import { useCallback, useEffect } from 'react'
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  type Connection,
  type NodeChange,
  type EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Node,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useFlowStore } from '@/store/flowStore'
import { useSimulationStore } from '@/store/simulationStore'
import { ScreenNode, DecisionNode, FrictionNode, EndNode } from './NodeTypes'
import { FlowToolbar } from './FlowToolbar'
import { NodeEditPanel } from './NodeEditPanel'
import { telemetry } from '@/lib/telemetry'
import type { FlowNode, FlowEdge } from '@/types'
import { v4 as uuidv4 } from 'uuid'

const nodeTypes = {
  screen: ScreenNode,
  decision: DecisionNode,
  friction: FrictionNode,
  end: EndNode,
}

function autoLayout(nodes: FlowNode[], edges: FlowEdge[]): FlowNode[] {
  // Simple left-to-right auto layout
  const levels: Record<string, number> = {}
  const targetIds = new Set(edges.map((e) => e.target))

  // Entry nodes start at level 0
  nodes.forEach((n) => {
    if (!targetIds.has(n.id)) levels[n.id] = 0
  })

  // BFS
  let changed = true
  while (changed) {
    changed = false
    edges.forEach((e) => {
      const sourceLevel = levels[e.source] ?? 0
      const targetLevel = levels[e.target]
      if (targetLevel == null || targetLevel < sourceLevel + 1) {
        levels[e.target] = sourceLevel + 1
        changed = true
      }
    })
  }

  const levelGroups: Record<number, FlowNode[]> = {}
  nodes.forEach((n) => {
    const l = levels[n.id] ?? 0
    ;(levelGroups[l] ??= []).push(n)
  })

  return nodes.map((n) => {
    const level = levels[n.id] ?? 0
    const group = levelGroups[level] ?? []
    const idx = group.findIndex((g) => g.id === n.id)
    return {
      ...n,
      position: {
        x: level * 260 + 100,
        y: idx * 140 + 80,
      },
    }
  })
}

export function FlowCanvas() {
  const { nodes, edges, setNodes, setEdges, setSelectedNode, selectedNodeId, undo, redo } = useFlowStore()
  const status = useSimulationStore((s) => s.status)
  const isReadOnly = status === 'RUNNING'

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) undo()
      if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) redo()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [undo, redo])

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      if (isReadOnly) return
      setNodes(applyNodeChanges(changes, nodes as Node[]) as FlowNode[])
      const selChange = changes.find((c) => c.type === 'select' && (c as { selected: boolean }).selected)
      if (selChange) setSelectedNode((selChange as { id: string }).id)
      const deselChange = changes.find((c) => c.type === 'select' && !(c as { selected: boolean }).selected && (c as { id: string }).id === selectedNodeId)
      if (deselChange && !changes.some((c) => c.type === 'select' && (c as { selected: boolean }).selected)) setSelectedNode(null)
    },
    [nodes, setNodes, setSelectedNode, selectedNodeId, isReadOnly],
  )

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      if (isReadOnly) return
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setEdges(applyEdgeChanges(changes, edges as any[]) as FlowEdge[])
    },
    [edges, setEdges, isReadOnly],
  )

  const onConnect = useCallback(
    (connection: Connection) => {
      if (isReadOnly) return
      const newEdge: FlowEdge = {
        id: uuidv4(),
        source: connection.source!,
        target: connection.target!,
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle,
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setEdges(addEdge(newEdge, edges as any[]) as FlowEdge[])
      const sourceNode = nodes.find((n) => n.id === connection.source)
      const targetNode = nodes.find((n) => n.id === connection.target)
      if (sourceNode && targetNode) {
        telemetry.flowNodeConnected(sourceNode.type, targetNode.type, edges.length + 1)
      }
    },
    [edges, setEdges, nodes, isReadOnly],
  )

  const handleAutoLayout = () => {
    const laid = autoLayout(nodes, edges)
    setNodes(laid)
  }

  const isEmpty = nodes.filter((n) => n.type !== 'friction').length === 0

  return (
    <div id="flow-canvas" className="relative w-full h-full bg-void overflow-hidden">
      <ReactFlow
        nodes={nodes as Node[]}
        edges={edges.map((fe) => ({
          ...fe,
          animated: status === 'RUNNING',
          style: {
            stroke: fe.traversalPercentage != null
              ? fe.traversalPercentage > 70
                ? '#22C55E'
                : fe.traversalPercentage > 30
                ? '#EAB308'
                : '#FF6B2B'
              : '#3A424F',
            strokeWidth: 2,
          },
          labelStyle: { fill: '#64748B', fontFamily: 'JetBrains Mono', fontSize: 10 },
          label: fe.traversalPercentage != null ? `${fe.traversalPercentage}%` : undefined,
        }))}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodesDraggable={!isReadOnly}
        nodesConnectable={!isReadOnly}
        elementsSelectable={!isReadOnly}
        fitView
        className="bg-void"
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="rgba(58, 66, 79, 0.5)"
        />
        <Controls
          className="!bg-slate-mid !border-wire [&_button]:!bg-slate-mid [&_button]:!text-ghost [&_button:hover]:!text-data [&_button]:!border-wire"
          position="top-right"
        />
        <MiniMap
          position="bottom-right"
          style={{ background: '#1C2028', border: '1px solid #3A424F', borderRadius: '2px' }}
          nodeColor="#64748B"
          maskColor="rgba(10,12,15,0.6)"
        />
      </ReactFlow>

      <FlowToolbar onAutoLayout={handleAutoLayout} />
      <NodeEditPanel />

      {isEmpty && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="font-mono text-xs tracking-[0.08em] uppercase text-ghost/40">No flow detected.</p>
            <p className="font-mono text-xs tracking-[0.08em] uppercase text-ghost/30 mt-1">Add a screen node to begin.</p>
          </div>
        </div>
      )}
    </div>
  )
}
