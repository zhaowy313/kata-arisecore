import { SGFSyntaxError, SGFParser, IdentitySGFPropertyMapper } from '../src';
import { describe, test, expect } from 'vitest';
import { SGFParsingContext } from '../src/parser/SGFParsingContext';
import { Point } from '@wgojs/common';

describe('Parsing nodes - parseProperties()', () => {
  const parser = new SGFParser();

  test('Parsing empty value', () => {
    expect(parser.parseProperties('DM[1]')).toEqual({ DM: '1' });
  });

  test('Parsing single value', () => {
    expect(parser.parseProperties('B[ab]')).toEqual({ B: { x: 0, y: 1 } });
  });

  test('Parsing multiple values', () => {
    expect(parser.parseProperties('AB[aa][bb][cc]')).toEqual({
      AB: [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 2 },
      ],
    });
  });

  test('Parsing special characters', () => {
    expect(parser.parseProperties('C[SGF property:\nC\\[\\\\\\]]')).toEqual({
      C: 'SGF property:\nC[\\]',
    });
  });

  test('Parsing multiple properties', () => {
    expect(parser.parseProperties('W[aa]C[foo bar]SQ[ab][ba]')).toEqual({
      W: { x: 0, y: 0 },
      C: 'foo bar',
      SQ: [
        { x: 0, y: 1 },
        { x: 1, y: 0 },
      ],
    });
  });

  test('Correctly ignoring whitespace characters', () => {
    expect(parser.parseProperties(' \nB [aa] TR\n[ab]\n[ba]')).toEqual({
      B: { x: 0, y: 0 },
      TR: [
        { x: 0, y: 1 },
        { x: 1, y: 0 },
      ],
    });
  });

  test('Unknown properties are returned as is', () => {
    expect(parser.parseProperties('XX[]YY[1][2]')).toEqual({
      XX: [],
      YY: ['1', '2'],
    });
  });

  test('Correctly parses an empty node', () => {
    expect(parser.parseProperties('')).toEqual({});
  });

  test('Throws error when value is missing', () => {
    expect(() => parser.parseProperties('W')).toThrow(SGFSyntaxError);
  });

  test('Throws error when closing bracket is missing', () => {
    expect(() => parser.parseProperties('B[aa')).toThrow(SGFSyntaxError);
  });

  test('Throws error when unexpected character.', () => {
    expect(() => parser.parseProperties('B]')).toThrow(SGFSyntaxError);
  });
});

describe('Parsing a game tree - parseGameTree()', () => {
  const parser = new SGFParser();

  test('Correctly parses simple game tree without children', () => {
    expect(parser.parseTree('(;DT[2100-12-01]KM[7.5];B[aa];W[bb])')).toEqual({
      sequence: [{ DT: '2100-12-01', KM: 7.5 }, { B: { x: 0, y: 0 } }, { W: { x: 1, y: 1 } }],
      children: [],
    });
  });

  test('Correctly parses game tree with children', () => {
    expect(
      parser.parseTree('(;DT[2100-12-01]KM[7.5](;B[aa];W[bb](;B[ee])(;B[ff]))(;B[cc];W[dd]))'),
    ).toEqual({
      sequence: [{ DT: '2100-12-01', KM: 7.5 }],
      children: [
        {
          sequence: [{ B: { x: 0, y: 0 } }, { W: { x: 1, y: 1 } }],
          children: [
            {
              sequence: [{ B: { x: 4, y: 4 } }],
              children: [],
            },
            {
              sequence: [{ B: { x: 5, y: 5 } }],
              children: [],
            },
          ],
        },
        {
          sequence: [{ B: { x: 2, y: 2 } }, { W: { x: 3, y: 3 } }],
          children: [],
        },
      ],
    });
  });

  test("Throws error when game tree isn' closed.", () => {
    expect(() => parser.parseTree('(;B[aa](;W[ee](;W[ff]))')).toThrow(SGFSyntaxError);
  });
});

describe('Parsing a SGF - parseCollection()', () => {
  const parser = new SGFParser();

  test('Correctly parses SGF.', () => {
    expect(parser.parseCollection('(;DT[2100-12-01](;B[aa])(;B[bb]))(;KM[7.5])')).toEqual([
      {
        sequence: [{ DT: '2100-12-01' }],
        children: [
          {
            sequence: [{ B: { x: 0, y: 0 } }],
            children: [],
          },
          {
            sequence: [{ B: { x: 1, y: 1 } }],
            children: [],
          },
        ],
      },
      {
        sequence: [{ KM: 7.5 }],
        children: [],
      },
    ]);
  });

  test('Throws error when there is no game tree.', () => {
    expect(() => parser.parseCollection(';B[aa]')).toThrow(SGFSyntaxError);
  });
});

describe('Parsing using IdentitySGFPropertyMapper', () => {
  const parser = new SGFParser({ propertyMapper: IdentitySGFPropertyMapper });

  test('Correctly parses empty properties', () => {
    expect(parser.parseProperties('KO[]')).toEqual({ KO: [] });
  });

  test('Correctly parses more properties', () => {
    expect(parser.parseProperties('AB[aa][bb]')).toEqual({ AB: ['aa', 'bb'] });
  });

  test('Correctly parses SGF', () => {
    expect(
      parser.parseTree('(;DT[2100-12-01]KM[7.5](;B[aa];W[bb](;B[ee])(;B[ff]))(;B[cc];W[dd]))'),
    ).toEqual({
      sequence: [{ DT: ['2100-12-01'], KM: ['7.5'] }],
      children: [
        {
          sequence: [{ B: ['aa'] }, { W: ['bb'] }],
          children: [
            {
              sequence: [{ B: ['ee'] }],
              children: [],
            },
            {
              sequence: [{ B: ['ff'] }],
              children: [],
            },
          ],
        },
        {
          sequence: [{ B: ['cc'] }, { W: ['dd'] }],
          children: [],
        },
      ],
    });
  });
});

describe('Parser extension methods', () => {
  test('Config `visitNode` visits all nodes', () => {
    const visited: any[] = [];
    const parser = new SGFParser({
      propertyMapper: IdentitySGFPropertyMapper,
      visitNode: (node, context) => {
        visited.push({ node, ...context });
      },
    });
    parser.parseCollection('(;A[1];B[2](;C[3])(;D[4]))');

    expect(visited.length).toBe(4);
    expect(visited[0].node).toHaveProperty('A');
    expect(visited[0].game).toBe(0);
    expect(visited[0].move).toBe(0);
    expect(visited[1].game).toBe(0);
    expect(visited[1].move).toBe(1);
    expect(visited[2].game).toBe(0);
    expect(visited[2].move).toBe(2);
    expect(visited[3].game).toBe(0);
    expect(visited[3].move).toBe(2);
    expect(visited.some((v) => v.node.B)).toBe(true);
    expect(visited.some((v) => v.node.C)).toBe(true);
    expect(visited.some((v) => v.node.D)).toBe(true);
  });

  test('Custom context data is preserved', () => {
    const parser = new SGFParser({
      propertyMapper: IdentitySGFPropertyMapper,
      visitNode: (_node, context: SGFParsingContext<{ count: number }>) => {
        context.count++;
      },
    });
    const ctx = { count: 0 };
    parser.parseCollection('(;A[1];B[2](;C[3])(;D[4]))', ctx);
    expect(ctx.count).toBe(4);
  });

  test('Config `transformTree` works', () => {
    const parser = new SGFParser({
      propertyMapper: IdentitySGFPropertyMapper,
      transformTree: (
        sequence,
        children: Array<{ seqLen: number; childCount: number }>,
        context,
      ) => ({
        seqLen: sequence.length,
        childCount: children.length,
        game: context.game,
      }),
    });
    const tree = parser.parseCollection('(;A[1];B[2](;C[3])(;D[4]))');
    expect(tree).toEqual([{ seqLen: 2, childCount: 2, game: 0 }]);
  });

  test('Config `transformCollection` change output structure', () => {
    const parser = new SGFParser({
      propertyMapper: IdentitySGFPropertyMapper,
      transformCollection: (collection, _context) => ({
        total: collection.length,
        trees: collection,
      }),
    });
    const result = parser.parseCollection('(;A[1])(;B[2])');
    expect(result).toHaveProperty('total', 2);
    expect(result).toHaveProperty('trees');
    expect(Array.isArray(result.trees)).toBe(true);
  });

  test('transformTree and transformCollection can be combined', () => {
    const parser = new SGFParser({
      propertyMapper: IdentitySGFPropertyMapper,
      transformTree: (sequence, children: Array<{ nodeCount: number }>) => ({
        nodeCount: sequence.length + children.reduce((acc, c) => acc + (c.nodeCount || 0), 0),
      }),
      transformCollection: (collection) => ({
        totalNodes: collection.reduce((acc, t) => acc + (t.nodeCount || 0), 0),
      }),
    });
    const result = parser.parseCollection('(;A[1];B[2](;C[3])(;D[4]))(;E[5])');
    expect(result).toHaveProperty('totalNodes', 5);
  });
});

describe('Stringify methods', () => {
  const parser = new SGFParser();
  const identityParser = new SGFParser({ propertyMapper: IdentitySGFPropertyMapper });

  describe('stringifyProperties()', () => {
    test('Stringifies empty properties', () => {
      const properties = {};
      expect(parser.stringifyProperties(properties)).toBe('');
    });

    test('Stringifies single property with StandardSGFPropertyMapper', () => {
      const properties = { B: { x: 0, y: 0 } };
      expect(parser.stringifyProperties(properties)).toBe('B[aa]');
    });

    test('Stringifies multiple properties with StandardSGFPropertyMapper', () => {
      const properties = {
        B: { x: 0, y: 0 },
        C: 'test comment',
        KM: 6.5,
      };
      const result = parser.stringifyProperties(properties);
      // Properties can be in any order, so check each one is present
      expect(result).toContain('B[aa]');
      expect(result).toContain('C[test comment]');
      expect(result).toContain('KM[6.5]');
    });

    test('Stringifies properties with multiple values', () => {
      const properties = {
        AB: [
          { x: 0, y: 0 },
          { x: 1, y: 1 },
        ],
      };
      expect(parser.stringifyProperties(properties)).toBe('AB[aa][bb]');
    });

    test('Escapes special characters in property values', () => {
      const properties = {
        C: 'Comment with ] bracket and \\ backslash',
      };
      expect(parser.stringifyProperties(properties)).toBe(
        'C[Comment with \\] bracket and \\\\ backslash]',
      );
    });

    test('Handles undefined properties by omitting them', () => {
      const properties = {
        B: { x: 0, y: 0 },
        C: undefined,
        W: { x: 1, y: 1 },
      };
      const result = parser.stringifyProperties(properties);
      expect(result).toContain('B[aa]');
      expect(result).toContain('W[bb]');
      expect(result).not.toContain('C');
    });

    test('Works with IdentitySGFPropertyMapper', () => {
      const properties = {
        B: ['aa'],
        C: ['test comment'],
        AB: ['aa', 'bb'],
      };
      const result = identityParser.stringifyProperties(properties);
      expect(result).toContain('B[aa]');
      expect(result).toContain('C[test comment]');
      expect(result).toContain('AB[aa][bb]');
    });

    test('Handles complex properties like labels and lines', () => {
      const properties = {
        LB: [[{ x: 0, y: 0 }, 'A'] as [Point, string], [{ x: 1, y: 1 }, 'B'] as [Point, string]],
        AR: [
          [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
          ] as [Point, Point],
        ],
      };
      const result = parser.stringifyProperties(properties);
      expect(result).toContain('LB[aa:A][bb:B]');
      expect(result).toContain('AR[aa:bb]');
    });
  });

  describe('stringifyGameTree()', () => {
    test('Stringifies simple game tree', () => {
      const gameTree = {
        sequence: [{ GM: 1, FF: 4 }, { B: { x: 15, y: 3 } }, { W: { x: 3, y: 15 } }],
        children: [],
      };
      const result = parser.stringifyGameTree(gameTree);
      expect(result).toMatch(/^\(;.*\)$/);
      expect(result).toContain('GM[1]');
      expect(result).toContain('FF[4]');
      expect(result).toContain('B[pd]');
      expect(result).toContain('W[dp]');
    });

    test('Stringifies game tree with variations', () => {
      const gameTree = {
        sequence: [{ GM: 1 }, { B: { x: 0, y: 0 } }],
        children: [
          {
            sequence: [{ W: { x: 1, y: 1 } }],
            children: [],
          },
          {
            sequence: [{ W: { x: 2, y: 2 } }],
            children: [],
          },
        ],
      };
      const result = parser.stringifyGameTree(gameTree);
      expect(result).toMatch(/^\(;.*\(;.*\)\(;.*\)\)$/);
      expect(result).toContain('GM[1]');
      expect(result).toContain('B[aa]');
      expect(result).toContain('W[bb]');
      expect(result).toContain('W[cc]');
    });

    test('Stringifies deeply nested variations', () => {
      const gameTree = {
        sequence: [{ GM: 1 }],
        children: [
          {
            sequence: [{ B: { x: 0, y: 0 } }],
            children: [
              {
                sequence: [{ W: { x: 1, y: 1 } }],
                children: [],
              },
            ],
          },
        ],
      };
      const result = parser.stringifyGameTree(gameTree);
      expect(result).toMatch(/^\(;.*\(;.*\(;.*\)\)\)$/);
      expect(result).toContain('GM[1]');
      expect(result).toContain('B[aa]');
      expect(result).toContain('W[bb]');
    });

    test('Throws error for empty sequence', () => {
      const gameTree = {
        sequence: [],
        children: [],
      };
      expect(() => parser.stringifyGameTree(gameTree)).toThrow(
        'SGF game tree must contain at least one node in sequence',
      );
    });

    test('Works with IdentitySGFPropertyMapper', () => {
      const gameTree = {
        sequence: [{ GM: ['1'] }, { B: ['aa'] }],
        children: [],
      };
      const result = identityParser.stringifyGameTree(gameTree);
      expect(result).toBe('(;GM[1];B[aa])');
    });
  });

  describe('stringifyCollection()', () => {
    test('Stringifies single game collection', () => {
      const collection = [
        {
          sequence: [{ GM: 1, FF: 4 }, { B: { x: 0, y: 0 } }],
          children: [],
        },
      ];
      const result = parser.stringifyCollection(collection);
      expect(result).toMatch(/^\(;.*\)$/);
      expect(result).toContain('GM[1]');
      expect(result).toContain('FF[4]');
      expect(result).toContain('B[aa]');
    });

    test('Stringifies multiple games collection', () => {
      const collection = [
        {
          sequence: [{ GM: 1 }, { B: { x: 0, y: 0 } }],
          children: [],
        },
        {
          sequence: [{ GM: 1 }, { B: { x: 1, y: 1 } }],
          children: [],
        },
      ];
      const result = parser.stringifyCollection(collection);
      expect(result).toMatch(/^\(;.*\)\(;.*\)$/);
      expect(result).toContain('B[aa]');
      expect(result).toContain('B[bb]');
    });

    test('Throws error for empty collection', () => {
      const collection: any[] = [];
      expect(() => parser.stringifyCollection(collection)).toThrow(
        'SGF must contain at least one game tree',
      );
    });
  });

  describe('Round-trip tests', () => {
    test('Properties roundtrip correctly with StandardSGFPropertyMapper', () => {
      const originalSGF = 'GM[1]FF[4]SZ[19]KM[6.5]B[pd]W[dd]C[Test comment]AB[aa][bb]';
      const parsed = parser.parseProperties(originalSGF);
      const stringified = parser.stringifyProperties(parsed);

      // Parse the stringified version and compare with original
      const reparsed = parser.parseProperties(stringified);
      expect(reparsed).toEqual(parsed);
    });

    test('Properties roundtrip correctly with IdentitySGFPropertyMapper', () => {
      const originalSGF = 'GM[1]FF[4]SZ[19]KM[6.5]B[pd]W[dd]C[Test comment]AB[aa][bb]';
      const parsed = identityParser.parseProperties(originalSGF);
      const stringified = identityParser.stringifyProperties(parsed);
      const reparsed = identityParser.parseProperties(stringified);
      expect(reparsed).toEqual(parsed);
    });

    test('Game tree roundtrip correctly', () => {
      const originalSGF = '(;GM[1]FF[4];B[pd];W[dd](;B[pq])(;B[dp]))';
      const parsed = parser.parseTree(originalSGF);
      const stringified = parser.stringifyGameTree(parsed);
      const reparsed = parser.parseTree(stringified);
      expect(reparsed).toEqual(parsed);
    });

    test('Collection roundtrip correctly', () => {
      const originalSGF = '(;GM[1];B[pd])(;GM[1];B[dd])';
      const parsed = parser.parseCollection(originalSGF);
      const stringified = parser.stringifyCollection(parsed);
      const reparsed = parser.parseCollection(stringified);
      expect(reparsed).toEqual(parsed);
    });

    test('Complex SGF with variations and comments roundtrips correctly', () => {
      const originalSGF =
        '(;GM[1]FF[4]SZ[19]C[Root comment];B[pd]C[First move](;W[dd]C[Variation 1])(;W[dp]C[Variation 2]))';
      const parsed = parser.parseTree(originalSGF);
      const stringified = parser.stringifyGameTree(parsed);
      const reparsed = parser.parseTree(stringified);
      expect(reparsed).toEqual(parsed);
    });

    test('SGF with special characters roundtrips correctly', () => {
      const originalSGF = 'C[Comment with \\] and \\\\ characters]';
      const parsed = parser.parseProperties(originalSGF);
      const stringified = parser.stringifyProperties(parsed);
      const reparsed = parser.parseProperties(stringified);
      expect(reparsed).toEqual(parsed);
    });

    test('SGF with empty properties roundtrips correctly', () => {
      const originalSGF = 'KO[]FG[]';
      const parsed = identityParser.parseProperties(originalSGF);
      const stringified = identityParser.stringifyProperties(parsed);
      const reparsed = identityParser.parseProperties(stringified);
      expect(reparsed).toEqual(parsed);
    });
  });
});
