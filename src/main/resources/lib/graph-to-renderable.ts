import {
  MultiSelectOption,
  RadioOptions,
  TranslatedChoiceMap,
  WizardNumberOptions,
  WizardRenderNode,
  WizardStep,
} from './types'
import { WizardQueryParamObject } from './wizard-util'
import { isQuestion, isResult, isResultCalculator } from './type-check'
import { getResultsFromResultCalculatorNode } from './result-calculator'
import { flatten } from '@enonic/js-utils'

export function mapNodeToRenderable(
  step: WizardStep,
  userChoices: Array<WizardQueryParamObject>,
  choiceMap: TranslatedChoiceMap
): WizardRenderNode {
  if (isQuestion(step.node)) {
    switch (step.node.choiceType) {
      case 'number':
        return {
          choiceType: 'number',
          id: step.node.id,
          errorMessages: step.node.errorMessages,
          question: step.node.question,
          options: mapNumberOptions(step),
        }
      case 'checkbox':
        return {
          choiceType: 'checkbox',
          id: step.node.id,
          errorMessages: step.node.errorMessages,
          question: step.node.question,
          options: mapMultiselectOptions(step),
          preferredChoices: step.preferredChoices?.map((c) => ({
            value: c.id,
            text: c.text,
            removeAriaLabel: `todo localize({ key: 'wizard.remove' }) ${c.text}`,
          })),
        }
      case 'radio':
        return {
          choiceType: 'radio',
          id: step.node.id,
          errorMessages: step.node.errorMessages,
          question: step.node.question,
          options: mapRadioOptions(step),
        }
      default:
        log.info(`TODO error`)
    }
  } else if (isResult(step.node)) {
    return {
      type: step.node.type,
      id: step.node.id,
      title: step.node.title,
      intro: step.node.intro,
      text: step.node.text,
    }
  } else if (isResultCalculator(step.node)) {
    const answers = flatten(
      userChoices.map(({ choice, id }) => {
        if (id.indexOf('_') !== -1) {
          return id.split('_')[1]
        }
        return choice
      })
    ) as Array<string>

    return {
      type: step.node.type,
      id: step.node.id,
      results: getResultsFromResultCalculatorNode(step.node, choiceMap, answers),
    }
  }
}

export function mapNumberOptions(step: WizardStep): Array<WizardNumberOptions> {
  return flatten(
    step.edges.map((e) => {
      return e.choices.map((c) => {
        const choice = step.choices.find((choice) => choice.id === c)
        return {
          name: `${step.node.id}_${c}`,
          value: c,
          label: choice.text,
        }
      })
    })
  ) as Array<WizardNumberOptions>
}

export function mapMultiselectOptions(step: WizardStep): Array<MultiSelectOption> {
  const { choices, preferredChoices } = step
  return choices
    .reduce((acc, c) => {
      if (preferredChoices?.some((pc) => pc.id === c.id)) {
        return acc
      }
      return acc.concat({
        value: c.id,
        text: c.text,
        removeAriaLabel: `todo localize({ key: 'wizard.remove' }) ${c.text}`,
      })
    }, [])
    .sort((a, b) => a.text?.localeCompare(b.text))
}

export function mapRadioOptions(step: WizardStep): Array<RadioOptions> {
  if (step.edges.length > 1) {
    return step.edges.map((edge) => {
      return {
        value: edge.choices[0],
        text: step.choices.find((c) => c.id === edge.choices[0]).text,
      }
    })
  }
  //todo??
  return []
}
