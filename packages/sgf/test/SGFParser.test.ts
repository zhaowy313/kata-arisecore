import { SGFSyntaxError, SGFParser, IdentitySGFPropertyMapper } from '../src';
import { describe, test, expect } from 'vitest';

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
      visitNode: (node, context) => {
        visited.push({ node, position: context.position });
      },
    });
    parser.parseCollection('(;A[1];B[2](;C[3])(;D[4]))');

    expect(visited.length).toBe(4);
    expect(visited[0].node).toHaveProperty('A');
    expect(visited[0].position).toBe(6);
    expect(visited.some((v) => v.node.B)).toBe(true);
    expect(visited.some((v) => v.node.C)).toBe(true);
    expect(visited.some((v) => v.node.D)).toBe(true);
  });

  test('Custom context data is preserved', () => {
    const parser = new SGFParser({
      visitNode: (_node, context: { count: number }) => {
        context.count++;
      },
    });
    const ctx = { count: 0 };
    parser.parseCollection('(;A[1];B[2](;C[3])(;D[4]))', ctx);
    expect(ctx.count).toBe(4);
  });

  test('Config `transformTree` works', () => {
    const parser = new SGFParser({
      transformTree: (
        sequence,
        children: Array<{ seqLen: number; childCount: number }>,
        _context,
      ) => ({
        seqLen: sequence.length,
        childCount: children.length,
      }),
    });
    const tree = parser.parseTree('(;A[1];B[2](;C[3])(;D[4]))');
    expect(tree).toEqual({ seqLen: 2, childCount: 2 });
  });

  test('Config `transformCollection` change output structure', () => {
    const parser = new SGFParser({
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
