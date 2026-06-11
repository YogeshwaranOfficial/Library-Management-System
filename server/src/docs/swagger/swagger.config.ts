import swaggerJSDoc from "swagger-jsdoc";
import swaggerDefinition from "./swagger.definition.js";
import path from "path";

const options: swaggerJSDoc.Options = {
  definition: swaggerDefinition,
  apis: [
    path.join(process.cwd(), "src/modules/**/*.ts"),
  ],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;