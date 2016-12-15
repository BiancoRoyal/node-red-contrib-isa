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

var opcua;
var serverAddressSpace;
var QualifiedName = require("node-opcua/lib/datamodel/qualified_name").QualifiedName;

/**
 * Basic functions to build OPC UA mappings.
 * @module ISAOPCUA
 */
module.exports = {

    opcua: opcua,
    serverAddressSpace: serverAddressSpace,
    QualifiedName: QualifiedName,

    /**
     * Gives a new OPC UA machine mapping structure.
     * @function
     * @param {object} machineConfig - machine config node object
     * @param {object} node - mapping node object
     * @returns {object} mapping object without payload to describe mapping to build address space
     */
    newOpcUaMachineMapping: function (machineConfig, node, structuredValues) {
        return {
            'mappingType': 'new',
            'machine': machineConfig.machine,
            'protocolName': machineConfig.protocolName,
            'name': node.name,
            'topic': node.topic,
            'group': node.group,
            'order': node.order,
            'mappings': structuredValues,
            'payload': structuredValues.length + ' values to write'
        }
    },
    /**
     * Gives a OPC UA write mapping structure.
     * @function
     * @param {object} machineConfig - machine config node object
     * @param {object} node - mapping node object
     * @param {set} structuredValues - list of values to write to address space
     * @returns {object} mapping object with payload to write data in address space
     */
    writeOpcUaMachineMapping: function (machineConfig, node, structuredValues) {
        return {
            'mappingType': 'write',
            'machine': machineConfig.machine,
            'protocolName': machineConfig.protocolName,
            'name': node.name,
            'topic': node.topic,
            'group': node.group,
            'order': node.order,
            'mappings': structuredValues,
            'payload': structuredValues.length + ' values to write'
        };
    },
    /**
     * Gives a OPC UA machine mapping for value.
     * @function
     * @param {object} mapping - mapping object
     * @param {object} machineValue - machine value
     * @param {Number} bits - how many Bits in value (2^n)
     * @returns {object} mapping object with payload to describe mapping of one machine value
     */
    mapOpcUaMachineValue: function (mapping, machineValue, bits) {
        return {
            'nodeId': mapping.structureNodeId,
            'value': machineValue,
            'bits': bits,
            'datatype': mapping.typeStructure,
            'mapping': mapping,
            'payload': mapping.structureNodeId + ' write value ' + machineValue
        }
    },
    /**
     * Gives a mapping object for OPC UA from datatype with init value.
     * @function
     * @param {String|opcua.DataType} typeStructure - type in structure
     * @returns {Number} mappingDatatype - mapping Datatype to add OPC UA variable
     */
    mapOpcUaDatatypeAndInitValue: function (typeStructure) {

        var mappingDatatype = {variableDatatype: 'String', initValue: ''};

        switch (typeStructure) {

            case 'Bool':
            case 'Boolean':
            case module.exports.opcua.DataType.Boolean:
                mappingDatatype.variableDatatype = "Boolean";
                mappingDatatype.initValue = false;
                break;

            case 'Float':
            case module.exports.opcua.DataType.Float:
                mappingDatatype.variableDatatype = "Float";
                mappingDatatype.initValue = 0.0;
                break;

            case 'Double':
            case 'Real':
            case module.exports.opcua.DataType.Double:
                mappingDatatype.variableDatatype = "Double";
                mappingDatatype.initValue = 0.0;
                break;

            case 'UInt16':
            case module.exports.opcua.DataType.UInt16:
                mappingDatatype.variableDatatype = "UInt16";
                mappingDatatype.initValue = 0;
                break;

            case 'Int16':
            case module.exports.opcua.DataType.Int16:
                mappingDatatype.variableDatatype = "Int16";
                mappingDatatype.initValue = 0;
                break;

            case 'Int':
            case 'Int32':
            case 'Integer':
            case module.exports.opcua.DataType.Int32:
            case module.exports.opcua.DataType.Integer:
                mappingDatatype.variableDatatype = "Int32";
                mappingDatatype.initValue = 0;
                break;

            case 'UInt':
            case 'UInt32':
            case 'UInteger':
            case module.exports.opcua.DataType.UInt32:
            case module.exports.opcua.DataType.UInteger:
                mappingDatatype.variableDatatype = "UInt32";
                mappingDatatype.initValue = 0;
                break;

            case "Int64":
            case module.exports.opcua.DataType.Int64:
                mappingDatatype.variableDatatype = "Int64";
                mappingDatatype.initValue = 0;
                break;

            case "UInt64":
            case module.exports.opcua.DataType.UInt64:
                mappingDatatype.variableDatatype = "UInt64";
                mappingDatatype.initValue = 0;
                break;

            default:
                break;

        }

        return mappingDatatype;
    },
    /**
     * Gives an init value for given OPC UA datatype.
     * @function
     * @param {String|opcua.DataType} variableDatatype - OPC UA datatype of variable
     * @returns initValue - init value for datatype
     */
    getInitValueByDatatype: function (variableDatatype) {

        var initValue = '';

        switch (variableDatatype) {

            case "Boolean":
            case module.exports.opcua.DataType.Boolean:
                initValue = false;
                break;

            case "Float":
            case module.exports.opcua.DataType.Float:
                initValue = 0.0;
                break;

            case "Double":
            case module.exports.opcua.DataType.Double:
                initValue = 0.0;
                break;

            case "UInt16":
            case module.exports.opcua.DataType.UInt16:
                initValue = 0;
                break;

            case "Int16":
            case module.exports.opcua.DataType.Int16:
                initValue = 0;
                break;

            case "Int32":
            case module.exports.opcua.DataType.Int32:
                initValue = 0;
                break;

            case "UInt32":
            case module.exports.opcua.DataType.UInt32:
                initValue = 0;
                break;

            case "Int64":
            case module.exports.opcua.DataType.Int64:
                initValue = 0;
                break;

            case "UInt64":
            case module.exports.opcua.DataType.UInt64:
                initValue = 0;
                break;

            default:
                break;

        }

        return initValue;
    },
    /**
     * Gives a parsed value of variant datatype.
     * @function
     * @param {String|opcua.DataType} variantValue - OPC UA value of variant
     * @param {String|opcua.DataType} variantDatatype - OPC UA datatype of variant
     * @returns parsedValue - value for the parsed datatype
     */
    parseValueByDatatype: function (variantValue, variantDatatype) {

        var parsedValue = variantValue;

        switch (variantDatatype) {

            case module.exports.opcua.DataType.Boolean:
            case "Boolean":
                if (variantValue == true
                    || variantValue === 'true') {

                    parsedValue = true;
                }
                else {

                    parsedValue = false;
                }
                break;

            case module.exports.opcua.DataType.Float:
            case "Float":
            case module.exports.opcua.DataType.Double:
            case "Double":
                parsedValue = parseFloat(variantValue);
                break;

            case module.exports.opcua.DataType.UInt16:
            case "UInt16":
            case module.exports.opcua.DataType.Int16:
            case "Int16":
            case module.exports.opcua.DataType.Int32:
            case "Int32":
            case module.exports.opcua.DataType.UInt32:
            case "UInt32":
            case module.exports.opcua.DataType.Int64:
            case "Int64":
            case module.exports.opcua.DataType.UInt64:
            case "UInt64":
                parsedValue = parseInt(variantValue);
                break;

            default:
                break;

        }

        return parsedValue;
    },
    /**
     * Add organized object to OPC UA address space.
     * @function
     * @param {String} organizeNodeObject - organizedBy reference
     * @param {String} nodeBrowseName - browseName to build QualifiedName
     * @param {String} namespace - namespace in information model to build nodeId reference
     * @returns created server address space object
     */
    addOrganizeObject: function (organizeNodeObject, nodeBrowseName, namespace) {

        return module.exports.serverAddressSpace.addObject({
            organizedBy: organizeNodeObject,
            nodeId: "ns=" + namespace + ";s=" + nodeBrowseName,
            browseName: new module.exports.QualifiedName({name: nodeBrowseName, namespaceIndex: namespace}),
            displayName: nodeBrowseName,
            symbolicName: nodeBrowseName
        });
    },
    /**
     * Add organized object to OPC UA address space with typeDefinition "FolderType".
     * @function
     * @param {String} organizeNodeObject - organizedBy reference
     * @param {String} nodeBrowseName - browseName to build QualifiedName
     * @param {String} namespace - namespace in information model to build nodeId reference
     * @returns created server address space object
     */
    addOrganizeFolder: function (organizeNodeObject, nodeBrowseName, namespace) {

        return module.exports.serverAddressSpace.addObject({
            organizedBy: organizeNodeObject,
            typeDefinition: "FolderType",
            nodeId: "ns=" + namespace + ";s=" + nodeBrowseName,
            browseName: new module.exports.QualifiedName({name: nodeBrowseName, namespaceIndex: namespace}),
            displayName: nodeBrowseName,
            symbolicName: nodeBrowseName
        });
    }
}
;
