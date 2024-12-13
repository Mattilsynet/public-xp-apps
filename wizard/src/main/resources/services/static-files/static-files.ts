// @ts-expect-error no-types
import Router from '/lib/router'
import { GETTER_ROOT } from '/constants'
import { Request } from '/types'
import { immutableGetter } from '/admin/widgets/preview/urlHelper'

const router = Router()
router.all(`/${GETTER_ROOT}/{path:.+}`, (r: Request) => {
  return immutableGetter(r)
})

export const all = (request) => router.dispatch(request)
