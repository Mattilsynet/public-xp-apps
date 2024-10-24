import { processHtml } from '/lib/xp/portal'
import { query } from '/lib/xp/content'

export function processHtmlWithMacros(html: string) {
  const textWithLinks = transformInternalLinksInHtml(html)
  const processedHtml = processHtml({ value: textWithLinks }).replace(/\\"/g, '"')
  const macroNames = findMatches(RegExp('<!--#MACRO.+_name="(.*?)"', 'g'), processedHtml)
  return replaceMacroCommentWithHtml(macroNames, processedHtml)
}

function transformInternalLinksInHtml(text: string) {
  const hrefContentIds = findMatches(RegExp('<a[^>]*href="content://([a-z0-9-]{36})"', 'g'), text)
  const idsToHref = query({ filters: { ids: { values: hrefContentIds } } })?.hits?.map((hit) => ({
    id: hit._id,
    href: hit._path?.replace(/\/[^/]*/, '') || '/',
  }))
  return idsToHref.reduce((acc, { id, href }) => acc.replace(RegExp(`content://${id}`), href), text)
}

function replaceMacroCommentWithHtml(macroNames: string[], html: string): string {
  return macroNames.reduce((acc, name) => {
    const macroWithoutFields = RegExp(`<!--#MACRO _name="${name}".+_body="([\\s\\S]*?)"-->`, 'g')
    switch (name) {
      case 'summaryDetails':
        return acc.replace(
          RegExp(`<!--#MACRO _name="${name}".+summary="(.*?)".+_body="([\\s\\S]*?)"-->`, 'g'),
          `<details class='mt-details with-border'>
            <summary class='mt-summary mt-summary-icon'>
              $1
            </summary>
            <div class='summary-wrapper'>
              $2
            </div>
          </details>`
        )
      case 'notice':
        return acc.replace(
          RegExp(
            `<!--#MACRO _name="${name}" (iconText="([^"]*)")?.*infoType="([^"]*)".*_body="([\\s\\S]*?)"-->`,
            'g'
          ),
          (match, _, iconText, infoType, body) => {
            if (iconText) {
              return `<div class='notice ${infoType !== 'none' ? infoType : ''}'>
                    <span class='inclusively-hidden'>${iconText}</span>
                    <div class='text'>${body}</div>
                  </div>`
            }
            return `
                <div class='notice ${infoType !== 'none' ? infoType : ''}'>
                    <div class='text'>${body}</div>
                </div>
            `
          }
        )
      case 'video':
        return acc.replace(
          RegExp(
            `<!--#MACRO _name="${name}" videoId="([^"]*)" videoTitle="([^"]*)"[\\s\\S]*?"-->`,
            'g'
          ),
          `<div class="video-wrapper">
            <iframe
              width="560"
              height="315"
              src="https://www.youtube-nocookie.com/embed/$1"
              title="$2"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen>
            </iframe>
          </div>`
        )
      case 'embed':
        return acc.replace(
          macroWithoutFields,
          (match, body) => `<div class='video-wrapper'>
            ${decodeLtGtSymbols(body)}
          </div>`
        )
      case 'breakline':
        return acc.replace(macroWithoutFields, '&shy;')
      default:
        return acc
    }
  }, html)
}

function findMatches(regex: RegExp, str: string, matches = []): string[] {
  const res = regex.exec(str)?.[1]
  if (!res) {
    return matches
  }
  matches.push(res)
  return findMatches(regex, str, matches)
}

function decodeLtGtSymbols(str: string): string {
  return str.replace(/&lt;/g, '<').replace(/&gt;/g, '>')
}
