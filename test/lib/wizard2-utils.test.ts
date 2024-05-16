import { getData, gqlQueryResponse } from './wizard2-mocks'
import { getRenderSteps } from '../../src/main/resources/lib/traverse'
import { describe, expect, it } from '@jest/globals'
import { mapQueryToValues } from '../../src/main/resources/lib/wizard-util'

describe('Utils', function () {
  it('getRenderSteps first step', () => {
    const root = getData(gqlQueryResponse)
    const res = getRenderSteps('', root)
    expect(res.length).toEqual(1)
    expect(res[0].question).toEqual('Reiser du med dyrene selv?')
  })
  it('getRenderSteps two', () => {
    const root = getData(gqlQueryResponse)
    const res = getRenderSteps('d9d69944-4f22-4e40-a457-d77e9f151dfb=ja', root)
    expect(res.length).toEqual(2)
    expect(res[0].question).toEqual('Reiser du med dyrene selv?')
    expect(res[1].question).toEqual('Hvilke hvor mange dyr reiser du med?')
  })

  it('getRenderSteps two - result', () => {
    const root = getData(gqlQueryResponse)
    const res = getRenderSteps('d9d69944-4f22-4e40-a457-d77e9f151dfb=nei', root)
    expect(res.length).toEqual(2)
    expect(res[0].question).toEqual('Reiser du med dyrene selv?')
    expect(res[1].title).toEqual('Du må reise med dyrene selv!')
  })

  it('getRenderSteps tree', () => {
    const root = getData(gqlQueryResponse)
    const res = getRenderSteps(
      'd9d69944-4f22-4e40-a457-d77e9f151dfb=ja&776101f2-615c-404b-8d37-acbe8b7ede38_hund=1',
      root
    )
    expect(res.length).toEqual(3)
    expect(res[0].question).toEqual('Reiser du med dyrene selv?')
    expect(res[1].question).toEqual('Hvilke hvor mange dyr reiser du med?')
    expect(res[2].question).toEqual('Hvilke land skal du besøke?')
  })
  it('getRenderSteps tree and summary', () => {
    const root = getData(gqlQueryResponse)
    const res = getRenderSteps(
      encodeURI(
        'd9d69944-4f22-4e40-a457-d77e9f151dfb=ja&776101f2-615c-404b-8d37-acbe8b7ede38_hund=1&f0621c54-e231-4fb0-af92-d3eb796f7c85=sverige,danmark'
      ),
      root
    )
    expect(res.length).toEqual(4)
    expect(res[0].question).toEqual('Reiser du med dyrene selv?')
    expect(res[1].question).toEqual('Hvilke hvor mange dyr reiser du med?')
    expect(res[2].question).toEqual('Hvilke land skal du besøke?')
    expect(res[3].type).toEqual('no.mattilsynet.wizard:result-calculator')
  })

  it('getRenderSteps - change with result', () => {
    const root = getData(gqlQueryResponse)
    const res = getRenderSteps(
      'd9d69944-4f22-4e40-a457-d77e9f151dfb=nei&776101f2-615c-404b-8d37-acbe8b7ede38_hund=1',
      root
    )
    expect(res.length).toEqual(2)
    expect(res[0].question).toEqual('Reiser du med dyrene selv?')
    expect(res[1].title).toEqual('Du må reise med dyrene selv!')
  })

  it('getRenderSteps tree - cat and dog', () => {
    const root = getData(gqlQueryResponse)
    const res = getRenderSteps(
      'd9d69944-4f22-4e40-a457-d77e9f151dfb=ja&776101f2-615c-404b-8d37-acbe8b7ede38_hund=1&776101f2-615c-404b-8d37-acbe8b7ede38_katt=1',
      root
    )
    expect(res.length).toEqual(3)
    expect(res[0].question).toEqual('Reiser du med dyrene selv?')
    expect(res[1].question).toEqual('Hvilke hvor mange dyr reiser du med?')
    expect(res[2].question).toEqual('Hvilke land skal du besøke?')
    expect(res[2].options.find((c) => c.value === 's-r-korea').value).toEqual('s-r-korea')
  })

  it('getRenderSteps tree - totalNumberCondition to total', () => {
    const root = getData(gqlQueryResponse)
    const res = getRenderSteps(
      'd9d69944-4f22-4e40-a457-d77e9f151dfb=ja&776101f2-615c-404b-8d37-acbe8b7ede38_hund=6&776101f2-615c-404b-8d37-acbe8b7ede38_katt=5',
      root
    )
    expect(res.length).toEqual(3)
    expect(res[0].question).toEqual('Reiser du med dyrene selv?')
    expect(res[1].question).toEqual('Hvilke hvor mange dyr reiser du med?')
    expect(res[2].title).toEqual('Kan ikke reise med flere enn 5 dyr!')
  })

  it('getRenderSteps tree - specificNumberConditions - single result', () => {
    const root = getData(gqlQueryResponse)
    const res = getRenderSteps(
      'd9d69944-4f22-4e40-a457-d77e9f151dfb=ja&776101f2-615c-404b-8d37-acbe8b7ede38_hund=5',
      root
    )
    expect(res.length).toEqual(3)
    expect(res[0].question).toEqual('Reiser du med dyrene selv?')
    expect(res[1].question).toEqual('Hvilke hvor mange dyr reiser du med?')
    expect(res[2].title).toEqual('Du kan ikke ha mer enn 2 hunder!')
  })

  it('getRenderSteps tree - specificNumberConditions - multiple condition same result', () => {
    const root = getData(gqlQueryResponse)
    const res = getRenderSteps(
      'd9d69944-4f22-4e40-a457-d77e9f151dfb=ja&776101f2-615c-404b-8d37-acbe8b7ede38_ilder=5&776101f2-615c-404b-8d37-acbe8b7ede38_gnager=5',
      root
    )
    expect(res.length).toEqual(3)
    expect(res[0].question).toEqual('Reiser du med dyrene selv?')
    expect(res[1].question).toEqual('Hvilke hvor mange dyr reiser du med?')
    expect(res[2].conditionResults.length).toEqual(1)
    expect(res[2].conditionResults[0].title).toEqual('Du kan ikke ha mer enn 3 ildere!')
  })

  it('getRenderSteps tree - specificNumberConditions - multiple results', () => {
    const root = getData(gqlQueryResponse)
    const query = [
      'd9d69944-4f22-4e40-a457-d77e9f151dfb=ja',
      '776101f2-615c-404b-8d37-acbe8b7ede38_hund=4',
      '776101f2-615c-404b-8d37-acbe8b7ede38_katt=4',
    ].join('&')
    const res = getRenderSteps(query, root)
    expect(res.length).toEqual(3)
    expect(res[0].question).toEqual('Reiser du med dyrene selv?')
    expect(res[1].question).toEqual('Hvilke hvor mange dyr reiser du med?')
    expect(res[2].conditionResults.length).toEqual(2)
    expect(res[2].conditionResults[0].title).toEqual('Du kan ikke ha mer enn 2 hunder!')
    expect(res[2].conditionResults[1].title).toEqual('Du kan ikke ha mer enn 2 katter!')
  })

  it('getRenderSteps tree - specificNumberConditions ok', () => {
    const root = getData(gqlQueryResponse)
    const query = [
      'd9d69944-4f22-4e40-a457-d77e9f151dfb=ja',
      '776101f2-615c-404b-8d37-acbe8b7ede38_hund=1',
      '776101f2-615c-404b-8d37-acbe8b7ede38_katt=1',
      '776101f2-615c-404b-8d37-acbe8b7ede38_ilder=1',
    ].join('&')
    const res = getRenderSteps(query, root)
    expect(res.length).toEqual(3)
    expect(res[0].question).toEqual('Reiser du med dyrene selv?')
    expect(res[1].question).toEqual('Hvilke hvor mange dyr reiser du med?')
    expect(res[2].question).toEqual('Hvilke land skal du besøke?')
  })
})

describe('mapQueryToValues', () => {
  it('mapQueryToValues - maps query', () => {
    const res = mapQueryToValues(
      encodeURI(
        'd9d69944-4f22-4e40-a457-d77e9f151dfb=ja&776101f2-615c-404b-8d37-acbe8b7ede38_hund=10&776101f2-615c-404b-8d37-acbe8b7ede38_katt=1&f0621c54-e231-4fb0-af92-d3eb796f7c85=sverige,nord-irland'
      )
    )
    expect(res[0].id).toEqual('d9d69944-4f22-4e40-a457-d77e9f151dfb')
    expect(res[0].choice).toEqual(['ja'])
    expect(res[1].id).toEqual('776101f2-615c-404b-8d37-acbe8b7ede38')
    expect(res[1].choice).toEqual(['hund'])
    expect(res[1].value).toEqual(10)
    expect(res[2].id).toEqual('776101f2-615c-404b-8d37-acbe8b7ede38')
    expect(res[2].choice).toEqual(['katt'])
    expect(res[2].value).toEqual(1)
    expect(res[3].id).toEqual('f0621c54-e231-4fb0-af92-d3eb796f7c85')
    expect(res[3].choice).toEqual(['sverige', 'nord-irland'])
  })
  it('mapQueryToValues - no values', () => {
    const res = mapQueryToValues(
      encodeURI(
        'd9d69944-4f22-4e40-a457-d77e9f151dfb=&776101f2-615c-404b-8d37-acbe8b7ede38_hund=&f0621c54-e231-4fb0-af92-d3eb796f7c85='
      )
    )
    expect(res[0].id).toEqual('d9d69944-4f22-4e40-a457-d77e9f151dfb')
    expect(res[0].choice).toEqual([])
    expect(res[0].value).toEqual(undefined)
    expect(res[1].id).toEqual('776101f2-615c-404b-8d37-acbe8b7ede38')
    expect(res[1].choice).toEqual(['hund'])
    expect(res[1].value).toEqual(undefined)
    expect(res[2].id).toEqual('f0621c54-e231-4fb0-af92-d3eb796f7c85')
    expect(res[2].choice).toEqual([])
    expect(res[2].value).toEqual(undefined)
  })
})
