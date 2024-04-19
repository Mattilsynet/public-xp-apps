import { GraphQL, GuillotineExtensions } from '/types/guillotine-types'

export function extensions(graphQL: GraphQL): GuillotineExtensions {
	const { GraphQLString, GraphQLInt, GraphQLBoolean, Json, GraphQLID, reference, list } = graphQL

	return {
		enums: {},
		types: {},
		resolvers: {},
		creationCallbacks: {},
	}
}
