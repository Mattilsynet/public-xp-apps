import { AppData } from '/static/admin/previewTypes'
import { Edge, Node } from 'reactflow'
import { isQuestion, isResult, isResultCalculator } from '/lib/type-check'
import { TreeQuestionNode, TreeResultCalculatorNode, WizardRoot } from '/lib/types'

const X_OFFSET = 200

export function mapToReactFlow(data: WizardRoot): AppData {
  const currentPathMap: { [key: string]: boolean } = data.traversedGraph?.renderSteps?.reduce(
    (acc, step) => {
      acc[step.id] = true
      if (isResultCalculator(step)) {
        step.resultGroups.forEach((group) => {
          group.results.forEach((result) => {
            acc[result.id] = true
          })
        })
      }
      return acc
    },
    {}
  )
  const nodes: Node[] = []
  const edges: Edge[] = []
  const visited: { [key: string]: boolean } = {}
  const queue: { nodeId: string; x: number; y: number }[] = [{ nodeId: data.rootNode, x: 0, y: 10 }]
  let iteration = 0

  while (queue.length > 0) {
    const { nodeId, x, y } = queue.shift()
    iteration++
    if (!visited[nodeId]) {
      visited[nodeId] = true

      const nodeData = data.nodes[nodeId]
      let label = nodeData.id
      let other = undefined
      if (isResult(nodeData)) {
        label = nodeData.title
        other = {
          style: {
            background: 'hsla(60, 100%, 50%, 0.10)',
          },
          type: 'output',
        }
      } else if (isQuestion(nodeData)) {
        label = nodeData.question
        other = {
          style: {
            background: 'hsla(333, 100%, 50%, 0.10)',
          },
        }
      } else if (isResultCalculator(nodeData)) {
        label = 'Kalkulator'
        other = {
          style: {
            background: 'hsla(0, 0%, 0%, 0.20)',
          },
        }
      }
      nodes.push({
        id: nodeId,
        data: { ...nodeData, label: label?.substring(0, 100) },
        position: { x: X_OFFSET + x, y },
        ...other,
      })

      if (isQuestion(nodeData)) {
        mapQuestionNode(nodeData, data, edges, nodeId, currentPathMap, visited, queue, iteration)
      } else if (isResultCalculator(nodeData)) {
        mapResultCalculator(
          nodeData,
          data,
          nodes,
          edges,
          nodeId,
          currentPathMap,
          visited,
          queue,
          iteration
        )
      }
    }
  }

  return { ...data, nodes, edges }
}

function mapResultCalculator(
  nodeData: TreeResultCalculatorNode,
  data: WizardRoot,
  nodes: Node[],
  edges: Edge[],
  nodeId: string,
  currentPathMap: {
    [p: string]: boolean
  },
  visited: { [p: string]: boolean },
  queue: { nodeId: string; x: number; y: number }[],
  iteration: number
) {
  nodeData.resultGroups?.forEach((group, index) => {
    const groupId = nodeData.id + index
    nodes.push({
      id: groupId,
      type: 'output',
      data: undefined,
      position: { x: 200 * index, y: (iteration + 1) * 100 },
      style: {
        width: 200,
        height: 100 * group.length,
        backgroundColor: 'rgba(240,240,240,0.25)',
      },
    })
    edges.push({
      id: groupId,
      source: nodeId,
      target: groupId,
    })
    group?.forEach((resultNode, index) => {
      const resultIsRendered = currentPathMap[resultNode.id]
      nodes.push({
        id: resultNode.id,
        type: 'output',
        // @ts-ignore
        targetPosition: 'left',
        data: { label: resultNode.displayName?.substring(0, 70) },
        position: { x: 10, y: 100 * index + 10 },
        parentId: groupId,
        extent: 'parent',
        style: resultIsRendered
          ? { background: 'hsla(118, 100%, 69%, 0.3)', width: 180 }
          : { width: 180 },
      })
    })
  })

  if (nodeData.fallbackResult) {
    const fallbackId = 'fallback-' + nodeData.id
    const fallbackIsRendered =
      currentPathMap[nodeId] &&
      nodeData.resultGroups?.every((group) => group.every((result) => !currentPathMap[result.id]))
    nodes.push({
      id: fallbackId,
      type: 'output',
      // @ts-ignore
      targetPosition: 'right',
      data: { label: 'Fallback: ' + nodeData.fallbackResult.title?.substring(0, 40) },
      position: { x: 0, y: iteration * 100 - 50 },
      style: fallbackIsRendered
        ? { background: 'hsla(118, 100%, 69%, 0.3)', width: 180 }
        : { width: 180 },
    })
    edges.push({
      id: fallbackId + '-edge',
      source: nodeId,
      target: fallbackId,
    })
  }
}

function mapQuestionNode(
  nodeData: TreeQuestionNode,
  data: WizardRoot,
  edges: Edge[],
  nodeId: string,
  currentPathMap: {
    [p: string]: boolean
  },
  visited: { [p: string]: boolean },
  queue: { nodeId: string; x: number; y: number }[],
  iteration: number
) {
  nodeData.targets?.forEach((edgeId, index) => {
    let nPushed = 0
    const edgeData = data.edges[edgeId]
    edges.push({
      id: edgeId,
      source: nodeId,
      target: edgeData.target,
      animated: currentPathMap[edgeData.target],
    })

    if (!visited[edgeData.target]) {
      queue.push({
        nodeId: edgeData.target,
        x: index * 250 + nPushed * 250,
        y: (iteration + 1) * 100,
      })
      nPushed++
    }

    edgeData?.conditionals?.specificNumberConditions?.forEach((condition) => {
      edges.push({
        id: edgeId + condition.target,
        source: nodeId,
        target: condition.target,
        animated: currentPathMap[condition.target],
      })
      if (!visited[condition.target]) {
        queue.push({
          nodeId: condition.target,
          x: index * 250 + nPushed * 250,
          y: (iteration + 1) * 100,
        })
        nPushed++
      }
    })

    const totalConditionTarget = edgeData?.conditionals?.totalNumberCondition?.target
    if (totalConditionTarget && !visited[totalConditionTarget]) {
      edges.push({
        id: edgeId + totalConditionTarget,
        source: nodeId,
        target: totalConditionTarget,
        animated: currentPathMap[totalConditionTarget],
      })
      queue.push({
        nodeId: totalConditionTarget,
        x: index * 250 + nPushed * 250,
        y: (iteration + 1) * 100,
      })
      nPushed++
    }
  })
}
