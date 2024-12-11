import { TranslatedChoiceMap, TraversedGraph, UIError } from '/lib/types'
import { Edge, Node } from 'reactflow'

export type AppData = {
  rootNode: string
  nodes: Node[]
  edges: Edge[]
  choices: TranslatedChoiceMap
  errors: string[]
  validTree: boolean
  validationErrors?: Array<UIError>
  traversedGraph?: TraversedGraph
  wizards?: { id: string; title: string }[]
  repositories?: { id: string; displayName: string }[]
  pathParams?: { branch?: string; selectedWizard?: string; repository?: string }
}
