import { SGFGameTree, SGFProperties, StandardSGFProperties } from '@wgojs/sgf';
import { KifuMove } from './move';
import { Kifu, KifuRoot } from './kifu';
import { KifuVariation } from './variation';
import { KifuInfo } from './info';
import { PositionSetup } from './setup';
import { kifuSGFParser } from './kifuSGFParser';
import { Color } from '@wgojs/common';

export interface KifuSGFWriterConfig {
  /**
   * Function to alter move SGF properties before they are written to SGF.
   *
   * @param properties properties map already created from the move
   * @param move move object related to the properties
   * @param variant optional variation object if the move is first node of a variation
   * @return altered properties map
   */
  alterMoveProperties?(
    properties: StandardSGFProperties & SGFProperties,
    move: KifuMove,
    variant?: KifuVariation,
  ): StandardSGFProperties & SGFProperties;

  /**
   * Function to alter root SGF properties before they are written to SGF.
   *
   * @param properties properties map already created from the kifu info, root and setup
   * @param kifu kifu object related to SGF
   * @return altered properties map
   */
  alterRootProperties?(
    properties: StandardSGFProperties & SGFProperties,
    kifu: Kifu,
  ): StandardSGFProperties & SGFProperties;
}

export class KifuSGFWriter {
  constructor(private config: KifuSGFWriterConfig = {}) {}

  stringify(kifu: Kifu): string {
    let rootProperties: StandardSGFProperties & SGFProperties = {
      ...KifuInfo.toSGFProperties(kifu.info),
      ...(kifu.root && KifuRoot.toSGFProperties(kifu.root)),
      ...(kifu.setup && PositionSetup.toSGFProperties(kifu.setup)),
    };

    if (this.config.alterRootProperties) {
      rootProperties = this.config.alterRootProperties(rootProperties, kifu);
    }

    const gameTree = this.#movesToSGFGameTree(
      {
        sequence: [rootProperties],
        children: [],
      },
      kifu.moves,
    );

    return kifuSGFParser.stringifyGameTree(gameTree);
  }

  stringifyMove(kifuMove: KifuMove): string {
    return kifuSGFParser.stringifyProperties(this.#getMoveProperties(kifuMove));
  }

  #movesToSGFGameTree(
    gameTree: SGFGameTree<any>,
    moves: readonly KifuMove[],
    initialColor?: Color,
  ): SGFGameTree<any> {
    let color = initialColor || Color.Black;
    let move: KifuMove;

    for (let i = 0; i < moves.length; i++) {
      move = moves[i];

      if (move.variations && move.variations.length > 0) {
        gameTree.children.push(
          this.#movesToSGFGameTree(
            {
              sequence: [this.#getMoveProperties(move, color)],
              children: [],
            },
            moves.slice(i + 1),
            Color.opposite(color),
          ),
        );

        for (const variation of move.variations) {
          if (!variation.moves.length) {
            continue; // Skip empty variations
          }
          gameTree.children.push(
            this.#movesToSGFGameTree(
              {
                sequence: [this.#getMoveProperties(variation.moves[0], color, variation)],
                children: [],
              },
              variation.moves.slice(1),
              Color.opposite(color),
            ),
          );
        }

        return gameTree;
      }

      gameTree.sequence.push(this.#getMoveProperties(move, color));
      color = Color.opposite(color);
    }

    return gameTree;
  }

  #getMoveProperties(move: KifuMove, color?: Color, variation?: KifuVariation): SGFProperties {
    const properties = KifuMove.toSGFProperties(move, color);
    if (variation && variation.name) {
      properties.N = variation.name;
    }
    if (this.config.alterMoveProperties) {
      return this.config.alterMoveProperties(properties, move, variation);
    }
    return properties;
  }
}
