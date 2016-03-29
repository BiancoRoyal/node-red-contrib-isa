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
    var qualifiedName = require("node-opcua/lib/datamodel/qualified_name");
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
        var examples;
        var enterprises;

        var initialized = false;
        var server = null;
        var dynamicNodes = [];

        function verbose_warn(logMessage) {
            if (RED.settings.verbose) {
                node.warn((node.name) ? node.name + ': ' + logMessage : 'OpcUaServerNode: ' + logMessage);
            }
        }

        function verbose_log(logMessage) {
            if (RED.settings.verbose) {
                node.log(logMessage);
            }
        }

        node.status({fill: "red", shape: "ring", text: "Not running"});

        var xmlFiles = [path.join(__dirname, 'public/vendor/opc-foundation/xml/Opc.Ua.NodeSet2.xml'),
            path.join(__dirname, 'public/vendor/opc-foundation/xml/Opc.ISA95.NodeSet2.xml')];
        verbose_warn("node set:" + xmlFiles.toString());

        function initNewServer() {

            initialized = false;
            verbose_warn("create Server from XML ...");
            server = new opcua.OPCUAServer({port: node.port, nodeset_filename: xmlFiles});
            server.buildInfo.productName = node.name.concat("OPC UA server");
            server.buildInfo.buildNumber = "911";
            server.buildInfo.buildDate = new Date(2016, 3, 24);
            verbose_warn("init next...");
            server.initialize(post_initialize);
        }

        function build_enterprise_structure(addressSpace, namespace, id) {

            var enterprise = addressSpace.addObject({
                organizedBy: enterprises,
                nodeId: "ns=" + namespace + ";s=Enterprise" + id,
                browseName: "Enterprise" + id
            });

            var sites = addressSpace.addObject({
                organizedBy: enterprise,
                nodeId: "ns=" + namespace + ";s=Sites",
                browseName: "Sites"
            });

            var site = addressSpace.addObject({
                organizedBy: sites,
                nodeId: "ns=" + namespace + ";s=Site" + id,
                browseName: "Site" + id
            });

            var areas = addressSpace.addObject({
                organizedBy: site,
                nodeId: "ns=" + namespace + ";s=Areas",
                browseName: "Areas"
            });

            var area = addressSpace.addObject({
                organizedBy: areas,
                nodeId: "ns=" + namespace + ";s=Area" + id,
                browseName: "Area" + id
            });

            var processcells = addressSpace.addObject({
                organizedBy: area,
                nodeId: "ns=" + namespace + ";s=ProcessCells",
                browseName: "ProcessCells"
            });

            var processcell = addressSpace.addObject({
                organizedBy: processcells,
                nodeId: "ns=" + namespace + ";s=ProcessCell" + id,
                browseName: "ProcessCell" + id
            });

            addressSpace.addObject({
                organizedBy: processcell,
                nodeId: "ns=" + namespace + ";s=Storage",
                browseName: "Storage"
            });

            var units = addressSpace.addObject({
                organizedBy: processcell,
                nodeId: "ns=" + namespace + ";s=Units",
                browseName: "Units"
            });

            var unit = addressSpace.addObject({
                organizedBy: units,
                nodeId: "ns=" + namespace + ";s=Unit" + id,
                browseName: "Unit" + id
            });

            var lines = addressSpace.addObject({
                organizedBy: unit,
                nodeId: "ns=" + namespace + ";s=Lines",
                browseName: "Lines"
            });

            var line = addressSpace.addObject({
                organizedBy: lines,
                nodeId: "ns=" + namespace + ";s=Line" + id,
                browseName: "Line" + id
            });

            var productionunits = addressSpace.addObject({
                organizedBy: line,
                nodeId: "ns=" + namespace + ";s=ProductionUnits",
                browseName: "ProductionUnits"
            });

            addressSpace.addObject({
                organizedBy: productionunits,
                nodeId: "ns=" + namespace + ";s=ProductionUnit" + id,
                browseName: "ProductionUnit" + id
            });


            // business
            addressSpace.addObject({
                organizedBy: processcell,
                nodeId: "ns=" + namespace + ";s=Orders",
                browseName: "Orders"
            });

            addressSpace.addObject({
                organizedBy: enterprise,
                nodeId: "ns=" + namespace + ";s=MasterRecipe",
                browseName: "MasterRecipe"
            });

            addressSpace.addObject({
                organizedBy: enterprise,
                nodeId: "ns=" + namespace + ";s=Recipe",
                browseName: "Recipe"
            });

            addressSpace.addObject({
                organizedBy: processcell,
                nodeId: "ns=" + namespace + ";s=ControlRecipe",
                browseName: "ControlRecipe"
            });

            addressSpace.addObject({
                organizedBy: enterprise,
                nodeId: "ns=" + namespace + ";s=Materials",
                browseName: "Materials"
            });

            addressSpace.addObject({
                organizedBy: enterprise,
                nodeId: "ns=" + namespace + ";s=Materiallots",
                browseName: "Materiallots"
            });

            addressSpace.addObject({
                organizedBy: enterprise,
                nodeId: "ns=" + namespace + ";s=Materialsublots",
                browseName: "Materialsublots"
            });
        }

        function construct_my_address_space(addressSpace) {

            verbose_warn('Server add structure ...');

            var objectsOrganizer = addressSpace.findNode("ns=0;i=85");
            var serverNode = addressSpace.findNode("ns=0;i=2253");
            var references = objectsOrganizer.findReferences("Organizes", true);

            if (findReference(references, serverNode.nodeId)) {
                verbose_warn("Server Reference found in Objects");
            }
            else {
                verbose_warn("Server Reference not found in Objects");
                return;
            }

            examples = addressSpace.addObject({
                organizedBy: addressSpace.rootFolder.objects,
                nodeId: "ns=4;s=Examples",
                browseName: "Examples"
                // browseName: new qualifiedName.QualifiedName({name: "Examples", namespaceIndex: 4})
            });

            enterprises = addressSpace.addObject({
                organizedBy: addressSpace.rootFolder.objects,
                nodeId: "ns=4;s=Enterprises",
                browseName: "Enterprises"
            });

            build_enterprise_structure(addressSpace, 5, 1);
            build_enterprise_structure(addressSpace, 6, 2);

            // ######################################################################################################
            verbose_warn('Server add MyVariable2 ...');

            var variable2 = 10.0;

            addressSpace.addVariable({
                componentOf: examples,
                nodeId: "ns=4;s=MyVariable2",
                browseName: "MyVariable2",
                dataType: opcua.DataType.Double,

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

            verbose_warn('Server add FreeMemory ...');

            addressSpace.addVariable({
                componentOf: examples,
                nodeId: "ns=4;s=FreeMemory",
                browseName: "FreeMemory",
                dataType: opcua.DataType.Double,

                value: {
                    get: function () {
                        return new opcua.Variant({dataType: opcua.DataType.Double, value: available_memory()});
                    }
                }
            });

            verbose_warn('Server add Counter ...');

            addressSpace.addVariable({
                componentOf: examples,
                nodeId: "ns=4;s=Counter",
                browseName: "Counter",
                dataType: opcua.DataType.UInt16,

                value: {
                    get: function () {
                        return new opcua.Variant({dataType: opcua.DataType.UInt16, value: counterValue});
                    }
                }
            });

            var method = addressSpace.addMethod(
                examples, {
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

                verbose_log("Hello World ! I will bark ", nbBarks, " times");
                verbose_log("the requested volume is ", volume, "");
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

                verbose_warn("Next server start...");

                server.start(function () {
                    verbose_warn("Server is now listening ... ( press CTRL+C to stop)");
                    server.endpoints[0].endpointDescriptions().forEach(function (endpoint) {
                        verbose_warn("Server endpointUrl: " + endpoint.endpointUrl + ' securityMode: ' + endpoint.securityMode.toString() + ' securityPolicyUri: ' + endpoint.securityPolicyUri.toString());
                    });

                    var endpointUrl = server.endpoints[0].endpointDescriptions()[0].endpointUrl;
                    verbose_log(" the primary server endpoint url is " + endpointUrl);
                });
                node.status({fill: "green", shape: "dot", text: "running"});
                initialized = true;
                verbose_warn("server initialized");
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

            // verbose_log("input " + msg.payload);

            if (!server) {
                verbose_warn("no Server");
                return;
            }

            if (!initialized) {
                verbose_warn("Server is not initialized");
                return;
            }

            var payload = msg.payload;

            // verbose_log("check for mapping");
            if (contains_mappingType(payload)) {
                verbose_log("has mapping");
                check_mapping(payload);
            }

            // verbose_log("check for message");
            if (contains_messageType(payload)) {
                verbose_log("has message");
                read_message(payload);
            }

            // verbose_log("check for opc ua command");
            if (contains_opcua_command(payload)) {
                verbose_log("has opc ua command");
                execute_opcua_command(payload);
            }

            node.send(msg);
        });

        function findReference(references, nodeId) {

            if (!nodeId) {
                verbose_warn("can not search with this node " + nodeId);
            }

            // verbose_log("searching Reference for " + nodeId.toString());

            var found = false;

            references.filter(function (r) {

                // verbose_log(nodeId.toString() + " equals " + r.nodeId.toString());

                if (r.nodeId.toString() == nodeId.toString()) {
                    found = true;
                }
            });

            return found;
        }

        function contains_mappingType(payload) {
            return payload.hasOwnProperty('mappingType');
        }

        function check_mapping(payload) {

            var addressSpace = server.engine.addressSpace;

            if (addressSpace === undefined) {
                node.error("addressSpace undefinded");
                return;
            }

            switch (payload.mappingType) {

                case 'new':
                    verbose_log("new mapping to check " + payload.mappings.length);

                    payload.mappings.forEach(function (mapping) {

                        verbose_log("search Node Id " + mapping.structureParentNodeId);

                        var rootFolder = addressSpace.findNode(mapping.structureParentNodeId);

                        if (!rootFolder) {
                            verbose_warn("root folder not found structureParentNodeId: " + mapping.structureParentNodeId);
                            return;
                        }

                        var references = rootFolder.findReferences("Organizes", true);

                        if (!mapping.structureNodeId) {
                            verbose_warn("mapping.structureNodeId not valid " + mapping.structureNodeId);
                            return;
                        }

                        if (findReference(references, mapping.structureNodeId)) {
                            verbose_log(mapping.structureNodeId + " Mapping Reference found in " + mapping.structureParentNodeId);

                        }
                        else {
                            verbose_warn(mapping.structureNodeId + " Mapping Reference not found in " + mapping.structureParentNodeId);

                            if (rootFolder) {

                                var variableDatatype = opcua.DataType.String;
                                var initValue = '';

                                verbose_log("structrue Type: " + mapping.typeStructure);

                                switch (mapping.typeStructure) {

                                    case 'Bool':
                                    case 'Boolean':
                                        variableDatatype = opcua.DataType.Boolean;
                                        initValue = false;
                                        break;

                                    case 'Float':
                                        variableDatatype = opcua.DataType.Float;
                                        initValue = 0.0;
                                        break;

                                    case 'Double':
                                    case 'Real':
                                        variableDatatype = opcua.DataType.Double;
                                        initValue = 0.0;
                                        break;

                                    case 'UInt16':
                                        variableDatatype = opcua.DataType.UInt16;
                                        initValue = 0;
                                        break;

                                    case 'Int16':
                                        variableDatatype = opcua.DataType.Int16;
                                        initValue = 0;
                                        break;

                                    case 'Int':
                                    case 'Int32':
                                    case 'Integer':
                                        variableDatatype = opcua.DataType.Int32;
                                        initValue = 0;
                                        break;

                                    case 'UInt':
                                    case 'UInt32':
                                    case 'UInteger':
                                        variableDatatype = opcua.DataType.UInt32;
                                        initValue = 0;
                                        break;

                                    default:
                                        break;

                                }

                                try {
                                    verbose_log('datatype ' + variableDatatype + ' value ' + initValue);

                                    verbose_log("mapping.structureNodeId type " + typeof mapping.structureNodeId);
                                    verbose_log("add Variable to root " + rootFolder.nodeId + ' with NodeId: ' + mapping.structureNodeId + ' browseName: ' + mapping.structureName + ' with datatype ' + variableDatatype.toString() + ' value ' + initValue);

                                    var item = read_mapped_value(mapping.structureNodeId, initValue);

                                    addressSpace.addVariable({
                                        organizedBy: rootFolder,
                                        nodeId: mapping.structureNodeId,
                                        browseName: mapping.structureName,
                                        dataType: variableDatatype,

                                        value: {
                                            get: function () {
                                                return new opcua.Variant({
                                                    dataType: variableDatatype,
                                                    value: item.value
                                                });
                                            }
                                        }
                                    });

                                } catch (err) {
                                    node.error(err);
                                }
                            }
                            else {
                                verbose_warn("Root folder not found to map new Node " + mapping.structureParentNodeId)
                            }
                        }

                    });
                    break;

                case 'write':
                    payload.mappings.forEach(function (mapping) {
                        try {
                            verbose_log("mapping write for " + mapping.nodeId);
                            write_mapped_value(mapping.nodeId, mapping.value);
                            verbose_log("value written for " + mapping.nodeId);
                        } catch (err) {
                            node.error(err);
                        }
                    });
                    break;

                default:
                    verbose_log("Mapping unchanged");
            }
        }

        function read_mapped_value(nodeId, initValue) {

            var filteredNode = dynamicNodes.filter(function (entry) {
                return entry.nodeId.toString() === nodeId.toString();
            });

            if (filteredNode.length) {
                var item = filteredNode[0];
                verbose_log( 'filteredNode length ' + filteredNode.length + " read mapped item " + item);
            }
            else {
                verbose_log("add mapped item by read " + nodeId);
                item = {'nodeId': nodeId, 'value': initValue};
                dynamicNodes.add(item);
            }

            return item;
        }

        function write_mapped_value(nodeId, value) {

            var filteredNode = dynamicNodes.filter(function (entry) {
                return entry.nodeId.toString() === nodeId.toString();
            });

            if (filteredNode.length) {
                var item = filteredNode[0];
                verbose_log( 'filteredNode length ' + filteredNode.length + " write mapped item " + item);
                item.value = value;
            }
            else {
                verbose_log("add mapped item by write " + nodeId);
                item = {'nodeId': nodeId, 'value': value};
                dynamicNodes.add(item);
            }
        }

        function build_new_variant(mapping) {

            var nValue = new opcua.Variant({dataType: opcua.DataType.Float, value: 0.0});

            switch (mapping.datatype) {
                case"Float":
                    nValue = new opcua.Variant({dataType: opcua.DataType.Float, value: parseFloat(mapping.value)});
                    break;
                case"Double":
                    nValue = new opcua.Variant({
                        dataType: opcua.DataType.Double,
                        value: parseFloat(mapping.value)
                    });
                    break;
                case"UInt16":
                    var uint16 = new Uint16Array([mapping.value]);
                    nValue = new opcua.Variant({dataType: opcua.DataType.UInt16, value: uint16[0]});
                    break;
                case"Integer":
                    nValue = new opcua.Variant({dataType: opcua.DataType.UInt16, value: parseInt(mapping.value)});
                    break;
                case"Boolean":
                    if (mapping.value) {
                        nValue = new opcua.Variant({dataType: opcua.DataType.Boolean, value: true})
                    }
                    else {
                        nValue = new opcua.Variant({dataType: opcua.DataType.Boolean, value: false})
                    }
                    break;
                case"String":
                    nValue = new opcua.Variant({dataType: opcua.DataType.String, value: mapping.value});
                    break;
                default:
                    break;
            }

            return nValue;
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
                        counterValue = payload.variableValue;
                    }
                    break;

                default:
                    verbose_log("unknown Message type");
                    verbose_warn("unknown Message type");
                    verbose_log(prettyjson.render(payload, pjOptions));
                    verbose_warn(prettyjson.render(payload, pjOptions));
            }
        }

        function contains_opcua_command(payload) {
            return payload.hasOwnProperty('opcuaCommand');
        }

        function execute_opcua_command(payload) {

            var addressSpace = server.engine.addressSpace;
            var name;

            verbose_warn("execute OPC UA command ".concat(payload.opcuaCommand));

            switch (payload.opcuaCommand) {

                case "restartOPCUAServer":
                    restart_server();
                    break;

                case "addEquipment":
                    verbose_warn("adding Node".concat(payload.nodeName));
                    equipmentCounter++;
                    name = payload.nodeName.concat(equipmentCounter);

                    addressSpace.addObject({
                        organizedBy: examples,
                        nodeId: "ns=4;s=".concat(name),
                        browseName: name
                    });
                    break;

                case "addPhysicalAsset":
                    verbose_warn("adding Node".concat(payload.nodeName));
                    physicalAssetCounter++;
                    name = payload.nodeName.concat(physicalAssetCounter);

                    addressSpace.addObject({
                        organizedBy: examples,
                        nodeId: "ns=4;s=".concat(name),
                        browseName: name
                    });

                    addressSpace.addVariable({
                        organizedBy: examples,
                        nodeId: "ns=4;s=".concat(name) + "Variable",
                        browseName: name + "Variable",
                        dataType: opcua.DataType.String,

                        value: {
                            get: function () {
                                return new opcua.Variant({
                                    dataType: opcua.DataType.String,
                                    value: name
                                });
                            }
                        }
                    });

                    break;

                case "deleteNode":
                    if (addressSpace === undefined) {
                        node.error("addressSpace undefinded");
                        return false;
                    }

                    var searchedNode = addressSpace.findNode(payload.nodeId);
                    if (searchedNode === undefined) {
                        verbose_warn("can not find Node in addressSpace")
                    } else {
                        addressSpace.deleteNode(searchedNode);
                    }
                    break;

                default:
                    verbose_warn("unknown OPC UA Command");
                    verbose_log("unknown OPC UA Command");
                    verbose_warn(prettyjson.render(payload, pjOptions));
                    verbose_log(prettyjson.render(payload, pjOptions));
            }

        }

        function reset_structure() {

            // manufacture
            enterprises = null;
        }

        function restart_server() {
            verbose_warn("Restart OPC UA Server");
            if (server) {
                server.shutdown(function () {
                    server = null;
                    examples = null;
                    initNewServer();
                });

            } else {
                server = null;
                examples = null;
                reset_structure();
                initNewServer();
            }

            if (server) {
                verbose_warn("Restart OPC UA Server done");
            } else {
                node.error("can not restart OPC UA Server");
            }
        }

        node.on("close", function () {
            verbose_warn("closing...");
            close_server();
        });

        function close_server() {
            if (server) {
                server.shutdown(function () {
                    server = null;
                    examples = null;
                    reset_structure();
                });

            } else {
                server = null;
                examples = null;
                reset_structure();
            }
        }
    }

    RED.nodes.registerType("ISA95-OPCUA-Server", ISA95OpcUaServerNode);
};
