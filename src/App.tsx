import { ReactFlowProvider } from 'reactflow'
import { SimulationHeader } from '@/components/simulation/SimulationHeader'
import { FlowCanvas } from '@/components/flow/FlowCanvas'
import { RightPanel } from '@/components/simulation/RightPanel'
import { FrictionMatrix } from '@/components/simulation/FrictionMatrix'
import { useSimulationStore } from '@/store/simulationStore'

function App() {
  const { showFrictionMatrix, setShowFrictionMatrix } = useSimulationStore()

  return (
    <div className="flex flex-col h-screen bg-void text-data overflow-hidden">
      {/* Header */}
      <SimulationHeader />

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Flow Canvas — 60% */}
        <div className="flex-1 relative overflow-hidden">
          <ReactFlowProvider>
            <FlowCanvas />
          </ReactFlowProvider>
        </div>

        {/* Right Panel — fixed 380px */}
        <RightPanel />
      </div>

      {/* Friction Matrix Modal */}
      <FrictionMatrix
        open={showFrictionMatrix}
        onClose={() => setShowFrictionMatrix(false)}
      />
    </div>
  )
}

export default App
