import { birthdayExample } from './birthday.example';
import { birthdaySchema, type BirthdayConfig } from './schema';

// Replace or extend these values, then set demo to false for the finished gift.
export const birthday: BirthdayConfig = {
  ...birthdayExample,
};

export const birthdayResult = birthdaySchema.safeParse(birthday);
export const gardenConfig = birthdayResult.success ? birthdayResult.data : birthdaySchema.parse(birthdayExample);
