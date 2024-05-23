import React, { useCallback } from 'react'
import ReactFlow, { addEdge, Background, Controls, useEdgesState, useNodesState } from 'reactflow'

import 'reactflow/dist/style.css'
import './App.sass'
import { AppData } from './previewTypes'

export function App(data: AppData) {
  const [nodes, setNodes, onNodesChange] = useNodesState(data.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(data.edges)
  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges])
  return (
    <>
      <div className="appbar">
        <div className="home-button app-icon">
          <span className="app-name">Wizard - forhåndsvisning veiviser</span>
        </div>
      </div>
      {data.selectedWizard ? (
        <div className="react-flow-container">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}>
            <Background />
            <Controls />
          </ReactFlow>
        </div>
      ) : (
        <div className="choose-wizard-container">
          <h1>Velg en veiviser</h1>
          {data.wizards?.map((wizard, id) => (
            <a href={`${window.location.pathname}?wizard=${wizard.id}`} key={id}>
              {wizard.title}
            </a>
          ))}
        </div>
      )}
    </>
  )
}
