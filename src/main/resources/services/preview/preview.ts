// @ts-expect-error no-types
import { render } from '/lib/mustache'
import { Request } from '/types'
import {
  contentSecurityPolicy,
  CSP_DEFAULT,
  CSP_PERMISSIVE,
  pushUniqueValue,
  UNSAFE_INLINE,
} from '/admin/widgets/preview/contentSecurityPolicy'
import { IS_DEV_MODE } from '/admin/widgets/preview/runMode'
import { getBrowserSyncUrl, isRunning } from '/admin/widgets/preview/browserSync'
import { get as getContext, run } from '/lib/xp/context'
import { Content, get as getContent, query } from '/lib/xp/content'
import { list as allRepos } from '/lib/xp/repo'
import { wizardType } from '/lib/type-check'
import { Wizard } from '/codegen/site/content-types'
import { getChoiceMaps } from '/guillotine/resolvers/choices'
import { resolveNodes } from '/guillotine/resolvers/nodes'
import { resolveEdges } from '/guillotine/resolvers/edges'
import { traverseGraph } from '/lib/traverse'
import { validateWizardData } from '/lib/validate'
import { mapQueryToValues } from '/lib/wizard-util'
import { mapToReactFlow } from '/admin/widgets/preview/mapToReactFlow'
import { getAdminUrl } from '/admin/widgets/preview/urlHelper'
import {
  FILEPATH_MANIFEST_CJS,
  FILEPATH_MANIFEST_NODE_MODULES,
} from '/admin/widgets/preview/constants'
import { assetUrl } from '/lib/xp/portal'
import { getLauncherPath, getToolUrl } from '/lib/xp/admin'

export function getRenderParams(request: Request, params: Record<string, string>) {
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

  const context = getContext()
  const repository = params['repository'] ?? context.repository
  const data = run(
    {
      repository,
      branch: params['branch'] ?? 'draft',
      principals: context.authInfo.principals,
    },
    () => {
      const errors: string[] = []
      if (!repository) {
        errors.push('Fant ingen repositories')
        return { errors }
      }

      const selectedWizard = params['wizard']
      const wizards = query({
        filters: { hasValue: { field: 'type', values: [wizardType('wizard')] } },
      }).hits.map((wizard) => ({ id: wizard._id, title: wizard.displayName }))
      const repositories = allRepos()
        .filter(
          (repo) => repo.id.indexOf('com.enonic.cms') !== -1 && repo.id !== 'com.enonic.cms.default'
        )
        .map((repo) => {
          return {
            id: repo.id,
            // @ts-expect-error com-enonic-cms.* has displayName
            displayName: repo.data['com-enonic-cms']?.displayName,
          }
        })
      if (!selectedWizard) {
        return {
          wizards,
          errors,
          repositories,
          pathParams: {
            branch: params['branch'] ?? 'draft',
            repository,
          },
        }
      }

      const wizard = getContent<Content<Wizard>>({ key: selectedWizard })
      const wizardPath = wizard?._path?.replace('/content', '')
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
      const queryString = Object.keys(params ?? {})
        ?.reduce((acc, key) => {
          return acc.concat(`&${key}=${params[key]}`)
        }, '')
        ?.replace('&', '')
      const traversedGraph = traverseGraph(queryString, root)
      const validationErrors = validateWizardData(
        traversedGraph.renderSteps,
        mapQueryToValues(queryString)
      )
      const enonicEditPath = `${getToolUrl('com.enonic.app.contentstudio', 'main')}/${repository.split('.').pop()}/edit/`

      return {
        ...mapToReactFlow({ ...root, validationErrors, traversedGraph }, enonicEditPath, errors),
        wizards,
        repositories,
        pathParams: {
          selectedWizard,
          branch: params['branch'] ?? 'draft',
          repository,
        },
      }
    }
  )

  const toolName = 'preview'
  const renderParams = {
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
  return { csp, renderParams }
}

export function get(request: Request) {
  const { params } = request
  const VIEW = resolve(`preview.html`)

  const { csp, renderParams } = getRenderParams(request, params)

  return {
    body: render(VIEW, renderParams),
    headers: {
      'content-security-policy': contentSecurityPolicy(IS_DEV_MODE ? CSP_PERMISSIVE : csp),
    },
  }
}
