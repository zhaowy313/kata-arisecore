import { SGFPropertyDescriptorMap } from '../sgf';
import { KifuInfo } from './KifuInfo';

export const kifuInfoSGFPropertyDescriptors: SGFPropertyDescriptorMap<KifuInfo> = {
  SZ: {
    set([value]) {
      if (!value) {
        this.boardSize = undefined;
        return;
      }
      const sizes = value.split(':');
      this.boardSize = sizes[1]
        ? { cols: parseInt(sizes[0]), rows: parseInt(sizes[1]) }
        : Number(sizes[0]);
    },
    get() {
      if (this.boardSize) {
        if (typeof this.boardSize === 'number') {
          return [String(this.boardSize)];
        } else {
          return [`${this.boardSize.cols}:${this.boardSize.rows}`];
        }
      }
    },
  },
  HA: {
    set([value]) {
      if (!value) {
        this.handicap = undefined;
        return;
      }
      this.handicap = parseInt(value);
    },
    get() {
      if (this.handicap) {
        return [String(this.handicap)];
      }
    },
  },
  KM: {
    set([value]) {
      if (!value) {
        this.komi = undefined;
        return;
      }
      this.komi = parseFloat(value);
    },
    get() {
      if (this.komi) {
        return [String(this.komi)];
      }
    },
  },
  ST: {
    set([value]) {
      if (!value) {
        this.variationsStyle = undefined;
        return;
      }
      const val = parseInt(value);

      this.variationsStyle = {
        currentNode: !!(val & 1),
        noMarkup: !!(val & 2),
      };
    },
    get() {
      if (this.variationsStyle) {
        return [
          String(
            Number(this.variationsStyle.currentNode) + Number(this.variationsStyle.noMarkup) * 2,
          ),
        ];
      }
    },
  },
  PB: {
    set([value]) {
      if (!value) {
        this.blackName = undefined;
        return;
      }
      this.blackName = value;
    },
    get() {
      if (this.blackName) {
        return [this.blackName];
      }
    },
  },
  BR: {
    set([value]) {
      if (!value) {
        this.blackRank = undefined;
        return;
      }
      this.blackRank = value;
    },
    get() {
      if (this.blackRank) {
        return [this.blackRank];
      }
    },
  },
  BT: {
    set([value]) {
      if (!value) {
        this.blackTeam = undefined;
        return;
      }
      this.blackTeam = value;
    },
    get() {
      if (this.blackTeam) {
        return [this.blackTeam];
      }
    },
  },
  PW: {
    set([value]) {
      if (!value) {
        this.whiteName = undefined;
        return;
      }
      this.whiteName = value;
    },
    get() {
      if (this.whiteName) {
        return [this.whiteName];
      }
    },
  },
  WR: {
    set([value]) {
      if (!value) {
        this.whiteRank = undefined;
        return;
      }
      this.whiteRank = value;
    },
    get() {
      if (this.whiteRank) {
        return [this.whiteRank];
      }
    },
  },
  WT: {
    set([value]) {
      if (!value) {
        this.whiteTeam = undefined;
        return;
      }
      this.whiteTeam = value;
    },
    get() {
      if (this.whiteTeam) {
        return [this.whiteTeam];
      }
    },
  },
  GN: {
    set([value]) {
      if (!value) {
        this.gameName = undefined;
        return;
      }
      this.gameName = value;
    },
    get() {
      if (this.gameName) {
        return [this.gameName];
      }
    },
  },
  GC: {
    set([value]) {
      if (!value) {
        this.gameComment = undefined;
        return;
      }
      this.gameComment = value;
    },
    get() {
      if (this.gameComment) {
        return [this.gameComment];
      }
    },
  },
  DT: {
    set([value]) {
      if (!value) {
        this.date = undefined;
        return;
      }
      this.date = value;
    },
    get() {
      if (this.date) {
        return [this.date];
      }
    },
  },
  EV: {
    set([value]) {
      if (!value) {
        this.event = undefined;
        return;
      }
      this.event = value;
    },
    get() {
      if (this.event) {
        return [this.event];
      }
    },
  },
  PC: {
    set([value]) {
      if (!value) {
        this.place = undefined;
        return;
      }
      this.place = value;
    },
    get() {
      if (this.place) {
        return [this.place];
      }
    },
  },
  RO: {
    set([value]) {
      if (!value) {
        this.round = undefined;
        return;
      }
      this.round = value;
    },
    get() {
      if (this.round) {
        return [this.round];
      }
    },
  },
  RE: {
    set([value]) {
      if (!value) {
        this.result = undefined;
        return;
      }
      this.result = value as any;
    },
    get() {
      if (this.result) {
        return [this.result];
      }
    },
  },
  TM: {
    set([value]) {
      if (!value) {
        this.timeLimits = undefined;
        return;
      }
      this.timeLimits = parseInt(value);
    },
    get() {
      if (this.timeLimits) {
        return [String(this.timeLimits)];
      }
    },
  },
  OT: {
    set([value]) {
      if (!value) {
        this.overTime = undefined;
        return;
      }
      this.overTime = value;
    },
    get() {
      if (this.overTime) {
        return [this.overTime];
      }
    },
  },
  RU: {
    set([value]) {
      if (!value) {
        this.rules = undefined;
        return;
      }
      this.rules = value;
    },
    get() {
      if (this.rules) {
        return [this.rules];
      }
    },
  },
  SO: {
    set([value]) {
      if (!value) {
        this.source = undefined;
        return;
      }
      this.source = value;
    },
    get() {
      if (this.source) {
        return [this.source];
      }
    },
  },
  US: {
    set([value]) {
      if (!value) {
        this.author = undefined;
        return;
      }
      this.author = value;
    },
    get() {
      if (this.author) {
        return [this.author];
      }
    },
  },
  AN: {
    set([value]) {
      if (!value) {
        this.annotator = undefined;
        return;
      }
      this.annotator = value;
    },
    get() {
      if (this.annotator) {
        return [this.annotator];
      }
    },
  },
  CP: {
    set([value]) {
      if (!value) {
        this.copyright = undefined;
        return;
      }
      this.copyright = value;
    },
    get() {
      if (this.copyright) {
        return [this.copyright];
      }
    },
  },
};
