import { AppData } from '/static/admin/previewTypes'
import { Edge, Node } from 'reactflow'
import { isQuestion, isResult, isResultCalculator } from '/lib/type-check'
import {
  SpecificNumberCondition,
  TotalNumberCondition,
  TreeQuestionNode,
  TreeResultCalculatorNode,
  WizardRoot,
} from '/lib/types'

const X_OFFSET = 200

export function mapToReactFlow(
  data: WizardRoot,
  enonicEditPath: string,
  errors: string[]
): AppData {
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
      if (!nodeData) {
        errors.push('Fant ikke noden')
        continue
      }
      let label = nodeData.id
      let other = undefined
      if (isResult(nodeData)) {
        label = nodeData.title
        other = {
          noSourceHandle: true,
          style: {
            background: 'hsla(60, 100%, 50%, 0.10)',
          },
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
        type: 'customNode',
        data: {
          ...nodeData,
          ...other,
          label: label?.substring(0, 100),
          enonicEditPath: enonicEditPath + nodeId,
        },
        position: { x: X_OFFSET + x, y },
        // @ts-ignore
        sourcePosition: 'bottom',
        // @ts-ignore
        targetPosition: 'top',
      })

      if (isQuestion(nodeData)) {
        mapQuestionNode(
          nodeData,
          data,
          edges,
          nodeId,
          currentPathMap,
          visited,
          queue,
          iteration,
          enonicEditPath
        )
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
          iteration,
          enonicEditPath
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
  iteration: number,
  enonicEditPath: string
) {
  nodeData.resultGroups?.forEach((group, index) => {
    const groupId = nodeData.id + index
    nodes.push({
      id: groupId,
      type: 'output',
      data: undefined,
      position: { x: 225 * index, y: (iteration + 1) * 100 },
      style: {
        width: 222,
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
        type: 'customNode',
        data: {
          noTargetHandle: true,
          noSourceHandle: true,
          label: resultNode.displayName?.substring(0, 70),
          enonicEditPath: enonicEditPath + resultNode.id,
          style: resultIsRendered
            ? { background: 'hsla(118, 100%, 69%, 0.3)', width: 180 }
            : { width: 180 },
        },
        position: { x: 10, y: 100 * index + 10 },
        parentId: groupId,
        extent: 'parent',
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
      type: 'customNode',
      // @ts-expect-error import of Position type results in error for some reason
      targetPosition: 'right',
      data: {
        noSourceHandle: true,
        label: 'Fallback: ' + nodeData.fallbackResult.title?.substring(0, 40),
        // @ts-expect-error id is not in type, but exists in data
        enonicEditPath: enonicEditPath + nodeData.fallbackResult?.id,
      },
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
  iteration: number,
  enonicEditPath: string
) {
  nodeData.targets?.forEach((edgeId, index) => {
    let nPushed = 0
    const edgeData = data.edges[edgeId]
    edges.push({
      id: edgeId,
      type: 'customEdge',
      source: nodeId,
      target: edgeData.target,
      data: {
        ...edgeData,
        enonicEditPath: enonicEditPath + edgeId,
      },
      label: edgeData.displayName,
      animated: currentPathMap[edgeData.target],
    })

    if (edgeData.target && !visited[edgeData.target]) {
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
        label: getConditionLabel(condition),
        type: 'customEdge',
        data: {
          enonicEditPath: enonicEditPath + edgeId,
        },
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

    const totalCondition = edgeData?.conditionals?.totalNumberCondition
    const totalConditionTarget = totalCondition?.target
    if (totalConditionTarget && !visited[totalConditionTarget]) {
      edges.push({
        id: edgeId + totalConditionTarget,
        source: nodeId,
        label: getConditionLabel(totalCondition),
        type: 'customEdge',
        data: {
          enonicEditPath: enonicEditPath + edgeId,
        },
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

function getConditionLabel(condition: SpecificNumberCondition | TotalNumberCondition): string {
  function isSpecificNumberCondition(
    condition: SpecificNumberCondition | TotalNumberCondition
  ): condition is SpecificNumberCondition {
    return (condition as SpecificNumberCondition).choices?.length > 0
  }
  let operator: string
  switch (condition.operator) {
    case 'gt':
      operator = '>'
      break
    case 'lt':
      operator = '<'
      break
    case 'eq':
      operator = '='
      break
    case 'neq':
      operator = '!='
      break
    default:
      operator = condition.operator
  }
  if (isSpecificNumberCondition(condition)) {
    return `${condition.choices[0]}${condition.choices?.length > 1 ? '...' : ''} ${operator} ${condition.value}`
  }
  return `total ${operator} ${condition.value}`
}
