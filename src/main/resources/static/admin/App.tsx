import React, { useCallback } from 'react'
import ReactFlow, {
  Background,
  Controls,
  Panel,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from 'reactflow'
import Dagre from '@dagrejs/dagre'

import 'reactflow/dist/style.css'
import './App.sass'
import { AppData } from './previewTypes'
import { CustomNode } from './CustomNode'
import { CustomEdge } from './CustomEdge'

const nodeTypes = { customNode: CustomNode }
const edgeTypes = { customEdge: CustomEdge }
const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}))

const getLayoutedElements = (nodes, edges, options: Dagre.GraphLabel) => {
  g.setGraph(options)

  edges.forEach((edge) => g.setEdge(edge.source, edge.target))
  nodes.forEach((node) => g.setNode(node.id, node))

  Dagre.layout(g)

  return {
    nodes: nodes.map((node) => {
      const { x, y } = g.node(node.id)

      return { ...node, position: { x, y } }
    }),
    edges,
  }
}

export function LayoutFlow({ data }: { data: AppData }) {
  const { fitView } = useReactFlow()
  const [nodes, setNodes, onNodesChange] = useNodesState(data.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(data.edges)

  const onLayout = useCallback(
    (rankdir) => {
      let nodesThatShouldMove = []
      let nodesThatShouldNotMove = []
      let edgesThatShouldMove = []
      let edgesThatShouldNotMove = []
      nodes.forEach((node) =>
        node.data?.noMove ? nodesThatShouldNotMove.push(node) : nodesThatShouldMove.push(node)
      )
      edges.forEach((edge) =>
        edge.data?.noMove ? edgesThatShouldNotMove.push(edge) : edgesThatShouldMove.push(edge)
      )
      const layouted = getLayoutedElements(nodesThatShouldMove, edgesThatShouldMove, {
        rankdir,
        nodesep: 150,
        edgesep: 50,
        ranksep: 100,
      })

      setNodes([...layouted.nodes, ...nodesThatShouldNotMove])
      setEdges([...layouted.edges, ...edgesThatShouldNotMove])

      window.requestAnimationFrame(() => {
        fitView()
      })
    },
    [nodes, edges]
  )
  return (
    <>
      <div className="appbar">
        <div className="home-button app-icon">
          <span className="app-name">Wizard - forhåndsvisning veiviser</span>
        </div>
      </div>
      {data.errors?.length > 0 ? (
        <div className="errors">
          {data.errors.map((error, id) => (
            <p id={`${id}`}>{error}</p>
          ))}
        </div>
      ) : (
        <></>
      )}
      {data.selectedWizard ? (
        <div className="react-flow-container">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView>
            <Background />
            <Controls />
            <Panel position="top-right">
              <button onClick={() => onLayout('TB')}>Vertikal visning</button>
              <button onClick={() => onLayout('LR')}>Horisontal visning</button>
            </Panel>
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

export function App(data: AppData) {
  return (
    <ReactFlowProvider>
      <LayoutFlow data={data} />
    </ReactFlowProvider>
  )
}
