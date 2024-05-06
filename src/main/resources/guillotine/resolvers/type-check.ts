import { Content } from '/lib/xp/content'
import {
  BranchNumber,
  Choice,
  ChoiceGroup,
  Question,
  ResultCalculator,
  ResultWithConditions,
} from '/codegen/site/content-types'
import { TreeNode, TreeQuestionNode } from '/lib/types'

export const wizardType = (type: string) => `${app.name}:${type}`

export const isNumberEdge = (edge: Content<unknown>): edge is Content<BranchNumber> =>
  edge.type === wizardType('branch-number')

export const isQuestionNode = (node: Content<unknown>): node is Content<Question> =>
  node.type === wizardType('question')

export const isResultCalculatorNode = (node: Content<unknown>): node is Content<ResultCalculator> =>
  node.type === wizardType('result-calculator')

export const isResultWithConditions = (
  node: Content<unknown>
): node is Content<ResultWithConditions> => node.type === wizardType('result-with-conditions')

export const isChoiceGroup = (node: Content<unknown>): node is Content<ChoiceGroup> =>
  node.type === wizardType('choice-group')

export const isChoice = (node: Content<unknown>): node is Content<Choice> =>
  node.type === wizardType('choice')

export const isTreeQuestionNode = (node: TreeNode): node is TreeQuestionNode =>
  node.type === wizardType('question')
