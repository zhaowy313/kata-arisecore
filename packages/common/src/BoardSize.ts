export type BoardSize = number | { readonly cols: number; readonly rows: number };

export const BoardSize = {
  create(cols: number, rows?: number): BoardSize {
    if (!rows) {
      return cols;
    }

    return { cols, rows };
  },

  equals: (a: BoardSize, b: BoardSize): boolean => {
    if (typeof a === 'number' && typeof b === 'number') {
      return a === b;
    }

    // if some of them is number, transform it to object where cols and rows are equal
    if (typeof a === 'number') {
      return a === (b as any).cols && a === (b as any).rows;
    }
    if (typeof b === 'number') {
      return a.cols === b && a.rows === b;
    }
    return a.cols === b.cols && a.rows === b.rows;
  },

  getRows(size: BoardSize): number {
    return typeof size === 'number' ? size : size.rows;
  },

  getCols(size: BoardSize): number {
    return typeof size === 'number' ? size : size.cols;
  },

  isRectangular(size: BoardSize): boolean {
    return typeof size !== 'number' && size.cols !== size.rows;
  },
};
