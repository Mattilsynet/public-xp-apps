import { query } from '/lib/xp/content'
import { isCheckboxEdgeContent, isQuestion, wizardType } from '/lib/type-check'
import { resolveEdgeWithNumberInputCondition } from '/guillotine/resolvers/conditions'
import { BranchCheckbox, BranchNumber, BranchRadio } from '/codegen/site/content-types'
import { Content } from '@enonic-types/lib-content'
import { translateChoices } from '/guillotine/resolvers/choices'
import { ChoiceMaps, TreeEdges, TreeNodes } from '/lib/types'

require('../../polyfills.js')

export function resolveEdges(
  wizardPath: string,
  nodes: TreeNodes,
  choiceMaps: ChoiceMaps,
  errors: Array<string>
): TreeEdges {
  const edges = query<Content<BranchNumber | BranchCheckbox | BranchRadio>>({
    query: `_path LIKE '/content${wizardPath}/*'`,
    count: -1,
    filters: {
      hasValue: {
        field: 'type',
        values: [
          wizardType('branch-radio'),
          wizardType('branch-checkbox'),
          wizardType('branch-number'),
        ],
      },
    },
  }).hits

  const edgeToNodeSourceMap = createEdgeToNodeSourceMap(nodes, errors)
  return edges.reduce((acc: TreeEdges, edge) => {
    const conditionals = resolveEdgeWithNumberInputCondition(edge, choiceMaps)

    const directOrRef = edge.data.directOrRefChoices?._selected
    let choices = translateChoices(
      edge.data.directOrRefChoices?.[directOrRef]?.choices,
      directOrRef,
      choiceMaps
    )

    let preferredChoices: undefined | string[]
    if (isCheckboxEdgeContent(edge)) {
      preferredChoices = translateChoices(edge.data.preferredChoices, directOrRef, choiceMaps)
      choices = choices.filter(
        (choice) => !preferredChoices.find((preferred) => choice === preferred)
      )
    }

    const source = edgeToNodeSourceMap[edge._id]
    if (!source) {
      errors.push(`Det finnes en løs gren. navn:${edge.displayName}`)
    }
    return {
      ...acc,
      [edge._id]: {
        displayName: edge.displayName,
        id: edge._id,
        type: edge.type,
        source,
        target: edge.data.nextQuestionOrResult,
        choices,
        preferredChoices,
        conditionals,
      },
    }
  }, {})
}

/* create a reversed node -> edge map to quickly find the node source of the edge */
function createEdgeToNodeSourceMap(
  nodes: TreeNodes,
  errors: Array<string>
): Record<string, string> {
  const edgeToNodeMap = {}
  for (const key in nodes) {
    const node = nodes[key]
    if (!isQuestion(node)) {
      continue
    }
    node.targets?.forEach((target) => {
      if (edgeToNodeMap.hasOwnProperty(target)) {
        errors.push(
          `Gren er brukt mer enn én gang! ${target} blir brukt av ${edgeToNodeMap[target]} og ${key}`
        )
      }
      edgeToNodeMap[target] = key
    })
  }
  return edgeToNodeMap
}
