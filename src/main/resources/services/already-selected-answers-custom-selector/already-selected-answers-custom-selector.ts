import { get as getContent, query } from '/lib/xp/content'
import { Request } from '/types'
import { forceArray } from '@enonic/js-utils'
import { Content } from '@enonic-types/lib-content'
import { BranchNumber } from '../../../../../.xp-codegen/site/content-types'

export function get(request: Request) {
	const key = request.path.match(/\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/)?.[0]
	const contentRequestedFrom = getContent<Content<BranchNumber>>({ key })
	const directOrRefAnswers = contentRequestedFrom?.data?.directOrRefAnswers

	if (directOrRefAnswers?._selected === 'direct') {
		const hits = forceArray(directOrRefAnswers?.direct?.answers).map((answer, i) => ({
			id: i,
			displayName: answer,
			description: 'Direktesvar',
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
	} else if (directOrRefAnswers?._selected === 'reference') {
		const res = query({
			filters: {
				boolean: {
					must: {
						ids: {
							values: forceArray(directOrRefAnswers?.reference?.answers),
						},
					},
				},
			},
		}).hits.map((hit, i) => ({
			id: i,
			displayName: hit.displayName,
			description: 'Referansesvar',
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
				message: 'No answers found. Check the content for errors.',
			},
		}
	}
}
