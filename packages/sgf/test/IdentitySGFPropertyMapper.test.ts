import { describe, test, expect } from 'vitest';
import { IdentitySGFPropertyMapper } from '../src';

describe('IdentitySGFPropertyMapper', () => {
  test('map returns value unchanged', () => {
    expect(IdentitySGFPropertyMapper.map('B', ['aa'])).toEqual(['aa']);
    expect(IdentitySGFPropertyMapper.map('C', ['foo', 'bar'])).toEqual(['foo', 'bar']);
  });

  test('unmap returns value unchanged', () => {
    expect(IdentitySGFPropertyMapper.unmap('B', ['bb'])).toEqual(['bb']);
    expect(IdentitySGFPropertyMapper.unmap('C', ['baz'])).toEqual(['baz']);
  });
});
