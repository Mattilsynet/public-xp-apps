import { Request } from '/types'
import { get as getContent, query } from '/lib/xp/content'
import { Content } from '@enonic-types/lib-content'
import { wizardType } from './type-check'
import { assetUrl } from '/lib/xp/portal'

export function getContentWithinWizard(request: Request, contentTypes: string[]) {
  const key = request.path.match(/\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/)?.[0]
  const contentRequestedFrom = getContent<Content<unknown>>({ key })
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

  const iconUrlResult = assetUrl({ path: 'result.svg' })
  const iconUrlResultWithConditions = assetUrl({ path: 'result-with-conditions.svg' })
  const iconUrlQuestion = assetUrl({ path: 'question.svg' })
  const iconUrlResultCalculator = assetUrl({ path: 'result-calculator.svg' })
  const iconUrlChoice = assetUrl({ path: 'choice.svg' })
  const iconUrlChoiceGroup = assetUrl({ path: 'choice-group.svg' })

  const queryString = request.params.query
    ? `fulltext("displayName^2,data.*,_allText", '"${request.params.query}"~1', "OR") OR displayName LIKE '*${request.params.query}*'`
    : undefined

  const choicesWithinWizard = query({
    query: `_path LIKE '/content${wizardPath}/*'${queryString ? ` AND (${queryString})` : ''}`,
    count: -1,
    filters: {
      hasValue: {
        field: 'type',
        values: contentTypes,
      },
    },
  }).hits.map((hit, i) => {
    let iconUrl: string
    switch (hit.type) {
      case wizardType('question'):
        iconUrl = iconUrlQuestion
        break
      case wizardType('result'):
        iconUrl = iconUrlResult
        break
      case wizardType('result-calculator'):
        iconUrl = iconUrlResultCalculator
        break
      case wizardType('choice'):
        iconUrl = iconUrlChoice
        break
      case wizardType('choice-group'):
        iconUrl = iconUrlChoiceGroup
        break
      case wizardType('result-with-conditions'):
        iconUrl = iconUrlResultWithConditions
        break
    }
    return {
      id: hit._id,
      iconUrl,
      displayName: hit.displayName,
      description: hit._path,
    }
  })

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
