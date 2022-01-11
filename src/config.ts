/**
 * This file will house all used environmental variables we use in the application.
 * It does not cover environmental variables used in dependencies.
 */
export const CONFIG = {
  mongoFilesURL: process.env.FILES_DB_URL ?? "mongodb://127.0.0.1:27017/files_v1",
  mongoDataURL:  process.env.DATA_DB_URL  ?? "mongodb://127.0.0.1:27017/data_v1",
  mongoUserURL:  process.env.USER_DB_URL  ?? "mongodb://127.0.0.1:27017/users_v1",

  emailValidationRequired: process.env.EMAIL_VALIDATION_REQUIRED ?? true,
  generateCustomIds: process.env.GENERATE_CUSTOM_IDS ?? false,

  SSEToken: process.env.SSE_TOKEN || "sse_token"
}

export const SecurityTypes = {
  accessToken: 'AccessToken',
}

