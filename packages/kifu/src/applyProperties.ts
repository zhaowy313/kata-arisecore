import { curryLast } from '@wgojs/common';
import { SGFProperties, StandardSGFProperties } from '@wgojs/sgf';

export interface ApplyPropertiesParams<
  T,
  P extends Record<string, any> = StandardSGFProperties & SGFProperties,
> {
  properties: P;
  applyProperty?: (move: T, properties: P, key: keyof P) => T;
}

/**
 * Create function `applyProperties(entity, { properties, applyProperty = defaultApplyProperty }) => entity`.
 * This function applies properties to the entity using the provided `applyProperty` function.
 * This is useful for applying SGF properties to various entities like KifuInfo and KifuMove.
 */
export function createApplyProperties<T>(
  defaultApplyProperty: Required<ApplyPropertiesParams<T>>['applyProperty'],
) {
  return curryLast(
    (
      move: T,
      { properties, applyProperty = defaultApplyProperty }: ApplyPropertiesParams<T>,
    ): T => {
      return Object.keys(properties).reduce((updatedMove, key) => {
        return applyProperty(updatedMove, properties, key);
      }, move);
    },
  ) as {
    <P extends Record<string, any> = StandardSGFProperties>(
      a: ApplyPropertiesParams<T, P>,
    ): (data: T) => T;
    <P extends Record<string, any> = StandardSGFProperties>(
      data: T,
      a: ApplyPropertiesParams<T, P>,
    ): T;
  };
}
