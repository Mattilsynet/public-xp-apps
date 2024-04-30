import {
  TreeDisplayCriteriaChoice,
  TreeResultCalculatorNode,
  TreeResultWithConditions,
} from '/guillotine/resolvers/types'
import { CoreCommon } from '/codegen/site/mixins/core-common'

require('../polyfills')

/**
 * @returns true if the answers fulfill the displayCriteria
 */
export function shouldRenderResultWithConditions(
  displayCriteria: TreeResultWithConditions['displayCriteria'] | TreeDisplayCriteriaChoice,
  answers?: Array<string>
) {
  const { type, operator } = displayCriteria
  if (type === 'choice') {
    const choices = displayCriteria.choices
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
      return logic.every((criteria) => shouldRenderResultWithConditions(criteria, answers))
    } else if (operator === 'or') {
      return logic.some((criteria) => shouldRenderResultWithConditions(criteria, answers))
    } else if (operator === 'not') {
      return logic.every((criteria) => !shouldRenderResultWithConditions(criteria, answers))
    }
  }
  return false
}

export function getResultsFromResultCalculatorNode(
  node: TreeResultCalculatorNode,
  answers?: Array<string>
): Array<CoreCommon> {
  const { resultGroups, fallbackResult } = node
  const result =
    resultGroups?.reduce((acc, resultGroup) => {
      const resultInGroupToRender = resultGroup.find((resultGroup) => {
        return shouldRenderResultWithConditions(resultGroup.displayCriteria, answers)
      })
      if (resultInGroupToRender) {
        const { title, intro, text } = resultInGroupToRender
        return [...acc, { title, intro, text }]
      }
      return acc
    }, []) || []

  if (result && result.length === 0 && fallbackResult) {
    return [fallbackResult]
  }
  return result
}
