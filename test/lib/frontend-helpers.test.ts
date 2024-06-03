import { getData, gqlQueryResponse } from './wizard2-mocks'
import {
  createUrlQueryWizard,
  createUrlQueryWizardRemoveInvalid,
} from '../../src/main/resources/lib/frontend-helpers'
import { describe, expect, it } from '@jest/globals'
import Log from '@enonic/mock-xp/dist/Log'

// @ts-ignore TS2339: Property 'log' does not exist on type 'typeof globalThis'.
global.log = Log.createLogger({
  loglevel: 'warn',
})

describe('Frontend helpers - createUrlQueryWizard', function () {
  it('should create query', () => {
    const root = getData(gqlQueryResponse)
    const wizardResponses = [
      { id: 'd9d69944-4f22-4e40-a457-d77e9f151dfb', choice: ['ja'] },
      { id: '776101f2-615c-404b-8d37-acbe8b7ede38', choice: ['hund'], value: 1 },
      { id: 'f0621c54-e231-4fb0-af92-d3eb796f7c85', choice: ['sverige'] },
    ]
    const res = createUrlQueryWizard(root.nodes, wizardResponses)
    expect(res).toEqual(
      'd9d69944-4f22-4e40-a457-d77e9f151dfb=ja&776101f2-615c-404b-8d37-acbe8b7ede38_hund=1&f0621c54-e231-4fb0-af92-d3eb796f7c85=sverige'
    )
  })

  it('should create query - numbers is undefined', () => {
    const root = getData(gqlQueryResponse)
    const wizardResponses = [
      { id: 'd9d69944-4f22-4e40-a457-d77e9f151dfb', choice: ['ja'] },
      { id: '776101f2-615c-404b-8d37-acbe8b7ede38', choice: ['hund'], value: 1 },
      { id: '776101f2-615c-404b-8d37-acbe8b7ede38', choice: ['katt'] },
      { id: 'f0621c54-e231-4fb0-af92-d3eb796f7c85', choice: ['sverige'] },
    ]
    const res = createUrlQueryWizard(root.nodes, wizardResponses)
    expect(res).toEqual(
      'd9d69944-4f22-4e40-a457-d77e9f151dfb=ja&776101f2-615c-404b-8d37-acbe8b7ede38_hund=1&776101f2-615c-404b-8d37-acbe8b7ede38_katt=&f0621c54-e231-4fb0-af92-d3eb796f7c85=sverige'
    )
  })

  it('should create query - multiple checkboxes', () => {
    const root = getData(gqlQueryResponse)
    const wizardResponses = [
      { id: 'd9d69944-4f22-4e40-a457-d77e9f151dfb', choice: ['ja'] },
      { id: '776101f2-615c-404b-8d37-acbe8b7ede38', choice: ['hund'], value: 1 },
      { id: 'f0621c54-e231-4fb0-af92-d3eb796f7c85', choice: ['sverige', 's-r-korea'] },
    ]
    const res = createUrlQueryWizard(root.nodes, wizardResponses)
    expect(res).toEqual(
      'd9d69944-4f22-4e40-a457-d77e9f151dfb=ja&776101f2-615c-404b-8d37-acbe8b7ede38_hund=1&f0621c54-e231-4fb0-af92-d3eb796f7c85=sverige%2Cs-r-korea'
    )
  })
})
describe('Frontend helpers - createUrlQueryWizardRemoveInvalid', function () {
  it('should create query', () => {
    const root = getData(gqlQueryResponse)
    const wizardResponses = [
      { id: 'd9d69944-4f22-4e40-a457-d77e9f151dfb', choice: ['ja'] },
      { id: '776101f2-615c-404b-8d37-acbe8b7ede38', choice: ['hund'], value: 1 },
      { id: 'f0621c54-e231-4fb0-af92-d3eb796f7c85', choice: ['sverige'] },
    ]
    const res = createUrlQueryWizardRemoveInvalid(root.nodes, wizardResponses)
    expect(res).toEqual(
      'd9d69944-4f22-4e40-a457-d77e9f151dfb=ja&776101f2-615c-404b-8d37-acbe8b7ede38_hund=1&f0621c54-e231-4fb0-af92-d3eb796f7c85=sverige'
    )
  })

  it('should create query - numbers is undefined', () => {
    const root = getData(gqlQueryResponse)
    const wizardResponses = [
      { id: 'd9d69944-4f22-4e40-a457-d77e9f151dfb', choice: ['ja'] },
      { id: '776101f2-615c-404b-8d37-acbe8b7ede38', choice: ['hund'], value: 1 },
      { id: '776101f2-615c-404b-8d37-acbe8b7ede38', choice: ['katt'] },
      { id: 'f0621c54-e231-4fb0-af92-d3eb796f7c85', choice: ['sverige'] },
    ]
    const res = createUrlQueryWizardRemoveInvalid(root.nodes, wizardResponses)
    expect(res).toEqual(
      'd9d69944-4f22-4e40-a457-d77e9f151dfb=ja&776101f2-615c-404b-8d37-acbe8b7ede38_hund=1&f0621c54-e231-4fb0-af92-d3eb796f7c85=sverige'
    )
  })

  it('should create query - multiple checkboxes', () => {
    const root = getData(gqlQueryResponse)
    const wizardResponses = [
      { id: 'd9d69944-4f22-4e40-a457-d77e9f151dfb', choice: ['ja'] },
      { id: '776101f2-615c-404b-8d37-acbe8b7ede38', choice: ['hund'], value: 1 },
      { id: 'f0621c54-e231-4fb0-af92-d3eb796f7c85', choice: ['sverige', 's-r-korea'] },
    ]
    const res = createUrlQueryWizardRemoveInvalid(root.nodes, wizardResponses)
    expect(res).toEqual(
      'd9d69944-4f22-4e40-a457-d77e9f151dfb=ja&776101f2-615c-404b-8d37-acbe8b7ede38_hund=1&f0621c54-e231-4fb0-af92-d3eb796f7c85=sverige%2Cs-r-korea'
    )
  })
})
