import parseDuration from 'parse-duration';
import { z } from 'zod';

const msStringSchema = z
  .string()
  .refine((value) => Number.isFinite(parseDuration(value, 'millisecond')), {
    message: 'Invalid syntax, see https://www.npmjs.com/package/parse-duration',
  });

export const ZOD_MS_TYPE = {
  default: (value: string) =>
    msStringSchema.default(value).transform((v): number => {
      const result = parseDuration(v, 'millisecond');

      if (result === null) {
        throw new Error('Invalid duration string');
      }

      return result;
    }),
};
