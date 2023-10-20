var jsonRefs = require('json-refs');
var YAML = require('js-yaml');
var path = require('path');
var fs = require('fs');

var refsPath = path.join(process.cwd(), 'index.yaml');
var root = YAML.load(fs.readFileSync(refsPath, 'utf8'));
// const toJson = (jsontxt) => {
//     return YAML.load(jsontxt)
// }
var options = {
    // location: __dirname, // process.cwd(), // 
    loaderOptions: {
        processContent: (content, callback) => {
            callback(undefined, YAML.load(content.text))
        }
    }
};
jsonRefs.resolveRefs(root, options).then(function (results) {
    console.log(YAML.dump(results.resolved));
});