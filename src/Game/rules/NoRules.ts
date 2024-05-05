import { Rules } from './Rules';

/**
 * No rules. This rule set allows any move.
 */
export class NoRules implements Rules {
  constructor(public readonly name?: string) {}

  isValidMove(): boolean {
    return true;
  }
}
