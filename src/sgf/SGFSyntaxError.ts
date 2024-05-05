/**
 * Class for syntax errors in SGF string.
 */
export class SGFSyntaxError extends Error {
  // tslint:disable-next-line:variable-name
  __proto__: Error;

  constructor(message: string, sgfString?: string, state?: { lineNo: number; charNo: number }) {
    super(message);
    this.__proto__ = new.target.prototype;

    // var tempError = Error.apply(this);
    this.name = this.name = 'SGFSyntaxError';
    this.message = message || 'There was an unspecified syntax error in the SGF';

    if (sgfString && state) {
      this.message += ` on line ${state.lineNo}, char ${state.charNo}:\n`;
      this.message += `\t${sgfString.split('\n')[state.lineNo - 1]}\n`;
      this.message += `\t${Array(state.charNo + 1).join(' ')}^`;
    }
  }
}
