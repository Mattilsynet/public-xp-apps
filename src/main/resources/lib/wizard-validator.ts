import {
  isMultiSelect,
  isNumbers,
  isRadioButton,
  calculateChoiceTotal,
  type Wizard2QueryParamObject,
} from './wizard-util'
import { TreeNode, TreeNodes, TreeQuestionNode } from '/lib/types'

export interface UIError {
  key: string
  message: string
}

export function validateWizardData(
  nodes: TreeNodes,
  data: Array<Wizard2QueryParamObject>
): Array<UIError> {
  return data.reduce((acc, curr) => {
    if (acc.find((a) => a.key === curr.id)) {
      return acc
    }
    const node = nodes[curr.id]
    const error = validateNode(node, curr, data)
    if (error) {
      return acc.concat(error)
    }
    return acc
  }, [])
}

function validateNode(
  node: TreeNode,
  currentChoice: Wizard2QueryParamObject,
  data: Array<Wizard2QueryParamObject>
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
  node: TreeQuestionNode,
  choice: Wizard2QueryParamObject
): undefined | UIError {
  if (choice.choice.length === 0) {
    return { message: node.errorMessages.required, key: choice.id }
  }
  return undefined
}

function validateNumbers(
  node: TreeQuestionNode,
  currentChoice: Wizard2QueryParamObject,
  data: Array<Wizard2QueryParamObject>
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
  node: TreeQuestionNode,
  choice: Wizard2QueryParamObject
): undefined | UIError {
  if (choice.choice.length === 0) {
    return { message: node.errorMessages.required, key: choice.id }
  }
  return undefined
}
