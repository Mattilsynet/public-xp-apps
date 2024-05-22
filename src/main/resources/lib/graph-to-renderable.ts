import {
  MultiSelectOption,
  RadioOptions,
  TranslatedChoiceMap,
  TreeResultCalculatorNode,
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
          helpText: step.node.helpText,
          collapsableButtonText: step.node.collapsableButtonText,
        }
      case 'checkbox':
        return {
          choiceType: 'checkbox',
          id: step.node.id,
          errorMessages: step.node.errorMessages,
          question: step.node.question,
          options: mapMultiselectOptions(step),
          helpText: step.node.helpText,
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
          helpText: step.node.helpText,
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
      conditionResults: step.node.conditionResults,
    }
  } else if (isResultCalculator(step.node)) {
    const choiceGroups = groupChoices(userChoices, choiceMap, step.node.groupByQuestionId)

    return {
      type: step.node.type,
      id: step.node.id,
      resultGroups: choiceGroups.map(({ title, answers }) => {
        return {
          title,
          results: getResultsFromResultCalculatorNode(
            step.node as TreeResultCalculatorNode,
            choiceMap,
            answers
          ),
        }
      }),
      summaryPageTitle: step.node.summaryPageTitle,
    }
  }
}

export function groupChoices(
  userChoices: Array<WizardQueryParamObject>,
  choiceMap: TranslatedChoiceMap,
  id?: string
): Array<{ title: string | undefined; answers: Array<string> }> {
  if (!id) {
    return [
      {
        title: undefined,
        answers: flatten(
          userChoices.map(({ choice, id }) => {
            return choice
          })
        ) as Array<string>,
      },
    ]
  }
  const choiceGroups = userChoices.reduce((acc, curr) => {
    if (curr.id === id) {
      return [
        ...acc,
        ...curr.choice.map((choice) => {
          return {
            id: curr.id,
            choice,
          }
        }),
      ]
    }
    return acc
  }, [])

  return choiceGroups.map((cg) => {
    return {
      title: choiceMap[cg.choice].text,
      answers: userChoices.reduce((acc, curr) => {
        if (cg.id === curr.id && !acc.find((a) => a === cg.choice)) {
          return [...acc, cg.choice]
        } else if (cg.id === curr.id) {
          return acc
        }
        return [...acc, ...curr.choice]
      }, []),
    }
  })
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
