import {
  TranslatedChoice,
  TranslatedChoiceMap,
  TraversedGraph,
  TreeEdge,
  TreeEdges,
  TreeNode,
  WizardRenderNode,
  WizardRoot,
} from './types'
import { flatten, forceArray } from '@enonic/js-utils'
import { mapQueryToValues, WizardQueryParamObject } from './wizard-util'
import { mapNodeToRenderable } from './graph-to-renderable'
import { isQuestion, isResultCalculator } from './type-check'

export function getTargetEdges(node: TreeNode, nodesAndEdges: TreeEdges): Array<TreeEdge> {
  if (!isQuestion(node)) {
    return []
  }
  return forceArray(node?.targets ?? []).map((target) => {
    return nodesAndEdges[target]
  })
}

export function getChoices(
  edges: Array<TreeEdge>,
  choices: TranslatedChoiceMap
): { choices: Array<TranslatedChoice>; preferredChoices: Array<TranslatedChoice> } {
  const preferredChoices = []
  const mappedChoices = flatten(
    edges.map((edge) => {
      edge.preferredChoices?.forEach((c) => preferredChoices.push({ ...choices[c], id: c }) ?? [])

      return edge.choices.reduce((acc, c) => {
        const choiceObject = choices[c]
        if (choiceObject?.type === 'choice-group') {
          return acc.concat(
            choiceObject.choices.reduce((groupChoices, groupChoice) => {
              return groupChoices.concat({ ...choices[groupChoice], id: groupChoice })
            }, [])
          )
        }
        return acc.concat({ ...choiceObject, id: c })
      }, [])
    })
  ) as Array<TranslatedChoice>
  return { choices: mappedChoices, preferredChoices }
}

export function traverseGraph(query: string, root?: WizardRoot): TraversedGraph {
  const renderSteps = getRenderSteps(query, root)
  const lastStep = renderSteps[renderSteps.length - 1]
  let resultCalculatorNode: WizardRenderNode
  if (isResultCalculator(lastStep) && query.indexOf(lastStep.id) !== -1) {
    resultCalculatorNode = lastStep
  }
  return { renderSteps, resultCalculatorNode }
}

export function getRenderSteps(query: string, root: WizardRoot): Array<WizardRenderNode> {
  const userChoices = mapQueryToValues(query)
  const currentNodeId = root.rootNode
  const map: Array<WizardRenderNode> = []
  let currentNode = root.nodes[currentNodeId]

  while (currentNode) {
    const currentEdges = getTargetEdges(currentNode, root.edges)
    const { choices, preferredChoices } = getChoices(currentEdges, root.choices)

    const step = {
      node: currentNode,
      edges: currentEdges,
      choices,
      preferredChoices,
    }
    map.push(mapNodeToRenderable(step, userChoices, root.choices))

    const currentAnswer = userChoices.find((c) => c.id === currentNode.id)
    currentNode = getNextNode(currentEdges, currentAnswer, userChoices, root)
  }
  return map
}

export function calculateChoiceTotal(id: string, choices: Array<WizardQueryParamObject>): number {
  return choices.reduce((acc, c) => {
    if (c.id === id) {
      const value = c.value
      return value ? acc + Number(value) : acc
    }
    return acc
  }, 0)
}

function getNextWithConditionals(
  selectedEdge: TreeEdge,
  choice: WizardQueryParamObject,
  userChoices: Array<WizardQueryParamObject>,
  root: WizardRoot
): TreeNode | undefined {
  const totalNumberCondition = selectedEdge.conditionals.totalNumberCondition
  if (totalNumberCondition) {
    const choicesTotal = calculateChoiceTotal(choice.id, userChoices)
    const isTotalCondition = compareTotalCondition(totalNumberCondition, choicesTotal)

    if (isTotalCondition) {
      return root.nodes[totalNumberCondition.target]
    }
    return undefined
  }
  const specificNumberConditions = selectedEdge.conditionals.specificNumberConditions
  if (specificNumberConditions) {
    //todo
    return undefined
  }
  return undefined
}

function findTargetEdge(
  edges: Array<TreeEdge>,
  currentAnswer: WizardQueryParamObject,
  allChoices: TranslatedChoiceMap
): TreeEdge | undefined {
  return edges.find((edge) => {
    return edge.choices.some((edgeChoice) => {
      if (currentAnswer?.choice?.some((c) => c === edgeChoice)) {
        return true
      } else if (
        currentAnswer?.choice?.some((selectedChoice) =>
          allChoices[selectedChoice]?.partOfGroups?.some((c) => c === edgeChoice)
        )
      ) {
        return true
      }
    })
  })
}

function getNextNode(
  targetEdges: Array<TreeEdge>,
  currentAnswer: WizardQueryParamObject,
  userChoices: Array<WizardQueryParamObject>,
  root?: WizardRoot
): TreeNode {
  const selectedEdge = findTargetEdge(targetEdges, currentAnswer, root.choices)
  if (!selectedEdge) {
    return undefined
  }
  if (selectedEdge?.conditionals) {
    const nextWithConditionals = getNextWithConditionals(
      selectedEdge,
      currentAnswer,
      userChoices,
      root
    )
    if (nextWithConditionals) {
      return nextWithConditionals
    }
  }
  return root.nodes[selectedEdge?.target]
}

function compareTotalCondition(totalCondition, totalValue: number): boolean {
  switch (totalCondition.operator) {
    case 'eq':
      return totalValue === totalCondition.value
    case 'lt':
      return totalValue < totalCondition.value
    case 'gt':
      return totalValue > totalCondition.value
    case 'between':
      return totalValue > totalCondition.value && totalValue < totalCondition.toValue
    default:
      return false
  }
}
