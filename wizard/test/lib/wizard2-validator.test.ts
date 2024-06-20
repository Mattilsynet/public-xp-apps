import { describe, expect, it } from '@jest/globals'
import { getData, gqlQueryResponse } from './wizard2-mocks'
import { getRenderSteps } from '../../src/main/resources/lib/traverse'
import { validateWizardData } from '../../src/main/resources/lib/validate'
import { WizardRenderNode } from '../../src/main/resources/lib/types'
import Log from '@enonic/mock-xp/dist/Log'

// @ts-ignore TS2339: Property 'log' does not exist on type 'typeof globalThis'.
global.log = Log.createLogger({
  loglevel: 'warn',
})

describe('Wizard validator', () => {
  const root = getData(gqlQueryResponse)
  const renderSteps: Array<WizardRenderNode> = getRenderSteps(
    '?d9d69944-4f22-4e40-a457-d77e9f151dfb=ja&776101f2-615c-404b-8d37-acbe8b7ede38_katt=1sdf&f0621c54-e231-4fb0-af92-d3eb796f7c85=',
    root
  )
  it('Not valid: no choice', () => {
    const formData = [
      {
        id: 'd9d69944-4f22-4e40-a457-d77e9f151dfb',
        choice: [],
      },
      {
        id: '776101f2-615c-404b-8d37-acbe8b7ede38',
        choice: ['hund'],
        value: undefined,
      },
      {
        id: '776101f2-615c-404b-8d37-acbe8b7ede38',
        choice: ['katt'],
        value: undefined,
      },
    ]
    const res = validateWizardData(renderSteps, formData)
    expect(res.length).toEqual(2)
    expect(res[0].key).toEqual('d9d69944-4f22-4e40-a457-d77e9f151dfb')
    expect(res[0].message).toEqual('Radio påkrevd')
    expect(res[1].key).toEqual('776101f2-615c-404b-8d37-acbe8b7ede38')
    expect(res[1].message).toEqual('Du må svare på spørsmålet for å gå videre')
  })

  it('Is valid: all', () => {
    const root = getData(gqlQueryResponse)
    const formData = [
      {
        id: 'd9d69944-4f22-4e40-a457-d77e9f151dfb',
        choice: ['ja'],
      },
      {
        id: '776101f2-615c-404b-8d37-acbe8b7ede38',
        choice: ['hund'],
        value: 1,
      },
      {
        id: 'f0621c54-e231-4fb0-af92-d3eb796f7c85',
        choice: ['sverige'],
      },
    ]
    const res = validateWizardData(renderSteps, formData)
    expect(res.length).toEqual(0)
  })

  it('Invalid all', () => {
    const formData = [
      {
        id: 'd9d69944-4f22-4e40-a457-d77e9f151dfb',
        choice: [],
      },
      {
        id: '776101f2-615c-404b-8d37-acbe8b7ede38',
        choice: ['hund'],
        value: -1,
      },
      {
        id: '776101f2-615c-404b-8d37-acbe8b7ede38',
        choice: ['katt'],
        value: '1en',
      },
      {
        id: 'f0621c54-e231-4fb0-af92-d3eb796f7c85',
        choice: [],
      },
    ]

    const res = validateWizardData(renderSteps, formData)
    expect(res.length).toEqual(4)
    expect(res[0].key).toEqual('d9d69944-4f22-4e40-a457-d77e9f151dfb')
    expect(res[0].message).toEqual('Radio påkrevd')
    expect(res[1].key).toEqual('776101f2-615c-404b-8d37-acbe8b7ede38_hund')
    expect(res[1].message).toEqual('Tallet må være større enn 0')
    expect(res[2].key).toEqual('776101f2-615c-404b-8d37-acbe8b7ede38_katt')
    expect(res[2].message).toEqual('Du må bruke tall')
    expect(res[3].key).toEqual('f0621c54-e231-4fb0-af92-d3eb796f7c85')
    expect(res[3].message).toEqual('Checkbox påkrevd')
  })
})
