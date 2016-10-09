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

'use strict';
var isaOpcUa;
var isaResultMessage;
var serverAddressSpace;
var isaMapping;
var os = require("os");
var counterValue = 0;
/**
 * Basic functions to work with OPC UA address space of node-opcua.
 * @module ISAAddressSpace
 */

module.exports = {

    isaOpcUa: isaOpcUa,
    isaResultMessage: isaResultMessage,
    serverAddressSpace: serverAddressSpace,
    isaMapping: isaMapping,
    counterValue: counterValue,
    /**
     * Builds a fix ISA95 information model in address space.
     * @function
     * @param {object} enterprises - enterprises as a root node object
     * @param {Number} namespace - id of namespace in OPC UA
     * @param {Number} id - unique id for the model to build more than one of that structure
     */
    build_enterprise_structure: function (enterprises, namespace, id) {

        // ### Level 4 ###
        var enterprise = module.exports.isaOpcUa.addOrganizeFolder(enterprises, "Enterprise" + id, namespace);
        var sites = module.exports.isaOpcUa.addOrganizeFolder(enterprise, "Sites", namespace);
        var site = module.exports.isaOpcUa.addOrganizeFolder(sites, "Site" + id, namespace);
        var areas = module.exports.isaOpcUa.addOrganizeFolder(site, "Areas", namespace);

        // ### Level 3 ###
        var area = module.exports.isaOpcUa.addOrganizeFolder(areas, "Area" + id, namespace);
        var workcenters = module.exports.isaOpcUa.addOrganizeFolder(area, "WorkCenters", namespace);
        var workcenter = module.exports.isaOpcUa.addOrganizeFolder(workcenters, "WorkCenter" + id, namespace);

        // ### Storage ###
        var storageZones = module.exports.isaOpcUa.addOrganizeFolder(workcenter, "StorageZones", namespace);
        var storageZone = module.exports.isaOpcUa.addOrganizeFolder(storageZones, "StorageZone" + id, namespace);
        var storageUnits = module.exports.isaOpcUa.addOrganizeFolder(storageZone, "StorageUnits", namespace);
        module.exports.isaOpcUa.addOrganizeFolder(storageUnits, "StorageUnit" + id, namespace);

        // ### Work Units ###
        var workunits = module.exports.isaOpcUa.addOrganizeFolder(workcenter, "WorkUnits", namespace);
        var workunit = module.exports.isaOpcUa.addOrganizeFolder(workunits, "WorkUnit" + id, namespace);
        var processcells = module.exports.isaOpcUa.addOrganizeFolder(workunit, "ProcessCells", namespace);
        var processcell = module.exports.isaOpcUa.addOrganizeFolder(processcells, "ProcessCell" + id, namespace);
        var units = module.exports.isaOpcUa.addOrganizeFolder(processcell, "Units", namespace);
        var unit = module.exports.isaOpcUa.addOrganizeFolder(units, "Unit" + id, namespace);
        var lines = module.exports.isaOpcUa.addOrganizeFolder(unit, "ProductionLines", namespace);
        var line = module.exports.isaOpcUa.addOrganizeFolder(lines, "ProductionLine" + id, namespace);
        var workcells = module.exports.isaOpcUa.addOrganizeFolder(line, "WorkCells", namespace);
        var workcell = module.exports.isaOpcUa.addOrganizeFolder(workcells, "WorkCell" + id, namespace);
        var productionunits = module.exports.isaOpcUa.addOrganizeFolder(workcell, "ProductionUnits", namespace);
        module.exports.isaOpcUa.addOrganizeFolder(productionunits, "ProductionUnit" + id, namespace);

        // ### Business structrue ###
        module.exports.isaOpcUa.addOrganizeFolder(enterprise, "MasterRecipes", namespace);
        module.exports.isaOpcUa.addOrganizeFolder(enterprise, "Recipes", namespace);
        module.exports.isaOpcUa.addOrganizeFolder(enterprise, "Materials", namespace);
        module.exports.isaOpcUa.addOrganizeFolder(enterprise, "MaterialLots", namespace);
        module.exports.isaOpcUa.addOrganizeFolder(enterprise, "MaterialSublots", namespace);

        module.exports.isaOpcUa.addOrganizeFolder(processcell, "Orders", namespace);
        module.exports.isaOpcUa.addOrganizeFolder(processcell, "ControlRecipes", namespace);
    },
    /**
     * Construct the address space of the OPC UA server.
     * @function
     * @returns {object} ISAResultMessage @see ISAConstants:ISAResultMessage
     */
    construct_my_address_space: function () {

        if (!module.exports.serverAddressSpace) {
            return module.exports.isaResultMessagess.AddressSpaceNotValid;
        }

        var objectsOrganizer = module.exports.serverAddressSpace.findNode("ns=0;i=85");
        var serverNode = module.exports.serverAddressSpace.findNode("ns=0;i=2253");
        var references = objectsOrganizer.findReferences("Organizes", true);

        if (!module.exports.findAddressSpaceReference(references, serverNode.nodeId)) {
            return module.exports.isaResultMessagess.ReferenceNotFound;
        }

        var examples = module.exports.isaOpcUa.addOrganizeFolder(module.exports.serverAddressSpace.rootFolder.objects, "Examples", 4);

        var variable2 = 10.0;

        module.exports.serverAddressSpace.addVariable({
            componentOf: examples,
            nodeId: "ns=4;s=MyVariable",
            browseName: new module.exports.isaOpcUa.QualifiedName({name: "MyVariable", namespaceIndex: 4}),
            displayName: "MyVariable",
            symbolicName: "MyVariable",
            dataType: module.exports.isaOpcUa.opcua.DataType.Double,

            value: {
                get: function () {
                    return new module.exports.isaOpcUa.opcua.Variant({
                        dataType: module.exports.isaOpcUa.opcua.DataType.Double,
                        value: variable2
                    });
                },
                set: function (variant) {
                    variable2 = parseFloat(variant.value);
                    return module.exports.isaOpcUa.opcua.StatusCodes.Good;
                }
            }
        });

        module.exports.serverAddressSpace.addVariable({
            componentOf: examples,
            nodeId: "ns=4;s=FreeMemory",
            dataType: module.exports.isaOpcUa.opcua.DataType.Double,
            browseName: new module.exports.isaOpcUa.QualifiedName({name: "FreeMemory", namespaceIndex: 4}),
            displayName: "FreeMemory",
            symbolicName: "FreeMemory",

            value: {
                get: function () {
                    return new module.exports.isaOpcUa.opcua.Variant({
                        dataType: module.exports.isaOpcUa.opcua.DataType.Double,
                        value: os.freemem() / os.totalmem() * 100.0
                    });
                }
            }
        });

        module.exports.serverAddressSpace.addVariable({
            componentOf: examples,
            nodeId: "ns=4;s=Counter",
            dataType: module.exports.isaOpcUa.opcua.DataType.UInt16,
            browseName: new module.exports.isaOpcUa.QualifiedName({name: "Counter", namespaceIndex: 4}),
            displayName: "Counter",
            symbolicName: "Counter",

            value: {
                get: function () {
                    return new module.exports.isaOpcUa.opcua.Variant({
                        dataType: module.exports.isaOpcUa.opcua.DataType.UInt16,
                        value: counterValue
                    });
                }
            }
        });

        var method = module.exports.serverAddressSpace.addMethod(
            examples, {
                browseName: new module.exports.isaOpcUa.QualifiedName({name: "Bark", namespaceIndex: 4}),
                displayName: "Bark",
                symbolicName: "Bark",

                inputArguments: [
                    {
                        name: "nbBarks",
                        description: {text: "specifies the number of time I should bark"},
                        dataType: module.exports.isaOpcUa.opcua.DataType.UInt32
                    }, {
                        name: "volume",
                        description: {text: "specifies the sound volume [0 = quiet ,100 = loud]"},
                        dataType: module.exports.isaOpcUa.opcua.DataType.UInt32
                    }
                ],

                outputArguments: [{
                    name: "Barks",
                    description: {text: "the generated barks"},
                    dataType: module.exports.isaOpcUa.opcua.DataType.String,
                    valueRank: 1
                }]
            });

        method.bindMethod(function (inputArguments, context, callback) {

            var nbBarks = inputArguments[0].value;
            var volume = inputArguments[1].value;
            var sound_volume = new Array(volume).join("!");

            var barks = [];
            for (var i = 0; i < nbBarks; i++) {
                barks.push("Whaff" + sound_volume);
            }

            var callMethodResult = {
                statusCode: module.exports.isaOpcUa.opcua.StatusCodes.Good,
                outputArguments: [{
                    dataType: module.exports.isaOpcUa.opcua.DataType.String,
                    arrayType: module.exports.isaOpcUa.opcua.VariantArrayType.Array,
                    value: barks
                }]
            };
            callback(null, callMethodResult);
        });
    },
    /**
     * Find address space reference in the address space of the OPC UA server.
     * @function
     * @param {object} references - OPC UA server's references of an object
     * @param {String} nodeId - nodeId of OPC UA like ns=0;i85 or ns=0;s=Objects
     * @returns {boolean} found - true reference if found, otherwise false
     */
    findAddressSpaceReference: function (references, nodeId) {

        var found = false;

        if (!nodeId || !references) {
            return found;
        }

        references.filter(function (r) {

            if (r.nodeId.toString() == nodeId.toString()) {
                found = true;
            }
        });

        return found;
    },
    /**
     * Add variable in the address space of the OPC UA server.
     * @function
     * @param {String} rootFolder - root reference to set componentOf
     * @param {object} mapping - mapping object with mapping information
     * @returns {object} variableNode - opc ua node of type variable
     */
    add_opcua_variable: function (rootFolder, mapping) {

        var variableNode;
        var itemDefaultSettings = module.exports.isaOpcUa.mapOpcUaDatatypeAndInitValue(mapping.typeStructure);

        variableNode = module.exports.serverAddressSpace.addVariable({

            componentOf: rootFolder,
            nodeId: mapping.structureNodeId,
            browseName: mapping.structureName,
            // identifier: new module.exports.isaOpcUa.QualifiedName({name: "Examples", namespaceIndex: 4}),
            dataType: itemDefaultSettings.variableDatatype,

            value: {
                get: function () {

                    var item = module.exports.isaMapping.search_mapped_to_read(mapping.structureParentNodeId, mapping.structureNodeId, mapping.typeStructure);

                    if (item && item.value) {

                        if (item.writtenValue
                            && item.writtenValue !== item.value) {

                            item.value = item.writtenValue;
                        }

                        item.value = module.exports.isaOpcUa.parseValueByDatatype(item.value, itemDefaultSettings.variableDatatype);

                        return new module.exports.isaOpcUa.opcua.Variant({
                            dataType: itemDefaultSettings.variableDatatype,
                            value: item.value
                        });

                    } else {
                        return new module.exports.isaOpcUa.opcua.Variant({
                            dataType: itemDefaultSettings.variableDatatype,
                            value: itemDefaultSettings.initValue
                        });
                    }
                },
                set: function (variant) {

                    var item = module.exports.isaMapping.search_mapped_to_read(mapping.structureParentNodeId, mapping.structureNodeId, mapping.typeStructure);

                    if (variant !== null
                        || variant
                        && item
                        && item.writtenValue) {

                        if (variant.value === null || variant.value) {
                            item.writtenValue = module.exports.isaOpcUa.getInitValueByDatatype(variant.dataType);
                        } else {
                            item.writtenValue = module.exports.isaOpcUa.parseValueByDatatype(variant.value, variant.dataType);
                        }
                    } else {
                        item.writtenValue = module.exports.isaOpcUa.getInitValueByDatatype(itemDefaultSettings.variableDatatype);
                    }

                    return module.exports.isaOpcUa.opcua.StatusCodes.Good;
                }
            }
        });

        return variableNode;
    },
    /**
     * Add object in the address space of the OPC UA server.
     * @function
     * @param {String} rootFolder - root reference to set organizedBy
     * @param {object} mapping - mapping object with mapping information
     * @returns {object} objectNode - node of an OPC UA object
     */
    add_opcua_object: function (rootFolder, mapping) {

        var objectNode;

        if (mapping.typeStructure) {

            objectNode = module.exports.serverAddressSpace.addObject({
                organizedBy: rootFolder,
                typeDefinition: mapping.typeStructure,
                nodeId: mapping.structureNodeId,
                browseName: mapping.structureName
            });

        } else {

            objectNode = module.exports.serverAddressSpace.addObject({
                organizedBy: rootFolder,
                nodeId: mapping.structureNodeId,
                browseName: mapping.structureName
            });
        }

        return objectNode;
    }
};