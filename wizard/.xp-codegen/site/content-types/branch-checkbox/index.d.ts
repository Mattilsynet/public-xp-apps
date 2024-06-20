// WARNING: This file was automatically generated by "no.item.xp.codegen". You may lose your changes if you edit it.
export type BranchCheckbox = {
  /**
   * Valgtype
   */
  directOrRefChoices:
    | {
        /**
         * Selected
         */
        _selected: "direct";

        /**
         * Valg uten referanse
         */
        direct: {
          /**
           * Valg som fører til neste spørsmål eller resultat
           */
          choices: Array<string> | string;
        };
      }
    | {
        /**
         * Selected
         */
        _selected: "reference";

        /**
         * Valg med referanse
         */
        reference: {
          /**
           * Valg som fører til neste spørsmål eller resultat
           */
          choices: Array<string> | string;
        };
      }
    | {
        /**
         * Selected
         */
        _selected: "referenceOutside";

        /**
         * Valg med referanse som ligger utenfor veiviseren
         */
        referenceOutside: {
          /**
           * Valg som fører til neste spørsmål eller resultat. Se info hvis tom
           */
          choices: Array<string> | string;
        };
      };

  /**
   * Foretrukne valg
   */
  preferredChoices?: Array<string> | string;

  /**
   * Neste spørsmål eller resultat
   */
  nextQuestionOrResult: string;
}
