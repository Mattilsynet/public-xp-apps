// WARNING: This file was automatically generated by "no.item.xp.codegen". You may lose your changes if you edit it.
export type Answers = {
  /**
   * Svaralternativer
   */
  directOrRefAnswers:
    | {
        /**
         * Selected
         */
        _selected: "direct";

        /**
         * Direktesvar
         */
        direct: {
          /**
           * Svar som fører til neste spørsmål eller resultat
           */
          answers: Array<string> | string;
        };
      }
    | {
        /**
         * Selected
         */
        _selected: "reference";

        /**
         * Referansesvar
         */
        reference: {
          /**
           * Svar som fører til neste spørsmål eller resultat
           */
          answers: Array<string> | string;
        };
      };
}
