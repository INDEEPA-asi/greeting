import { birthdayExample } from '../../config/birthday.example';
import { birthdaySchema, type BirthdayConfig } from '../../config/schema';

export const birthday: BirthdayConfig = birthdayExample;
export const birthdayResult = birthdaySchema.safeParse(birthday);
export const gardenConfig = birthdaySchema.parse(birthday);
