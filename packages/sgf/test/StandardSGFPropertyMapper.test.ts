import { describe, test, expect } from 'vitest';
import { StandardSGFPropertyMapper } from '../src/mapper/StandardSGFPropertyMapper';
import type { Point, StandardSGFProperties } from '../src/sgfTypes';

function pt(x: number, y: number): Point {
  return { x, y };
}

describe('StandardSGFPropertyMapper', () => {
  // Helper for roundtrip
  function roundtrip<K extends keyof StandardSGFProperties>(key: K, value: any, mapped: any) {
    expect(StandardSGFPropertyMapper.map(key, value)).toEqual(mapped);
    expect(StandardSGFPropertyMapper.unmap(key, mapped)).toEqual(value);
  }

  test('B/W (move)', () => {
    roundtrip('B', ['aa'], pt(0, 0));
    roundtrip('B', [], null);
    roundtrip('W', ['bb'], pt(1, 1));
    roundtrip('W', [], null);
  });

  test('KO', () => {
    roundtrip('KO', [], null);
  });

  test('MN', () => {
    roundtrip('MN', ['5'], 5);
  });

  test('FF', () => {
    roundtrip('FF', ['4'], 4);
  });

  test('GM', () => {
    roundtrip('GM', ['1'], 1);
  });

  test('ST', () => {
    roundtrip('ST', ['2'], 2);
  });

  test('SZ', () => {
    roundtrip('SZ', ['19'], 19);
    roundtrip('SZ', ['19:13'], [19, 13]);
  });

  test('V', () => {
    roundtrip('V', ['1'], 1);
  });

  test('TM', () => {
    roundtrip('TM', ['60'], 60);
  });

  test('BL', () => {
    roundtrip('BL', ['30'], 30);
  });

  test('OB', () => {
    roundtrip('OB', ['2'], 2);
  });

  test('OW', () => {
    roundtrip('OW', ['3'], 3);
  });

  test('WL', () => {
    roundtrip('WL', ['15'], 15);
  });

  test('PM', () => {
    roundtrip('PM', ['2'], 2);
  });

  test('HA', () => {
    roundtrip('HA', ['3'], 3);
  });

  test('KM', () => {
    roundtrip('KM', ['6.5'], 6.5);
  });

  test('AB/AE/AW/CR/DD/MA/SL/SQ/TR/TB/TW (point arrays)', () => {
    const arr = ['aa', 'bb', 'cc'];
    const pts = [pt(0, 0), pt(1, 1), pt(2, 2)];
    for (const key of ['AB', 'AE', 'AW', 'CR', 'DD', 'MA', 'SL', 'SQ', 'TR', 'TB', 'TW'] as const) {
      roundtrip(key, arr, pts);
    }
  });

  test('PL', () => {
    roundtrip('PL', ['B'], 'B');
    roundtrip('PL', ['W'], 'W');
  });

  test('C/DM/GB/GW/HO/N/UC/BM/DO/IT/TE/CA/AN/BR/BT/CP/DT/EV/GN/GC/ON/OT/PB/PC/PW/RE/RO/RU/SO/US/WR/WT (string)', () => {
    const keys = [
      'C',
      'DM',
      'GB',
      'GW',
      'HO',
      'N',
      'UC',
      'BM',
      'DO',
      'IT',
      'TE',
      'CA',
      'AN',
      'BR',
      'BT',
      'CP',
      'DT',
      'EV',
      'GN',
      'GC',
      'ON',
      'OT',
      'PB',
      'PC',
      'PW',
      'RE',
      'RO',
      'RU',
      'SO',
      'US',
      'WR',
      'WT',
    ] as const;
    for (const key of keys) {
      roundtrip(key, ['foo'], 'foo');
    }
  });

  test('AR/LN (line arrays)', () => {
    roundtrip(
      'AR',
      ['aa:bb', 'cc:dd'],
      [
        [pt(0, 0), pt(1, 1)],
        [pt(2, 2), pt(3, 3)],
      ],
    );
    roundtrip('LN', ['ee:ff'], [[pt(4, 4), pt(5, 5)]]);
  });

  test('LB (label array)', () => {
    roundtrip(
      'LB',
      ['aa:A', 'bb:B'],
      [
        [pt(0, 0), 'A'],
        [pt(1, 1), 'B'],
      ],
    );
  });

  test('AP', () => {
    roundtrip('AP', ['foo:bar'], ['foo', 'bar']);
  });

  test('FG', () => {
    roundtrip('FG', ['1:foo'], [1, 'foo']);
    expect(StandardSGFPropertyMapper.map('FG', [''])).toBeNull();
    expect(StandardSGFPropertyMapper.unmap('FG', null)).toEqual([]);
  });

  test('VW', () => {
    roundtrip('VW', ['aa:bb'], [pt(0, 0), pt(1, 1)]);
  });
});
