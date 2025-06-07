/**
 * Interface for mapping SGF property values between their SGF string representation
 * and their corresponding JavaScript types.
 *
 * Implementations of this interface provide conversion logic for both directions:
 * - `map`: Converts SGF property string values to JavaScript types.
 * - `unmap`: Converts JavaScript types back to SGF property string values.
 *
 * @template PROPS - The type describing all supported SGF properties and their JS types.
 */
export interface SGFPropertyMapper<PROPS extends Record<string, unknown>> {
  /**
   * Maps an SGF property value from its string representation to its JavaScript type.
   *
   * @param propIdent - The property identifier (e.g., "B", "W", "SZ").
   * @param propValue - The SGF property value as an array of strings.
   * @returns The mapped JavaScript value for known properties, or the original string array for unknown properties.
   */
  map<IDENT extends string | keyof PROPS>(
    propIdent: IDENT,
    propValue: string[],
  ): IDENT extends keyof PROPS ? Exclude<PROPS[IDENT], undefined> : string[];

  /**
   * Converts a JavaScript property value back to its SGF string representation.
   *
   * @param propIdent - The property identifier (e.g., "B", "W", "SZ").
   * @param propValue - The JavaScript value for the property, or a string array for unknown properties.
   * @returns The SGF property value as an array of strings.
   */
  unmap<IDENT extends string | keyof PROPS>(
    propIdent: IDENT,
    propValue: IDENT extends keyof PROPS ? PROPS[IDENT] : string[],
  ): string[];
}
