const fsPromises = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');
const logger = require('morgan');
const express = require('express');
const jsonRefs = require('json-refs');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const OpenApiValidator = require('express-openapi-validator');

const apiSpecBundledPath = path.join(__dirname,'api-bundled.yaml');

async function buildApiFile () {
    // load spec with refs
    const apiSpecPath = path.join(__dirname, 'api', 'index.yaml');
    const apiSpecRoot = yaml.load(Buffer.from(await fsPromises.readFile(apiSpecPath, {encoding: 'utf8'})));
    const resolveRefsOp = {
        loaderOptions: {
            processContent: (content, callback) => {
                callback(undefined, yaml.load(content.text))
            }
        }
    };
    // link all refs
    const resolvedRefsRes = await jsonRefs.resolveRefs(apiSpecRoot, resolveRefsOp);
    // save new spec to file
    await fsPromises.writeFile(apiSpecBundledPath, yaml.dump(resolvedRefsRes.resolved));
    console.log('naw api file saved')
    return resolvedRefsRes.resolved;
}

async function runServer() {
    const apiSpecBundledRoot = await buildApiFile();
    const app = express();
    const port = process.env.PORT || 3000;
    
    // 1. Install bodyParsers for the request types your API will support
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.text());
    app.use(express.json());
    app.use(logger('dev'));

    // load new spec from file
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(apiSpecBundledRoot));
    app.use('/spec', express.static(apiSpecBundledPath));

    //  2. Install the OpenApiValidator on your express app
    app.use(
        OpenApiValidator.middleware({
            apiSpec: apiSpecBundledPath,
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
}

runServer()
