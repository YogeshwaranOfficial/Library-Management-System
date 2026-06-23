import helmet from "helmet";

const helmetConfig = helmet({
  crossOriginEmbedderPolicy: false,

  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],

      scriptSrc: ["'self'"],

      styleSrc: ["'self'", "'unsafe-inline'"],

      imgSrc: ["'self'", "data:"],
    },
  },
});

export default helmetConfig;