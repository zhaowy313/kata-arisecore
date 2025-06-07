import { Point, StandardSGFProperties } from '../sgfTypes';
import { SGFPropertyMapper } from './SGFPropertyMapper';

/**
 * Maps a string representation of a point (like "aa") to a Point object.
 * @param str - The string representation of the point.
 * @returns The mapped Point object.
 */
export function mapPoint(str: string): Point {
  return {
    x: str.charCodeAt(0) - 97,
    y: str.charCodeAt(1) - 97,
  };
}

/**
 * Converts a Point object to its SGF string representation.
 * @param point - The Point object to convert.
 * @returns The SGF string representation of the point.
 */
export function unmapPoint(point: Point): string {
  return String.fromCharCode(point.x + 97) + String.fromCharCode(point.y + 97);
}

// Helper functions for mapping/unmapping
function mapNumber(val: string[]): number {
  return Number(val[0]);
}

function unmapNumber(val: number): string[] {
  return [String(val)];
}

// Special handling for SZ property (board size)
function mapSZ(val: string[]): number | [number, number] {
  if (val[0].includes(':')) {
    const [x, y] = val[0].split(':').map(Number);
    return [x, y];
  }
  return Number(val[0]);
}

function unmapSZ(val: number | [number, number]): string[] {
  if (Array.isArray(val)) {
    return [`${val[0]}:${val[1]}`];
  }
  return [String(val)];
}

function mapString(val: string[]): string {
  return val[0];
}

function unmapString(val: string): string[] {
  return [val];
}

/**
 * Maps an array of SGF point strings to an array of Point objects.
 * @param vals - Array of SGF point strings.
 * @returns Array of Point objects.
 */
export function mapPointList(vals: string[]): Point[] {
  return vals.map(mapPoint);
}

/**
 * Converts an array of Point objects to their SGF string representations.
 * @param vals - Array of Point objects.
 * @returns Array of SGF point strings.
 */
export function unmapPointList(vals: Point[]): string[] {
  return vals.map(unmapPoint);
}

/**
 * Maps an array of SGF label strings to an array of [Point, string] tuples.
 * @param vals - Array of SGF label strings.
 * @returns Array of [Point, string] tuples.
 */
export function mapLabelList(vals: string[]): [Point, string][] {
  // Each value is like "aa:label"
  return vals.map((v) => {
    const idx = v.indexOf(':');
    return [mapPoint(v.slice(0, 2)), v.slice(idx + 1)];
  });
}

/**
 * Converts an array of [Point, string] tuples to their SGF label string representations.
 * @param vals - Array of [Point, string] tuples.
 * @returns Array of SGF label strings.
 */
export function unmapLabelList(vals: [Point, string][]): string[] {
  return vals.map(([pt, label]) => unmapPoint(pt) + ':' + label);
}

/**
 * Maps an array of SGF line strings to an array of [Point, Point] tuples.
 * @param vals - Array of SGF line strings.
 * @returns Array of [Point, Point] tuples.
 */
export function mapLineList(vals: string[]): [Point, Point][] {
  // Each value is like "aa:bb"
  return vals.map((v) => {
    const [a, b] = v.split(':');
    return [mapPoint(a), mapPoint(b)];
  });
}

/**
 * Converts an array of [Point, Point] tuples to their SGF line string representations.
 * @param vals - Array of [Point, Point] tuples.
 * @returns Array of SGF line strings.
 */
export function unmapLineList(vals: [Point, Point][]): string[] {
  return vals.map(([a, b]) => unmapPoint(a) + ':' + unmapPoint(b));
}

function mapAP(val: string[]): [string, string] {
  // AP[foo:bar]
  const [a, b] = val[0].split(':');
  return [a, b];
}

function unmapAP(val: [string, string]): string[] {
  return [val[0] + ':' + val[1]];
}

function mapFG(val: string[]): [number, string] | null {
  if (!val[0]) {
    return null;
  }
  const [num, str] = val[0].split(':');
  return [Number(num), str];
}

function unmapFG(val: [number, string] | null): string[] {
  if (!val) {
    return [];
  }
  return [val[0] + ':' + val[1]];
}

function mapVW(val: string[]): [Point, Point] {
  // VW[aa:bb]
  const [a, b] = val[0].split(':');
  return [mapPoint(a), mapPoint(b)];
}

function unmapVW(val: [Point, Point]): string[] {
  return [unmapPoint(val[0]) + ':' + unmapPoint(val[1])];
}

function mapPL(val: string[]): 'B' | 'W' {
  return val[0] as 'B' | 'W';
}

function unmapPL(val: 'B' | 'W'): string[] {
  return [val];
}

/**
 * Maps an SGF property value to a Point or null.
 * @param val - Array of SGF property values.
 * @returns The mapped Point object or null.
 */
export function mapNullablePoint(val: string[]): Point | null {
  if (!val[0]) {
    return null;
  }
  return mapPoint(val[0]);
}

/**
 * Converts a Point object or null to its SGF string representation.
 * @param val - The Point object or null.
 * @returns Array containing the SGF string representation, or empty if null.
 */
export function unmapNullablePoint(val: Point | null): string[] {
  if (val == null) {
    return [];
  }
  return [unmapPoint(val)];
}

function mapNull(_val: string[]): null {
  return null;
}

function unmapNull(_val: null): string[] {
  return [];
}

const mappers: {
  [T in keyof StandardSGFProperties]-?: [
    (val: string[]) => StandardSGFProperties[T],
    (val: Exclude<StandardSGFProperties[T], undefined>) => string[],
  ];
} = {
  B: [mapNullablePoint, unmapNullablePoint],
  W: [mapNullablePoint, unmapNullablePoint],
  KO: [mapNull, unmapNull],
  MN: [mapNumber, unmapNumber],
  FF: [mapNumber, unmapNumber],
  GM: [mapNumber, unmapNumber],
  ST: [mapNumber, unmapNumber],
  SZ: [mapSZ, unmapSZ],
  V: [mapNumber, unmapNumber],
  TM: [mapNumber, unmapNumber],
  BL: [mapNumber, unmapNumber],
  OB: [mapNumber, unmapNumber],
  OW: [mapNumber, unmapNumber],
  WL: [mapNumber, unmapNumber],
  PM: [mapNumber, unmapNumber],
  HA: [mapNumber, unmapNumber],
  KM: [mapNumber, unmapNumber],
  AB: [mapPointList, unmapPointList],
  AE: [mapPointList, unmapPointList],
  AW: [mapPointList, unmapPointList],
  CR: [mapPointList, unmapPointList],
  DD: [mapPointList, unmapPointList],
  MA: [mapPointList, unmapPointList],
  SL: [mapPointList, unmapPointList],
  SQ: [mapPointList, unmapPointList],
  TR: [mapPointList, unmapPointList],
  TB: [mapPointList, unmapPointList],
  TW: [mapPointList, unmapPointList],
  PL: [mapPL, unmapPL],
  C: [mapString, unmapString],
  DM: [mapString, unmapString],
  GB: [mapString, unmapString],
  GW: [mapString, unmapString],
  HO: [mapString, unmapString],
  N: [mapString, unmapString],
  UC: [mapString, unmapString],
  BM: [mapString, unmapString],
  DO: [mapString, unmapString],
  IT: [mapString, unmapString],
  TE: [mapString, unmapString],
  CA: [mapString, unmapString],
  AN: [mapString, unmapString],
  BR: [mapString, unmapString],
  BT: [mapString, unmapString],
  CP: [mapString, unmapString],
  DT: [mapString, unmapString],
  EV: [mapString, unmapString],
  GN: [mapString, unmapString],
  GC: [mapString, unmapString],
  ON: [mapString, unmapString],
  OT: [mapString, unmapString],
  PB: [mapString, unmapString],
  PC: [mapString, unmapString],
  PW: [mapString, unmapString],
  RE: [mapString, unmapString],
  RO: [mapString, unmapString],
  RU: [mapString, unmapString],
  SO: [mapString, unmapString],
  US: [mapString, unmapString],
  WR: [mapString, unmapString],
  WT: [mapString, unmapString],
  AR: [mapLineList, unmapLineList],
  LN: [mapLineList, unmapLineList],
  LB: [mapLabelList, unmapLabelList],
  AP: [mapAP, unmapAP],
  FG: [mapFG, unmapFG],
  VW: [mapVW, unmapVW],
};

/**
 * Maps SGF properties to their respective JS types based on SGF specification.
 *
 * From SGF specification, there are these types of property values:
 *
 * CValueType = (ValueType | *Compose*)
 * ValueType  = (*None* | *Number* | *Real* | *Double* | *Color* | *SimpleText* | *Text* | *Point*  | *Move* | *Stone*)
 *
 * - Types `Number`, `Real` are implemented by javascript's `number`.
 * - Types `Double`, `SimpleText` and `Text` are considered as the same and transformed to javascript string.
 * - Types `Point`, `Move` and `Stone` are all the same, implemented as `Point` object (simple object with `x` and `y` properties).
 * - Type `None` is implemented as `true`
 *
 * Each `Compose` type, which is used in SGF, has its own type.
 *
 * - `Point ':' Point` (used in AR property) has special type `Line` - object with two sets of coordinates.
 * - `Point ':' Simpletext` (used in LB property) has special type `Label` - object with coordinates and text property
 * - `Simpletext ":" Simpletext` (used in AP property) - not implemented
 * - `Number ":" SimpleText` (used in FG property) - not implemented
 *
 * {@link http://www.red-bean.com/sgf/sgf4.html}
 */
export const StandardSGFPropertyMapper: SGFPropertyMapper<StandardSGFProperties> = {
  map(propIdent, propValue) {
    if (propIdent in mappers) {
      return mappers[propIdent as keyof StandardSGFProperties][0](propValue as string[]) as any;
    }
    // If no specific mapper, return as is
    return propValue as unknown;
  },
  unmap(propIdent, propValue) {
    if (propIdent in mappers) {
      return (mappers[propIdent as keyof StandardSGFProperties][1] as any)(propValue);
    }
    // If no specific un-mapper, return as is
    return propValue as string[];
  },
};
