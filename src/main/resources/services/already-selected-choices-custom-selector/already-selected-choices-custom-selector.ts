import { get as getContent, query } from '/lib/xp/content'
import { Request } from '/types'
import { flatten, forceArray } from '@enonic/js-utils'
import { Content } from '@enonic-types/lib-content'
import { BranchNumber, BranchRadio } from '/codegen/site/content-types'
import { assetUrl } from '/lib/xp/portal'
import { isChoice, isChoiceGroup, wizardType } from '/guillotine/resolvers/type-check'

export function get(request: Request) {
  const key = request.path.match(/\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/)?.[0]
  const contentRequestedFrom = getContent<Content<BranchNumber>>({ key })
  const directOrRefChoices = contentRequestedFrom?.data?.directOrRefChoices

  const selected = directOrRefChoices?._selected
  if (selected === 'direct') {
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
  } else if (selected === 'reference' || selected === 'referenceOutside') {
    const iconUrlChoice = assetUrl({ path: 'choice.svg' })
    const iconUrlChoiceGroup = assetUrl({ path: 'choice-group.svg' })

    const ids = getAllChoiceIdsFromChoicesAndGroups(directOrRefChoices, selected)

    const res = query({
      count: request.params.count ? Number(request.params.count) : 10,
      query: `displayName LIKE '*${request.params.query}*'`,
      filters: {
        boolean: {
          must: {
            ids: {
              values: forceArray(ids),
            },
          },
        },
      },
    }).hits

    const mappedRes = res.map((hit, i) => {
      if (isChoiceGroup(hit)) {
        return {
          id: hit._id,
          iconUrl: iconUrlChoiceGroup,
          displayName: hit.displayName,
          description: hit._path,
        }
      } else if (isChoice(hit)) {
        return {
          id: hit._id,
          iconUrl: iconUrlChoice,
          displayName: hit.displayName,
          description: hit._path,
        }
      }
    }, [])

    return {
      status: 200,
      contentType: 'application/json',
      body: {
        hits: mappedRes,
        count: 10,
        total: mappedRes.length,
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

function getAllChoiceIdsFromChoicesAndGroups(
  directOrRefChoices: BranchRadio['directOrRefChoices'],
  selected: 'reference' | 'referenceOutside'
) {
  return flatten(
    query({
      count: -1,
      filters: {
        boolean: {
          must: {
            ids: {
              values: forceArray(directOrRefChoices?.[selected]?.choices),
            },
            hasValue: {
              field: 'type',
              values: [wizardType('choice'), wizardType('choice-group')],
            },
          },
        },
      },
    }).hits.map((hit) => {
      if (isChoiceGroup(hit)) {
        return query({
          count: -1,
          filters: {
            boolean: {
              must: {
                ids: {
                  values: forceArray(hit.data.choices ?? []),
                },
              },
            },
          },
        })
          .hits.map((choice) => choice._id)
          .concat(hit._id)
      }
      return hit._id
    })
  ) as string[]
}
