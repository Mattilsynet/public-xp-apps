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
import { getChoiceMaps } from '/guillotine/resolvers/choices'
import { resolveNodes } from '/guillotine/resolvers/nodes'
import { resolveEdges } from '/guillotine/resolvers/edges'
import { run } from '/lib/xp/context'
import { mapToReactFlow } from '/admin/tools/preview/mapToReactFlow'
import { traverseGraph } from '/lib/traverse'
import { validateWizardData } from '/lib/validate'
import { mapQueryToValues } from '/lib/wizard-util'
import { get as getContent, query } from '/lib/xp/content'
import { wizardType } from '/lib/type-check'
import { Wizard } from '/codegen/site/content-types'
import { Content } from '@enonic-types/lib-content'

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
  const data = run(
    {
      repository: 'com.enonic.cms.mattilsynet', // todo change to selectable repository. AppConfig?
      branch: 'draft', // todo make selectable through GUI
      principals: ['role:system.authenticated'],
    },
    () => {
      let wizards = undefined
      const selectedWizard = request.params['wizard']
      if (!selectedWizard) {
        wizards = query({
          filters: { hasValue: { field: 'type', values: [wizardType('wizard')] } },
        }).hits.map((wizard) => ({ id: wizard._id, title: wizard.displayName }))
        return { wizards }
      }
      const wizard = getContent<Content<Wizard>>({ key: selectedWizard })
      const wizardPath = wizard?._path?.replace('/content', '')
      const errors = []
      const choiceMaps = getChoiceMaps()
      const nodes = resolveNodes(wizardPath, choiceMaps, errors)
      const edges = resolveEdges(wizardPath, nodes, choiceMaps, errors)
      const root = {
        rootNode: wizard.data?.question,
        nodes,
        edges,
        choices: choiceMaps.translatedChoices,
        errors,
        validTree: errors.length === 0,
      }
      const queryString = Object.keys(request.params ?? {})
        ?.reduce((acc, key) => {
          return acc.concat(`&${key}=${request.params[key]}`)
        }, '')
        ?.replace('&', '')
      const traversedGraph = traverseGraph(queryString, root)
      const validationErrors = validateWizardData(
        traversedGraph.renderSteps,
        mapQueryToValues(queryString)
      )
      return {
        ...mapToReactFlow({ ...root, validationErrors, traversedGraph }),
        selectedWizard,
        wizards,
      }
    }
  )

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
    data: JSON.stringify(data, (_, value) => {
      if (typeof value === 'string') {
        return value.replace(/"/g, "'").replace(/\\+/g, '').replace(/\s/g, ' ')
      }
      return value
    }),
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
