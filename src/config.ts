/**
 * This file will house all used environmental variables we use in the application.
 * It does not cover environmental variables used in dependencies.
 */
export const CONFIG = {
  mongoURL:     process.env.MONGO_URL ?? 'mongodb://127.0.0.1:27017/',
  mongoFilesDb: process.env.FILES_DB  ?? "files_v1",
  mongoDataDb:  process.env.DATA_DB   ?? "data_v1",
  mongoUserDb:  process.env.USER_DB   ?? "users_v1",

  emailValidationRequired: process.env.EMAIL_VALIDATION_REQUIRED ?? true,
}

export const SecurityTypes = {
  accessToken: 'AccessToken',
}
