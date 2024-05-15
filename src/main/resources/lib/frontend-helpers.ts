import { getQueryParamObject, mapQueryToValues, WizardQueryParamObject } from './wizard-util'
import { TranslatedChoiceMap, TreeQuestionNode, UIError, WizardRoot } from './types'
import { isResultCalculator } from './type-check'

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

function getChoiceString(choices: TranslatedChoiceMap, choice: WizardQueryParamObject): string {
  let string = choice.choice.map((c) => choices[c].text).join(', ')
  if (choice.value) {
    string = `${string}: ${choice.value}`
  }
  return string
}
