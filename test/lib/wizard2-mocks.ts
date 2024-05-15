export const gqlQueryResponse = {
  data: {
    guillotine: {
      get: {
        __typename: 'no_mattilsynet_wizard_Wizard',
        data: {
          title: 'tester veien',
          root: {
            choices: {
              'andre-dyr-': {
                type: 'choice',
                text: 'Andre dyr 2',
              },
              hund: {
                type: 'choice',
                text: 'Hund',
              },
              katt: {
                type: 'choice',
                text: 'Katt',
              },
              's-r-korea': {
                partOfGroups: ['region-tredjeland'],
                text: 'Sør Korea',
                type: 'choice',
              },
              'region-tredjeland': {
                type: 'choice-group',
                choices: ['s-r-korea'],
                text: 'Region tredjeland',
              },
              ja: {
                type: 'choice',
                text: 'Ja',
              },
              nei: {
                type: 'choice',
                text: 'Nei',
              },
              sverige: {
                type: 'choice',
                text: 'Sverige',
              },
            },
            validTree: true,
            errors: [],
            rootNode: 'd9d69944-4f22-4e40-a457-d77e9f151dfb',
            edges: {
              'af76dbc6-a9ee-4f0f-9c1b-86b59f76f024': {
                id: 'af76dbc6-a9ee-4f0f-9c1b-86b59f76f024',
                type: 'no.mattilsynet.wizard:branch-number',
                source: '776101f2-615c-404b-8d37-acbe8b7ede38',
                target: '521631c2-b738-47ca-9f4e-5c72adfba55b',
                choices: [],
              },
              '32b12157-f18e-44b3-bb65-9cd02b2bee4c': {
                id: '32b12157-f18e-44b3-bb65-9cd02b2bee4c',
                type: 'no.mattilsynet.wizard:branch-radio',
                source: 'd9d69944-4f22-4e40-a457-d77e9f151dfb',
                target: '49cee92f-d1f0-4ae7-8683-a4c8b37fb625',
                choices: ['nei'],
              },
              'f2f1586d-8b61-4c18-be25-e267b02db91a': {
                id: 'f2f1586d-8b61-4c18-be25-e267b02db91a',
                type: 'no.mattilsynet.wizard:branch-number',
                source: '776101f2-615c-404b-8d37-acbe8b7ede38',
                target: 'f0621c54-e231-4fb0-af92-d3eb796f7c85',
                choices: ['hund', 'katt', 'ilder'],
                conditionals: {
                  totalNumberCondition: {
                    operator: 'gt',
                    value: 5,
                    target: 'af031da2-759d-4bf5-8c70-db9921813464',
                  },
                },
              },
              'aaee230e-ace3-459f-9267-30093e46fcb7': {
                id: 'aaee230e-ace3-459f-9267-30093e46fcb7',
                type: 'no.mattilsynet.wizard:branch-radio',
                source: 'd9d69944-4f22-4e40-a457-d77e9f151dfb',
                target: '776101f2-615c-404b-8d37-acbe8b7ede38',
                choices: ['ja'],
              },
              '4e3b0d67-cb4d-46ef-9654-cdf51bc91e93': {
                id: '4e3b0d67-cb4d-46ef-9654-cdf51bc91e93',
                type: 'no.mattilsynet.wizard:branch-checkbox',
                source: 'f0621c54-e231-4fb0-af92-d3eb796f7c85',
                target: 'cf598bcd-8a7b-4431-b6a3-d69338279e87',
                choices: ['sverige', 'danmark', 'finland', 'region-tredjeland'],
              },
            },
            nodes: {
              'cf598bcd-8a7b-4431-b6a3-d69338279e87': {
                id: 'cf598bcd-8a7b-4431-b6a3-d69338279e87',
                type: 'no.mattilsynet.wizard:result-calculator',
                resultGroups: [],
              },
              '49cee92f-d1f0-4ae7-8683-a4c8b37fb625': {
                id: '49cee92f-d1f0-4ae7-8683-a4c8b37fb625',
                type: 'no.mattilsynet.wizard:result',
                title: 'Du må reise med dyrene selv!',
              },
              'bf4d2f1e-a0b9-44c3-b00f-0018bb745d35': {
                id: 'bf4d2f1e-a0b9-44c3-b00f-0018bb745d35',
                type: 'no.mattilsynet.wizard:result',
                title: 'du har ikke plass til mer enn en ku i bilen!',
              },
              'ef546238-f2e9-4f77-a0c2-adbbf5709c1c': {
                id: 'ef546238-f2e9-4f77-a0c2-adbbf5709c1c',
                type: 'no.mattilsynet.wizard:result',
                title: 'Din luring! Kan vel ikke eie fler enn 2 hunder!?',
              },
              '521631c2-b738-47ca-9f4e-5c72adfba55b': {
                id: '521631c2-b738-47ca-9f4e-5c72adfba55b',
                type: 'no.mattilsynet.wizard:result',
                title: 'Så kult!',
              },
              'af031da2-759d-4bf5-8c70-db9921813464': {
                id: 'af031da2-759d-4bf5-8c70-db9921813464',
                type: 'no.mattilsynet.wizard:result',
                title: 'Kan ikke reise med flere enn 5 dyr!',
              },
              'f0621c54-e231-4fb0-af92-d3eb796f7c85': {
                id: 'f0621c54-e231-4fb0-af92-d3eb796f7c85',
                type: 'no.mattilsynet.wizard:question',
                question: 'Hvilke land skal du besøke?',
                targets: ['4e3b0d67-cb4d-46ef-9654-cdf51bc91e93'],
                choiceType: 'checkbox',
                errorMessages: {
                  required: 'Checkbox påkrevd',
                },
              },
              '776101f2-615c-404b-8d37-acbe8b7ede38': {
                id: '776101f2-615c-404b-8d37-acbe8b7ede38',
                type: 'no.mattilsynet.wizard:question',
                question: 'Hvilke hvor mange dyr reiser du med?',
                targets: ['f2f1586d-8b61-4c18-be25-e267b02db91a'],
                choiceType: 'number',
                errorMessages: {
                  required: 'Du må svare på spørsmålet for å gå videre',
                  greaterThanZero: 'Tallet må være større enn 0',
                  isNumber: 'Du må bruke tall',
                },
              },
              'd9d69944-4f22-4e40-a457-d77e9f151dfb': {
                id: 'd9d69944-4f22-4e40-a457-d77e9f151dfb',
                type: 'no.mattilsynet.wizard:question',
                question: 'Reiser du med dyrene selv?',
                targets: [
                  'aaee230e-ace3-459f-9267-30093e46fcb7',
                  '32b12157-f18e-44b3-bb65-9cd02b2bee4c',
                ],
                choiceType: 'radio',
                errorMessages: {
                  required: 'Radio påkrevd',
                },
              },
            },
          },
        },
      },
    },
  },
}
export function getData(gqlQuery) {
  return gqlQuery.data.guillotine.get.data.root
}
