import { get as getContent, query } from '/lib/xp/content'
import { Request } from '/types'
import { Content } from '@enonic-types/lib-content'
import { BranchNumber } from '/codegen/site/content-types'
import { wizardType } from '/lib/type-check'
import { assetUrl } from '/lib/xp/portal'

export function get(request: Request) {
  const key = request.path.match(/\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/)?.[0]
  const contentRequestedFrom = getContent<Content<BranchNumber>>({ key })
  const wizardPath = query({
    query: {
      pathMatch: {
        field: '_path',
        path: `/content${contentRequestedFrom._path}`,
      },
    },
    filters: {
      hasValue: {
        field: 'type',
        values: [wizardType('wizard')],
      },
    },
  }).hits?.[0]?._path

  if (!wizardPath) {
    return {
      status: 404,
      contentType: 'application/json',
      body: {
        total: 0,
        count: 0,
        message: 'No choices found. Check the content for errors.',
      },
    }
  }

  const iconUrlChoice = assetUrl({ path: 'choice.svg' })
  const iconUrlChoiceGroup = assetUrl({ path: 'choice-group.svg' })

  const choicesWithinWizard = query({
    query: `_path LIKE '/content${wizardPath}/*'`,
    filters: {
      hasValue: {
        field: 'type',
        values: [wizardType('choice'), wizardType('choice-group')],
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
      hits: choicesWithinWizard,
      count: 10,
      total: choicesWithinWizard.length,
    },
  }
}
