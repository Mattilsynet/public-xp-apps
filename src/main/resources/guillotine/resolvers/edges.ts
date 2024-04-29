import { query } from '/lib/xp/content'
import { isTreeQuestionNode, wizardType } from '/guillotine/resolvers/type-check'
import { resolveEdgeWithNumberInputCondition } from '/guillotine/resolvers/conditions'
import { BranchCheckbox, BranchNumber, BranchRadio } from '/codegen/site/content-types'
import { Content } from '@enonic-types/lib-content'
import { translateChoices } from '/guillotine/resolvers/choices'
import { ChoiceMaps, TreeEdges, TreeNodes } from '/guillotine/resolvers/types'

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
    const choices = translateChoices(
      edge.data.directOrRefChoices?.[directOrRef]?.choices,
      directOrRef,
      choiceMaps
    )

    const source = edgeToNodeSourceMap[edge._id]
    if (!source) {
      errors.push(
        `Fant ikke spørsmålet som fører til grenen! spørsmål:${source} gren:${edge.displayName}`
      )
    }
    return {
      ...acc,
      [edge._id]: {
        type: edge.type,
        source,
        target: edge.data.nextQuestionOrResult,
        choices,
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
    if (!isTreeQuestionNode(node)) {
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
