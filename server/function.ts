import serverless from "serverless-http";
import { app } from "./app";

// Configure serverless handler
const handler = serverless(app, {
  binary: ['application/octet-stream', 'application/pdf']
});

// Add Netlify specific handling
export { handler };