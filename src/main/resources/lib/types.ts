import { BranchNumber, Question, Result } from '/codegen/site/content-types'
import { LogicalOperator } from '/codegen/site/mixins/logical-operator'
import { CoreCommon } from '/codegen/site/mixins/core-common'

export type TranslatedChoice = {
  id: string
  type: 'choice' | 'choice-group'
  text?: string
  choices?: Array<string>
  partOfGroups?: Array<string>
}
export type TranslatedChoiceMap = Record<string, TranslatedChoice>
export type UUIDChoiceMap = Record<
  string,
  {
    type?: string
    text?: string
    partOfGroups?: Array<string>
    choices?: Array<string>
  }
>
export type ChoiceMaps = {
  choiceMap: UUIDChoiceMap
  choiceGroupMap: UUIDChoiceMap
  translatedChoices: TranslatedChoiceMap
}

type Operator = LogicalOperator['logicalOperator']
export type TreeDisplayCriteriaChoice = {
  type: 'choice'
  operator: Operator
  choices: Array<string>
}

type TreeDisplayCriteriaLogic = {
  type: 'logic'
  operator: Operator
  logic: Array<TreeDisplayCriteriaChoice>
}

export type TreeChoiceOrLogic = TreeDisplayCriteriaLogic | TreeDisplayCriteriaChoice
export type TreeResultWithConditions = {
  displayCriteria: {
    type: TreeDisplayCriteriaLogic['type']
    operator: Operator
    logic: Array<TreeChoiceOrLogic>
  }
} & CoreCommon

export type TreeResultGroups = Array<Array<TreeResultWithConditions>>
export type TreeResultCalculatorNode = {
  id: string
  type: string
  resultGroups: TreeResultGroups
  fallbackResult?: CoreCommon
}
export type TreeQuestionNode = {
  id: string
  type: string
  targets?: Array<string>
  question?: string
  choiceType: Question['choiceType']['_selected']
  choices?: Array<string>
  errorMessages: {
    required: string
    // number branch specific
    greaterThanZero?: string
    isNumber?: string
  }
}
export type TreeResultNode = {
  type: string
  id: string
  conditionResults?: Array<Omit<TreeResultNode, 'conditionResults'>>
} & Result
export type TreeNode = TreeQuestionNode | TreeResultNode | TreeResultCalculatorNode
export type TreeNodes = Record<string, TreeNode>

type NumberLogicOperator = BranchNumber['conditionalChoiceTotal']['numberCondition']['_selected']
export type TotalNumberCondition = {
  operator?: NumberLogicOperator
  value?: number
  target?: string
}
export type SpecificNumberCondition = {
  operator?: NumberLogicOperator
  value?: number
  choices: Array<string>
  target?: string
}
export type TreeEdgeNumberConditionals = {
  totalNumberCondition?: TotalNumberCondition
  specificNumberConditions?: Array<SpecificNumberCondition>
}
export type TreeEdge = {
  id: string
  type: string
  source: string
  target: string
  choices: string[]
  preferredChoices?: string[]
  conditionals?: TreeEdgeNumberConditionals
}
export type TreeEdges = Record<string, TreeEdge>

export type TraversedGraph = {
  renderSteps: Array<WizardRenderNode>
  resultCalculatorNode: WizardRenderNode
}
export type WizardRoot = {
  rootNode: string
  nodes: TreeNodes
  edges: TreeEdges
  choices: TranslatedChoiceMap
  errors: Array<string>
  validTree: boolean
  validationErrors?: Array<UIError>
  traversedGraph?: TraversedGraph
}

export type WizardStep = {
  node: TreeNode
  edges: Array<TreeEdge>
  choices: Array<TranslatedChoice>
  preferredChoices?: Array<TranslatedChoice>
}

type WizardErrorMessages = { required?: string; greaterThanZero?: string; isNumber?: string }
export type MultiSelectOption = {
  value: string
  text: string
  removeAriaLabel: string
}
export type RadioOptions = {
  value: string
  text: string
}
export type WizardNumberOptions = { name: string; value: string; label: string }
export type WizardRenderNode = {
  id: string
  // todo split to different types
  type?: string
  results?: Array<CoreCommon>

  conditionResults?: Array<TreeResultNode>
  choiceType?: 'radio' | 'number' | 'checkbox'
  errorMessages?: WizardErrorMessages
  options?: Array<RadioOptions | MultiSelectOption | WizardNumberOptions>
  question?: string
  preferredChoices?: Array<MultiSelectOption>
} & Partial<CoreCommon>

export type UIError = {
  key: string
  message: string
}
