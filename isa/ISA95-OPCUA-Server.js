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
        var serverAddressSpace;


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

        set_server_notrunning();

        var xmlFiles = [path.join(__dirname, 'public/vendor/opc-foundation/xml/Opc.Ua.NodeSet2.xml'),
            path.join(__dirname, 'public/vendor/opc-foundation/xml/Opc.ISA95.NodeSet2.xml')];
        verbose_warn("node set:" + xmlFiles.toString());

        function initNewServer() {

            initialized = false;
            verbose_warn("create Server from XML ...");

            server = new opcua.OPCUAServer({
                port: node.port,
                nodeset_filename: xmlFiles,
                resourcePath: "UA/NodeRED/ISA95Server"});

            server.buildInfo.productName = node.name.concat("OPC UA server");
            server.buildInfo.buildNumber = "911";
            server.buildInfo.buildDate = new Date(2016, 4, 1);
            verbose_warn("init next...");
            server.initialize(post_initialize);
        }

        function addOrganizeObject(organizeNodeObject, nodeBrowseName, namespace) {

            return serverAddressSpace.addObject({
                organizedBy: organizeNodeObject,
                nodeId: "ns=" + namespace + ";s=" + nodeBrowseName,
                browseName: new qualifiedName.QualifiedName({name: nodeBrowseName, namespaceIndex: namespace}),
                displayName: nodeBrowseName,
                symbolicName: nodeBrowseName
            });
        }

        function addOrganizeFolder(organizeNodeObject, nodeBrowseName, namespace) {

            return serverAddressSpace.addObject({
                organizedBy: organizeNodeObject,
                typeDefinition: "FolderType",
                nodeId: "ns=" + namespace + ";s=" + nodeBrowseName,
                browseName: new qualifiedName.QualifiedName({name: nodeBrowseName, namespaceIndex: namespace}),
                displayName: nodeBrowseName,
                symbolicName: nodeBrowseName
            });
        }

        function build_enterprise_structure(namespace, id) {

            // ### Level 4 ###
            var enterprise = addOrganizeFolder(enterprises, "Enterprise" + id, namespace);
            var sites = addOrganizeFolder(enterprise, "Sites", namespace);
            var site = addOrganizeFolder(sites, "Site" + id, namespace);
            var areas = addOrganizeFolder(site, "Areas", namespace);

            // ### Level 3 ###
            var area = addOrganizeFolder(areas, "Area" + id, namespace);
            var workcenters = addOrganizeFolder(area, "WorkCenters", namespace);
            var workcenter = addOrganizeFolder(workcenters, "WorkCenter" + id, namespace);

            // ### Storage ###
            var storageZones = addOrganizeFolder(workcenter, "StorageZones", namespace);
            var storageZone = addOrganizeFolder(storageZones, "StorageZone" + id, namespace);
            var storageUnits = addOrganizeFolder(storageZone, "StorageUnits", namespace);
            addOrganizeFolder(storageUnits, "StorageUnit" + id, namespace);

            // ### Work Units ###
            var workunits = addOrganizeFolder(workcenter, "WorkUnits", namespace);
            var workunit = addOrganizeFolder(workunits, "WorkUnit" + id, namespace);
            var processcells = addOrganizeFolder(workunit, "ProcessCells", namespace);
            var processcell = addOrganizeFolder(processcells, "ProcessCell" + id, namespace);
            var units = addOrganizeFolder(processcell, "Units", namespace);
            var unit = addOrganizeFolder(units, "Unit" + id, namespace);
            var lines = addOrganizeFolder(unit, "ProductionLines", namespace);
            var line = addOrganizeFolder(lines, "ProductionLine" + id, namespace);
            var workcells = addOrganizeFolder(line, "WorkCells", namespace);
            var workcell = addOrganizeFolder(workcells, "WorkCell" + id, namespace);
            var productionunits = addOrganizeFolder(workcell, "ProductionUnits", namespace);
            addOrganizeFolder(productionunits, "ProductionUnit" + id, namespace);

            // ### Business structrue ###
            addOrganizeFolder(enterprise, "MasterRecipes", namespace);
            addOrganizeFolder(enterprise, "Recipes", namespace);
            addOrganizeFolder(enterprise, "Materials", namespace);
            addOrganizeFolder(enterprise, "MaterialLots", namespace);
            addOrganizeFolder(enterprise, "MaterialSublots", namespace);

            addOrganizeFolder(processcell, "Orders", namespace);
            addOrganizeFolder(processcell, "ControlRecipes", namespace);
        }

        function construct_my_address_space() {

            verbose_warn('Server add structure ...');

            var objectsOrganizer = serverAddressSpace.findNode("ns=0;i=85");
            var serverNode = serverAddressSpace.findNode("ns=0;i=2253");
            var references = objectsOrganizer.findReferences("Organizes", true);

            if (findReference(references, serverNode.nodeId)) {
                verbose_warn("Server Reference found in Objects");
            }
            else {
                verbose_warn("Server Reference not found in Objects");
                return;
            }

            enterprises = addOrganizeFolder(serverAddressSpace.rootFolder.objects, "Enterprises", 4);
            examples = addOrganizeFolder(serverAddressSpace.rootFolder.objects, "Examples", 4);
            build_enterprise_structure(5, 1);
            build_enterprise_structure(6, 2);

            // ######################################################################################################
            verbose_warn('Server add MyVariable2 ...');

            var variable2 = 10.0;

            serverAddressSpace.addVariable({
                componentOf: examples,
                nodeId: "ns=4;s=MyVariable",
                browseName: new qualifiedName.QualifiedName({name: "MyVariable", namespaceIndex: 4}),
                displayName: "MyVariable",
                symbolicName: "MyVariable",
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

            serverAddressSpace.addVariable({
                componentOf: examples,
                nodeId: "ns=4;s=FreeMemory",
                dataType: opcua.DataType.Double,
                browseName: new qualifiedName.QualifiedName({name: "FreeMemory", namespaceIndex: 4}),
                displayName: "FreeMemory",
                symbolicName: "FreeMemory",

                value: {
                    get: function () {
                        return new opcua.Variant({dataType: opcua.DataType.Double, value: available_memory()});
                    }
                }
            });

            verbose_warn('Server add Counter ...');

            serverAddressSpace.addVariable({
                componentOf: examples,
                nodeId: "ns=4;s=Counter",
                dataType: opcua.DataType.UInt16,
                browseName: new qualifiedName.QualifiedName({name: "Counter", namespaceIndex: 4}),
                displayName: "Counter",
                symbolicName: "Counter",

                value: {
                    get: function () {
                        return new opcua.Variant({dataType: opcua.DataType.UInt16, value: counterValue});
                    }
                }
            });

            var method = serverAddressSpace.addMethod(
                examples, {
                    browseName: new qualifiedName.QualifiedName({name: "Bark", namespaceIndex: 4}),
                    displayName: "Bark",
                    symbolicName: "Bark",

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

                serverAddressSpace = server.engine.addressSpace;

                if (!serverAddressSpace) {
                    verbose_warn("post initialize - AddressSpace not ready to use");
                    return;
                }

                construct_my_address_space();

                verbose_warn("Next server start...");

                server.start(function () {
                    verbose_warn("Server is now listening ... ( press CTRL+C to stop)");
                    server.endpoints[0].endpointDescriptions().forEach(function (endpoint) {
                        verbose_warn("Server endpointUrl: " + endpoint.endpointUrl + ' securityMode: ' + endpoint.securityMode.toString() + ' securityPolicyUri: ' + endpoint.securityPolicyUri.toString());
                    });

                    var endpointUrl = server.endpoints[0].endpointDescriptions()[0].endpointUrl;
                    verbose_log(" the primary server endpoint url is " + endpointUrl);
                });

                set_server_running();

                initialized = true;

                verbose_warn("server initialized");
            }
            else {
                set_server_stoped();
                node.error("server is not initialized")
            }
        }

        function set_server_running() {
            node.status({fill: "green", shape: "dot", text: "running"});
        }

        function set_server_stoped() {
            node.status({fill: "gray", shape: "dot", text: "not running"});
        }

        function available_memory() {
            return os.freemem() / os.totalmem() * 100.0;
        }

        initNewServer();

        function check_server_ready() {

            if (!server) {
                verbose_warn("no Server");
            }

            if (!initialized) {
                verbose_warn("Server is not initialized");
            }

            if (!serverAddressSpace) {
                verbose_warn("Server has no valid AddressSpace");
            }

            return (server && initialized);
        }

        //######################################################################################
        node.on("input", function (msg) {

            // verbose_log("input " + msg.payload);
            var payload = msg.payload;

            // verbose_log("check for opc ua command");
            if (contains_opcua_command(payload)) {
                verbose_log("has opc ua command");
                execute_opcua_command(payload);
                return;
            }

            if (!check_server_ready()) {
                return;
            }

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

            if (!check_server_ready()) {
                return;
            }

            switch (payload.mappingType) {

                case 'new':
                    verbose_log("new mapping to check " + payload.mappings.length);

                    payload.mappings.forEach(function (mapping) {

                            verbose_log("search Node Id " + mapping.structureParentNodeId);

                            var rootFolder = serverAddressSpace.findNode(mapping.structureParentNodeId);

                            if (!rootFolder) {
                                verbose_warn("root folder not found structureParentNodeId: " + mapping.structureParentNodeId);
                                return;
                            }


                            if (!mapping.structureNodeId) {
                                verbose_warn("mapping.structureNodeId not valid " + mapping.structureNodeId);
                                return;
                            }

                            var references;

                            switch (mapping.structureType) {

                                case 'Variable':
                                    references = rootFolder.findReferences("HasComponent", true);
                                    break;

                                default:
                                    references = rootFolder.findReferences("Organizes", true);
                            }

                            if (findReference(references, mapping.structureNodeId)) {
                                verbose_log(mapping.structureNodeId + " Mapping Reference found in " + mapping.structureParentNodeId);
                            }
                            else {
                                verbose_warn(mapping.structureNodeId + " Mapping Reference not found in " + mapping.structureParentNodeId);

                                if (rootFolder) {

                                    switch (mapping.structureType) {

                                        case 'Variable':
                                            add_opcua_variable(rootFolder, mapping);
                                            break;

                                        case 'Object':
                                            add_opcua_object(rootFolder, mapping);
                                            break;
                                        default:
                                            break;
                                    }
                                }
                                else {
                                    verbose_warn("Root folder not found to map new Node " + mapping.structureParentNodeId)
                                }
                            }

                        }
                    );
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

        function add_opcua_variable(rootFolder, mapping) {

            verbose_log("add_opcua_variable");

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
                verbose_log("add Variable to root " + rootFolder.nodeId + ' with NodeId: ' + mapping.structureNodeId + ' browseName: ' + mapping.structureName + ' with datatype ' + variableDatatype.toString() + ' value ' + initValue);

                var item = read_mapped_value(mapping.structureNodeId, initValue);

                serverAddressSpace.addVariable({
                    componentOf: rootFolder,
                    nodeId: mapping.structureNodeId,
                    browseName: mapping.structureName,
                    // browseName: new qualifiedName.QualifiedName({name: "Examples", namespaceIndex: 4})
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

        function add_opcua_object(rootFolder, mapping) {

            verbose_log("add dynamic object to OPC UA Server Type: " + mapping.typeStructure + ' NodeId:' + mapping.structureNodeId + ' Name: ' + mapping.structureName);
            try {

                if (mapping.typeStructure) {
                    serverAddressSpace.addObject({
                        organizedBy: rootFolder,
                        typeDefinition: mapping.typeStructure,
                        nodeId: mapping.structureNodeId,
                        browseName: mapping.structureName
                        // browseName: new qualifiedName.QualifiedName({name: "Examples", namespaceIndex: 4})
                    });
                } else {
                    serverAddressSpace.addObject({
                        organizedBy: rootFolder,
                        nodeId: mapping.structureNodeId,
                        browseName: mapping.structureName
                        // browseName: new qualifiedName.QualifiedName({name: "Examples", namespaceIndex: 4})
                    });
                }
            } catch (err) {
                node.error(err + " you need a valid ObjectType from what's in your OPC UA Server defined");
            }
        }

        function read_mapped_value(nodeId, initValue) {

            var filteredNode = dynamicNodes.filter(function (entry) {
                return entry.nodeId.toString() === nodeId.toString();
            });

            if (filteredNode.length) {
                var item = filteredNode[0];
                verbose_log('filteredNode length ' + filteredNode.length + " read mapped item " + item);
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
                verbose_log('filteredNode length ' + filteredNode.length + " write mapped item " + item);
                item.value = value;
            }
            else {
                verbose_log("add mapped item by write " + nodeId);
                item = {'nodeId': nodeId, 'value': value};
                dynamicNodes.add(item);
            }
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

            var name;

            verbose_warn("execute OPC UA command ".concat(payload.opcuaCommand));

            switch (payload.opcuaCommand) {

                case "restartOPCUAServer":
                case "startOPCUAServer":
                    restart_server();
                    break;

                case "stopOPCUAServer":
                    stop_server();
                    break;

                case "addEquipment":

                    if (!check_server_ready()) {
                        verbose_warn("Server not active for adding ".concat(payload.nodeName));
                        return;
                    }

                    verbose_warn("adding Node".concat(payload.nodeName));
                    equipmentCounter++;
                    name = payload.nodeName.concat(equipmentCounter);

                    serverAddressSpace.addObject({
                        organizedBy: examples,
                        nodeId: "ns=4;s=".concat(name),
                        browseName: name
                    });
                    break;

                case "addPhysicalAsset":

                    if (!check_server_ready()) {
                        verbose_warn("Server not active for adding ".concat(payload.nodeName));
                        return;
                    }

                    verbose_warn("adding Node".concat(payload.nodeName));
                    physicalAssetCounter++;
                    name = payload.nodeName.concat(physicalAssetCounter);

                    serverAddressSpace.addObject({
                        organizedBy: examples,
                        nodeId: "ns=4;s=".concat(name),
                        browseName: name
                    });

                    serverAddressSpace.addVariable({
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

                    if (!check_server_ready()) {
                        verbose_warn("Server not active for deleting ".concat(payload.nodeName));
                        return;
                    }

                    var searchedNode = serverAddressSpace.findNode(payload.nodeId);
                    if (searchedNode === undefined) {
                        verbose_warn("can not find Node in serverAddressSpace")
                    } else {
                        serverAddressSpace.deleteNode(searchedNode);
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

            // examples
            examples = null;
        }

        function set_server_notrunning() {
            node.status({fill: "red", shape: "ring", text: "Not running"});
        }

        function reset_internals() {
            server = null;
            reset_structure();
        }

        function stop_server() {
            verbose_warn("Stop OPC UA Server");
            if (server) {
                server.shutdown(function () {
                    reset_internals();
                    set_server_stoped();
                });

            } else {
                reset_internals();
                set_server_stoped();
            }
        }

        function restart_server() {

            if (server) {
                verbose_warn("Restart OPC UA Server");
                server.shutdown(function () {
                    reset_internals();
                    initNewServer();
                });

            } else {
                verbose_warn("Start OPC UA Server");
                reset_internals();
                set_server_stoped();
                initNewServer();
            }

            if (server) {
                verbose_warn("OPC UA Server started");
            } else {
                node.error("can't start OPC UA Server");
            }
        }

        node.on("close", function () {
            verbose_warn("closing...");
            stop_server();
        });

    }

    RED.nodes.registerType("ISA95-OPCUA-Server", ISA95OpcUaServerNode);
};
