import { Point, Vector } from '../types';
import { SGFParser } from './SGFParser';
import { PropIdent, SGFProperties } from './sgfTypes';

/**
 * Descriptor of SGF property. It contains two methods:
 *
 * - `set` - set property from SGF prop values
 * - `get` - returns SGF prop values
 *
 * This descriptor is inspired by ES5 `PropertyDescriptor` and works in similar way. Imagine you have
 * sgf property `B[aa]`, which represents black move on board. If you want to store this property in JS
 * object, much better way is to store it as object with `x` and `y` coordinates. So its descriptor could
 * look like this:
 *
 * ```javascript
 * const blackMoveDescriptor = {
 *   set(value) {
 *     this.blackMove = {
 *       x: value[0].charCodeAt(0) - 97,
 *       y: value[0].charCodeAt(1) - 97,
 *     };
 *   },
 *   get() {
 *     return [String.fromCharCode(this.blackMove.x + 97) + String.fromCharCode(this.blackMove.y + 97)];
 *   },
 * };
 * ```
 */
export type SGFPropertyDescriptor<T> = {
  set(value: string[]): void;
  get(): string[] | undefined;
} & ThisType<T>;

/**
 *  Map of SGF property descriptors. Keys are property identifiers, values are descriptors.
 */
export interface SGFPropertyDescriptorMap<T> {
  [key: string]: SGFPropertyDescriptor<T>;
}

/**
 * Class for storing SGF properties. It contains methods for setting properties (even from SGF string) and
 * method for writing SGF string. Itself it doesn't have any special handling of properties, however other classes
 * can extend it and add custom handling of properties.
 */
export class SGFPropertiesBag {
  /**
   * Properties from SGF are stored in this object. Usually they are saved as they are in sgf (as array of string),
   * however they can be transformed to some other format (like object with x and y coordinates) with property descriptors.
   */
  properties: { [key: string]: unknown } = {};

  /**
   * Get SGF descriptor for given property, this is used to determine how to store SGF property value.
   *
   * Class SGFPropertiesBag doesn't have any custom handling of properties, all are saved as is into properties object.
   * However its descendants can override this method.
   */
  getPropertyDescriptor(propIdent: string): SGFPropertyDescriptor<SGFPropertiesBag> | undefined {
    return {
      set(values: string[]) {
        this.properties[propIdent] = values;
      },
      get() {
        return this.properties[propIdent] as string[];
      },
    };
  }

  /**
   * Get all SGF property descriptors for this object. This returns only descriptors for properties with special handling.
   */
  getPropertyDescriptors(): SGFPropertyDescriptorMap<SGFPropertiesBag> {
    return {};
  }

  /**
   * Set one SGF property.
   */
  setSGFProperty(propIdent: string, propValues: string[]) {
    const descriptor = this.getPropertyDescriptor(propIdent);

    if (descriptor) {
      descriptor.set.call(this, propValues);
    }
  }

  /**
   * Set properties from the SGF properties object or SGF string.
   */
  setSGFProperties(sgfProperties: SGFProperties | string) {
    if (typeof sgfProperties === 'string') {
      const parser = new SGFParser();
      const parsedProperties = parser.parseNode(
        // Node must have semicolon at the beginning
        sgfProperties[0] === ';' ? sgfProperties : `;${sgfProperties}`,
      );

      this.setSGFProperties(parsedProperties);
      return;
    }

    (Object.keys(sgfProperties) as PropIdent[]).forEach((propIdent) => {
      this.setSGFProperty(propIdent, sgfProperties[propIdent]!);
    });
  }

  /**
   * Returns stored properties as SGF string.
   */
  getSGFProperties() {
    const descriptors = this.getPropertyDescriptors();
    let sgf = '';

    Object.keys(descriptors).forEach((propIdent) => {
      sgf += writeProperty(propIdent, descriptors[propIdent].get.call(this));
    });

    Object.keys(this.properties).forEach((propIdent) => {
      if (!descriptors[propIdent]) {
        const descriptor = this.getPropertyDescriptor(propIdent);
        if (descriptor) {
          sgf += writeProperty(propIdent, descriptor.get.call(this));
        }
      }
    });

    return sgf;
  }

  /**
   * Helper function to transform SGF coordinates (aa) to JS object.
   */
  static parsePoint(str: string) {
    return {
      x: str.charCodeAt(0) - 97,
      y: str.charCodeAt(1) - 97,
    };
  }

  /**
   * Helper function to transform SGF vector (aa:bb) to JS object.
   */
  static parseVector(str: string) {
    return {
      x1: str.charCodeAt(0) - 97,
      y1: str.charCodeAt(1) - 97,
      x2: str.charCodeAt(3) - 97,
      y2: str.charCodeAt(4) - 97,
    };
  }

  /**
   * Helper function to transform JS Point object to SGF coordinates.
   */
  static pointToSGFValue(point: Point) {
    return String.fromCharCode(point.x + 97) + String.fromCharCode(point.y + 97);
  }

  /**
   * Helper function to transform JS Vector object to SGF vector.
   */
  static vectorToSGFValue(vector: Vector) {
    return `${String.fromCharCode(vector.x1 + 97) + String.fromCharCode(vector.y1 + 97)}:${
      String.fromCharCode(vector.x2 + 97) + String.fromCharCode(vector.y2 + 97)
    }`;
  }
}

function writeProperty(propIdent: string, values: string[] | undefined) {
  if (values && values.length) {
    return `${propIdent}${values.map((v) => `[${escapeSGFValue(v)}]`).join('')}`;
  }

  return '';
}

// Characters, which has to be escaped when transforming to SGF
const escapeCharacters = ['\\\\', '\\]'];

const escapeSGFValue = function (value: string) {
  return escapeCharacters.reduce(
    (prev, current) => prev.replace(new RegExp(current, 'g'), current),
    value,
  );
};
