import {
  TranslatedChoiceMap,
  TreeDisplayCriteriaChoice,
  TreeResultCalculatorNode,
  TreeResultWithConditions,
} from '/lib/types'
import { CoreCommon } from '/codegen/site/mixins/core-common'
import { flatten } from '@enonic/js-utils'

require('../polyfills')

/**
 * @returns true if the answers fulfill the displayCriteria
 */
export function shouldRenderResultWithConditions(
  displayCriteria: TreeResultWithConditions['displayCriteria'] | TreeDisplayCriteriaChoice,
  choiceMap: TranslatedChoiceMap,
  answers?: Array<string>
): boolean {
  const { type, operator } = displayCriteria
  if (type === 'choice') {
    const choices = getChoicesFromGroups(displayCriteria.choices, choiceMap)
    if (operator === 'and') {
      return choices.every((choice) => answers?.some((answer) => answer === choice))
    } else if (operator === 'or') {
      return choices.some((choice) => answers?.some((answer) => answer === choice))
    } else if (operator === 'not') {
      return choices.every((choice) => !answers?.some((answer) => answer === choice))
    }
  } else if (type === 'logic') {
    const logic = displayCriteria.logic
    if (operator === 'and') {
      return logic.every((criteria) =>
        shouldRenderResultWithConditions(criteria, choiceMap, answers)
      )
    } else if (operator === 'or') {
      return logic.some((criteria) =>
        shouldRenderResultWithConditions(criteria, choiceMap, answers)
      )
    } else if (operator === 'not') {
      return logic.every(
        (criteria) => !shouldRenderResultWithConditions(criteria, choiceMap, answers)
      )
    }
  }
  return false
}

export function getResultsFromResultCalculatorNode(
  node: TreeResultCalculatorNode,
  choiceMap: TranslatedChoiceMap,
  answers?: Array<string>
): Array<CoreCommon & { id?: string; x?: Record<string, unknown> }> {
  const { resultGroups, fallbackResult } = node
  const result =
    resultGroups?.reduce((acc, resultGroup) => {
      const resultInGroupToRender = resultGroup.find((resultGroup) => {
        return shouldRenderResultWithConditions(resultGroup.displayCriteria, choiceMap, answers)
      })
      if (resultInGroupToRender) {
        const { title, intro, text, id, x } = resultInGroupToRender
        return [...acc, { title, intro, text, id, x }]
      }
      return acc
    }, []) || []

  if (result && result.length === 0 && fallbackResult) {
    return [fallbackResult]
  }
  return result
}

export function getChoicesFromGroups(choices: string[], choiceMap: TranslatedChoiceMap): string[] {
  if (!choices) {
    return []
  }
  return flatten(
    choices?.map((choice) => {
      if (choiceMap[choice].type === 'choice-group') {
        return choiceMap[choice].choices
      }
      return choice
    })
  ) as string[]
}
