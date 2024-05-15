import { GraphQL, GuillotineExtensions } from '/types/guillotine-types'
import { GraphQLResolverEnvironment } from '/lib/graphql'
import { get } from '/lib/xp/content'
import { Wizard } from '/codegen/site/content-types'
import { resolveEdges } from '/guillotine/resolvers/edges'
import { resolveNodes } from '/guillotine/resolvers/nodes'
import { getChoiceMaps } from '/guillotine/resolvers/choices'
import { mapQueryToValues } from '/lib/wizard-util'
import { WizardRoot } from '/lib/types'
import { traverseGraph } from '/lib/traverse'
import { validateWizardData } from '/lib/validate'

export function extensions(graphQL: GraphQL): GuillotineExtensions {
  const { GraphQLString, GraphQLBoolean, Json, reference, list } = graphQL

  return {
    types: {
      UIError: {
        description: 'Error object for UI',
        fields: {
          key: {
            type: GraphQLString,
          },
          message: {
            type: GraphQLString,
          },
        },
      },
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
          validationErrors: {
            type: list(reference('UIError')),
          },
          traversedGraph: {
            type: Json,
          },
        },
      },
    },
    resolvers: {
      no_mattilsynet_wizard_Wizard_Data: {
        root: (env: GraphQLResolverEnvironment<Wizard & { __contentId?: string }>): WizardRoot => {
          const wizardPath = get({ key: env.source?.__contentId ?? '/nowhere' })?._path
          if (!wizardPath) {
            return undefined
          }
          const errors: Array<string> = []
          const choiceMaps = getChoiceMaps()
          const nodes = resolveNodes(wizardPath, choiceMaps, errors)
          const edges = resolveEdges(wizardPath, nodes, choiceMaps, errors)

          const root = {
            rootNode: env.source.question,
            nodes,
            edges,
            choices: choiceMaps.translatedChoices,
            errors,
            validTree: errors.length === 0,
          }
          const traversedGraph = traverseGraph(env.args.wizardChoices, root)
          const validationErrors = validateWizardData(
            traversedGraph.renderSteps,
            mapQueryToValues(env.args.wizardChoices)
          )
          return { ...root, validationErrors, traversedGraph }
        },
      },
    },
    creationCallbacks: {
      no_mattilsynet_wizard_Wizard_Data: (params) => {
        params.addFields({
          root: {
            type: reference('Wizard_Root'),
            args: {
              wizardChoices: GraphQLString,
            },
          },
        })
      },
    },
  }
}
