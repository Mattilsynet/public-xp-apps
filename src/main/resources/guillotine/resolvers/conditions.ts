import { Content } from '/lib/xp/content'
import { isNumberEdgeContent } from '/lib/type-check'
import { forceArray } from '@enonic/js-utils'
import { translateChoices } from '/guillotine/resolvers/choices'
import { ChoiceMaps, SpecificNumberCondition, TreeEdgeNumberConditionals } from '/lib/types'

export function resolveEdgeWithNumberInputCondition(
  edge: Content<unknown>,
  choiceMaps: ChoiceMaps
): TreeEdgeNumberConditionals | undefined {
  if (!isNumberEdgeContent(edge)) {
    return undefined
  }

  const { data } = edge
  let conditionals: TreeEdgeNumberConditionals | undefined = undefined
  if (data.conditionalChoiceTotal) {
    const operator = data.conditionalChoiceTotal.numberCondition?._selected
    conditionals = {
      totalNumberCondition: {
        operator,
        value: data.conditionalChoiceTotal.numberCondition?.[operator]?.number,
        target: data.conditionalChoiceTotal.nextQuestionOrResult,
      },
    }
  }

  if (data.conditionalChoice) {
    const specificNumberConditions = forceArray(
      data.conditionalChoice
    ).map<SpecificNumberCondition>((conditionalChoice) => {
      const choices = translateChoices(
        conditionalChoice.choices,
        data.directOrRefChoices?._selected,
        choiceMaps
      )
      const operator = conditionalChoice.numberCondition?._selected
      return {
        operator,
        value: conditionalChoice.numberCondition?.[operator]?.number,
        choices: choices,
        target: conditionalChoice.nextQuestionOrResult,
      }
    }, {})

    if (!conditionals) {
      conditionals = { specificNumberConditions }
    } else {
      conditionals = { ...conditionals, specificNumberConditions }
    }
  }
  return conditionals
}
