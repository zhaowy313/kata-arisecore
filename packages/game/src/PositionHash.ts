import { Color, curryLast, Stone } from '@wgojs/common';

export type PositionHash = bigint;

export const PositionHash = {
  /**
   * Initial empty hash value - hash for empty board.
   */
  empty: 0n as PositionHash,

  /**
   * Creates a new position hash from current position hash and stone. This is using Zobrist hashing.
   */
  updateHash: curryLast((prevHash: PositionHash, stones: Stone | Stone[]): PositionHash => {
    if (Array.isArray(stones)) {
      return stones.reduce((hash, { x, y, color }) => hash ^ getNumberFor(x, y, color), prevHash);
    }
    return prevHash ^ getNumberFor(stones.x, stones.y, stones.color);
  }),
};

const zobristTable: bigint[][][] = [];

function getNumberFor(x: number, y: number, color: Color): bigint {
  zobristTable[x] ??= [];
  zobristTable[x][y] ??= [];
  zobristTable[x][y][color] ??= randomBigInt64();
  return zobristTable[x][y][color];
}

function randomBigInt64(): bigint {
  return (
    (BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)) << 32n) |
    BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER))
  );
}
