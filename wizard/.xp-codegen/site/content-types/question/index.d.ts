// WARNING: This file was automatically generated by "no.item.xp.codegen". You may lose your changes if you edit it.
export type Question = {
  /**
   * Spørsmål
   */
  question: string;

  /**
   * Hjelpetekst
   */
  helpText?: string;

  /**
   * Valgtype
   */
  choiceType:
    | {
        /**
         * Selected
         */
        _selected: "radio";

        /**
         * Radioknapper
         */
        radio: {
          /**
           * Grener
           */
          nextStep?: Array<string> | string;

          /**
           * Feilmeldinger
           */
          errorMessages: {
            /**
             * Påkrevd
             */
            required: string;
          };
        };
      }
    | {
        /**
         * Selected
         */
        _selected: "checkbox";

        /**
         * Sjekkboks
         */
        checkbox: {
          /**
           * Grener
           */
          nextStep?: Array<string> | string;

          /**
           * Feilmeldinger
           */
          errorMessages: {
            /**
             * Påkrevd
             */
            required: string;
          };
        };
      }
    | {
        /**
         * Selected
         */
        _selected: "number";

        /**
         * Tall
         */
        number: {
          /**
           * Grener
           */
          nextStep?: Array<string> | string;

          /**
           * Lukkbar Knapptekst
           */
          collapsableButtonText: {
            /**
             * Knapptekst åpen
             */
            openLabel: string;

            /**
             * Knapptekst lukket
             */
            closedLabel: string;
          };

          /**
           * Feilmeldinger
           */
          errorMessages: {
            /**
             * Påkrevd
             */
            required: string;

            /**
             * Større enn 0
             */
            greaterThanZero: string;

            /**
             * Svaret må være et tall
             */
            isNumber: string;
          };
        };
      };
};
