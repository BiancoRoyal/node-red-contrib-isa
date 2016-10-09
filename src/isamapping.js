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
/**
 * ISA functions to work with mappings.
 * @module ISAMapping
 */

module.exports = {

    isaOpcUa: isaOpcUa,

    /**
     * Searching the containing of the property "mappingType".
     * @function
     * @param {object} payload - payload of msg object
     * @returns {boolean} true if found, otherwise false
     */
    contains_mappingType: function (payload) {
        return payload.hasOwnProperty('mappingType');
    },
    /**
     * Searching the containing of the property "messageType".
     * @function
     * @param {object} payload - payload of msg object
     * @returns {boolean} true if found, otherwise false
     */
    contains_messageType: function (payload) {
        return payload.hasOwnProperty('messageType');
    },
    /**
     * Searching the containing of the property "opcuaCommand".
     * @function
     * @param {object} payload - payload of msg object
     * @returns {boolean} true if found, otherwise false
     */
    contains_opcua_command: function (payload) {
        return payload.hasOwnProperty('opcuaCommand');
    },
    /**
     * Read mapped objects from a dynamic list of address space objects.
     * @function
     * @param {String} nodeId - nodeId to search for
     * @param {object} variableDatatype - OPC UA variable datatype
     * @returns {object} item of list
     */
    search_mapped_to_read: function (parentNodeId, nodeId, dynamicNodes) {

        if (!nodeId) {
            throw new Error("search_mapped_to_read nodeId have to be a valid object");
        }

        if (dynamicNodes.hasOwnProperty(nodeId.toString())) {
            return dynamicNodes[nodeId.toString()];
        }
    },
    /**
     * Add mapped object of address space objects to dynamic list.
     * @function
     * @param {String} nodeId - nodeId to search for
     * @param {object} variableDatatype - OPC UA variable datatype
     * @returns {object} item of list
     */
    add_mapped_to_list: function (parentNodeId, nodeId, variableDatatype, dynamicNodes) {

        if (!nodeId) {
            throw new Error("add_mapped_to_list nodeId have to be a valid object");
        }

        if (dynamicNodes.hasOwnProperty(nodeId.toString())) {
            return dynamicNodes[nodeId.toString()];
        }

        var item = {
            'parentNodeId': parentNodeId,
            'nodeId': nodeId,
            'value': undefined,
            'writtenValue': undefined,
            'variableDatatype': variableDatatype
        };

        dynamicNodes[nodeId.toString()] = item;

        return item;
    },
    /**
     * Write mapped or adds mapping object to a dynamic list of address space objects.
     * @function
     * @param {String} nodeId - nodeId to search for
     * @param {object} value - value to write
     * @param {object} typeStructure - to find the init value @see ISAOPCUA:mapOpcUaDatatypeAndInitValue
     * @returns {object} item if found, otherwise item created
     */
    search_mapped_to_write: function (parentNodeId, nodeId, value, typeStructure, dynamicNodes) {

        if (!nodeId) {
            throw new Error("search_mapped_to_write nodeId have to be a valid object");
        }

        var item;

        if (dynamicNodes.hasOwnProperty(nodeId.toString())) {

            item = dynamicNodes[nodeId.toString()];
            this.set_item_value(item, value);
        }
        else {

            var itemDefaultSettings = module.exports.isaOpcUa.mapOpcUaDatatypeAndInitValue(typeStructure);

            if (itemDefaultSettings) {

                item = {
                    'parentNodeId': parentNodeId,
                    'nodeId': nodeId,
                    'value': value,
                    'writtenValue': value,
                    'variableDatatype': itemDefaultSettings.variableDatatype
                };

                this.set_item_value(item, value);
                dynamicNodes[nodeId.toString()] = item;
            }
        }

        return item;
    },
    /**
     * Write value to item with special handling for boolean
     * @function
     * @param {object} item - item to write property value
     * @param {object} value - value to write
     * @returns {object} item with value
     */
    set_item_value: function (item, value) {

        if (item.variableDatatype === "Boolean") {

            if (value) {
                item.value = true;
            }
            else {
                item.value = false;
            }

        } else {
            item.value = value;
        }

        return item;
    }
};