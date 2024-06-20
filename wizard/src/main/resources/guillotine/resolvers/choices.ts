import { query } from '/lib/xp/content'
import { wizardType } from '/lib/type-check'
import { Content } from '@enonic-types/lib-content'
import { forceArray } from '@enonic/js-utils'
import { stringToKey } from '/lib/string-to-key'
import { ChoiceMaps, UUIDChoiceMap } from '/lib/types'
import { Choice, ChoiceGroup } from '/codegen/site/content-types'

export function getChoiceMaps(): ChoiceMaps {
  const choices = query<Content<Choice>>({
    count: -1,
    filters: {
      hasValue: {
        field: 'type',
        values: [wizardType('choice')],
      },
    },
  }).hits
  const choiceGroups = query<Content<ChoiceGroup>>({
    count: -1,
    filters: {
      hasValue: {
        field: 'type',
        values: [wizardType('choice-group')],
      },
    },
  }).hits

  const choiceMap: UUIDChoiceMap = choices.reduce((acc, choice) => {
    return {
      ...acc,
      [choice._id]: {
        type: choice.type,
        text: choice.data.text,
      },
    }
  }, {})
  const choiceGroupMap = choiceGroups.reduce(
    (acc, choiceGroup) => {
      if (!choiceGroup.data.choices) {
        return acc
      }
      return {
        ...acc,
        [choiceGroup._id]: {
          type: choiceGroup.type,
          text: choiceGroup.displayName,
          choices: forceArray(choiceGroup.data.choices).map((choice) => {
            choiceMap[choice] = {
              ...(choiceMap[choice] || {}),
              partOfGroups: choiceMap[choice]?.partOfGroups
                ? choiceMap[choice]?.partOfGroups.concat(stringToKey(choiceGroup.displayName))
                : [stringToKey(choiceGroup.displayName)],
            }
            return choice
          }),
        },
      }
    },
    {} as ChoiceMaps['choiceGroupMap']
  )

  return { choiceMap, choiceGroupMap, translatedChoices: {} }
}

/**
 * Uses the choice maps to translate the UUID key into readable choices. (to make a prettier url)
 * Then updates the translated choices map.
 * The new choice key may be identical with existing keys, so duplicate choices may cause issues.
 */
export function translateChoices(
  choices: Array<string> | string,
  selected: 'direct' | 'reference' | 'referenceOutside' | undefined,
  choiceMaps: ChoiceMaps
) {
  const { choiceMap, choiceGroupMap, translatedChoices } = choiceMaps
  if (!choices) {
    return []
  } else if (selected === 'reference' || selected === 'referenceOutside') {
    return forceArray(choices).map((choiceKeyUUID) => {
      const choiceValue = choiceMap[choiceKeyUUID] ?? choiceGroupMap[choiceKeyUUID]
      const choiceKey = stringToKey(choiceValue.text)

      if (choiceValue.type === wizardType('choice')) {
        translatedChoices[choiceKey] = { ...choiceValue, type: 'choice', id: choiceKeyUUID }
      } else if (choiceValue.type === wizardType('choice-group')) {
        choiceValue.type = 'choice-group'
        translatedChoices[choiceKey] = {
          id: choiceKeyUUID,
          type: 'choice-group',
          text: choiceValue.text,
          choices: choiceValue.choices?.map((choiceUUID) =>
            stringToKey(choiceMap[choiceUUID]?.text)
          ),
        }
        translateChoices(choiceValue.choices, selected, choiceMaps)
      }
      return choiceKey
    })
  } else if (selected === 'direct') {
    return forceArray(choices).map((choice) => {
      const choiceIndex = stringToKey(choice)
      translatedChoices[choiceIndex] = { type: 'choice', text: choice, id: choiceIndex }
      return choiceIndex
    })
  } else {
    return []
  }
}
