import { SGFSyntaxError, SGFParser } from '../src/sgf';
import { describe, test, expect } from 'vitest';

describe('SGFParser', () => {
  const parser = new SGFParser();

  // describe('Parsing properties - parseProperties()', () => {});

  describe('Parsing nodes - parseNode()', () => {
    test('Parsing empty value', () => {
      expect(parser.parseNode(';DM[]')).toEqual({ DM: [''] });
    });

    test('Parsing single value', () => {
      expect(parser.parseNode(';B[aa]')).toEqual({ B: ['aa'] });
    });

    test('Parsing multiple values', () => {
      expect(parser.parseNode(';AB[aa][bb][cc]')).toEqual({ AB: ['aa', 'bb', 'cc'] });
    });

    test('Parsing special characters', () => {
      expect(parser.parseNode(';C[SGF property:\nC\\[\\\\\\]]')).toEqual({
        C: ['SGF property:\nC[\\]'],
      });
    });

    test('Parsing multiple properties', () => {
      expect(parser.parseNode(';W[aa]C[foo bar]SQ[ab][ba]')).toEqual({
        W: ['aa'],
        C: ['foo bar'],
        SQ: ['ab', 'ba'],
      });
    });

    test('Correctly ignoring whitespace characters', () => {
      expect(parser.parseNode(' ; \nB [aa] TR\n[ab]\n[ba]')).toEqual({
        B: ['aa'],
        TR: ['ab', 'ba'],
      });
    });

    test('Throws error when value is missing', () => {
      expect(() => parser.parseNode(';W')).toThrow(SGFSyntaxError);
    });

    test('Throws error when closing bracket is missing', () => {
      expect(() => parser.parseNode(';B[aa')).toThrow(SGFSyntaxError);
    });

    test('Correctly parses a node', () => {
      expect(parser.parseNode(';AB[aa]AW[bb][cc]')).toEqual({ AB: ['aa'], AW: ['bb', 'cc'] });
    });

    test('Correctly parses an empty node', () => {
      expect(parser.parseNode(';')).toEqual({});
    });

    test("Throws error when node isn't starting with `;`.", () => {
      expect(() => parser.parseNode('B[aa]')).toThrow(SGFSyntaxError);
    });
  });

  describe('Parsing node sequence - parseSequence()', () => {
    test('Correctly parses a node sequence', () => {
      expect(parser.parseSequence(';DT[2100-12-01]KM[7.5];B[aa];W[bb]')).toEqual([
        { DT: ['2100-12-01'], KM: ['7.5'] },
        { B: ['aa'] },
        { W: ['bb'] },
      ]);
    });

    test('Correctly ignoring whitespace characters', () => {
      expect(parser.parseSequence('; B[aa] ; ;\nW[bb]')).toEqual([
        { B: ['aa'] },
        {},
        { W: ['bb'] },
      ]);
    });
  });

  describe('Parsing a game tree - parseGameTree()', () => {
    test('Correctly parses simple game tree without children', () => {
      expect(parser.parseGameTree('(;DT[2100-12-01]KM[7.5];B[aa];W[bb])')).toEqual({
        sequence: [{ DT: ['2100-12-01'], KM: ['7.5'] }, { B: ['aa'] }, { W: ['bb'] }],
        children: [],
      });
    });

    test('Correctly parses game tree with children', () => {
      expect(
        parser.parseGameTree(
          '(;DT[2100-12-01]KM[7.5](;B[aa];W[bb](;B[ee])(;B[ff]))(;B[cc];W[dd]))',
        ),
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

    test("Throws error when game tree isn' closed.", () => {
      expect(() => parser.parseGameTree('(;B[aa](;W[ee](;W[ff]))')).toThrow(SGFSyntaxError);
    });
  });

  describe('Parsing a SGF - parseCollection()', () => {
    test('Correctly parses SGF.', () => {
      expect(parser.parseCollection('(;DT[2100-12-01](;B[aa])(;B[bb]))(;KM[7.5])')).toEqual([
        {
          sequence: [{ DT: ['2100-12-01'] }],
          children: [
            {
              sequence: [{ B: ['aa'] }],
              children: [],
            },
            {
              sequence: [{ B: ['bb'] }],
              children: [],
            },
          ],
        },
        {
          sequence: [{ KM: ['7.5'] }],
          children: [],
        },
      ]);
    });

    test('Throws error when there is no game tree.', () => {
      expect(() => parser.parseCollection(';B[aa]')).toThrow(SGFSyntaxError);
    });
  });
});
