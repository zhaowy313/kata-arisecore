import { test, expect } from 'vitest';
import { Kifu, KifuInfo, KifuNode } from '../src/kifu';
import { Color } from '../src/types';

test('Create empty Kifu', () => {
  const kifu = new Kifu();
  expect(kifu.root).toEqual(new KifuNode());
  expect(kifu.info).toEqual(new KifuInfo());
});

test('Create kifu from SGF', () => {
  const kifu = Kifu.fromSGF('(;FF[4]SZ[19]AB[ab];B[cd];W[ef])');
  expect(kifu.info.boardSize).toBe(19);
  expect(kifu.info.properties).toEqual({ FF: ['4'] });
  expect(kifu.root.setup).toEqual([{ x: 0, y: 1, c: Color.B }]);
  expect(kifu.info.properties).toEqual({ FF: ['4'] });
  expect(kifu.root.children[0].move).toEqual({ x: 2, y: 3, c: Color.B });
  expect(kifu.root.children[0].children[0]).toEqual(
    KifuNode.fromJS({ move: { x: 4, y: 5, c: Color.W } }),
  );
});

test('Convert kifu into JSON and back', () => {
  const kifu = Kifu.fromSGF('(;FF[4]SZ[19]AB[ab];B[cd];W[ef])');
  const json = JSON.stringify(kifu.toJS());
  const kifu2 = Kifu.fromJS(JSON.parse(json));
  expect(kifu).toEqual(kifu2);
});

test('Cloning of kifu', () => {
  const kifu = Kifu.fromSGF('(;FF[4]SZ[19]AB[ab];B[cd];W[ef])');
  const kifu2 = kifu.clone();
  expect(kifu).toEqual(kifu2);
  kifu2.root.children[0].move! = { ...kifu2.root.children[0].move, c: Color.W };
  expect(kifu).not.toEqual(kifu2);
});

test('Convert to SGF', () => {
  const kifu = Kifu.fromSGF('(;SZ[19]AB[ab];B[cd];W[ef])');
  expect(kifu.toSGF()).toBe('(;SZ[19]AB[ab];B[cd];W[ef])');
});

test('Convert to SGF with variations', () => {
  const kifu = new Kifu();
  kifu.info.gameComment = 'Game comment';
  kifu.root.setSGFProperty('AB', ['ab']);
  kifu.root.children.push(KifuNode.fromJS({ move: { x: 2, y: 3, c: Color.B } }));
  kifu.root.children.push(KifuNode.fromJS({ move: { x: 4, y: 5, c: Color.B } }));
  kifu.root.children[1].children.push(KifuNode.fromJS({ move: { x: 6, y: 7, c: Color.W } }));
  expect(kifu.toSGF()).toBe('(;GC[Game comment]AB[ab](;B[cd])(;B[ef];W[gh]))');
});

test('Method getNode with number argument', () => {
  const kifu = Kifu.fromSGF('(;C[1](;C[2a];C[3a](;C[4aa])(;C[4ab]))(;C[2b];C[3b]))');
  expect(kifu.getNode(0)?.comment).toBe('1');
  expect(kifu.getNode(3)?.comment).toBe('4aa');
  expect(kifu.getNode(4)).toBeUndefined();
});

test('Method getNode with path object argument', () => {
  const kifu = Kifu.fromSGF('(;C[1](;C[2a];C[3a](;C[4aa])(;C[4ab]))(;C[2b];C[3b]))');
  expect(kifu.getNode({ moveNumber: 3, variations: [0, 1] })?.comment).toBe('4ab');
  expect(kifu.getNode({ moveNumber: 2, variations: [1] })?.comment).toBe('3b');
  expect(kifu.getNode({ moveNumber: 2, variations: [2] })).toBeUndefined();
});

test('Method getPath works for root node', () => {
  const kifu = Kifu.fromSGF('(;C[1](;C[2a];C[3a](;C[4aa])(;C[4ab]))(;C[2b];C[3b]))');
  expect(kifu.getPath(kifu.root)).toEqual({ moveNumber: 0, variations: [] });
});

test('Method getPath works for deep nodes', () => {
  const kifu = Kifu.fromSGF('(;C[1](;C[2a];C[3a](;C[4aa])(;C[4ab]))(;C[2b];C[3b]))');
  expect(kifu.getPath(kifu.root)).toEqual({ moveNumber: 0, variations: [] });

  const node1 = kifu.getNode({ moveNumber: 3, variations: [0, 1] });
  const node2 = kifu.getNode({ moveNumber: 2, variations: [1] });
  const node3 = new KifuNode();

  expect(kifu.getPath(node1!)).toEqual({ moveNumber: 3, variations: [0, 1] });
  expect(kifu.getPath(node2!)).toEqual({ moveNumber: 2, variations: [1] });
  expect(kifu.getPath(node3)).toBeUndefined();
});

test('Method find finds first matching node (path)', () => {
  const kifu = Kifu.fromSGF('(;C[1](;C[2a];N[3a](;C[4aa])(;B[ab]))(;N[2b];C[3b]))');

  const firstComment = kifu.find((node) => node.comment != null);
  expect(firstComment?.path).toEqual({ moveNumber: 0, variations: [] });
  expect(firstComment?.node).toBe(kifu.root);

  const firstNodeName = kifu.find((node) => node.properties.N != null);
  expect(firstNodeName?.path).toEqual({ moveNumber: 1, variations: [1] });
  expect(firstNodeName?.node).toBe(kifu.root.children[1]);

  const firstMove = kifu.find((node) => node.move != null);
  expect(firstMove?.path).toEqual({ moveNumber: 3, variations: [0, 1] });
  expect(firstMove?.node).toBe(kifu.root.children[0].children[0].children[1]);

  const firstSetup = kifu.find((node) => node.setup.length > 0);
  expect(firstSetup).toBeUndefined();
});
