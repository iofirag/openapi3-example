const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const logger = require('morgan');
const express = require('express');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const OpenApiValidator = require('express-openapi-validator');

const app = express();
const port = process.env.PORT || 3000;

// 1. Install bodyParsers for the request types your API will support
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.text());
app.use(express.json());
app.use(logger('dev'));

// load new spec from file
const apiSpecPath = path.join(__dirname, 'api-bundled.yaml');
const apiSpecRoot = yaml.load(fs.readFileSync(apiSpecPath, 'utf8'));

app.use('/docs', swaggerUi.serve, swaggerUi.setup(apiSpecRoot));
app.use('/spec', express.static(apiSpecPath));

//  2. Install the OpenApiValidator on your express app
app.use(
    OpenApiValidator.middleware({
        apiSpec: apiSpecPath,
        // 3. Provide the base path to the operation handlers directory
        operationHandlers: __dirname,
        // validateRequests: true,
        // validateResponses: true, // default false
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
