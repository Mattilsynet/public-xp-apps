import { query } from '/lib/xp/content'
import { isQuestionNode, wizardType } from '/guillotine/resolvers/type-check'
import { forceArray } from '@enonic/js-utils'
import { TreeNodes } from '/guillotine/resolvers/types'

export function resolveNodes(wizardPath: string, errors: Array<string>): TreeNodes {
  const nodes = query({
    query: `_path LIKE '/content${wizardPath}/*'`,
    filters: {
      hasValue: {
        field: 'type',
        values: [wizardType('question'), wizardType('result')],
      },
    },
  }).hits

  return nodes.reduce((acc, node) => {
    let mapped = {}
    if (isQuestionNode(node)) {
      const choiceType = node.data.choiceType?._selected
      mapped = {
        question: node.data.question,
        targets: forceArray(node.data.choiceType?.[choiceType]?.nextStep),
        choiceType,
      }
    } else if (node.type === wizardType('result')) {
      mapped = node.data
    } else {
      errors.push(`Unknown node type: ${node.type}`)
    }

    return {
      ...acc,
      [node._id]: {
        type: node.type,
        ...mapped,
      },
    }
  }, {})
}
