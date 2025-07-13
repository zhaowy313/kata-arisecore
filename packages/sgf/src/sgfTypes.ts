import { Point, Color } from '@wgojs/common';

export enum PropIdent {
  // Move Properties
  BlackMove = 'B',
  ExecuteIllegal = 'KO',
  MoveNumber = 'MN',
  WhiteMove = 'W',

  // Setup Properties
  AddBlack = 'AB',
  ClearField = 'AE',
  AddWhite = 'AW',
  SetTurn = 'PL',

  // Node Annotation Properties
  Comment = 'C',
  EvenPosition = 'DM',
  GoodForBlack = 'GB',
  GoodForWhite = 'GW',
  Hotspot = 'HO',
  NodeName = 'N',
  UnclearPosition = 'UC',
  NodeValue = 'V',

  // Move Annotation Properties
  BadMove = 'BM',
  DoubtfulMove = 'DO',
  InterestingMove = 'IT',
  GoodMove = 'TE',

  // Markup Properties
  Arrow = 'AR',
  Circle = 'CR',
  Dim = 'DD',
  Label = 'LB',
  Line = 'LN',
  XMark = 'MA',
  Selected = 'SL',
  Square = 'SQ',
  Triangle = 'TR',

  // Root Properties
  Application = 'AP',
  Charset = 'CA',
  SGFVersion = 'FF',
  GameType = 'GM',
  VariationsStyle = 'ST',
  BoardSize = 'SZ',

  // Game Info Properties
  Annotator = 'AN',
  BlackRank = 'BR',
  BlackTeam = 'BT',
  Copyright = 'CP',
  Date = 'DT',
  Event = 'EV',
  GameName = 'GN',
  GameComment = 'GC',
  OpeningInfo = 'ON',
  OverTime = 'OT',
  BlackName = 'PB',
  Place = 'PC',
  WhiteName = 'PW',
  Result = 'RE',
  Round = 'RO',
  Rules = 'RU',
  Source = 'SO',
  TimeLimits = 'TM',
  Author = 'US',
  WhiteRank = 'WR',
  WhiteTeam = 'WT',

  // Timing Properties
  BlackTimeLeft = 'BL',
  BlackStonesLeft = 'OB',
  WhiteStonesLeft = 'OW',
  WhiteTimeLeft = 'WL',

  // Miscellaneous Properties
  Figure = 'FG',
  PrintMoveNumbers = 'PM',
  BoardSection = 'VW',

  // GO specific Properties
  Handicap = 'HA',
  Komi = 'KM',
  BlackTerritory = 'TB',
  WhiteTerritory = 'TW',
}

export type SGFProperties = Record<string, string[] | undefined>;

export type StandardSGFProperties = {
  // Move Properties
  B?: Point | null;
  KO?: null;
  MN?: number;
  W?: Point | null;

  // Setup Properties
  AB?: Point[];
  AE?: Point[];
  AW?: Point[];
  PL?: Color;

  // Node Annotation Properties
  C?: string;
  DM?: string;
  GB?: string;
  GW?: string;
  HO?: string;
  N?: string;
  UC?: string;
  V?: number;

  // Move Annotation Properties
  BM?: string;
  DO?: string;
  IT?: string;
  TE?: string;

  // Markup Properties
  AR?: [Point, Point][];
  CR?: Point[];
  DD?: Point[];
  LB?: [Point, string][];
  LN?: [Point, Point][];
  MA?: Point[];
  SL?: Point[];
  SQ?: Point[];
  TR?: Point[];

  // Root Properties
  AP?: [string, string];
  CA?: string;
  FF?: number;
  GM?: number;
  ST?: number;
  SZ?: number | [number, number];

  // Game Info Properties
  AN?: string;
  BR?: string;
  BT?: string;
  CP?: string;
  DT?: string;
  EV?: string;
  GN?: string;
  GC?: string;
  ON?: string;
  OT?: string;
  PB?: string;
  PC?: string;
  PW?: string;
  RE?: string;
  RO?: string;
  RU?: string;
  SO?: string;
  TM?: number;
  US?: string;
  WR?: string;
  WT?: string;

  // Timing Properties
  BL?: number;
  OB?: number;
  OW?: number;
  WL?: number;

  // Miscellaneous Properties
  FG?: [number, string] | null;
  PM?: number;
  VW?: [Point, Point];

  // GO specific Properties
  HA?: number;
  KM?: number;
  TB?: Point[];
  TW?: Point[];
};

export type SGFNode<SGF_PROPS extends Record<string, unknown>> = SGF_PROPS;

export interface SGFGameTree<SGF_PROPS extends Record<string, unknown>> {
  sequence: SGFNode<SGF_PROPS>[];
  children: SGFGameTree<SGF_PROPS>[];
}

export type SGFCollection<SGF_PROPS extends Record<string, unknown>> = SGFGameTree<SGF_PROPS>[];
