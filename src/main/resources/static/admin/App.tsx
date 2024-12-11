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

const getLayoutedElements = (nodes, edges, rankdir: Dagre.GraphLabel['rankdir']) => {
  let nodeSourceTargetOptions = {
    targetPosition: 'top',
    sourcePosition: 'bottom',
  }
  let graphOptions: Dagre.GraphLabel = {
    nodesep: 80,
    edgesep: 100,
    ranksep: 150,
  }
  if (rankdir === 'LR') {
    // Left to right
    nodeSourceTargetOptions = {
      targetPosition: 'left',
      sourcePosition: 'right',
    }
    graphOptions = {
      nodesep: 50,
      edgesep: 50,
      ranksep: 200,
    }
  }

  g.setGraph({ rankdir, ...graphOptions })
  edges.forEach((edge) => g.setEdge(edge.source, edge.target))
  nodes.forEach((node) => g.setNode(node.id, { ...node, nodeOptions: nodeSourceTargetOptions }))

  Dagre.layout(g)

  return {
    nodes: nodes.map((node) => {
      const { x, y } = g.node(node.id)

      return { ...node, ...nodeSourceTargetOptions, position: { x, y } }
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
      const nodesThatShouldMove = []
      const nodesThatShouldNotMove = []
      const edgesThatShouldMove = []
      const edgesThatShouldNotMove = []
      nodes.forEach((node) =>
        node.data?.noMove ? nodesThatShouldNotMove.push(node) : nodesThatShouldMove.push(node)
      )
      edges.forEach((edge) =>
        edge.data?.noMove ? edgesThatShouldNotMove.push(edge) : edgesThatShouldMove.push(edge)
      )
      const layouted = getLayoutedElements(nodesThatShouldMove, edgesThatShouldMove, rankdir)

      setNodes([...layouted.nodes, ...nodesThatShouldNotMove])
      setEdges([...layouted.edges, ...edgesThatShouldNotMove])

      window.requestAnimationFrame(() => {
        fitView()
      })
    },
    [nodes, edges]
  )

  const updatePathParamsAndNavigate = (
    { target: { value, name } }: React.ChangeEvent<HTMLSelectElement>,
    resetOthers = false,
    additionalParams: Record<string, string> = {}
  ) => {
    const params = new URLSearchParams(resetOthers ? '' : location.search)
    Object.entries(additionalParams).forEach(([key, value]) => {
      params.set(key, value)
    })
    params.set(name, value)
    window.location.search = params.toString()
  }

  const { repository, branch, selectedWizard } = data.pathParams ?? {}
  const selectedRepository = repository !== 'com.enonic.cms.default' ? repository : undefined
  return (
    <>
      <div className="appbar">
        <div className="home-button app-icon">
          <span className="app-name">Wizard | preview</span>
        </div>
        <label htmlFor="site">Site:</label>
        <select
          id="site"
          name="repository"
          className={selectedRepository ? '' : 'red'}
          value={selectedRepository}
          onChange={(e) => updatePathParamsAndNavigate(e, true)}>
          <option key={'not-selected'} value={'not-selected'} hidden>
            Velg repo
          </option>
          {data.repositories?.map((repo, id) => (
            <option key={id} value={repo.id}>
              {repo.displayName}
            </option>
          ))}
        </select>
        <label htmlFor="branch">Branch:</label>
        <select
          id="branch"
          name="branch"
          defaultValue={branch ?? 'draft'}
          onChange={updatePathParamsAndNavigate}>
          <option value="draft">draft</option>
          <option value="master">master</option>
        </select>
        {selectedRepository ? (
          <>
            <label htmlFor="wizard">Wizard:</label>
            <select
              id="wizard"
              name="wizard"
              defaultValue={selectedWizard ?? 'not-selected'}
              onChange={(e) =>
                updatePathParamsAndNavigate(e, false, { repository: selectedRepository })
              }>
              <option key={'not-selected'} value={'not-selected'} hidden>
                Velg veiviser
              </option>
              {data.wizards?.map((wizard, id) => (
                <option key={id} value={wizard.id}>
                  {wizard.title}
                </option>
              ))}
            </select>
          </>
        ) : (
          <></>
        )}
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
      {selectedWizard ? (
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
            <Controls position={'bottom-right'} />
            <Panel position="top-right" className={'layout-panel'}>
              <button onClick={() => onLayout('TB')}>Vertikal visning</button>
              <button onClick={() => onLayout('LR')}>Horisontal visning</button>
            </Panel>
          </ReactFlow>
        </div>
      ) : (
        <div className="choose-wizard-container">
          <h1>
            {data.wizards?.length > 0
              ? 'Velg en veiviser'
              : selectedRepository
                ? 'Du må opprette en veiviser'
                : 'Du må velge et repository (site)'}
          </h1>
          {data.wizards?.map((wizard, id) => (
            <a href={`${window.location.search}&wizard=${wizard.id}`} key={id}>
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
