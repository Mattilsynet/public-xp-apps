// @ts-expect-error no-types
import { render } from '/lib/mustache'
// @ts-expect-error no-types
import Router from '/lib/router'
import { getLauncherPath } from '/lib/xp/admin'
import { assetUrl } from '/lib/xp/portal'
import { getBrowserSyncUrl, isRunning } from './browserSync'
import {
  contentSecurityPolicy,
  CSP_DEFAULT,
  CSP_PERMISSIVE,
  pushUniqueValue,
  UNSAFE_INLINE,
} from './contentSecurityPolicy'
import { IS_DEV_MODE } from './runMode'
import { getAdminUrl, immutableGetter } from './urlHelper'
import { FILEPATH_MANIFEST_CJS, FILEPATH_MANIFEST_NODE_MODULES, GETTER_ROOT } from './constants'
import { Request } from '/types'
import { AppData } from '../../../static/admin/previewTypes'

const router = Router()

router.all(`/${GETTER_ROOT}/{path:.+}`, (r: Request) => {
  return immutableGetter(r)
})

const get = (request: Request): any => {
  const toolName = 'preview'
  const VIEW = resolve(`${toolName}.html`)

  const csp = CSP_DEFAULT
  pushUniqueValue(csp['script-src'], UNSAFE_INLINE)
  pushUniqueValue(csp['style-src'], UNSAFE_INLINE)

  let browserSyncUrl = ''
  if (IS_DEV_MODE) {
    if (isRunning({ request })) {
      browserSyncUrl = getBrowserSyncUrl({ request })
    } else {
      log.info(
        'HINT: You are running Enonic XP in development mode, however, BrowserSync is not running.'
      )
    }
  }

  const data: AppData = {
    hello: "i'm some data",
  }

  const params = {
    applicationIconUrl: getAdminUrl(
      {
        path: 'icons/application.svg',
      },
      toolName
    ),
    appUrl: getAdminUrl(
      {
        path: 'admin/App.mjs',
      },
      toolName
    ),
    browserSyncUrl,
    cssUrl: getAdminUrl(
      {
        manifestPath: FILEPATH_MANIFEST_CJS,
        path: 'admin/App.css',
      },
      toolName
    ),
    assetsUrl: assetUrl({ path: '' }),
    launcherPath: getLauncherPath(),
    reactDomUrl: getAdminUrl(
      {
        manifestPath: FILEPATH_MANIFEST_NODE_MODULES,
        path: 'react-dom/umd/react-dom.development.js',
      },
      toolName
    ),
    reactUrl: getAdminUrl(
      {
        manifestPath: FILEPATH_MANIFEST_NODE_MODULES,
        path: 'react/umd/react.development.js',
      },
      toolName
    ),
    reactflowUrl: getAdminUrl(
      {
        manifestPath: FILEPATH_MANIFEST_NODE_MODULES,
        path: 'reactflow/dist/umd/index.js',
      },
      toolName
    ),
    data: JSON.stringify(data),
  }

  return {
    body: render(VIEW, params),
    headers: {
      'content-security-policy': contentSecurityPolicy(IS_DEV_MODE ? CSP_PERMISSIVE : csp),
    },
  }
}

router.get('', (r: Request) => get(r)) // Default admin tool path
router.get('/', (r: Request) => get(r)) // Just in case someone adds a slash on the end

export const all = (r: Request) => router.dispatch(r)
