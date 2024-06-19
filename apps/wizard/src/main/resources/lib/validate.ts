import { UIError, WizardRenderNode } from './types'
import { isMultiSelect, isNumbers, isRadioButton, WizardQueryParamObject } from './wizard-util'
import { calculateChoiceTotal } from './traverse'

export function validateWizardData(
  steps: Array<WizardRenderNode>,
  data: Array<WizardQueryParamObject>
): Array<UIError> {
  return data.reduce((acc, curr) => {
    if (acc.find((a) => a.key === curr.id)) {
      return acc
    }
    const node = steps.find((s) => s.id === curr.id)
    const error = validateNode(node, curr, data)
    if (error) {
      return acc.concat(error)
    }
    return acc
  }, [])
}

function validateNode(
  node: WizardRenderNode,
  currentChoice: WizardQueryParamObject,
  data: Array<WizardQueryParamObject>
): undefined | UIError {
  if (isNumbers(node)) {
    return validateNumbers(node, currentChoice, data)
  } else if (isRadioButton(node)) {
    return validateRadio(node, currentChoice)
  } else if (isMultiSelect(node)) {
    return validateMultiselect(node, currentChoice)
  } else {
    return undefined
  }
}
function validateRadio(
  node: WizardRenderNode,
  choice: WizardQueryParamObject
): undefined | UIError {
  if (choice.choice.length === 0) {
    return { message: node.errorMessages.required, key: choice.id }
  }
  return undefined
}

function validateNumbers(
  node: WizardRenderNode,
  currentChoice: WizardQueryParamObject,
  data: Array<WizardQueryParamObject>
): undefined | UIError {
  const total = calculateChoiceTotal(currentChoice.id, data)
  if (total === 0) {
    return { message: node.errorMessages.required, key: currentChoice.id }
  }
  const fieldName = `${currentChoice.id}_${currentChoice.choice[0]}`
  // @ts-expect-error skip for now
  if (currentChoice.value && isNaN(currentChoice.value)) {
    return { message: node.errorMessages.isNumber, key: fieldName }
  }
  // @ts-expect-error skip for now
  if (currentChoice.value < 0) {
    return { message: node.errorMessages.greaterThanZero, key: fieldName }
  }
  return undefined
}

function validateMultiselect(
  node: WizardRenderNode,
  choice: WizardQueryParamObject
): undefined | UIError {
  if (choice.choice.length === 0) {
    return { message: node.errorMessages.required, key: choice.id }
  }
  return undefined
}
