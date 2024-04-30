// WARNING: This file was automatically generated by "no.item.xp.codegen". You may lose your changes if you edit it.
export type ResultWithConditions = {
  /**
   * Title
   */
  title: string;

  /**
   * Intro
   */
  intro?: string;

  /**
   * Text
   */
  text?: string;

  /**
   * Kriterier for visning
   */
  displayCriteria: {
    /**
     * Logisk operator for denne boksen
     */
    logicalOperator: "and" | "or" | "not";


    choiceOrLogic?: Array<
      | {
          /**
           * Selected
           */
          _selected: "choice";

          /**
           * Valg
           */
          choice: {
            /**
             * Logisk operator for denne boksen
             */
            logicalOperator: "and" | "or" | "not";

            /**
             * Valg
             */
            choices: Array<string> | string;
          };
        }
      | {
          /**
           * Selected
           */
          _selected: "choiceOutside";

          /**
           * Valg som ligger utenfor veiviseren
           */
          choiceOutside: {
            /**
             * Logisk operator for denne boksen
             */
            logicalOperator: "and" | "or" | "not";

            /**
             * Valg
             */
            choices: Array<string> | string;
          };
        }
      | {
          /**
           * Selected
           */
          _selected: "logic";

          /**
           * Logisk uttrykk
           */
          logic: {
            /**
             * Logisk operator for denne boksen
             */
            logicalOperator: "and" | "or" | "not";

            /**
             * Betingelser for tall-input
             */
            choiceOrChoiceOutside: Array<
              | {
                  /**
                   * Selected
                   */
                  _selected: "choice";

                  /**
                   * Valg
                   */
                  choice: {
                    /**
                     * Logisk operator for denne boksen
                     */
                    logicalOperator: "and" | "or" | "not";

                    /**
                     * Valg
                     */
                    choices: Array<string> | string;
                  };
                }
              | {
                  /**
                   * Selected
                   */
                  _selected: "choiceOutside";

                  /**
                   * Valg som ligger utenfor veiviseren
                   */
                  choiceOutside: {
                    /**
                     * Logisk operator for denne boksen
                     */
                    logicalOperator: "and" | "or" | "not";

                    /**
                     * Valg
                     */
                    choices: Array<string> | string;
                  };
                }
            >;
          };
        }
    >;
  };
}
