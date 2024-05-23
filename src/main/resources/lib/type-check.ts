import { Content } from '/lib/xp/content'
import {
  BranchCheckbox,
  BranchNumber,
  Choice,
  ChoiceGroup,
  Question,
  Result,
  ResultCalculator,
  ResultWithConditions,
} from '/codegen/site/content-types'
import {
  TreeNode,
  TreeQuestionNode,
  TreeResultCalculatorNode,
  TreeResultNode,
  WizardRenderNode,
} from '/lib/types'

export const wizardType = (type: string) => `no.mattilsynet.wizard:${type}`

// CONTENT<UNKNOWN> TYPE CHECKS

export const isNumberEdgeContent = (edge: Content<unknown>): edge is Content<BranchNumber> =>
  edge.type === wizardType('branch-number')

export const isCheckboxEdgeContent = (edge: Content<unknown>): edge is Content<BranchCheckbox> =>
  edge.type === wizardType('branch-checkbox')

export const isQuestionNodeContent = (node: Content<unknown>): node is Content<Question> =>
  node.type === wizardType('question')

export const isResultCalculatorNodeContent = (
  node: Content<unknown>
): node is Content<ResultCalculator> => node.type === wizardType('result-calculator')

export const isResultNodeContent = (node: Content<unknown>): node is Content<Result> =>
  node.type === wizardType('result')

export const isResultWithConditionsContent = (
  node: Content<unknown>
): node is Content<ResultWithConditions> => node.type === wizardType('result-with-conditions')

export const isChoiceContent = (node: Content<unknown>): node is Content<Choice> =>
  node.type === wizardType('choice')

export const isChoiceGroupContent = (node: Content<unknown>): node is Content<ChoiceGroup> =>
  node.type === wizardType('choice-group')

// GRAPH STRUCTURE TYPE CHECKS
/* eslint-disable  @typescript-eslint/no-explicit-any */
export const isResultCalculator = (node: any): node is TreeResultCalculatorNode =>
  node?.type === wizardType('result-calculator')

export const isQuestion = (node: TreeNode): node is TreeQuestionNode =>
  node?.type === wizardType('question')

export const isResult = (node: TreeNode): node is TreeResultNode =>
  node?.type === wizardType('result')

// RENDERING TYPE CHECKS

export function isRadioButton(node: WizardRenderNode): boolean {
  return node?.choiceType === 'radio'
}

export function isNumbers(node: WizardRenderNode): boolean {
  return node?.choiceType === 'number'
}

export function isMultiSelect(node: WizardRenderNode): boolean {
  return node?.choiceType === 'checkbox'
}
