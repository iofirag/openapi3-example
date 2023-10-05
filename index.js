// const express = require('express');
// const app = express();

// app.use(express.json());

const path = require('path');
const YAML = require('yamljs');
const logger = require('morgan');
const express = require('express');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const OpenApiValidator = require('express-openapi-validator');

const app = express();
const port = process.env.PORT || 3000;
const apiSpec = path.join(__dirname, '/out/bundle-api.yaml');

// 1. Install bodyParsers for the request types your API will support
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.text());
app.use(express.json());
app.use(logger('dev'));

const openapiSpec = YAML.load(apiSpec);
const openapiOp = {
    customSiteTitle: "YOUR TITLE",
    customfavIcon: "https://static.rawpixel.com/_next/static/images/rawpixel-1be0929918b5f1d29e326a3ad5357d2a.ico"
    // customCss: '.swagger-ui .topbar { display: none }',
};
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec, openapiOp));
app.use('/spec', express.static(apiSpec));

//  2. Install the OpenApiValidator on your express app
app.use(
    OpenApiValidator.middleware({
        apiSpec,
        // validateRequests: true,
        // validateResponses: true, // default false
        // 3. Provide the base path to the operation handlers directory
        operationHandlers: path.join(__dirname),
    }),
);

// 4. Woah sweet! With auto-wired operation handlers, I don't have to declare my routes!
//    See api.yaml for x-eov-* vendor extensions

// 6. Create an Express error handler
app.use((err, req, res, next) => {
    // 7. Customize errors
    console.error(err); // dump error to console for debug
    res.status(err.status || 500).json({
        message: err.message,
        errors: err.errors,
    });
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});