import { SGFPropertiesBag, SGFPropertyDescriptorMap } from '../sgf';
import { Color } from '../types';
import { KifuNode, MarkupType } from './KifuNode';

export const kifuNodeSGFPropertyDescriptors: SGFPropertyDescriptorMap<KifuNode> = {
  B: KifuNode.createMoveDescriptor(Color.Black),
  W: KifuNode.createMoveDescriptor(Color.White),
  AB: KifuNode.createSetupDescriptor(Color.Black),
  AW: KifuNode.createSetupDescriptor(Color.White),
  AE: KifuNode.createSetupDescriptor(Color.Empty),
  PL: {
    set([value]) {
      if (!value) {
        this.player = undefined;
        return;
      }
      this.player = value.toUpperCase() === 'W' ? Color.White : Color.Black;
    },
    get() {
      if (this.player) {
        return [this.player === Color.White ? 'W' : 'B'];
      }
    },
  },
  VW: {
    set([value]) {
      if (value) {
        this.boardSection = SGFPropertiesBag.parseVector(value);
      } else if (value === '') {
        this.boardSection = null;
      } else {
        this.boardSection = undefined;
      }
    },
    get() {
      if (this.boardSection) {
        return [SGFPropertiesBag.vectorToSGFValue(this.boardSection)];
      } else if (this.boardSection === null) {
        return [''];
      }
    },
  },
  DD: {
    set(values: string[]) {
      if (!values.length) {
        this.dim = undefined;
      } else if (values[0] === '') {
        this.dim = [];
      } else {
        this.dim = values.map((value) => {
          if (value.length === 5) {
            return SGFPropertiesBag.parseVector(value);
          } else {
            const point = SGFPropertiesBag.parsePoint(value);
            return { x1: point.x, y1: point.y, x2: point.x, y2: point.y };
          }
        });
      }
    },
    get() {
      if (this.dim) {
        if (!this.dim.length) {
          return [''];
        }
        return this.dim.map((value) => {
          if (value.x1 === value.x2 && value.y1 === value.y2) {
            return SGFPropertiesBag.vectorToSGFValue(value).substring(0, 2);
          } else {
            return SGFPropertiesBag.vectorToSGFValue(value);
          }
        });
      }
    },
  },
  BL: {
    set([value]) {
      if (!value) {
        this.blackTimeLeft = undefined;
        return;
      }
      this.blackTimeLeft = parseFloat(value);
    },
    get() {
      if (this.blackTimeLeft) {
        return [String(this.blackTimeLeft)];
      }
    },
  },
  OB: {
    set([value]) {
      if (!value) {
        this.blackStonesLeft = undefined;
        return;
      }
      this.blackStonesLeft = parseInt(value, 10);
    },
    get() {
      if (this.blackStonesLeft) {
        return [String(this.blackStonesLeft)];
      }
    },
  },
  WL: {
    set([value]) {
      if (!value) {
        this.whiteTimeLeft = undefined;
        return;
      }
      this.whiteTimeLeft = parseFloat(value);
    },
    get() {
      if (this.whiteTimeLeft) {
        return [String(this.whiteTimeLeft)];
      }
    },
  },
  OW: {
    set([value]) {
      if (!value) {
        this.whiteStonesLeft = undefined;
        return;
      }
      this.whiteStonesLeft = parseInt(value, 10);
    },
    get() {
      if (this.whiteStonesLeft) {
        return [String(this.whiteStonesLeft)];
      }
    },
  },
  C: {
    set([value]) {
      if (!value) {
        this.comment = undefined;
        return;
      }
      this.comment = value;
    },
    get() {
      if (this.comment) {
        return [this.comment];
      }
    },
  },
  CR: KifuNode.createPointMarkupDescriptor(MarkupType.Circle),
  MA: KifuNode.createPointMarkupDescriptor(MarkupType.XMark),
  SL: KifuNode.createPointMarkupDescriptor(MarkupType.Selected),
  SQ: KifuNode.createPointMarkupDescriptor(MarkupType.Square),
  TR: KifuNode.createPointMarkupDescriptor(MarkupType.Triangle),
  AR: KifuNode.createLineMarkupDescriptor(MarkupType.Arrow),
  LN: KifuNode.createLineMarkupDescriptor(MarkupType.Line),
  LB: KifuNode.createLabelMarkupDescriptor(MarkupType.Label),
};
