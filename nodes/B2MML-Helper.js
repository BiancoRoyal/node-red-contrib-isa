/**

 The MIT License (MIT)

 Copyright (c) 2016 Klaus Landsdorf - Lohne (Olb) - Germany

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.

 @author <a href="mailto:klaus.landsdorf@bianco-royal.de">Klaus Landsdorf</a> (Bianco Royal)

 **/

module.exports = function (RED) {
    var xsd2json = require('xsd2json2').xsd2json;
    var fs = require('fs');
    var path = require('path');

    function ISA95B2MMLHelperNode(config) {

        RED.nodes.createNode(this, config);
        this.action = config.action;

        var node = this;

        function verbose_warn(logMessage) {
            if (RED.settings.verbose) {
                node.warn((node.name) ? node.name + ': ' + logMessage : 'B2MML-Helper: ' + logMessage);
            }
        }

        function verbose_log(logMessage) {
            if (RED.settings.verbose) {
                node.log(logMessage);
            }
        }

        node.on('input', function (msg) {

            verbose_log("ISA95B2MMLHelperNodeAction: " + node.action);

            xsd2json(path.join(__dirname, 'public/vendor/mesa/Schema/B2MML-V0600-Material.xsd'))
                .pipe(process.stdout);

            xsd2json(filename, function(err, schemaObject) {
                node.log(JSON.stringify(schemaObject, null, 2));
            });

            var data = msg.payload;

            verbose_log("ISA95B2MMLHelperNodeType:" + typeof data);

            node.send(msg);
        });

        node.on('close', function (msg) {
            verbose_log("close");
        });
    }

    function work_with_equipment_schema(data, jsonSchema) {

        verbose_log("working with equipment schema");

        var equipment = { 'ID': data };

        xsd2json.addSchema(jsonSchema, 'Material');

        verbose_warn("validate schema equipment " + xsd2json.validate(equipment, jsonSchema));
    }

    RED.nodes.registerType("B2MML-Helper", ISA95B2MMLHelperNode);
};