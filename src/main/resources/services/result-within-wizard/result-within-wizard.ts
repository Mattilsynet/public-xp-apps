import { Request } from '/types'
import { wizardType } from '/lib/type-check'
import { getContentWithinWizard } from '/lib/service-utils'

export function get(request: Request) {
  return getContentWithinWizard(request, [wizardType('result')])
}
