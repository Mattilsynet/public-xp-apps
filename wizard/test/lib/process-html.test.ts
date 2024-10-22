import { describe, expect, it } from '@jest/globals'
import Log from '@enonic/mock-xp/dist/Log'
// import { processHtmlWithMacros } from '../../src/main/resources/lib/process-html'

// @ts-ignore TS2339: Property 'log' does not exist on type 'typeof globalThis'.
global.log = Log.createLogger({
  loglevel: 'warn',
})

describe.skip('skipped because enonic import issue (proccessed html with macros)', function () {
  it('all known macros', () => {
    const processedHtml = 'nothing' //processHtmlWithMacros(inputHtml)
    expect(processedHtml).toContain('<!--#MACRO _name="nonExistantMacro"')
    expect(processedHtml).toContain("<details class='mt-details with-border'>")
    expect(processedHtml).toContain("<div class='notice important'>")
    expect(processedHtml).toContain("<span class='inclusively-hidden'>TEKST!</span>")
    expect(processedHtml).toContain("<div class='notice '>")
    expect(processedHtml).toContain('<div class="video-wrapper">')
    expect(processedHtml).toContain('src="https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ"')
    expect(processedHtml).toContain('<iframe title="title" src="https://www.w3schools.com">')
    expect(processedHtml).toContain('<p>&shy;</p>')
  })
})

const inputHtml = `
<p>hei</p>

<p>[nonExistantMacro summary="sumsummarum"]</p>

<p><strong>tester med 2</strong></p>

<p>[/nonExistantMacro]</p>

<p>[summaryDetails summary="sumsummarum"]</p>

<p><strong>tester med 2</strong></p>

<p>[/summaryDetails]</p>

<p>[summaryDetails summary="Forklaring til listen"]</p>

<p><strong>Animalsk biprodukt:</strong> Hele dyr eller deler av dyr dyr som ikke skal brukes til mat. Eksempler er innmat, avskjær, bein og ull. Inkluderer også oppdrettede insekter og lavtrofiske organismer (eks. blåskjell og tunikater) som dyrkes i havet.</p>

<p><strong>Matavfall:</strong> Matrester fra restauranter, serveringssteder, storkjøkken og husholdningskjøkken.</p>

<p><strong>Mineralsk materiale: </strong>For eksempel oppkverna gipsplater, fosfater, resirkulerte fosfor-produkter.</p>

<p><strong>Fiskeslam:</strong> Oppsamlede ekskrementer og fôrrester fra oppdrettsanlegg.</p>

<p><strong>Husdyrgjødsel: </strong>Ekskrementer og/eller urin fra husdyr.</p>

<p><strong>Avløpsslam:</strong> Organisk materiale og næringsstoffer som blir fjernet fra kloakken når den renses på renseanlegget.</p>

<p><strong>Vegetabilsk: </strong>Plantebasert materiale.</p>

<p><strong>Makroalger: </strong>Tang og tare.</p>

<p><strong>Mikroalger og andre mikroorganismer: <a href="https://vg.no">ekstern lenke</a> "test" """</strong></p>

<p><a href="content://1648f432-102e-404b-9f61-4435dfa78db9">intern lenke</a></p>

<p>[/summaryDetails]</p>

<p>[notice infoType="important" iconText="TEKST!"]</p>

<p>notice text</p>

<p>[/notice]</p>

<p>[video videoId="aqz-KE-bpKQ" videoTitle="tittel"/]</p>

<p>[notice infoType="none"]</p>

<p>notice text none</p>

<p>[/notice]</p>

<p>[breakline/]</p>

<p>[embed]&lt;iframe title="title" src="https://www.w3schools.com"&gt;<br />
&lt;/iframe&gt;[/embed]</p>

<p> </p>
`
