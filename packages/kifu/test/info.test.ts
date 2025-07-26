import { describe, test, expect } from 'vitest';
import { KifuInfo, KifuPlayerInfo, KifuInfoCustom, Result, KnownGoRule } from '../src';
import { Color, BoardSize } from '@wgojs/common';

describe('KnownGoRule enum', () => {
  test('should contain all expected rule types', () => {
    expect(KnownGoRule.AGA).toBe('AGA');
    expect(KnownGoRule.GOE).toBe('GOE');
    expect(KnownGoRule.Japanese).toBe('Japanese');
    expect(KnownGoRule.NZ).toBe('NZ');
    expect(KnownGoRule.Chinese).toBe('Chinese');
  });
});

describe('KifuInfo helper methods', () => {
  describe('KifuInfo.empty', () => {
    test('should be an empty object', () => {
      expect(KifuInfo.empty).toEqual({});
    });
  });

  describe('KifuInfo.update', () => {
    test('should update info with new properties', () => {
      const originalInfo = {
        gameName: 'Original Game',
        event: 'Championship',
      };

      const result = KifuInfo.update(originalInfo, {
        gameName: 'Updated Game',
        place: 'Tokyo',
      });

      expect(result).toEqual({
        gameName: 'Updated Game',
        event: 'Championship',
        place: 'Tokyo',
      });
      expect(result).not.toBe(originalInfo); // Should be a new object
    });

    test('should work with empty info', () => {
      const result = KifuInfo.update(
        {},
        {
          gameName: 'New Game',
          handicap: 2,
        },
      );

      expect(result).toEqual({
        gameName: 'New Game',
        handicap: 2,
      });
    });

    test('should work with curried version', () => {
      const updateWithGameName = KifuInfo.update({ gameName: 'Test Game' });
      const result = updateWithGameName({ event: 'Tournament' });

      expect(result).toEqual({
        gameName: 'Test Game',
        event: 'Tournament',
      });
    });
  });

  describe('KifuInfo.setBlack', () => {
    test('should add black player info', () => {
      const info = { gameName: 'Test Game' };
      const blackInfo = { name: 'Black Player', rank: '5d' };

      const result = KifuInfo.setBlack(info, blackInfo);

      expect(result).toEqual({
        gameName: 'Test Game',
        black: {
          name: 'Black Player',
          rank: '5d',
        },
      });
    });

    test('should merge with existing black player info', () => {
      const info = {
        black: { name: 'Original Name', rank: '3k' },
        white: { name: 'White Player' },
      };
      const blackInfo = { rank: '5d', team: 'Team A' };

      const result = KifuInfo.setBlack(info, blackInfo);

      expect(result).toEqual({
        black: {
          name: 'Original Name',
          rank: '5d',
          team: 'Team A',
        },
        white: { name: 'White Player' },
      });
    });

    test('should work with curried version', () => {
      const setBlackRank = KifuInfo.setBlack({ rank: '7d' });
      const result = setBlackRank({
        black: { name: 'Player' },
        gameName: 'Test',
      });

      expect(result).toEqual({
        black: {
          name: 'Player',
          rank: '7d',
        },
        gameName: 'Test',
      });
    });
  });

  describe('KifuInfo.setWhite', () => {
    test('should add white player info', () => {
      const info = { gameName: 'Test Game' };
      const whiteInfo = { name: 'White Player', rank: '1d' };

      const result = KifuInfo.setWhite(info, whiteInfo);

      expect(result).toEqual({
        gameName: 'Test Game',
        white: {
          name: 'White Player',
          rank: '1d',
        },
      });
    });

    test('should merge with existing white player info', () => {
      const info = {
        white: { name: 'Original Name', rank: '2k' },
        black: { name: 'Black Player' },
      };
      const whiteInfo = { rank: '1d', team: 'Team B' };

      const result = KifuInfo.setWhite(info, whiteInfo);

      expect(result).toEqual({
        white: {
          name: 'Original Name',
          rank: '1d',
          team: 'Team B',
        },
        black: { name: 'Black Player' },
      });
    });

    test('should work with curried version', () => {
      const setWhiteTeam = KifuInfo.setWhite({ team: 'Champions' });
      const result = setWhiteTeam({
        white: { name: 'Player' },
        event: 'Tournament',
      });

      expect(result).toEqual({
        white: {
          name: 'Player',
          team: 'Champions',
        },
        event: 'Tournament',
      });
    });
  });

  describe('KifuInfo.setCustom', () => {
    test('should add custom properties', () => {
      const info = { gameName: 'Test Game' };
      const custom = { customProp: 'value', anotherProp: 42 };

      const result = KifuInfo.setCustom(info, custom);

      expect(result).toEqual({
        gameName: 'Test Game',
        custom: {
          customProp: 'value',
          anotherProp: 42,
        },
      });
    });

    test('should merge with existing custom properties', () => {
      const info = {
        custom: { existingProp: 'old', overrideProp: 'original' },
        gameName: 'Test',
      };
      const custom = { overrideProp: 'new', newProp: true };

      const result = KifuInfo.setCustom(info, custom);

      expect(result).toEqual({
        custom: {
          existingProp: 'old',
          overrideProp: 'new',
          newProp: true,
        },
        gameName: 'Test',
      });
    });

    test('should work with curried version', () => {
      const setRating = KifuInfo.setCustom({ rating: 2150 });
      const result = setRating({
        custom: { source: 'online' },
        gameName: 'Rated Game',
      });

      expect(result).toEqual({
        custom: {
          source: 'online',
          rating: 2150,
        },
        gameName: 'Rated Game',
      });
    });
  });
});

describe('Result helper methods', () => {
  describe('Result.create', () => {
    test('should create result for Black wins', () => {
      expect(Result.create(Color.B)).toBe('B+');
      expect(Result.create(Color.B, 5.5)).toBe('B+5.5');
      expect(Result.create(Color.B, 'resign')).toBe('B+Resign');
      expect(Result.create(Color.B, 'R')).toBe('B+Resign');
      expect(Result.create(Color.B, 'time')).toBe('B+Time');
      expect(Result.create(Color.B, 'T')).toBe('B+Time');
      expect(Result.create(Color.B, 'forfeit')).toBe('B+Forfeit');
      expect(Result.create(Color.B, 'F')).toBe('B+Forfeit');
    });

    test('should create result for White wins', () => {
      expect(Result.create(Color.W)).toBe('W+');
      expect(Result.create(Color.W, 2.5)).toBe('W+2.5');
      expect(Result.create(Color.W, 'resign')).toBe('W+Resign');
      expect(Result.create(Color.W, 'R')).toBe('W+Resign');
      expect(Result.create(Color.W, 'time')).toBe('W+Time');
      expect(Result.create(Color.W, 'T')).toBe('W+Time');
      expect(Result.create(Color.W, 'forfeit')).toBe('W+Forfeit');
      expect(Result.create(Color.W, 'F')).toBe('W+Forfeit');
    });

    test('should create result for draws', () => {
      expect(Result.create(Color.E)).toBe('Draw');
      expect(Result.create(Color.E, 'draw')).toBe('Draw');
      expect(Result.create(Color.E, 'DRAW')).toBe('Draw');
      expect(Result.create(Color.E, '0')).toBe('Draw');
      expect(Result.create(Color.E, 'void')).toBe('Void');
      expect(Result.create(Color.E, 'VOID')).toBe('Void');
    });

    test('should return unknown result for invalid inputs', () => {
      expect(Result.create()).toBe('?');
      expect(Result.create(undefined)).toBe('?');
      expect(Result.create(Color.B, 'invalid')).toBe('B+');
      expect(Result.create(Color.E, 'invalid')).toBe('?');
    });

    test('should handle case insensitive inputs', () => {
      expect(Result.create(Color.B, 'RESIGN')).toBe('B+Resign');
      expect(Result.create(Color.W, 'TIME')).toBe('W+Time');
      expect(Result.create(Color.B, 'FORFEIT')).toBe('B+Forfeit');
    });
  });

  describe('Result.isValid', () => {
    test('should validate correct result formats', () => {
      // Basic results
      expect(Result.isValid('0')).toBe(true);
      expect(Result.isValid('Draw')).toBe(true);
      expect(Result.isValid('Void')).toBe(true);
      expect(Result.isValid('?')).toBe(true);

      // Black wins
      expect(Result.isValid('B+')).toBe(true);
      expect(Result.isValid('B+5')).toBe(true);
      expect(Result.isValid('B+5.5')).toBe(true);
      expect(Result.isValid('B+R')).toBe(true);
      expect(Result.isValid('B+Resign')).toBe(true);
      expect(Result.isValid('B+T')).toBe(true);
      expect(Result.isValid('B+Time')).toBe(true);
      expect(Result.isValid('B+F')).toBe(true);
      expect(Result.isValid('B+Forfeit')).toBe(true);

      // White wins
      expect(Result.isValid('W+')).toBe(true);
      expect(Result.isValid('W+2.5')).toBe(true);
      expect(Result.isValid('W+R')).toBe(true);
      expect(Result.isValid('W+Resign')).toBe(true);
      expect(Result.isValid('W+T')).toBe(true);
      expect(Result.isValid('W+Time')).toBe(true);
      expect(Result.isValid('W+F')).toBe(true);
      expect(Result.isValid('W+Forfeit')).toBe(true);
    });

    test('should reject invalid result formats', () => {
      expect(Result.isValid('')).toBe(false);
      expect(Result.isValid(undefined)).toBe(false);
      expect(Result.isValid('Invalid')).toBe(false);
      expect(Result.isValid('B')).toBe(false);
      expect(Result.isValid('W')).toBe(false);
      expect(Result.isValid('B+Invalid')).toBe(false);
      expect(Result.isValid('W+Invalid')).toBe(false);
      expect(Result.isValid('X+5')).toBe(false);
      expect(Result.isValid('B+5.5.5')).toBe(false);
    });
  });

  describe('Result.getWinner', () => {
    test('should return Black for Black wins', () => {
      expect(Result.getWinner('B+')).toBe(Color.B);
      expect(Result.getWinner('B+5.5')).toBe(Color.B);
      expect(Result.getWinner('B+Resign')).toBe(Color.B);
      expect(Result.getWinner('B+Time')).toBe(Color.B);
    });

    test('should return White for White wins', () => {
      expect(Result.getWinner('W+')).toBe(Color.W);
      expect(Result.getWinner('W+2.5')).toBe(Color.W);
      expect(Result.getWinner('W+Resign')).toBe(Color.W);
      expect(Result.getWinner('W+Time')).toBe(Color.W);
    });

    test('should return Empty for draws or no winner', () => {
      expect(Result.getWinner('Draw')).toBe(Color.E);
      expect(Result.getWinner('Void')).toBe(Color.E);
      expect(Result.getWinner('0')).toBe(Color.E);
      expect(Result.getWinner('?')).toBe(Color.E);
    });
  });

  describe('Result.getScore', () => {
    test('should extract numeric scores', () => {
      expect(Result.getScore('B+5.5')).toBe(5.5);
      expect(Result.getScore('W+2')).toBe(2);
      expect(Result.getScore('B+0.5')).toBe(0.5);
      expect(Result.getScore('W+10')).toBe(10);
    });

    test('should return null for non-numeric results', () => {
      expect(Result.getScore('B+')).toBeNull();
      expect(Result.getScore('B+Resign')).toBeNull();
      expect(Result.getScore('W+Time')).toBeNull();
      expect(Result.getScore('Draw')).toBeNull();
      expect(Result.getScore('?')).toBeNull();
    });
  });

  describe('Result.fromCounting', () => {
    test('should create Black win result', () => {
      expect(Result.fromCounting(100, 95)).toBe('B+5');
      expect(Result.fromCounting(100.5, 95)).toBe('B+5.5');
    });

    test('should create White win result', () => {
      expect(Result.fromCounting(95, 100)).toBe('W+5');
      expect(Result.fromCounting(95, 100.5)).toBe('W+5.5');
    });

    test('should create Draw result for equal scores', () => {
      expect(Result.fromCounting(100, 100)).toBe('Draw');
      expect(Result.fromCounting(95.5, 95.5)).toBe('Draw');
    });

    test('should handle zero scores', () => {
      expect(Result.fromCounting(0, 0)).toBe('Draw');
      expect(Result.fromCounting(5, 0)).toBe('B+5');
      expect(Result.fromCounting(0, 3)).toBe('W+3');
    });
  });
});

describe('Type definitions', () => {
  test('KifuPlayerInfo should accept valid player information', () => {
    const player: KifuPlayerInfo = {
      name: 'Test Player',
      rank: '5d',
      team: 'Team A',
    };

    expect(player.name).toBe('Test Player');
    expect(player.rank).toBe('5d');
    expect(player.team).toBe('Team A');
  });

  test('KifuPlayerInfo should accept partial information', () => {
    const player1: KifuPlayerInfo = { name: 'Player 1' };
    const player2: KifuPlayerInfo = { rank: '3k' };
    const player3: KifuPlayerInfo = {};

    expect(player1.name).toBe('Player 1');
    expect(player2.rank).toBe('3k');
    expect(player3).toEqual({});
  });

  test('KifuInfoCustom should accept any string key', () => {
    const custom: KifuInfoCustom = {
      rating: 2150,
      server: 'KGS',
      gameType: 'ranked',
      customFlag: true,
    };

    expect(custom.rating).toBe(2150);
    expect(custom.server).toBe('KGS');
    expect(custom.gameType).toBe('ranked');
    expect(custom.customFlag).toBe(true);
  });

  test('BoardSize should accept number or object', () => {
    const size1: BoardSize = 19;
    const size2: BoardSize = { cols: 19, rows: 13 };

    expect(size1).toBe(19);
    expect(size2).toEqual({ cols: 19, rows: 13 });
  });

  test('Result type should accept valid result strings', () => {
    const results: Result[] = [
      '0',
      'Draw',
      'Void',
      '?',
      'B+',
      'B+5.5',
      'B+R',
      'B+Resign',
      'B+T',
      'B+Time',
      'B+F',
      'B+Forfeit',
      'W+',
      'W+2.5',
      'W+R',
      'W+Resign',
      'W+T',
      'W+Time',
      'W+F',
      'W+Forfeit',
    ];

    results.forEach((result) => {
      expect(typeof result).toBe('string');
    });
  });

  test('KifuInfo should accept all valid properties', () => {
    const info: KifuInfo = {
      boardSize: 19,
      handicap: 2,
      komi: 6.5,
      black: { name: 'Black Player', rank: '5d' },
      white: { name: 'White Player', rank: '3k' },
      variationsStyle: {
        currentNode: true,
        noMarkup: false,
      },
      gameName: 'Test Game',
      gameComment: 'A test game',
      date: '2024-01-15',
      event: 'Championship',
      place: 'Tokyo',
      round: 'Final',
      result: 'B+5.5',
      timeLimit: 3600,
      overTime: '30/5min',
      rules: KnownGoRule.Japanese,
      source: 'SGF File',
      author: 'Test Author',
      annotator: 'Test Annotator',
      copyright: '2024 Test',
      custom: {
        rating: 2150,
        server: 'online',
      },
    };

    expect(info.boardSize).toBe(19);
    expect(info.handicap).toBe(2);
    expect(info.komi).toBe(6.5);
    expect(info.black?.name).toBe('Black Player');
    expect(info.white?.name).toBe('White Player');
    expect(info.variationsStyle?.currentNode).toBe(true);
    expect(info.gameName).toBe('Test Game');
    expect(info.gameComment).toBe('A test game');
    expect(info.date).toBe('2024-01-15');
    expect(info.event).toBe('Championship');
    expect(info.place).toBe('Tokyo');
    expect(info.round).toBe('Final');
    expect(info.result).toBe('B+5.5');
    expect(info.timeLimit).toBe(3600);
    expect(info.overTime).toBe('30/5min');
    expect(info.rules).toBe(KnownGoRule.Japanese);
    expect(info.source).toBe('SGF File');
    expect(info.author).toBe('Test Author');
    expect(info.annotator).toBe('Test Annotator');
    expect(info.copyright).toBe('2024 Test');
    expect(info.custom?.rating).toBe(2150);
  });
});

describe('KifuInfo.toSGFProperties', () => {
  test('should convert KifuInfo to SGF properties', () => {
    const info: KifuInfo = {
      boardSize: 19,
      handicap: 2,
      komi: 6.5,
      black: { name: 'Black Player', rank: '5d', team: 'Team A' },
      white: { name: 'White Player', rank: '3k', team: 'Team B' },
      variationsStyle: {
        currentNode: true,
        noMarkup: false,
      },
      gameName: 'Test Game',
      gameComment: 'A test game',
      date: '2024-01-15',
      event: 'Championship',
      place: 'Tokyo',
      round: 'Final',
      result: 'B+5.5',
      timeLimit: 3600,
      overTime: '30/5min',
      rules: KnownGoRule.Japanese,
      source: 'SGF File',
      author: 'Test Author',
      annotator: 'Test Annotator',
      copyright: '2024 Test',
    };
    const properties = KifuInfo.toSGFProperties(info);
    expect(properties).toEqual({
      SZ: 19,
      HA: 2,
      KM: 6.5,
      PB: 'Black Player',
      BR: '5d',
      BT: 'Team A',
      PW: 'White Player',
      WR: '3k',
      WT: 'Team B',
      GN: 'Test Game',
      GC: 'A test game',
      DT: '2024-01-15',
      EV: 'Championship',
      PC: 'Tokyo',
      RO: 'Final',
      RE: 'B+5.5',
      TM: 3600,
      OT: '30/5min',
      RU: KnownGoRule.Japanese,
      SO: 'SGF File',
      AN: 'Test Annotator',
      US: 'Test Author',
      CP: '2024 Test',
      ST: 1,
    });
  });
});
