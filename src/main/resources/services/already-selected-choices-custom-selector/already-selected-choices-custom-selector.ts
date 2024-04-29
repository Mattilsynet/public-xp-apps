import { get as getContent, query } from '/lib/xp/content'
import { Request } from '/types'
import { forceArray } from '@enonic/js-utils'
import { Content } from '@enonic-types/lib-content'
import { BranchNumber } from '/codegen/site/content-types'
import { assetUrl } from '/lib/xp/portal'
import { wizardType } from '/guillotine/resolvers/type-check'

export function get(request: Request) {
  const key = request.path.match(/\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/)?.[0]
  const contentRequestedFrom = getContent<Content<BranchNumber>>({ key })
  const directOrRefChoices = contentRequestedFrom?.data?.directOrRefChoices

  if (directOrRefChoices?._selected === 'direct') {
    const hits = forceArray(directOrRefChoices?.direct?.choices).map((choice, i) => ({
      id: choice,
      displayName: choice,
      description: 'Valg uten referanse',
    }))
    return {
      status: 200,
      contentType: 'application/json',
      body: {
        hits,
        count: hits.length,
        total: hits.length,
      },
    }
  } else if (directOrRefChoices?._selected === 'reference') {
    const iconUrlChoice = assetUrl({ path: 'choice.svg' })
    const iconUrlChoiceGroup = assetUrl({ path: 'choice-group.svg' })

    const res = query({
      count: -1,
      filters: {
        boolean: {
          must: {
            ids: {
              values: forceArray(directOrRefChoices?.reference?.choices),
            },
          },
        },
      },
    }).hits.map((hit, i) => ({
      id: hit._id,
      iconUrl: hit.type === wizardType('choice') ? iconUrlChoice : iconUrlChoiceGroup,
      displayName: hit.displayName,
      description: hit._path,
    }))

    return {
      status: 200,
      contentType: 'application/json',
      body: {
        hits: res,
        count: 10,
        total: res.length,
      },
    }
  } else {
    return {
      status: 404,
      contentType: 'application/json',
      body: {
        message: 'No choices found. Check the content for errors.',
      },
    }
  }
}
