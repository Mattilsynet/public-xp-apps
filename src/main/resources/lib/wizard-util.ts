import { TreeNode, TreeNodes, TreeQuestionNode } from '/lib/types'

export const SCHEMA_TAG_SEPARATOR = '_'
export const SCHEMA_LIST_SEPARATOR = ','
export type Wizard2QueryParamObject = { id: string; choice: Array<string>; value?: string | number }

export function isRadioButton(node: TreeNode): node is TreeQuestionNode {
  // @ts-expect-error skip for now
  return node.choiceType === 'radio'
}

export function isNumbers(node: TreeNode): node is TreeQuestionNode {
  // @ts-expect-error skip for now
  return node.choiceType === 'number'
}
export function isMultiSelect(node: TreeNode): node is TreeQuestionNode {
  // @ts-expect-error skip for now
  return node.choiceType === 'checkbox'
}

export function mapQueryToValues(query: string): Array<Wizard2QueryParamObject> {
  const idsAndValues = splitQueryParamString(query)
  return idsAndValues.map((str) => {
    const keyValue = str.split('=')
    return getQueryParamObject(keyValue[0], keyValue[1])
  })
}

function splitQueryParamString(query: string): Array<string> {
  if (query.length === 0) {
    return []
  }
  const removed = query.replace('?', '')
  return removed.split('&')
}

export function calculateChoiceTotal(id: string, choices: Array<Wizard2QueryParamObject>): number {
  return choices.reduce((acc, c) => {
    if (c.id === id) {
      // @ts-expect-error skip for now
      return c.value ? acc + c.value : acc
    }
    return acc
  }, 0)
}

export function getQueryParamObject(key: string, value: string): Wizard2QueryParamObject {
  const idValue = key.split(SCHEMA_TAG_SEPARATOR)
  const id = idValue[0]

  const choice = getChoice(idValue, value)
  const parsedValue =
    idValue.length > 1 && value !== '' ? parseValue(decodeURIComponent(value)) : undefined
  return {
    id,
    choice,
    value: parsedValue,
  }
}

function getChoice(idValue: Array<string>, value: string): Array<string> {
  if (idValue.length > 1) {
    return [decodeURIComponent(idValue[1])]
  }
  return value !== '' ? decodeURIComponent(value).split(SCHEMA_LIST_SEPARATOR) : []
}

function parseValue(value: string): string | number {
  const isNumber = new RegExp(/^\d+$/).test(value)
  const number = parseInt(value)
  return isNumber ? number : value
}
