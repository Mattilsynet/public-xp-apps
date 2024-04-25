import { BranchNumber, Question, Result } from '/codegen/site/content-types'

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

export type TreeQuestionNode = {
  type: string
  choiceType: Question['choiceType']['_selected']
  targets?: Array<string>
  question?: string
}
type TreeResultNode = { type: string } & Result
export type TreeNode = TreeQuestionNode | TreeResultNode
export type TreeNodes = Record<string, TreeNode>

type LogicOperator = BranchNumber['conditionalChoiceTotal']['numberCondition']['_selected']
type TotalNumberCondition = {
  operator?: LogicOperator
  value?: number
  target?: string
}
export type SpecificNumberCondition = {
  operator?: LogicOperator
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
