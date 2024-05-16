import { WizardRenderNode } from './types'

export const SCHEMA_TAG_SEPARATOR = '_'
export const SCHEMA_LIST_SEPARATOR = ','
export type WizardQueryParamObject = { id: string; choice: Array<string>; value?: string | number }

export function isRadioButton(node: WizardRenderNode): node is WizardRenderNode {
  return node.choiceType === 'radio'
}

export function isNumbers(node: WizardRenderNode): node is WizardRenderNode {
  return node.choiceType === 'number'
}
export function isMultiSelect(node: WizardRenderNode): node is WizardRenderNode {
  return node.choiceType === 'checkbox'
}

export function mapQueryToValues(query: string): Array<WizardQueryParamObject> {
  const idsAndValues = splitQueryParamString(query)
  return idsAndValues.map((str) => {
    const keyValue = str.split('=')
    return getQueryParamObject(keyValue[0], keyValue[1])
  })
}

function splitQueryParamString(query?: string): Array<string> {
  if (!query || !query.length) {
    return []
  }
  const removed = query.replace('?', '')
  return removed.split('&')
}

export function getQueryParamObject(key: string, value: string): WizardQueryParamObject {
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
