// WARNING: This file was automatically generated by "no.item.xp.codegen". You may lose your changes if you edit it.
export type ConditionNumber = {
  /**
   * Betingelse for tall-input
   */
  numberCondition:
    | {
        /**
         * Selected
         */
        _selected: "gt";

        /**
         * Større enn
         */
        gt: {
          /**
           * Større enn
           */
          number?: number;
        };
      }
    | {
        /**
         * Selected
         */
        _selected: "lt";

        /**
         * Mindre enn
         */
        lt: {
          /**
           * Mindre enn
           */
          number?: number;
        };
      }
    | {
        /**
         * Selected
         */
        _selected: "between";

        /**
         * Mellom
         */
        between: {
          /**
           * Større enn
           */
          number?: number;
        };
      }
    | {
        /**
         * Selected
         */
        _selected: "eq";

        /**
         * Lik
         */
        eq: {
          /**
           * Mindre enn
           */
          number?: number;
        };
      }
    | {
        /**
         * Selected
         */
        _selected: "neq";

        /**
         * Ulik
         */
        neq: {
          /**
           * Mindre enn
           */
          number?: number;
        };
      };
}
