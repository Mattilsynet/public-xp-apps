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
  selectedWizard?: string
  wizards?: { id: string; title: string }[]
}
