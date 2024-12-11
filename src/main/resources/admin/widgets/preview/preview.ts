// @ts-expect-error no-types
import { render } from '/lib/mustache'
import { Request } from '/types'
import { get as getContext } from '/lib/xp/context'
import { serviceUrl } from '/lib/xp/portal'

export function get(_: Request) {
  const toolName = 'preview'
  const VIEW = resolve(`${toolName}.html`)

  const previewService = serviceUrl({ service: 'preview', type: 'server' })
  const context = getContext()
  return {
    body: render(VIEW, {
      previewService,
      repository: context.repository,
    }),
  }
}
