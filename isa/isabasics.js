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

'use strict';
module.exports = {

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

    newMachineMapping: function (machineConfig, node) {
        return {
            'mappingType': 'm2mom-mapping',
            'machine': machineConfig.machine,
            'interface': machineConfig.interface,
            'name': node.name,
            'topic': node.topic,
            'mappings': node.mappings
        };
    },

    writeMachineMapping: function (machineConfig, node, namedValues) {
        return {
            'mappingType': 'm2mom-write',
            'machine': machineConfig.machine,
            'interface': machineConfig.interface,
            'name': node.name,
            'topic': node.topic,
            'mappings': namedValues,
            'payload': namedValues.length + ' values to write'
        };
    },

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