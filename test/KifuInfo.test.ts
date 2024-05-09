import { kifuInfoSGFPropertyDescriptors } from '../src/kifu/kifuInfoSGFPropertyDescriptors';
import { KifuInfo } from '../src/kifu';
import { PropIdent } from '../src/sgf';
import { describe, test, assert } from 'vitest';

describe('Correct transformation from SGF property values.', () => {
  let tests = 0;

  test('Property SZ', () => {
    tests++;
    const info = KifuInfo.fromSGF('SZ[19]');
    assert.strictEqual(info.boardSize, 19);

    const info2 = KifuInfo.fromSGF('SZ[9:13]');
    assert.deepEqual(info2.boardSize, { cols: 9, rows: 13 });
  });

  test('Property HA', () => {
    tests++;
    const info = KifuInfo.fromSGF('HA[2]');
    assert.strictEqual(info.handicap, 2);
  });

  test('Property KM', () => {
    tests++;
    const info = KifuInfo.fromSGF('KM[5.5]');
    assert.strictEqual(info.komi, 5.5);
  });

  test('Property ST', () => {
    tests++;
    const info = KifuInfo.fromSGF('ST[1]');
    assert.deepEqual(info.variationsStyle, { currentNode: true, noMarkup: false });

    const info2 = KifuInfo.fromSGF('ST[2]');
    assert.deepEqual(info2.variationsStyle, { currentNode: false, noMarkup: true });

    const info3 = KifuInfo.fromSGF('ST[3]');
    assert.deepEqual(info3.variationsStyle, { currentNode: true, noMarkup: true });
  });

  test('Property PB', () => {
    tests++;
    const info = KifuInfo.fromSGF('PB[John Doe]');
    assert.strictEqual(info.blackName, 'John Doe');
  });

  test('Property BR', () => {
    tests++;
    const info = KifuInfo.fromSGF('BR[1d]');
    assert.strictEqual(info.blackRank, '1d');
  });

  test('Property BT', () => {
    tests++;
    const info = KifuInfo.fromSGF('BT[Team Black]');
    assert.strictEqual(info.blackTeam, 'Team Black');
  });

  test('Property PW', () => {
    tests++;
    const info = KifuInfo.fromSGF('PW[Jane Doe]');
    assert.strictEqual(info.whiteName, 'Jane Doe');
  });

  test('Property WR', () => {
    tests++;
    const info = KifuInfo.fromSGF('WR[2d]');
    assert.strictEqual(info.whiteRank, '2d');
  });

  test('Property WT', () => {
    tests++;
    const info = KifuInfo.fromSGF('WT[Team White]');
    assert.strictEqual(info.whiteTeam, 'Team White');
  });

  test('Property GN', () => {
    tests++;
    const info = KifuInfo.fromSGF('GN[Game Name]');
    assert.strictEqual(info.gameName, 'Game Name');
  });

  test('Property GC', () => {
    tests++;
    const info = KifuInfo.fromSGF('GC[Game Comment]');
    assert.strictEqual(info.gameComment, 'Game Comment');
  });

  test('Property DT', () => {
    tests++;
    const info = KifuInfo.fromSGF('DT[2020-01-01]');
    assert.strictEqual(info.date, '2020-01-01');
  });

  test('Property EV', () => {
    tests++;
    const info = KifuInfo.fromSGF('EV[Event]');
    assert.strictEqual(info.event, 'Event');
  });

  test('Property PC', () => {
    tests++;
    const info = KifuInfo.fromSGF('PC[Place]');
    assert.strictEqual(info.place, 'Place');
  });

  test('Property RO', () => {
    tests++;
    const info = KifuInfo.fromSGF('RO[Round]');
    assert.strictEqual(info.round, 'Round');
  });

  test('Property RE', () => {
    tests++;
    const info = KifuInfo.fromSGF('RE[B+R]');
    assert.strictEqual(info.result, 'B+R');
  });

  test('Property TM', () => {
    tests++;
    const info = KifuInfo.fromSGF('TM[600]');
    assert.strictEqual(info.timeLimits, 600);
  });

  test('Property OT', () => {
    tests++;
    const info = KifuInfo.fromSGF('OT[5x30 byo-yomi]');
    assert.strictEqual(info.overTime, '5x30 byo-yomi');
  });

  test('Property RU', () => {
    tests++;
    const info = KifuInfo.fromSGF('RU[Japanese]');
    assert.strictEqual(info.rules, 'Japanese');
  });

  test('Property SO', () => {
    tests++;
    const info = KifuInfo.fromSGF('SO[Source]');
    assert.strictEqual(info.source, 'Source');
  });

  test('Property US', () => {
    tests++;
    const info = KifuInfo.fromSGF('US[User]');
    assert.strictEqual(info.author, 'User');
  });

  test('Property AN', () => {
    tests++;
    const info = KifuInfo.fromSGF('AN[Annotation]');
    assert.strictEqual(info.annotator, 'Annotation');
  });

  test('Property CP', () => {
    tests++;
    const info = KifuInfo.fromSGF('CP[copyright]');
    assert.strictEqual(info.copyright, 'copyright');
  });

  test('Test of all property types', () => {
    assert.strictEqual(tests, Object.keys(kifuInfoSGFPropertyDescriptors).length);
  });

  test('Unknown property', () => {
    const info = KifuInfo.fromSGF('XX[test][test2]');
    assert.deepEqual(info.properties.XX, ['test', 'test2']);
  });
});

describe('Correct clear of SGF property values.', () => {
  let tests = 0;

  test('Property SZ', () => {
    tests++;
    const info = KifuInfo.fromSGF('SZ[19]');
    info.setSGFProperty(PropIdent.BoardSize, []);
    assert.strictEqual(info.boardSize, undefined);
  });

  test('Property HA', () => {
    tests++;
    const info = KifuInfo.fromSGF('HA[2]');
    info.setSGFProperty(PropIdent.Handicap, []);
    assert.strictEqual(info.handicap, undefined);
  });

  test('Property KM', () => {
    tests++;
    const info = KifuInfo.fromSGF('KM[5.5]');
    info.setSGFProperty(PropIdent.Komi, []);
    assert.strictEqual(info.komi, undefined);
  });

  test('Property ST', () => {
    tests++;
    const info = KifuInfo.fromSGF('ST[1]');
    info.setSGFProperty(PropIdent.VariationsStyle, []);
    assert.strictEqual(info.variationsStyle, undefined);
  });

  test('Property PB', () => {
    tests++;
    const info = KifuInfo.fromSGF('PB[John Doe]');
    info.setSGFProperty(PropIdent.BlackName, []);
    assert.strictEqual(info.blackName, undefined);
  });

  test('Property BR', () => {
    tests++;
    const info = KifuInfo.fromSGF('BR[1d]');
    info.setSGFProperty(PropIdent.BlackRank, []);
    assert.strictEqual(info.blackRank, undefined);
  });

  test('Property BT', () => {
    tests++;
    const info = KifuInfo.fromSGF('BT[Team Black]');
    info.setSGFProperty(PropIdent.BlackTeam, []);
    assert.strictEqual(info.blackTeam, undefined);
  });

  test('Property PW', () => {
    tests++;
    const info = KifuInfo.fromSGF('PW[Jane Doe]');
    info.setSGFProperty(PropIdent.WhiteName, []);
    assert.strictEqual(info.whiteName, undefined);
  });

  test('Property WR', () => {
    tests++;
    const info = KifuInfo.fromSGF('WR[2d]');
    info.setSGFProperty(PropIdent.WhiteRank, []);
    assert.strictEqual(info.whiteRank, undefined);
  });

  test('Property WT', () => {
    tests++;
    const info = KifuInfo.fromSGF('WT[Team White]');
    info.setSGFProperty(PropIdent.WhiteTeam, []);
    assert.strictEqual(info.whiteTeam, undefined);
  });

  test('Property GN', () => {
    tests++;
    const info = KifuInfo.fromSGF('GN[Game Name]');
    info.setSGFProperty(PropIdent.GameName, []);
    assert.strictEqual(info.gameName, undefined);
  });

  test('Property GC', () => {
    tests++;
    const info = KifuInfo.fromSGF('GC[Game Comment]');
    info.setSGFProperty(PropIdent.GameComment, []);
    assert.strictEqual(info.gameComment, undefined);
  });

  test('Property DT', () => {
    tests++;
    const info = KifuInfo.fromSGF('DT[2020-01-01]');
    info.setSGFProperty(PropIdent.Date, []);
    assert.strictEqual(info.date, undefined);
  });

  test('Property EV', () => {
    tests++;
    const info = KifuInfo.fromSGF('EV[Event]');
    info.setSGFProperty(PropIdent.Event, []);
    assert.strictEqual(info.event, undefined);
  });

  test('Property PC', () => {
    tests++;
    const info = KifuInfo.fromSGF('PC[Place]');
    info.setSGFProperty(PropIdent.Place, []);
    assert.strictEqual(info.place, undefined);
  });

  test('Property RO', () => {
    tests++;
    const info = KifuInfo.fromSGF('RO[Round]');
    info.setSGFProperty(PropIdent.Round, []);
    assert.strictEqual(info.round, undefined);
  });

  test('Property RE', () => {
    tests++;
    const info = KifuInfo.fromSGF('RE[B+R]');
    info.setSGFProperty(PropIdent.Result, []);
    assert.strictEqual(info.result, undefined);
  });

  test('Property TM', () => {
    tests++;
    const info = KifuInfo.fromSGF('TM[600]');
    info.setSGFProperty(PropIdent.TimeLimits, []);
    assert.strictEqual(info.timeLimits, undefined);
  });

  test('Property OT', () => {
    tests++;
    const info = KifuInfo.fromSGF('OT[5x30 byo-yomi]');
    info.setSGFProperty(PropIdent.OverTime, []);
    assert.strictEqual(info.overTime, undefined);
  });

  test('Property RU', () => {
    tests++;
    const info = KifuInfo.fromSGF('RU[Japanese]');
    info.setSGFProperty(PropIdent.Rules, []);
    assert.strictEqual(info.rules, undefined);
  });

  test('Property SO', () => {
    tests++;
    const info = KifuInfo.fromSGF('SO[Source]');
    info.setSGFProperty(PropIdent.Source, []);
    assert.strictEqual(info.source, undefined);
  });

  test('Property US', () => {
    tests++;
    const info = KifuInfo.fromSGF('US[User]');
    info.setSGFProperty(PropIdent.Author, []);
    assert.strictEqual(info.author, undefined);
  });

  test('Property AN', () => {
    tests++;
    const info = KifuInfo.fromSGF('AN[Annotation]');
    info.setSGFProperty(PropIdent.Annotator, []);
    assert.strictEqual(info.annotator, undefined);
  });

  test('Property CP', () => {
    tests++;
    const info = KifuInfo.fromSGF('CP[copyright]');
    info.setSGFProperty(PropIdent.Copyright, []);
    assert.strictEqual(info.copyright, undefined);
  });

  test('Test of all property types', () => {
    assert.strictEqual(tests, Object.keys(kifuInfoSGFPropertyDescriptors).length);
  });

  test('Unknown property', () => {
    const info = KifuInfo.fromSGF('XX[test][test2]');
    assert.deepEqual(info.properties.XX, ['test', 'test2']);
  });
});

describe('Correct transformation to SGF property values.', () => {
  let tests = 0;

  test('Property SZ', () => {
    tests++;
    const info = KifuInfo.fromJS({ boardSize: 19 });
    assert.strictEqual(info.getSGFProperties(), 'SZ[19]');

    const info2 = KifuInfo.fromJS({ boardSize: { cols: 9, rows: 13 } });
    assert.strictEqual(info2.getSGFProperties(), 'SZ[9:13]');
  });

  test('Property HA', () => {
    tests++;
    const info = KifuInfo.fromJS({ handicap: 2 });
    assert.strictEqual(info.getSGFProperties(), 'HA[2]');
  });

  test('Property KM', () => {
    tests++;
    const info = KifuInfo.fromJS({ komi: 5.5 });
    assert.strictEqual(info.getSGFProperties(), 'KM[5.5]');
  });

  test('Property ST', () => {
    tests++;
    const info = KifuInfo.fromJS({ variationsStyle: { currentNode: true, noMarkup: false } });
    assert.strictEqual(info.getSGFProperties(), 'ST[1]');

    const info2 = KifuInfo.fromJS({ variationsStyle: { currentNode: false, noMarkup: true } });
    assert.strictEqual(info2.getSGFProperties(), 'ST[2]');

    const info3 = KifuInfo.fromJS({ variationsStyle: { currentNode: true, noMarkup: true } });
    assert.strictEqual(info3.getSGFProperties(), 'ST[3]');
  });

  test('Property PB', () => {
    tests++;
    const info = KifuInfo.fromJS({ blackName: 'John Doe' });
    assert.strictEqual(info.getSGFProperties(), 'PB[John Doe]');
  });

  test('Property BR', () => {
    tests++;
    const info = KifuInfo.fromJS({ blackRank: '1d' });
    assert.strictEqual(info.getSGFProperties(), 'BR[1d]');
  });

  test('Property BT', () => {
    tests++;
    const info = KifuInfo.fromJS({ blackTeam: 'Team Black' });
    assert.strictEqual(info.getSGFProperties(), 'BT[Team Black]');
  });

  test('Property PW', () => {
    tests++;
    const info = KifuInfo.fromJS({ whiteName: 'Jane Doe' });
    assert.strictEqual(info.getSGFProperties(), 'PW[Jane Doe]');
  });

  test('Property WR', () => {
    tests++;
    const info = KifuInfo.fromJS({ whiteRank: '2d' });
    assert.strictEqual(info.getSGFProperties(), 'WR[2d]');
  });

  test('Property WT', () => {
    tests++;
    const info = KifuInfo.fromJS({ whiteTeam: 'Team White' });
    assert.strictEqual(info.getSGFProperties(), 'WT[Team White]');
  });

  test('Property GN', () => {
    tests++;
    const info = KifuInfo.fromJS({ gameName: 'Game Name' });
    assert.strictEqual(info.getSGFProperties(), 'GN[Game Name]');
  });

  test('Property GC', () => {
    tests++;
    const info = KifuInfo.fromJS({ gameComment: 'Game Comment' });
    assert.strictEqual(info.getSGFProperties(), 'GC[Game Comment]');
  });

  test('Property DT', () => {
    tests++;
    const info = KifuInfo.fromJS({ date: '2020-01-01' });
    assert.strictEqual(info.getSGFProperties(), 'DT[2020-01-01]');
  });

  test('Property EV', () => {
    tests++;
    const info = KifuInfo.fromJS({ event: 'Event' });
    assert.strictEqual(info.getSGFProperties(), 'EV[Event]');
  });

  test('Property PC', () => {
    tests++;
    const info = KifuInfo.fromJS({ place: 'Place' });
    assert.strictEqual(info.getSGFProperties(), 'PC[Place]');
  });

  test('Property RO', () => {
    tests++;
    const info = KifuInfo.fromJS({ round: 'Round' });
    assert.strictEqual(info.getSGFProperties(), 'RO[Round]');
  });

  test('Property RE', () => {
    tests++;
    const info = KifuInfo.fromJS({ result: 'B+R' });
    assert.strictEqual(info.getSGFProperties(), 'RE[B+R]');
  });

  test('Property TM', () => {
    tests++;
    const info = KifuInfo.fromJS({ timeLimits: 600 });
    assert.strictEqual(info.getSGFProperties(), 'TM[600]');
  });

  test('Property OT', () => {
    tests++;
    const info = KifuInfo.fromJS({ overTime: '5x30 byo-yomi' });
    assert.strictEqual(info.getSGFProperties(), 'OT[5x30 byo-yomi]');
  });

  test('Property RU', () => {
    tests++;
    const info = KifuInfo.fromJS({ rules: 'Japanese' });
    assert.strictEqual(info.getSGFProperties(), 'RU[Japanese]');
  });

  test('Property SO', () => {
    tests++;
    const info = KifuInfo.fromJS({ source: 'Source' });
    assert.strictEqual(info.getSGFProperties(), 'SO[Source]');
  });

  test('Property US', () => {
    tests++;
    const info = KifuInfo.fromJS({ author: 'User' });
    assert.strictEqual(info.getSGFProperties(), 'US[User]');
  });

  test('Property AN', () => {
    tests++;
    const info = KifuInfo.fromJS({ annotator: 'Annotation' });
    assert.strictEqual(info.getSGFProperties(), 'AN[Annotation]');
  });

  test('Property CP', () => {
    tests++;
    const info = KifuInfo.fromJS({ copyright: 'copyright' });
    assert.strictEqual(info.getSGFProperties(), 'CP[copyright]');
  });

  test('Test of all property types', () => {
    assert.strictEqual(tests, Object.keys(kifuInfoSGFPropertyDescriptors).length);
  });
});

describe('Unknown properties.', () => {
  test('Properties which are handled by KifuNode are ignored', () => {
    const node = KifuInfo.fromSGF('B[cd]C[comment]');
    assert.deepEqual(node.properties, {});
  });

  test('Custom properties are stored as they are', () => {
    const node = KifuInfo.fromSGF('FOO[foo]BAR[bar][baz]');
    assert.deepEqual(node.properties, { FOO: ['foo'], BAR: ['bar', 'baz'] });
  });
});

describe('Configuring of Kifu info', () => {
  test('Adding custom properties', () => {
    KifuInfo.defineProperties({
      FF: {
        get() {
          const info = this as any;
          return info.sgfVersion ? [String(info.sgfVersion)] : undefined;
        },
        set([value]) {
          if (value) {
            const info = this as any;
            info.sgfVersion = value;
          }
        },
      },
    });
    const info = KifuInfo.fromSGF('FF[4]GC[Game comment]');
    assert(info.getSGFProperties().indexOf('FF[4]') !== -1);
    assert.strictEqual((info as any).sgfVersion, '4');
  });
});
