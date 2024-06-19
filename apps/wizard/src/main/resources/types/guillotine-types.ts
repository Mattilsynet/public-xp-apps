import {
  type GraphQLBoolean,
  type GraphQLID,
  type GraphQLInt,
  type GraphQLJson,
  type GraphQLListType,
  type GraphQLNonNullType,
  GraphQLResolverEnvironment,
  type GraphQLString,
  type GraphQLType as GraphQLTypeExternal,
  type GraphQLTypeReference,
} from '/lib/graphql'

export type GraphQL = {
  GraphQLString: GraphQLString
  GraphQLInt: GraphQLInt
  GraphQLBoolean: GraphQLBoolean
  Json: GraphQLJson
  GraphQLID: GraphQLID
  reference: (_typeKey: string) => GraphQLTypeReference
  list: (_type: GraphQLTypeExternal) => GraphQLListType
  nonNull: (_type: GraphQLTypeExternal) => GraphQLNonNullType
}
export type GuillotineExtensions = {
  inputTypes?: GuillotineInputTypes
  enums?: GuillotineEnumTypes
  interfaces?: GuillotineInterfaceTypes
  unions?: GuillotineUnionTypes
  types?: GuillotineTypes
  creationCallbacks?: GuillotineCreationCallbacks
  resolvers?: Record<string, GuillotineResolvers>
}

export type GuillotineTypes = Record<string, GraphQLCustomType>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GuillotineResolvers = Record<string, (_env: GraphQLResolverEnvironment) => any>
export type GuillotineEnumTypes = Record<string, GraphQLCustomEnumType>
type GuillotineCreationCallbacks = Record<string, (_params: CreationCallbackParams) => void>
type GuillotineUnionTypes = Record<string, GraphQLCustomUnionType>
type GuillotineInterfaceTypes = Record<string, GraphQLCustomInterfaceType>
type GuillotineInputTypes = Record<string, GraphQLCustomInputType>

export type CreationCallbackParams = {
  addFields: (_fields: Record<string, TypeAndArgs>) => void
  removeFields: (_fields: Array<string>) => void
  modifyFields: (_fields: Record<string, TypeAndArgs>) => void
  setInterfaces: (_interfaces: Array<GraphQLType>) => void
  setDescription: (_description: string) => void
  getInterfaces: () => Array<GraphQLType>
  getDescription: () => string
  getAddFields: () => Record<string, Record<string, object>>
  getRemoveFields: () => Array<string>
  getModifyFields: () => Record<string, Record<string, object>>
}
type GraphQLType = unknown
type GraphQLCustomEnumType = {
  description: string
  values: Record<string, string | number>
}
type GraphQLCustomUnionType = {
  description: string
  types: Array<GraphQLType>
}
type GraphQLCustomInputType = {
  description: string
  interfaces?: Array<GraphQLType>
  fields: Record<string, TypeAndArgs>
}
type GraphQLCustomType = {
  description: string
  interfaces?: Array<GraphQLType>
  fields: Record<string, GraphQLType>
}

type GraphQLCustomInterfaceType = Omit<GraphQLCustomType, 'interfaces'>
type TypeAndArgs = {
  type: GraphQLType
  args?: Record<string, GraphQLType>
}
