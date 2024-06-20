import {
  getResultsFromResultCalculatorNode,
  shouldRenderResultWithConditions,
} from '../../src/main/resources/lib/result-calculator'
import { describe, expect, it } from '@jest/globals'
import { TranslatedChoiceMap, TreeChoiceOrLogic, TreeResultCalculatorNode } from '/lib/types'
import Log from '@enonic/mock-xp/dist/Log'

// @ts-ignore TS2339: Property 'log' does not exist on type 'typeof globalThis'.
global.log = Log.createLogger({
  loglevel: 'warn',
})

const choices: TranslatedChoiceMap = {
  choice1: { type: 'choice', text: 'Choice 1', id: '123' },
  choice2: { type: 'choice', text: 'Choice 2', id: '123' },
  choice3: { type: 'choice', text: 'Choice 3', id: '123' },
  choice4: { type: 'choice', text: 'Choice 4', id: '123' },
  choiceGroup: { type: 'choice-group', text: 'Choice 5', choices: ['choice5'], id: '123' },
}

describe('shouldRenderResultWithConditions', () => {
  it('should return true when operator is "and" and all choices are in answers', () => {
    const displayCriteria: TreeChoiceOrLogic = {
      type: 'choice',
      operator: 'and',
      choices: ['choice1', 'choice2'],
    }
    const answers = ['choice1', 'choice2']
    expect(shouldRenderResultWithConditions(displayCriteria, choices, answers)).toBe(true)
  })

  it('should return true when operator is "and" and all choices are in answers', () => {
    const displayCriteria: TreeChoiceOrLogic = {
      type: 'choice',
      operator: 'and',
      choices: ['choice1', 'choiceGroup'],
    }
    const answers = ['choice1', 'choice5']
    expect(shouldRenderResultWithConditions(displayCriteria, choices, answers)).toBe(true)
  })

  it('should return false when operator is "and" and not all choices are in answers', () => {
    const displayCriteria: TreeChoiceOrLogic = {
      type: 'choice',
      operator: 'and',
      choices: ['choice1', 'choice2'],
    }
    const answers = ['choice1']
    expect(shouldRenderResultWithConditions(displayCriteria, choices, answers)).toBe(false)
  })

  it('should return true when operator is "or" and at least one choice is in answers', () => {
    const displayCriteria: TreeChoiceOrLogic = {
      type: 'choice',
      operator: 'or',
      choices: ['choice1', 'choice2'],
    }
    const answers = ['choice1']
    expect(shouldRenderResultWithConditions(displayCriteria, choices, answers)).toBe(true)
  })

  it('should return false when operator is "or" and no choices are in answers', () => {
    const displayCriteria: TreeChoiceOrLogic = {
      type: 'choice',
      operator: 'or',
      choices: ['choice1', 'choice2'],
    }
    const answers = ['choice3']
    expect(shouldRenderResultWithConditions(displayCriteria, choices, answers)).toBe(false)
  })

  it('should return true when operator is "not" and no choices are in answers', () => {
    const displayCriteria: TreeChoiceOrLogic = {
      type: 'choice',
      operator: 'not',
      choices: ['choice1', 'choice2'],
    }
    const answers = ['choice3']
    expect(shouldRenderResultWithConditions(displayCriteria, choices, answers)).toBe(true)
  })

  it('should return false when operator is "not" and at least one choice is in answers', () => {
    const displayCriteria: TreeChoiceOrLogic = {
      type: 'choice',
      operator: 'not',
      choices: ['choice1', 'choice2'],
    }
    const answers = ['choice1']
    expect(shouldRenderResultWithConditions(displayCriteria, choices, answers)).toBe(false)
  })

  it('should return true when type is "logic", operator is "and", and all nested criteria return true', () => {
    const displayCriteria: TreeChoiceOrLogic = {
      type: 'logic',
      operator: 'and',
      logic: [
        {
          type: 'choice',
          operator: 'and',
          choices: ['choice1', 'choice2'],
        },
        {
          type: 'choice',
          operator: 'or',
          choices: ['choice3', 'choice4'],
        },
      ],
    }
    const answers = ['choice1', 'choice2', 'choice3']
    expect(shouldRenderResultWithConditions(displayCriteria, choices, answers)).toBe(true)
  })

  it('should return false when type is "logic", operator is "and", and at least one nested criteria returns false', () => {
    const displayCriteria: TreeChoiceOrLogic = {
      type: 'logic',
      operator: 'and',
      logic: [
        {
          type: 'choice',
          operator: 'and',
          choices: ['choice1', 'choice2'],
        },
        {
          type: 'choice',
          operator: 'or',
          choices: ['choice3', 'choice4'],
        },
      ],
    }
    const answers = ['choice1', 'choice5']
    expect(shouldRenderResultWithConditions(displayCriteria, choices, answers)).toBe(false)
  })

  it('should return true when type is "logic", operator is "or", and at least one nested criteria returns true', () => {
    const displayCriteria: TreeChoiceOrLogic = {
      type: 'logic',
      operator: 'or',
      logic: [
        {
          type: 'choice',
          operator: 'and',
          choices: ['choice1', 'choice2'],
        },
        {
          type: 'choice',
          operator: 'or',
          choices: ['choice3', 'choice4'],
        },
      ],
    }
    const answers = ['choice3', 'choice5']
    expect(shouldRenderResultWithConditions(displayCriteria, choices, answers)).toBe(true)
  })

  it('should return false when type is "logic", operator is "or", and all nested criteria return false', () => {
    const displayCriteria: TreeChoiceOrLogic = {
      type: 'logic',
      operator: 'or',
      logic: [
        {
          type: 'choice',
          operator: 'and',
          choices: ['choice1', 'choice2'],
        },
        {
          type: 'choice',
          operator: 'or',
          choices: ['choice3', 'choice4'],
        },
      ],
    }
    const answers = ['choice5', 'choice6']
    expect(shouldRenderResultWithConditions(displayCriteria, choices, answers)).toBe(false)
  })
})

describe('getResultsFromResultCalculatorNode', () => {
  it('should return an empty array if no resultGroups are provided', () => {
    const node: TreeResultCalculatorNode = {
      id: '123',
      type: 'logic',
      resultGroups: null,
      fallbackResult: null,
    }

    const results = getResultsFromResultCalculatorNode(node, choices)
    expect(results).toEqual([])
  })

  it('should return the fallback result when no other display criteria is met', () => {
    const node: TreeResultCalculatorNode = {
      id: '123',
      type: 'logic',
      resultGroups: null,
      fallbackResult: {
        title: 'Fallback Title',
        intro: 'Fallback Intro',
        text: 'Fallback Text',
      },
    }

    const results = getResultsFromResultCalculatorNode(node, choices)
    expect(results).toEqual([
      {
        title: 'Fallback Title',
        intro: 'Fallback Intro',
        text: 'Fallback Text',
      },
    ])
  })

  it('should return an array of results that meet the display criteria', () => {
    const node: TreeResultCalculatorNode = {
      id: '123',
      type: 'no.mattilsynet.wizard:result-calculator',
      resultGroups: [
        [
          {
            displayCriteria: {
              type: 'logic',
              operator: 'and',
              logic: [
                {
                  type: 'choice',
                  operator: 'and',
                  choices: ['choice1', 'choice2'],
                },
              ],
            },
            title: 'Test Title 1',
            intro: 'Test Intro 1',
            text: 'Test Text 1',
          },
        ],
        [
          {
            displayCriteria: {
              type: 'logic',
              operator: 'and',
              logic: [
                {
                  type: 'choice',
                  operator: 'or',
                  choices: ['choice3'],
                },
              ],
            },
            title: 'Test Title 2',
            intro: 'Test Intro 2',
            text: 'Test Text 2',
          },
        ],
      ],
      fallbackResult: null,
    }

    const answers = ['choice1', 'choice2']
    const results = getResultsFromResultCalculatorNode(node, choices, answers)
    expect(results).toEqual([
      {
        title: 'Test Title 1',
        intro: 'Test Intro 1',
        text: 'Test Text 1',
      },
    ])
  })

  it('should return an empty array if no results meet the display criteria', () => {
    const node: TreeResultCalculatorNode = {
      id: '123',
      type: 'no.mattilsynet.wizard:result-calculator',
      resultGroups: [
        [
          {
            displayCriteria: {
              type: 'logic',
              operator: 'and',
              logic: [
                {
                  type: 'choice',
                  operator: 'and',
                  choices: ['choice1', 'choice2'],
                },
              ],
            },
            title: 'Test Title 1',
            intro: 'Test Intro 1',
            text: 'Test Text 1',
          },
        ],
        [
          {
            displayCriteria: {
              type: 'logic',
              operator: 'and',
              logic: [
                {
                  type: 'choice',
                  operator: 'or',
                  choices: ['choice3'],
                },
              ],
            },
            title: 'Test Title 2',
            intro: 'Test Intro 2',
            text: 'Test Text 2',
          },
        ],
      ],
      fallbackResult: null,
    }

    const answers = ['choice4']
    const results = getResultsFromResultCalculatorNode(node, choices, answers)
    expect(results).toEqual([])
  })

  it('should return a result when the not condition is fulfilled', () => {
    const node: TreeResultCalculatorNode = {
      id: '123',
      type: 'no.mattilsynet.wizard:result-calculator',
      resultGroups: [
        [
          {
            displayCriteria: {
              type: 'logic',
              operator: 'and',
              logic: [
                {
                  type: 'choice',
                  operator: 'and',
                  choices: ['choice1', 'choice2'],
                },
              ],
            },
            title: 'Test Title 1',
            intro: 'Test Intro 1',
            text: 'Test Text 1',
          },
        ],
        [
          {
            displayCriteria: {
              type: 'logic',
              operator: 'not',
              logic: [
                {
                  type: 'choice',
                  operator: 'and',
                  choices: ['choice3'],
                },
              ],
            },
            title: 'Test Title 2',
            intro: 'Test Intro 2',
            text: 'Test Text 2',
          },
        ],
      ],
      fallbackResult: null,
    }

    const answers = ['choice1']
    const results = getResultsFromResultCalculatorNode(node, choices, answers)
    expect(results).toEqual([
      {
        title: 'Test Title 2',
        intro: 'Test Intro 2',
        text: 'Test Text 2',
      },
    ])
  })
})
