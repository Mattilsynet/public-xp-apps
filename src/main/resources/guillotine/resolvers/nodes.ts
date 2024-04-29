import { query } from '/lib/xp/content'
import {
  isQuestionNode,
  isResultCalculatorNode,
  isResultWithConditions,
  wizardType,
} from '/guillotine/resolvers/type-check'
import { forceArray } from '@enonic/js-utils'
import {
  ChoiceMaps,
  TreeNode,
  TreeNodes,
  TreeResultWithConditions,
} from '/guillotine/resolvers/types'
import { translateChoices } from '/guillotine/resolvers/choices'
import { Logical } from '/codegen/site/mixins/logical'

export function resolveNodes(
  wizardPath: string,
  choiceMaps: ChoiceMaps,
  errors: Array<string>
): TreeNodes {
  const nodes = query({
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

  const resultWithConditions: Record<string, TreeResultWithConditions> = {}
  return nodes.reduce((acc: TreeNodes, node) => {
    let mapped: Omit<TreeNode, 'type'>
    if (isQuestionNode(node)) {
      const choiceType = node.data.choiceType?._selected
      mapped = {
        question: node.data.question,
        targets: forceArray(node.data.choiceType?.[choiceType]?.nextStep ?? []),
        choiceType,
      }
    } else if (node.type === wizardType('result')) {
      mapped = node.data
    } else if (isResultCalculatorNode(node)) {
      mapped = {
        ...node.data,
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
    } else if (isResultWithConditions(node)) {
      resultWithConditions[node._id] = {
        ...node.data,
        displayCriteria: {
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
                  type,
                  operator: choiceOrLogic.logic.logicalOperator,
                  logic: forceArray(choiceOrLogic.logic.logic ?? []).map((logic) => {
                    return {
                      operator: logic.logicalOperator,
                      choices: translateChoices(logic.choices, 'reference', choiceMaps),
                    }
                  }),
                }
              } else {
                errors.push(`Ukjent eller manglende kriterie for ${node.displayName}: ${type}`)
              }
            }
          ),
        },
      }
      return acc
    } else {
      errors.push(`Unknown node type: ${node.type}`)
    }

    return {
      ...acc,
      [node._id]: {
        type: node.type,
        ...mapped,
      } as TreeNode,
    }
  }, {})
}
