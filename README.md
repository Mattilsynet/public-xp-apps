# Mattilsynet's headless wizard for enonic xp

## Setup
`
echo "repository=com.enonic.cms.SITE_NAME" > ~/.enonic/sandboxes/SANDBOXNAME/home/config/no.mattilsynet.wizard.cfg
`
* Install the app from enonic market
* Add the app config as described above (only used for preview)
* Add the app to a site
* Get started by either:
  * Seeing the [editor documentation](doc/editor-doc.pdf)
  * Importing the [example wizard](doc/wizard-example.zip) to your xp instance
  * Trying it out blindly

## Make the wizard super-duper fast
[![npm version](https://badge.fury.io/js/@mattilsynet%2Fveiviser.svg)](https://badge.fury.io/js/@mattilsynet%2Fveiviser)
### Intall the helper npm package in your frontend and run the `traverseGraph` function on the client.
This package also exposes some functions and types that should come in handy when implementing the frontend.

## Wishlist
- [ ] Move the preview to within content studio to get context and support layers

## Implementation

#### GraphQL
```graphql
fragment wizard on no_mattilsynet_wizard_Wizard {
  data {
    title
    intro {
      ...richTextFields
    }
    text {
      ...richTextFields
    }
    root(wizardChoices: $wizardChoices) {
      rootNode
      nodes
      edges
      choices
      validTree
      errors
      validationErrors {
        key
        message
      }
      traversedGraph
    }
  }
}
```
where wizardChoices is the choices made by the user so far as a URL search string (?UID1=value1&UID2=value2).

#### Example pseudocode in svelte

```sveltehtml
<script lang="ts">
  import {
    isMultiSelect,
    isNumbers,
    isRadioButton,
    isResult,
    isResultCalculator,
    traverseGraph,
    type WizardRoot
  } from '@mattilsynet/veiviser'
  import { type Content } from '$lib/types/enonic'

  export let { root }: Content & { root: WizardRoot } = getFromStoreIfExist() ?? fetch('graphql')

  // traverseGraph is only needed if you want to traverse on client side.
  // The server will also run the function and is available in root.traversedGraph
  $: {
    renderSteps,
    resultCalculatorNode
  } = traverseGraph($page.url.search, root)

  $: errors = root.validationErrors
</script>

{#if resultCalculatorNode}
  <ResultCalculator {resultCalculatorNode} />
{:else}
  <form>
    {#each renderSteps as step}
      {#if isRadioButton(step)}
        <WizardRadio {step} />
      {:else if isNumbers(step)}
        <WizardNumber {step} {values} {errors} />
      {:else if isMultiSelect(step)}
        <WizardMultiselect {step} {values} {errors} {loadJs} {nextButtonText} />
      {:else if isResult(step)}
        {#if step.conditionResults?.length > 0}
          {#each step.conditionResults as result, i}
            <h2>{result.title}</h2>
            <div>
              {@html result.text}
            </div>
          {/each}
        {:else}
          <h2>{step.title}</h2>
          <div>
            {@html step.text}
          </div>
        {/if}
      {:else if isResultCalculator(step)}
        <WizardSummary>
          <input type="hidden" name={step.id} value="true" />
          <button type="submit">
            Til oppsummering
          </button>
        </WizardSummary>
      {/if}
    {/each}
  </form>
{/if}
```
