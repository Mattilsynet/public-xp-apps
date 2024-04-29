import { BranchNumber, Question, Result } from '/codegen/site/content-types'
import { LogicalOperator } from '/codegen/site/mixins/logical-operator'

export type TranslatedChoiceMap = Record<
  string,
  {
    type: 'choice' | 'choice-group'
    text?: string
    choices?: Array<string>
  }
>
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
type TreeDisplayCriteriaChoice = {
  type: 'choice'
  operator: Operator
  choices: Array<string>
}

type TreeDisplayCriteriaLogic = {
  type: 'logic'
  operator: Operator
  logic: Array<Omit<TreeDisplayCriteriaChoice, 'type'>>
}

export type TreeResultWithConditions = {
  displayCriteria: {
    operator: Operator
    logic: Array<TreeDisplayCriteriaLogic | TreeDisplayCriteriaChoice>
  }
}

export type TreeResultGroups = Array<Array<TreeResultWithConditions>>
export type TreeResultCalculatorNode = {
  type: string
  fallbackResult?: string
  resultGroups: TreeResultGroups
}
export type TreeQuestionNode = {
  type: string
  targets?: Array<string>
  question?: string
  choiceType: Question['choiceType']['_selected']
  choices?: Array<string>
}
type TreeResultNode = { type: string } & Result
export type TreeNode = TreeQuestionNode | TreeResultNode | TreeResultCalculatorNode
export type TreeNodes = Record<string, TreeNode>

type NumberLogicOperator = BranchNumber['conditionalChoiceTotal']['numberCondition']['_selected']
type TotalNumberCondition = {
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
  type: string
  source: string
  target: string
  choices: string[]
  conditionals?: TreeEdgeNumberConditionals
}
export type TreeEdges = Record<string, TreeEdge>
