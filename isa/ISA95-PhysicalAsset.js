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

module.exports = function(RED) {
    function ISA95PhysicalAssetNode(config) {

        RED.nodes.createNode(this, config);
        this.action = config.action;

        var node = this;
        this.on('input', function (msg) {
            console.log("ISA95PhysicalAssetTypeNode Action: " + node.action);

            var data = msg.payload;
            console.log("ISA95PhysicalAssetTypeNode Type:" + typeof data);

            switch (node.action) {
                case "default":
                    if (typeof data === "string") {
                        data = { 'version': 'PhysicalAssetType', 'data': data };
                    }
                    else
                    {
                        data = { 'info': 'ISA95PhysicalAssetTypeNode unknown data type for default action', 'data': data, 'type': typeof data }
                    }
                    break;
                case "extended":
                    if (typeof data === "string") {
                        data = { 'version': 'PhysicalAssetTypeExtended', 'data': data };
                    }
                    else
                    {
                        data = { 'info': 'ISA95PhysicalAssetTypeNode unknown data type for extended action', 'data': data, 'type': typeof data }
                    }
                    break;
                default:
                    data = { 'info': 'ISA95PhysicalAssetTypeNode unknown action or data type', 'data': data, 'type': typeof data };
            }

            msg.payload = data;
            node.send(msg);
        });
    }
    RED.nodes.registerType("ISA95-PhysicalAsset", ISA95PhysicalAssetNode);
};