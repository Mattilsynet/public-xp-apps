import { query } from '/lib/xp/content'
import {
  isQuestionNodeContent,
  isResultCalculatorNodeContent,
  isResultNodeContent,
  isResultWithConditionsContent,
  wizardType,
} from '/lib/type-check'
import { forceArray } from '@enonic/js-utils'
import { ChoiceMaps, TreeNode, TreeNodes, TreeResultWithConditions } from '/lib/types'
import { translateChoices } from '/guillotine/resolvers/choices'
import { Logical } from '/codegen/site/mixins/logical'
import { Content } from '@enonic-types/lib-content'
import {
  Question,
  Result,
  ResultCalculator,
  ResultWithConditions,
} from '/codegen/site/content-types'
import { processHtml } from '/lib/xp/portal'
import { CoreCommon } from '/codegen/site/mixins/core-common'

type WizardNodes = Content<Question | Result | ResultCalculator | ResultWithConditions>

export function resolveNodes(
  wizardPath: string,
  choiceMaps: ChoiceMaps,
  errors: Array<string>
): TreeNodes {
  const nodes = query<WizardNodes>({
    query: `_path LIKE '/content${wizardPath}/*'`,
    count: -1,
    filters: {
      hasValue: {
        field: 'type',
        values: [
          wizardType('question'),
          wizardType('result'),
          wizardType('result-calculator'),
          wizardType('result-with-conditions'),
        ],
      },
    },
    // sort by type to map result-with-conditions before result-calculator
    sort: 'type DESC',
  }).hits

  const questionAndResultNodes = getQuestionAndResultNodes(nodes, errors)
  const resultCalculatorNodes = getResultCalculatorNodes(
    nodes,
    questionAndResultNodes,
    errors,
    choiceMaps
  )
  return { ...questionAndResultNodes, ...resultCalculatorNodes }
}

function getResultCalculatorNodes(
  nodes: WizardNodes[],
  questionAndResultNodes: Record<string, TreeNode>,
  errors: Array<string>,
  choiceMaps: ChoiceMaps
): Record<string, TreeNode> {
  const resultWithConditions: Record<string, TreeResultWithConditions> = {}

  return nodes.reduce((acc: TreeNodes, node) => {
    let mapped: Partial<TreeNode>
    if (isResultCalculatorNodeContent(node)) {
      const fallbackResultUUID = node.data.fallbackResult
      mapped = {
        ...node.data,
        fallbackResult: fallbackResultUUID
          ? (questionAndResultNodes[fallbackResultUUID] as CoreCommon)
          : undefined,
        groupByQuestionId: node.data.groupByQuestionId,
        resultGroups: forceArray(node.data.resultGroups ?? []).map((resultGroup) => {
          return forceArray(resultGroup.result ?? []).map<TreeResultWithConditions>((result) => {
            const resultsWithCondition = resultWithConditions[result]
            if (!resultsWithCondition) {
              errors.push(
                `Fant ikke resultat med betingelser for ${result}. Fiks feil i koden. Resultat med betingelser må komme før resultatkalkulatorer.`
              )
            }
            return resultsWithCondition
          })
        }),
      }
    } else if (isResultWithConditionsContent(node)) {
      resultWithConditions[node._id] = {
        ...node.data,
        id: node._id,
        displayName: node.displayName,
        text: processHtml({ value: node.data.text }),
        displayCriteria: {
          type: 'logic',
          operator: node.data.displayCriteria.logicalOperator,
          // issue with codegen nested mixins? type cast Logical to fix
          logic: forceArray((node.data as Logical).displayCriteria.choiceOrLogic ?? []).map(
            (choiceOrLogic) => {
              const type = choiceOrLogic._selected
              if (type === 'choice' || type === 'choiceOutside') {
                return {
                  type: 'choice',
                  operator: choiceOrLogic[type].logicalOperator,
                  choices: translateChoices(choiceOrLogic[type].choices, 'reference', choiceMaps),
                }
              } else if (type === 'logic') {
                return {
                  type: 'logic',
                  operator: choiceOrLogic.logic.logicalOperator,
                  logic: forceArray(choiceOrLogic.logic.choiceOrChoiceOutside ?? []).map(
                    (choiceOrChoiceOutside) => {
                      const choice = choiceOrChoiceOutside[choiceOrChoiceOutside._selected]
                      return {
                        type: 'choice',
                        operator: choice.logicalOperator,
                        choices: translateChoices(choice.choices, 'reference', choiceMaps),
                      }
                    }
                  ),
                }
              } else {
                errors.push(`Ukjent eller manglende kriterie for ${node.displayName}: ${type}`)
              }
            }
          ),
        },
      }
      return acc
    } else if (!isQuestionNodeContent(node) && node.type !== wizardType('result')) {
      errors.push(`Unknown node type: ${node.type}`)
      return acc
    } else {
      return acc
    }

    return {
      ...acc,
      [node._id]: {
        id: node._id,
        type: node.type,
        ...mapped,
      } as TreeNode,
    }
  }, {})
}

function getQuestionAndResultNodes(
  nodes: Array<WizardNodes>,
  errors: Array<string>
): Record<string, TreeNode> {
  return nodes.reduce((acc, node) => {
    let mapped: Partial<TreeNode>
    if (isQuestionNodeContent(node)) {
      const choiceType = node.data.choiceType?._selected
      const choiceTypeData = node.data.choiceType?.[choiceType]
      if (!choiceTypeData) {
        errors.push(`Mangler valg-type for "${node.displayName ?? node._id}"`)
      }
      mapped = {
        choiceType,
        question: node.data.question,
        helpText: processHtml({ value: node.data.helpText }),
        targets: forceArray(choiceTypeData?.nextStep ?? []),
        collapsableButtonText: choiceTypeData?.collapsableButtonText,
        errorMessages: choiceTypeData?.errorMessages,
      }
    } else if (isResultNodeContent(node)) {
      mapped = {
        ...node.data,
        text: processHtml({ value: node.data.text }),
      }
    } else if (!isResultCalculatorNodeContent(node) && !isResultWithConditionsContent(node)) {
      errors.push(`Ukjent node type: ${node.type}`)
      return acc
    } else {
      return acc
    }

    return {
      ...acc,
      [node._id]: {
        id: node._id,
        type: node.type,
        ...mapped,
      } as TreeNode,
    }
  }, {})
}
