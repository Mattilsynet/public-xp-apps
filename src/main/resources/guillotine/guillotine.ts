import { GraphQL, GuillotineExtensions } from '/types/guillotine-types'
import { GraphQLResolverEnvironment } from '/lib/graphql'
import { get } from '/lib/xp/content'
import { Wizard } from '/codegen/site/content-types'
import { resolveEdges } from '/guillotine/resolvers/edges'
import { resolveNodes } from '/guillotine/resolvers/nodes'
import { getChoiceMaps } from '/guillotine/resolvers/choices'

export function extensions(graphQL: GraphQL): GuillotineExtensions {
  const { GraphQLString, GraphQLBoolean, Json, reference, list } = graphQL

  return {
    types: {
      Wizard_Root: {
        description: 'Inneholder alle spørsmål, grener og valg (nodes and edges)',
        fields: {
          rootNode: {
            type: GraphQLString,
          },
          nodes: {
            type: Json,
          },
          edges: {
            type: Json,
          },
          choices: {
            type: Json,
          },
          validTree: {
            type: GraphQLBoolean,
          },
          errors: {
            type: list(GraphQLString),
          },
        },
      },
    },
    resolvers: {
      no_mattilsynet_wizard_Wizard_Data: {
        root: (env: GraphQLResolverEnvironment<Wizard & { __contentId?: string }>) => {
          const wizardPath = get({ key: env.source?.__contentId ?? '/nowhere' })?._path
          if (!wizardPath) {
            return undefined
          }
          const errors: Array<string> = []
          const choiceMaps = getChoiceMaps()

          const nodes = resolveNodes(wizardPath, choiceMaps, errors)
          const edges = resolveEdges(wizardPath, nodes, choiceMaps, errors)

          return {
            rootNode: env.source.question,
            nodes,
            edges,
            choices: choiceMaps.translatedChoices,
            errors,
            validTree: errors.length === 0,
          }
        },
      },
    },
    creationCallbacks: {
      no_mattilsynet_wizard_Wizard_Data: (params) => {
        params.addFields({
          root: {
            type: reference('Wizard_Root'),
          },
        })
      },
    },
  }
}
