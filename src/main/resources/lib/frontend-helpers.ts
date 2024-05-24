import { getQueryParamObject, mapQueryToValues, WizardQueryParamObject } from './wizard-util'
import {
  TranslatedChoiceMap,
  TreeQuestionNode,
  UIError,
  WizardRenderNode,
  WizardRoot,
} from './types'
import { isNumbers, isResultCalculator } from './type-check'

export function findError(errors: Array<UIError>, key: string): undefined | UIError {
  return errors.find((error) => error.key === key)
}

// No access to FormData type in this context
interface FormData {
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  forEach: (callbackfn: (value: any, key: string, parent: FormData) => void, thisArg?: any) => void
}

export function mapFormToQueryParamObject(formData: FormData): Array<WizardQueryParamObject> {
  const data = []
  formData.forEach((val, key) => {
    data.push(getQueryParamObject(key, String(val)))
  })
  return data
}

export function mapChoiceSummary(
  search: string,
  root: WizardRoot
): Array<{ id: string; question: string; choice: string }> {
  const responses = mapQueryToValues(search)
  return responses.reduce((acc, curr) => {
    const question = root.nodes[curr.id]
    if (isResultCalculator(question)) {
      return acc
    }
    const hasQuestion = acc.find((a) => a.id === curr.id)
    const currChoice = getChoiceString(root.choices, curr)
    if (hasQuestion) {
      return acc.map((a) => {
        if (a.id === curr.id) {
          return { ...a, choice: `${a.choice}, ${currChoice}` }
        }
        return a
      })
    }
    return acc.concat({
      id: curr.id,
      question: `${(question as TreeQuestionNode).question} `,
      choice: `${currChoice}`,
    })
  }, [])
}

export function createUrlQueryWizard(
  nodes: WizardRenderNode,
  wizardResponses: Array<WizardQueryParamObject>
): string {
  return wizardResponses.reduce((acc, curr) => {
    const node = nodes[curr.id]

    if (isNumbers(node)) {
      const query = `${encodeURIComponent(`${curr.id}_${curr.choice[0]}`)}=${encodeURIComponent(curr.value ? curr.value : '')}`
      return acc === '' ? query : `${acc}&${query}`
    }
    const question = curr.id
    const value = curr.choice.join(',')
    const query = `${encodeURIComponent(question)}=${encodeURIComponent(value)}`
    return acc === '' ? query : `${acc}&${query}`
  }, '')
}

export function addNotAnsweredQuestions(
  data: Array<WizardQueryParamObject>,
  renderSteps: Array<WizardRenderNode>
): Array<WizardQueryParamObject> {
  return renderSteps.reduce((acc, curr) => {
    const dataHasId = data.find((d) => curr.id === d.id)
    if (dataHasId === undefined) {
      return acc.concat({ id: curr.id, choice: [] })
    }
    return acc
  }, data)
}

function getChoiceString(choices: TranslatedChoiceMap, choice: WizardQueryParamObject): string {
  let string = choice.choice.map((c) => choices[c].text).join(', ')
  if (choice.value) {
    string = `${string}: ${choice.value}`
  }
  return string
}
