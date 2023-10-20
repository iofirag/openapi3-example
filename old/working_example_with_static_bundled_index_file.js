const fs = require('fs');
// const fsPromises = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');
const logger = require('morgan');
const express = require('express');
const jsonRefs = require('json-refs');
// var resolve = require('json-refs').resolveRefs;
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const OpenApiValidator = require('express-openapi-validator');


const runServer = async () => {
    const app = express();
    const port = process.env.PORT || 3000;
    
    // 1. Install bodyParsers for the request types your API will support
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.text());
    app.use(express.json());
    app.use(logger('dev'));
    
    // const openapiOp = {
    //     customSiteTitle: "YOUR TITLE",
    //     customfavIcon: "https://static.rawpixel.com/_next/static/images/rawpixel-1be0929918b5f1d29e326a3ad5357d2a.ico"
    //     // customCss: '.swagger-ui .topbar { display: none }',
    // };

    // load spec with refs
    // const apiSpecPath = './index.yaml';
    // const apiSpecRoot = yaml.load(Buffer.from(await fsPromises.readFile(apiSpecPath, {encoding: 'utf8'})));
    // const apiSpec2Root = yaml.load(fs.readFileSync(apiSpecPath).toString());
    // var root = yaml.load(fs.readFileSync(apiSpecPath).toString());
    // const apiSpecRoot = yaml.load(readFileSync(apiSpecPath), 'utf8');
    // link all refs
    // const resolveRefsOp = {
    //     loaderOptions: {
    //         processContent: (content, callback) => {
    //             callback(undefined, yaml.load(content.text))
    //         }
    //     }
    // };
    // const resolvedRefsRes = await jsonRefs.resolveRefs(apiSpecRoot, resolveRefsOp);
    // const apiSpecBundledRoot = yaml.dump(resolvedRefsRes.resolved);
    // save new spec to file
    const apiSpecBundledPath = path.join(__dirname,'api-bundled.yaml'); // path.join(__dirname, '/out/api-bundled.yaml');
    // await fsPromises.writeFile(apiSpecBundledPath, yaml.dump(resolvedRefsRes.resolved));
    // const apiSpecBundledRoot = yaml.load(Buffer.from(await fsPromises.readFile(apiSpecBundledPath)));
    const apiSpecBundledRoot = yaml.load(fs.readFileSync(apiSpecBundledPath), 'utf8');
    // const apiSpecBundledRoot = yaml.load(Buffer.from(await fsPromises.readFile(apiSpecBundledPath, {encoding: 'utf8'})));
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(apiSpecBundledRoot));
    app.use('/spec', express.static(apiSpecBundledPath));

    //  2. Install the OpenApiValidator on your express app
    app.use(
        OpenApiValidator.middleware({
            apiSpec: apiSpecBundledPath, // apiSpecBundledPath,
            // validateRequests: true,
            // validateResponses: true, // default false
            // 3. Provide the base path to the operation handlers directory
            operationHandlers: __dirname //path.join(process.cwd(), 'handlers'), // process.cwd()    __dirname
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