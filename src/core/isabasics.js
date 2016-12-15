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

/**
 * Basic functions to build ISA mappings.
 * @module ISABasics
 */
module.exports = {

    /**
     * Gives the bits from quantity of reading modbus 16Bit chunks.
     * @function
     * @param {Number} quantity - amount (1, 2, 4) of reading 16Bit chunks
     * @returns {Number} bitValue - how many Bits are to use (16, 32, 64)
     */
    get_bits_from_quantity: function (quantity) {

        var bitValue = 0;
        var quantityNumber = Number(quantity);

        switch (quantityNumber) {
            case 4:
                bitValue = 64;
                break;
            case 2:
                bitValue = 32;
                break;
            case 1:
                bitValue = 16;
                break;
            default:
                break;
        }

        return bitValue;
    },
    /**
     * Reconnect the bits of reading modbus 16Bit chunks.
     * @function
     * @param {Number} bits - how many Bits to read - @see {@link get_bits_from_quantity}
     * @param {Number} start - where to start reading from register
     * @param {Array} register - array with minimum one value
     * @returns {number} value - value of reading bits (16, 32, 64) from start of register
     */
    reconnect_values: function (bits, start, register) {

        var value = 0;
        var startNumber = Number(start);
        var bitsNumber = Number(bits);

        if (register.length < 1) {
            throwOptionsError('register should be an array with minimum one value')
        }

        switch (bitsNumber) {
            case 64:
                if (register.length > startNumber + 3) {
                    value = register[startNumber + 3] << 48 | register[startNumber + 2] << 32 | register[startNumber + 1] << 16 | register[startNumber];
                }
                break;

            case 32:
                if (register.length > startNumber + 1) {
                    value = register[startNumber + 1] << 16 | register[startNumber];
                }
                break;

            case 16:
                if (register.length > startNumber) {
                    value = register[startNumber];
                }
                break;

            default:
                break;
        }

        return value;
    },
    /**
     * Generates a new machine mapping template for machine to MOM mapping.
     * @function
     * @param machineConfig
     * @param node
     * @returns {{mappingType: string, machine: (*|defaults.machine|{value, required}), interface: (*|exports.closureTags.interface|{canHaveName, mustNotHaveValue}|defaults.interface|{value, required}|exports.baseTags.interface), name, topic, mappings: (*|defaults.mappings|{value}|set|Array)}}
     */
    newMachineMapping: function (machineConfig, node) {
        return {
            'mappingType': 'm2mom-mapping',
            'machine': machineConfig.machine,
            'protocolName': machineConfig.protocolName,
            'name': node.name,
            'topic': node.topic,
            'mappings': node.mappings
        };
    },
    /**
     * Generates a writing template for machine mapping data from machine to MOM.
     * @function
     * @param machineConfig
     * @param node
     * @param namedValues
     * @returns {{mappingType: string, machine: (*|defaults.machine|{value, required}), interface: (*|exports.closureTags.interface|{canHaveName, mustNotHaveValue}|defaults.interface|{value, required}|exports.baseTags.interface), name, topic, mappings: *, payload: string}}
     */
    writeMachineMapping: function (machineConfig, node, namedValues) {
        return {
            'mappingType': 'm2mom-write',
            'machine': machineConfig.machine,
            'protocolName': machineConfig.protocolName,
            'name': node.name,
            'topic': node.topic,
            'mappings': namedValues,
            'payload': namedValues.length + ' values to write'
        };
    },
    /**
     * Generates a template to set a value for a OPC UA node by its node-id.
     * @function
     * @param mapping
     * @param machineValue
     * @param bits
     * @returns {{nodeId: (string|string|*), value: *, bits: *, datatype: (string|string|*|string|string), mapping: *, payload: string}}
     */
    mapMachineValue: function (mapping, machineValue, bits) {
        return {
            'nodeId': mapping.valueName,
            'value': machineValue,
            'bits': bits,
            'datatype': mapping.valueType,
            'mapping': mapping,
            'payload': mapping.valueName + ' write value ' + machineValue
        };
    }
};