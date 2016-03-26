/*

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
*/


module.exports = function (RED) {
    "use strict";
    var opcua = require('node-opcua');
    var path = require('path');
    var os = require("os");
    var prettyjson = require('prettyjson');
    var pjOptions = {
        noColor: true
    };

    function ISA95OpcUaServerNode(n) {

        RED.nodes.createNode(this, n);

        this.name = n.name;
        this.port = n.port;
        var node = this;

        var equipmentCounter = 0;
        var physicalAssetCounter = 0;
        var counterValue = 0;
        var equipment;
        var physicalAssets;
        var vendorName;
        var equipmentNotFound = true;
        var initialized = false;
        var server = null;

        node.status({fill: "red", shape: "ring", text: "Not running"});

        var xmlFiles = [path.join(__dirname, 'public/vendor/opc-foundation/xml/Opc.Ua.NodeSet2.xml'),
            path.join(__dirname, 'public/vendor/opc-foundation/xml/Opc.ISA95.NodeSet2.xml')];
        node.warn("node set:" + xmlFiles.toString());

        function initNewServer() {

            initialized = false;
            node.warn("create Server from XML ...");
            server = new opcua.OPCUAServer({port: node.port, nodeset_filename: xmlFiles});
            server.buildInfo.productName = node.name.concat("ISA-95 OPC UA server");
            server.buildInfo.buildNumber = "911";
            server.buildInfo.buildDate = new Date(2016, 3, 26);
            node.warn("init next...");
            server.initialize(post_initialize);
        }

        function construct_my_address_space(addressSpace) {

            node.warn('Server add VendorName ...');

            vendorName = addressSpace.addObject({
                organizedBy: addressSpace.rootFolder.objects,
                nodeId: "ns=4;s=VendorName",
                browseName: "VendorName"
            });

            equipment = addressSpace.addObject({
                organizedBy: vendorName,
                nodeId: "ns=4;s=Equipment",
                browseName: "Equipment"
            });

            physicalAssets = addressSpace.addObject({
                organizedBy: vendorName,
                nodeId: "ns=4;s=PhysicalAssets",
                browseName: "Physical Assets"
            });

            node.warn('Server add MyVariable2 ...');

            var variable2 = 10.0;

            addressSpace.addVariable({
                componentOf: vendorName,
                nodeId: "ns=4;s=MyVariable2",
                browseName: "MyVariable2",
                dataType: "Double",

                value: {
                    get: function () {
                        return new opcua.Variant({dataType: opcua.DataType.Double, value: variable2});
                    },
                    set: function (variant) {
                        variable2 = parseFloat(variant.value);
                        return opcua.StatusCodes.Good;
                    }
                }
            });

            node.warn('Server add FreeMemory ...');

            addressSpace.addVariable({
                componentOf: vendorName,
                nodeId: "ns=4;s=FreeMemory",
                browseName: "FreeMemory",
                dataType: "Double",

                value: {
                    get: function () {
                        return new opcua.Variant({dataType: opcua.DataType.Double, value: available_memory()});
                    }
                }
            });

            node.warn('Server add Counter ...');

            addressSpace.addVariable({
                componentOf: vendorName,
                nodeId: "ns=4;s=Counter",
                browseName: "Counter",
                dataType: "Double",

                value: {
                    get: function () {
                        return new opcua.Variant({dataType: opcua.DataType.Double, value: counterValue});
                    }
                }
            });

            var method = addressSpace.addMethod(
                vendorName, {
                    browseName: "Bark",

                    inputArguments: [
                        {
                            name: "nbBarks",
                            description: {text: "specifies the number of time I should bark"},
                            dataType: opcua.DataType.UInt32
                        }, {
                            name: "volume",
                            description: {text: "specifies the sound volume [0 = quiet ,100 = loud]"},
                            dataType: opcua.DataType.UInt32
                        }
                    ],

                    outputArguments: [{
                        name: "Barks",
                        description: {text: "the generated barks"},
                        dataType: opcua.DataType.String,
                        valueRank: 1
                    }]
                });

            method.bindMethod(function (inputArguments, context, callback) {

                var nbBarks = inputArguments[0].value;
                var volume = inputArguments[1].value;

                console.log("Hello World ! I will bark ", nbBarks, " times");
                console.log("the requested volume is ", volume, "");
                var sound_volume = new Array(volume).join("!");

                var barks = [];
                for (var i = 0; i < nbBarks; i++) {
                    barks.push("Whaff" + sound_volume);
                }

                var callMethodResult = {
                    statusCode: opcua.StatusCodes.Good,
                    outputArguments: [{
                        dataType: opcua.DataType.String,
                        arrayType: opcua.VariantArrayType.Array,
                        value: barks
                    }]
                };
                callback(null, callMethodResult);
            });
        }

        function post_initialize() {

            if (server) {

                var addressSpace = server.engine.addressSpace;
                construct_my_address_space(addressSpace);

                node.warn("Next server start...");

                server.start(function () {
                    node.warn("Server is now listening ... ( press CTRL+C to stop)");
                    server.endpoints[0].endpointDescriptions().forEach(function (endpoint) {
                        var endpointUrl = server.endpoints[0].endpointDescriptions()[0].endpointUrl;
                        console.log(" the primary server endpoint url is ", endpointUrl);
                    });
                });
                node.status({fill: "green", shape: "dot", text: "running"});
                initialized = true;
                node.warn("server initialized");
            }
            else {
                node.status({fill: "gray", shape: "dot", text: "not running"});
                node.error("server is not initialized")
            }
        }

        function available_memory() {
            return os.freemem() / os.totalmem() * 100.0;
        }

        initNewServer();

        //######################################################################################
        node.on("input", function (msg) {

            if (server == undefined || !initialized)
                return;

            if (equipmentNotFound) {

                var addressSpace = server.engine.addressSpace;

                if (addressSpace === undefined) {
                    node.error("addressSpace undefinded");
                    return false;
                }

                var rootFolder = addressSpace.findNode("ns=4;s=VendorName");
                var references = rootFolder.findReferences("Organizes", true);

                if (findReference(references, equipment.nodeId)) {
                    node.warn("Equipment Reference found in VendorName");
                    equipmentNotFound = false;
                }
                else {
                    node.warn("Equipment Reference not found in VendorName");
                }
            }

            var payload = msg.payload;

            if (contains_messageType(payload)) {
                read_message(payload);
            }

            if (contains_opcua_command(payload)) {
                execute_opcua_command(payload);
            }
        });

        function findReference(references, nodeId) {
            return references.filter(function (r) {
                return r.nodeId.toString() === nodeId.toString();
            });
        }

        function contains_messageType(payload) {
            return payload.hasOwnProperty('messageType');
        }

        function read_message(payload) {

            switch (payload.messageType) {

                case 'Variable':
                    if (payload.variableName == "Counter") {
                        // Code for the Node-RED function to send the data by an inject
                        // msg = { payload : { "messageType" : "Variable", "variableName": "Counter", "variableValue": msg.payload }};
                        // return msg;
                        counterValue = payload.variableValue[0];
                    }
                    break;

                default:
                    console.log("unknown Message type");
                    node.error("unknown Message type");
                    node.warn(prettyjson.render(payload, pjOptions));
                    console.log(prettyjson.render(payload, pjOptions));
            }
        }

        function contains_opcua_command(payload) {
            return payload.hasOwnProperty('opcuaCommand');
        }

        function execute_opcua_command(payload) {

            var addressSpace = server.engine.addressSpace;
            var name;

            switch (payload.opcuaCommand) {

                case "restartOPCUAServer":
                    restart_server();
                    break;

                case "addEquipment":
                    node.warn("adding Node".concat(payload.nodeName));
                    equipmentCounter++;
                    name = payload.nodeName.concat(equipmentCounter);

                    addressSpace.addObject({
                        organizedBy: addressSpace.findNode(equipment.nodeId),
                        nodeId: "ns=4;s=".concat(name),
                        browseName: name
                    });
                    break;

                case "addPhysicalAsset":
                    node.warn("adding Node".concat(payload.nodeName));
                    physicalAssetCounter++;
                    name = payload.nodeName.concat(physicalAssetCounter);

                    addressSpace.addObject({
                        organizedBy: addressSpace.findNode(physicalAssets.nodeId),
                        nodeId: "ns=4;s=".concat(name),
                        browseName: name
                    });
                    break;

                case "deleteNode":
                    if (addressSpace === undefined) {
                        node.error("addressSpace undefinded");
                        return false;
                    }

                    var searchedNode = addressSpace.findNode(payload.nodeId);
                    if (searchedNode === undefined) {
                        node.warn("can not find Node in addressSpace")
                    } else {
                        addressSpace.deleteNode(searchedNode);
                    }
                    break;

                default:
                    consol.log("unknown OPC UA Command");
                    node.error("unknown OPC UA Command");
                    node.warn(prettyjson.render(payload, pjOptions));
                    console.log(prettyjson.render(payload, pjOptions));
            }

        }

        function restart_server() {
            node.warn("Restart OPC UA Server");
            if (server) {
                server.shutdown(function () {
                    server = null;
                    vendorName = null;
                    initNewServer();
                });

            } else {
                server = null;
                vendorName = null;
                initNewServer();
            }

            if (server) {
                node.warn("Restart OPC UA Server done");
            } else {
                node.error("can not restart OPC UA Server");
            }
        }

        node.on("close", function () {
            node.warn("closing...");
            close_server();
        });

        function close_server() {
            if (server) {
                server.shutdown(function () {
                    server = null;
                    vendorName = null;
                });

            } else {
                server = null;
                vendorName = null;
            }
        }
    }

    RED.nodes.registerType("ISA95OpcUaServer", ISA95OpcUaServerNode);
};
