/**
 * Class for syntax errors in SGF string.
 */
export class SGFSyntaxError extends Error {
  // tslint:disable-next-line:variable-name
  __proto__: Error;

  constructor(message: string, sgfString?: string, position?: { line: number; column: number }) {
    super(message);
    this.__proto__ = new.target.prototype;

    // var tempError = Error.apply(this);
    this.name = this.name = 'SGFSyntaxError';
    this.message = message || 'There was an unspecified syntax error in the SGF';

    if (sgfString && position) {
      this.message += ` on line ${position.line}, char ${position.column}:\n`;
      this.message += `\t${sgfString.split('\n')[position.line - 1]}\n`;
      this.message += `\t${Array(position.column + 1).join(' ')}^`;
    }
  }
}
