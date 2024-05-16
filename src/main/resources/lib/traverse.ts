import {
  SpecificNumberCondition,
  TotalNumberCondition,
  TranslatedChoice,
  TranslatedChoiceMap,
  TraversedGraph,
  TreeEdge,
  TreeEdges,
  TreeNode,
  TreeNodes,
  TreeResultNode,
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
    const isTotalCondition = compareTotalOrSpecificCondition(totalNumberCondition, choicesTotal)

    if (isTotalCondition) {
      return root.nodes[totalNumberCondition.target]
    }
  }
  const specificNumberConditions = selectedEdge.conditionals.specificNumberConditions
  if (specificNumberConditions) {
    const conditionResults = calculateSpecificNumberConditionsResults(
      specificNumberConditions,
      userChoices,
      root.nodes
    )
    return conditionResults.id ? conditionResults : undefined
  }
  return undefined
}

function calculateSpecificNumberConditionsResults(
  specificNumberConditions: Array<SpecificNumberCondition>,
  userChoices: Array<WizardQueryParamObject>,
  nodes: TreeNodes
): TreeResultNode {
  return specificNumberConditions.reduce((acc, curr) => {
    const totalSpecific = calculateSpecificConditionTotal(userChoices, curr.choices)
    const isMoreThanCondition = compareTotalOrSpecificCondition(curr, totalSpecific)
    if (isMoreThanCondition) {
      return createConditionResult(acc, nodes[curr.target])
    }
    return acc
  }, {} as TreeResultNode)
}

function calculateSpecificConditionTotal(
  userChoices: Array<WizardQueryParamObject>,
  conditionChoices: Array<string>
): number {
  return userChoices
    .filter((uc) => uc.choice.some((uc) => conditionChoices.some((cc) => cc === uc)))
    .reduce((acc, curr) => {
      return acc + Number(curr.value)
    }, 0)
}

function createConditionResult(result: TreeResultNode, node: TreeNode): TreeResultNode {
  const conditionResultsArray = forceArray(result.conditionResults ?? [])
  const isDuplicateResult = conditionResultsArray.find((cr) => cr.id === node.id)
  if (!result.id) {
    result = node as TreeResultNode
  }
  return {
    ...result,
    conditionResults: isDuplicateResult
      ? conditionResultsArray
      : [...conditionResultsArray, node as TreeResultNode],
  }
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

function compareTotalOrSpecificCondition(
  condition: SpecificNumberCondition | TotalNumberCondition,
  value: number
): boolean {
  switch (condition.operator) {
    case 'eq':
      return value === condition.value
    case 'lt':
      return value < condition.value
    case 'gt':
      return value > condition.value
    case 'neq':
      return value !== condition.value
    case 'between':
      return value > condition.value && value < condition.value
    default:
      return false
  }
}
