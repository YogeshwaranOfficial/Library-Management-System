const requiredEnvVariables = [
  "PORT",
  "NODE_ENV",
  "DATABASE_URL",
  "JWT_SECRET",
];

requiredEnvVariables.forEach((envVariable) => {
  if (!process.env[envVariable]) {
    throw new Error(
      `Missing required environment variable: ${envVariable}`
    );
  }
});

