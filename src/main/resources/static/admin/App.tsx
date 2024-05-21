import React, { useCallback } from 'react'
import ReactFlow, { addEdge, useEdgesState, useNodesState } from 'reactflow'

import 'reactflow/dist/style.css'
import './App.sass'
import { AppData } from './previewTypes'

const initialNodes = [
  { id: '1', position: { x: 0, y: 0 }, data: { label: '1' } },
  { id: '2', position: { x: 0, y: 100 }, data: { label: '2' } },
]
const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }]

export function App(data: AppData) {
  console.log('data', data)
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges])
  return (
    <>
      <div className="appbar">
        <div className="home-button app-icon">
          <span className="app-name">Wizard - forhåndsvisning veiviser</span>
        </div>
      </div>
      <div className="react-flow-container">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
        />
      </div>
    </>
  )
}
