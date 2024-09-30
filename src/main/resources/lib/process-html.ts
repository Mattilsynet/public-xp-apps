import { processHtml } from '/lib/xp/portal'

export function processHtmlWithMacros(text: string) {
  return processHtml({ value: text }).replace(
    /<!--#MACRO.*summary="([^"]*)".*_body="([^"]*)"-->/g,
    "<details class='mt-details with-border'><summary class='mt-summary mt-summary-icon'>$1</summary><div class='summary-wrapper'>$2</div></details>"
  )
}
