import {customAlphabet} from 'nanoid';
import {lowercase} from 'nanoid-dictionary';

const nanoid = customAlphabet(lowercase);

export function generateId() {
  return nanoid();
}
