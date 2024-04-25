import { query } from '/lib/xp/content'
import { isTreeQuestionNode, wizardType } from '/guillotine/resolvers/type-check'
import { resolveEdgeWithNumberInputCondition } from '/guillotine/resolvers/conditions'
import { BranchCheckbox, BranchNumber, BranchRadio } from '/codegen/site/content-types'
import { Content } from '@enonic-types/lib-content'
import { getChoiceMaps, translateChoices } from '/guillotine/resolvers/choices'
import { TranslatedChoiceMap, TreeEdges, TreeNodes } from '/guillotine/resolvers/types'

export function resolveEdges(
  wizardPath: string,
  nodes: TreeNodes,
  errors: Array<string>
): { edges: TreeEdges; choices: TranslatedChoiceMap } {
  const edges = query<Content<BranchNumber | BranchCheckbox | BranchRadio>>({
    query: `_path LIKE '/content${wizardPath}/*'`,
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

  const choiceMaps = getChoiceMaps()
  const edgeToNodeSourceMap = createEdgeToNodeSourceMap(nodes, errors)

  const mappedEdges: TreeEdges = edges.reduce((acc: TreeEdges, edge) => {
    const conditionals = resolveEdgeWithNumberInputCondition(edge, choiceMaps)

    const directOrRef = edge.data.directOrRefChoices?._selected
    return {
      ...acc,
      [edge._id]: {
        type: edge.type,
        source: edgeToNodeSourceMap[edge._id],
        target: edge.data.nextQuestionOrResult,
        choices: translateChoices(
          edge.data.directOrRefChoices?.[directOrRef]?.choices,
          directOrRef,
          choiceMaps
        ),
        conditionals,
      },
    }
  }, {})

  return {
    edges: mappedEdges,
    choices: choiceMaps.translatedChoices,
  }
}

/* create a reversed node -> edge map to quickly find the node source of the edge */
function createEdgeToNodeSourceMap(nodes: TreeNodes, errors: Array<string>) {
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
