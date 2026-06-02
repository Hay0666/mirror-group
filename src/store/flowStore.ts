import { create } from 'zustand'
import type { FlowNode, FlowEdge } from '@/types'

interface HistoryEntry {
  nodes: FlowNode[]
  edges: FlowEdge[]
}

interface FlowStore {
  nodes: FlowNode[]
  edges: FlowEdge[]
  history: HistoryEntry[]
  historyIndex: number
  selectedNodeId: string | null
  editingNodeId: string | null

  setNodes: (nodes: FlowNode[]) => void
  setEdges: (edges: FlowEdge[]) => void
  addNode: (node: FlowNode) => void
  updateNode: (id: string, data: Partial<FlowNode['data']>) => void
  deleteNode: (id: string) => void
  addEdge: (edge: FlowEdge) => void
  deleteEdge: (id: string) => void
  setSelectedNode: (id: string | null) => void
  setEditingNode: (id: string | null) => void
  clearCanvas: () => void
  undo: () => void
  redo: () => void
  pushHistory: () => void
  updateEdgesPostSim: (edgeUpdates: Partial<FlowEdge> & { id: string }[]) => void
  updateNodesPostSim: (nodeUpdates: Partial<FlowNode['data']> & { id: string }[]) => void
}

export const useFlowStore = create<FlowStore>((set, get) => ({
  nodes: [],
  edges: [],
  history: [],
  historyIndex: -1,
  selectedNodeId: null,
  editingNodeId: null,

  pushHistory: () => {
    const { nodes, edges, history, historyIndex } = get()
    const entry: HistoryEntry = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    }
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(entry)
    set({ history: newHistory, historyIndex: newHistory.length - 1 })
  },

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  addNode: (node) => {
    get().pushHistory()
    set((s) => ({ nodes: [...s.nodes, node] }))
  },

  updateNode: (id, data) => {
    set((s) => ({
      nodes: s.nodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...data } } : n)),
    }))
  },

  deleteNode: (id) => {
    get().pushHistory()
    set((s) => ({
      nodes: s.nodes.filter((n) => n.id !== id),
      edges: s.edges.filter((e) => e.source !== id && e.target !== id),
    }))
  },

  addEdge: (edge) => {
    get().pushHistory()
    set((s) => ({ edges: [...s.edges, edge] }))
  },

  deleteEdge: (id) => {
    get().pushHistory()
    set((s) => ({ edges: s.edges.filter((e) => e.id !== id) }))
  },

  setSelectedNode: (id) => set({ selectedNodeId: id }),
  setEditingNode: (id) => set({ editingNodeId: id }),

  clearCanvas: () => {
    get().pushHistory()
    set({ nodes: [], edges: [], selectedNodeId: null, editingNodeId: null })
  },

  undo: () => {
    const { history, historyIndex } = get()
    if (historyIndex <= 0) return
    const prev = history[historyIndex - 1]
    set({ nodes: prev.nodes, edges: prev.edges, historyIndex: historyIndex - 1 })
  },

  redo: () => {
    const { history, historyIndex } = get()
    if (historyIndex >= history.length - 1) return
    const next = history[historyIndex + 1]
    set({ nodes: next.nodes, edges: next.edges, historyIndex: historyIndex + 1 })
  },

  updateEdgesPostSim: (edgeUpdates) => {
    set((s) => ({
      edges: s.edges.map((e) => {
        const upd = edgeUpdates.find((u) => u.id === e.id)
        return upd ? { ...e, ...upd } : e
      }),
    }))
  },

  updateNodesPostSim: (nodeUpdates) => {
    set((s) => ({
      nodes: s.nodes.map((n) => {
        const upd = nodeUpdates.find((u) => u.id === n.id)
        return upd ? { ...n, data: { ...n.data, ...upd } } : n
      }),
    }))
  },
}))
