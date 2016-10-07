/**

 The BSD 3-Clause License

 Copyright (c) 2016, Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.

 Redistribution and use in source and binary forms, with or without modification,
 are permitted provided that the following conditions are met:

 1. Redistributions of source code must retain the above copyright notice,
 this list of conditions and the following disclaimer.

 2. Redistributions in binary form must reproduce the above copyright notice,
 this list of conditions and the following disclaimer in the documentation and/or
 other materials provided with the distribution.

 3. Neither the name of the copyright holder nor the names of its contributors may be
 used to endorse or promote products derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES,
 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
 FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR
 CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY,
 OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

 @author <a href="mailto:klaus.landsdorf@bianco-royal.de">Klaus Landsdorf</a> (Bianco Royal)

 **/

/**
 * OPC UA server with API to build ISA compliant information models.
 * @namespace ISAOpcUaServer
 * @module ISA95OpcUaServerNode
 */
"use strict";

module.exports = function (RED) {

    var opcua = require("node-opcua");
    // add server ISA95 extension to node-opcua
    require("node-opcua-isa95")(opcua);

    var isaMapping = require('./isamapping');
    var isaAddressSpace = require('./isaaddresssspace');
    var isaResultMessages = require('./isaconst').ISAResultMessage;
    var isaOpcUa = require('./isaopcua');

    isaOpcUa.opcua = opcua;

    isaMapping.isaOpcUa = isaOpcUa;
    isaMapping.isaResultMessage = isaResultMessages;

    isaAddressSpace.isaOpcUa = isaOpcUa;
    isaAddressSpace.isaMapping = isaMapping;
    isaAddressSpace.isaResultMessages = isaResultMessages;

    var path = require('path');
    var os = require("os");
    var prettyjson = require('prettyjson');

    var pjOptions = {
        noColor: true
    };

    var EquipmentLevel = opcua.ISA95.EquipmentLevel;

    /**
     * OPC UA server node capsule.
     * @memberof ISAOpcUaServer
     * @constructor
     */
    function ISA95OpcUaServerNode(n) {

        RED.nodes.createNode(this, n);

        this.name = n.name;
        this.port = n.port;
        var node = this;

        var examples;
        var enterprises;

        var initialized = false;
        var server = null;
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

        // see node-opcua-isa95 doc
        var xmlFiles = [
            opcua.standard_nodeset_file,
            opcua.ISA95.nodeset_file
        ];

        verbose_warn("node set:" + xmlFiles.toString());

        /**
         * Initialization of a new OPC UA server.
         * @function
         */
        function initNewServer() {

            initialized = false;

            server = new opcua.OPCUAServer({
                port: node.port,
                nodeset_filename: xmlFiles,
                resourcePath: "UA/NodeRED/ISA95Server",
                buildInfo: {
                    productName: node.name.concat("OPC UA server"),
                    buildNumber: "1911",
                    buildDate: new Date(2016, 9, 25)
                }
            });

            server.initialize(post_initialize);
        }

        /**
         * Callback for server initialization work of node-opcua.
         *
         * Builds a static information model of ISA95 structures.
         * Here we also add all possibilities how to use node-opcua (variable, objects, methods ...).
         *
         * @function
         */
        function post_initialize() {

            if (server) {
                console.time("initaddressspace");

                serverAddressSpace = server.engine.addressSpace;

                if (!serverAddressSpace) {
                    verbose_warn("post initialize - AddressSpace not ready to use");
                    return;
                }

                isaAddressSpace.serverAddressSpace = serverAddressSpace;
                isaOpcUa.serverAddressSpace = serverAddressSpace;

                var instantiateSampleISA95Model = require("./helpers/isa95_demo_address_space").instantiateSampleISA95Model;
                instantiateSampleISA95Model(serverAddressSpace);

                isaAddressSpace.construct_my_address_space(serverAddressSpace);

                enterprises = isaOpcUa.addOrganizeFolder(serverAddressSpace.rootFolder.objects, "Enterprises", 4);

                isaAddressSpace.build_enterprise_structure(enterprises, 5, 1);
                isaAddressSpace.build_enterprise_structure(enterprises, 6, 2);

                server.start(function () {
                    server.endpoints[0].endpointDescriptions().forEach(function (endpoint) {
                        verbose_warn("Server endpointUrl: " + endpoint.endpointUrl + ' securityMode: ' + endpoint.securityMode.toString() + ' securityPolicyUri: ' + endpoint.securityPolicyUri.toString());
                    });

                    var endpointUrl = server.endpoints[0].endpointDescriptions()[0].endpointUrl;
                    verbose_log(" the primary server endpoint url is " + endpointUrl);
                });

                console.timeEnd("initaddressspace");
                set_server_running();
                initialized = true;
                console.timeEnd("initserver");
            }
            else {
                set_server_stoped();
            }
        }

        /**
         * Set the server is running symbol on OPC UA server node.
         * @function
         */
        function set_server_running() {
            node.status({fill: "green", shape: "dot", text: "running"});
        }

        /**
         * Set the server is stoped symbol on OPC UA server node.
         * @function
         */
        function set_server_stoped() {
            node.status({fill: "gray", shape: "dot", text: "not running"});
        }

        function set_server_notrunning() {
            node.status({fill: "red", shape: "ring", text: "Not running"});
        }

        /**
         * Check if OPC UA server is ready to use.
         * @function
         */
        function check_server_ready() {
            return (server && initialized);
        }

        /**
         * Find address space reference in the address space of the OPC UA server.
         * @function
         * @param {object} payload - payload of msg object
         */
        function check_mapping(payload) {

            if (!check_server_ready()) {
                return isaResultMessages.ServerNotReady;
            }

            switch (payload.mappingType) {

                case 'new':
                    console.time("newmapping");
                    for (var entry in payload.mappings) {
                        if (entry) {
                            new_mapping_entry_opcua(payload.mappings[entry].mapping);
                        } else {
                            verbose_log(JSON.stringify(entry) + " isn't a valid new object");
                        }
                    }
                    console.timeEnd("newmapping");
                    break;

                case 'write':
                    console.time("writemapping");
                    var item;
                    for (var entry in payload.mappings) {
                        if (entry) {
                            item = payload.mappings[entry];
                            if (item && isaMapping.search_mapped_to_read(item.mapping.structureParentNodeId, item.nodeId)) {
                                verbose_log("write " + item.mapping.structureParentNodeId + ' ' + item.nodeId + ' ' + item.value + ' ' + item.datatype);
                                isaMapping.search_mapped_to_write(item.mapping.structureParentNodeId, item.nodeId, item.value, item.datatype);
                            }
                        }
                        else {
                            verbose_log(JSON.stringify(entry) + " isn't a valid existing object");
                        }

                    }
                    console.timeEnd("writemapping");
                    break;

                default:
                    verbose_warn("unknown mapping type " + payload.mappingType);
                    break;
            }
        }

        /**
         * Add new node in the address space of the OPC UA server.
         * @function
         * @param {object} mapping - one mapping object
         */
        function new_mapping_entry_opcua(mapping) {

            var rootFolder = serverAddressSpace.findNode(mapping.structureParentNodeId);

            if (!rootFolder) {
                return isaResultMessages.ParentNodeReferenceNotFound;
            }

            if (!mapping.structureNodeId || !mapping.typeStructure) {
                return isaResultMessages.NodeIdNotValid;
            }

            var references;

            switch (mapping.structureType) {
                case 'Variable':
                    references = rootFolder.findReferences("HasComponent", true);
                    break;
                // TODO: add more types
                default:
                    references = rootFolder.findReferences("Organizes", true);
            }

            if (references
                && !isaAddressSpace.findAddressSpaceReference(references, mapping.structureNodeId)
                && !isaMapping.search_mapped_to_read(mapping.structureParentNodeId, mapping.structureNodeId)) {

                verbose_log("new " + mapping.structureParentNodeId + ' ' + mapping.structureNodeId + ' ' + mapping.typeStructure);

                switch (mapping.structureType) {
                    case 'Variable':
                        var item = isaMapping.add_mapped_to_list(mapping.structureParentNodeId, mapping.structureNodeId, mapping.typeStructure);
                        isaAddressSpace.add_opcua_variable(rootFolder, mapping);
                        break;
                    case 'Object':
                        var item = isaMapping.add_mapped_to_list(mapping.structureParentNodeId, mapping.structureNodeId, mapping.typeStructure);
                        isaAddressSpace.add_opcua_object(rootFolder, mapping);
                        break;
                    default:
                        var item = isaMapping.add_mapped_to_list(mapping.structureParentNodeId, mapping.structureNodeId, mapping.typeStructure);
                        break;
                }
            }
        }

        /**
         * Read message type from msg input payload.
         * @function
         * @param {object} payload - payload of msg object
         */
        function read_message(payload) {

            switch (payload.messageType) {

                case 'Variable':
                    if (payload.variableName == "Counter") {
                        isaAddressSpace.counterValue = payload.variableValue;
                    }
                    break;
                // TODO: add more messages to control OPC UA server
                default:
                    break;
            }
        }

        /**
         * Execute command from msg input payload.
         * @function
         * @param {object} payload - payload of msg object
         * @property payload.opcuaCommand.restartOPCUAServer - restarts the OPC UA server
         * @property payload.opcuaCommand.startOPCUAServer - restarts the OPC UA server
         * @property payload.opcuaCommand.stopOPCUAServer - stops the OPC UA server
         * @property payload.opcuaCommand.deleteNode - delete if found a node by nodeid in the OPC UA server's address space
         */
        function execute_opcua_command(payload) {

            var name;

            verbose_log("execute OPC UA command ".concat(payload.opcuaCommand));

            switch (payload.opcuaCommand) {

                case "restartOPCUAServer":
                case "startOPCUAServer":
                    restart_server();
                    break;

                case "stopOPCUAServer":
                    stop_server();
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

                // TODO: add more commands to give control over OPC UA server
                default:
                    break;
            }

        }

        /**
         * Reset structure of the ISA OPC UA server address space models.
         * @function
         */
        function reset_structure() {
            // manufacture
            enterprises = null;
            // examples
            examples = null;
        }

        /**
         * Reset internals of the ISA OPC UA server.
         * @function
         */
        function reset_internals() {
            server = null;
            reset_structure();
        }

        /**
         * Stop and shutdown the ISA OPC UA server.
         * @function
         */
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

        /**
         * Restart the ISA OPC UA server.
         * @function
         */
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
        }

        console.time("initserver");
        initNewServer();

        /**
         * On input event of the ISA OPC UA server node.
         * @function
         */
        node.on("input", function (msg) {

            var payload = msg.payload;

            if (isaMapping.contains_opcua_command(payload)) {
                execute_opcua_command(payload);
            } else {

                try {
                    if (check_server_ready()) {

                        if (isaMapping.contains_mappingType(payload)) {
                            check_mapping(payload);
                        }

                        if (isaMapping.contains_messageType(payload)) {
                            read_message(payload);
                        }
                    }
                } catch (err) {
                    node.error(err);
                }
            }

            node.send(msg);
        });

        /**
         * On close event of the ISA OPC UA server node.
         * @function
         */
        node.on("close", function () {
            verbose_warn("closing...");
            stop_server();
        });

    }

    RED.nodes.registerType("ISA95-OPCUA-Server", ISA95OpcUaServerNode);
}
;
