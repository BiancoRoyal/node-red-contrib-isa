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
module.exports = {

    newOpcUaMachineMapping: function (machineConfig, node) {
        return {
            'mappingType': 'new',
            'machine': machineConfig.machine,
            'interface': machineConfig.interface,
            'name': node.name,
            'topic': node.topic,
            'group': node.group,
            'order': node.order,
            'mappings': node.mappings
        }
    },

    writeOpcUaMachineMapping: function (machineConfig, node, structuredValues) {
        return {
            'mappingType': 'write',
            'machine': machineConfig.machine,
            'interface': machineConfig.interface,
            'name': node.name,
            'topic': node.topic,
            'group': node.group,
            'order': node.order,
            'mappings': structuredValues,
            'payload': structuredValues.length + ' values to write'
        };
    },
    
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

    mapOpcUaDatatypeAndInitValue: function (typeStructure) {

        var opcua = require('node-opcua');

        var mappingDatatype = {variableDatatype: 'String', initValue: ''};

        switch (typeStructure) {

            case 'Bool':
            case 'Boolean':
            case opcua.DataType.Boolean:
                mappingDatatype.variableDatatype = "Boolean";
                mappingDatatype.initValue = false;
                break;

            case 'Float':
            case opcua.DataType.Float:
                mappingDatatype.variableDatatype = "Float";
                mappingDatatype.initValue = 0.0;
                break;

            case 'Double':
            case 'Real':
            case opcua.DataType.Double:
                mappingDatatype.variableDatatype = "Double";
                mappingDatatype.initValue = 0.0;
                break;

            case 'UInt16':
            case opcua.DataType.UInt16:
                mappingDatatype.variableDatatype = "UInt16";
                mappingDatatype.initValue = 0;
                break;

            case 'Int16':
            case opcua.DataType.Int16:
                mappingDatatype.variableDatatype = "Int16";
                mappingDatatype.initValue = 0;
                break;

            case 'Int':
            case 'Int32':
            case 'Integer':
            case opcua.DataType.Int32:
            case opcua.DataType.Integer:
                mappingDatatype.variableDatatype = "Int32";
                mappingDatatype.initValue = 0;
                break;

            case 'UInt':
            case 'UInt32':
            case 'UInteger':
            case opcua.DataType.UInt32:
            case opcua.DataType.UInteger:
                mappingDatatype.variableDatatype = "UInt32";
                mappingDatatype.initValue = 0;
                break;

            case "Int64":
            case opcua.DataType.Int64:
                mappingDatatype.variableDatatype = "Int64";
                mappingDatatype.initValue = 0;
                break;

            case "UInt64":
            case opcua.DataType.UInt64:
                mappingDatatype.variableDatatype = "UInt64";
                mappingDatatype.initValue = 0;
                break;

            default:
                break;

        }

        return mappingDatatype;
    },


    getInitValueByDatatype: function (variableDatatype) {

        var opcua = require('node-opcua');

        var initValue = '';

        switch (variableDatatype) {

            case "Boolean":
            case opcua.DataType.Boolean:
                initValue = false;
                break;

            case "Float":
            case opcua.DataType.Float:
                initValue = 0.0;
                break;

            case "Double":
            case opcua.DataType.Double:
                initValue = 0.0;
                break;

            case "UInt16":
            case opcua.DataType.UInt16:
                initValue = 0;
                break;

            case "Int16":
            case opcua.DataType.Int16:
                initValue = 0;
                break;

            case "Int32":
            case opcua.DataType.Int32:
                initValue = 0;
                break;

            case "UInt32":
            case opcua.DataType.UInt32:
                initValue = 0;
                break;

            case "Int64":
            case opcua.DataType.Int64:
                initValue = 0;
                break;

            case "UInt64":
            case opcua.DataType.UInt64:
                initValue = 0;
                break;

            default:
                break;

        }

        return initValue;
    },

    parseValueByDatatype: function (variantValue, variantDatatype) {

        var opcua = require('node-opcua');

        var parsedValue = variantValue;

        switch (variantDatatype) {

            case opcua.DataType.Boolean:
            case "Boolean":
                if (variantValue == true
                    || variantValue === 'true') {

                    parsedValue = true;
                }
                else {

                    parsedValue = false;
                }
                break;

            case opcua.DataType.Float:
            case "Float":
            case opcua.DataType.Double:
            case "Double":
                parsedValue = parseFloat(variantValue);
                break;

            case opcua.DataType.UInt16:
            case "UInt16":
            case opcua.DataType.Int16:
            case "Int16":
            case opcua.DataType.Int32:
            case "Int32":
            case opcua.DataType.UInt32:
            case "UInt32":
            case opcua.DataType.Int64:
            case "Int64":
            case opcua.DataType.UInt64:
            case "UInt64":
                parsedValue = parseInt(variantValue);
                break;

            default:
                break;

        }

        return parsedValue;
    }
};
