import { SGFProperties } from '../sgfTypes';
import { SGFPropertyMapper } from './SGFPropertyMapper';

export const IdentitySGFPropertyMapper: SGFPropertyMapper<SGFProperties> = {
  map(_prop, value) {
    return value as any;
  },
  unmap(_prop, value) {
    return value;
  },
};
