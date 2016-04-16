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

module.exports = function (RED) {
    'use strict';
    var isaBasics = require('./isabasics');

    function ISA95M2MOMNode(config) {

        RED.nodes.createNode(this, config);

        this.name = config.name;
        this.register = config.register;
        this.mappings = config.mappings;

        var node = this;

        var machineConfig = RED.nodes.getNode(config.machineid);

        this.on('input', function (msg) {

            var data = msg.payload;

            if (msg.payload.length != node.register) {
                node.send(msg);
                return;
            }

            var bitValue = 0;
            var namedValues = [];

            node.mappings.forEach(function (mapping) {
                bitValue = isaBasics.get_bits_from_quantity(mapping.quantity);
                var machineValue = isaBasics.reconnect_values(bitValue, mapping.start, msg.payload);
                namedValues.add(isaBasics.mapMachineValue(mapping, machineValue, bitValue));
            });

            var sendMapping = isaBasics.newMachineMapping(machineConfig, node);
            var sendWriteValue = isaBasics.writeMachineMapping(machineConfig, node, namedValues);

            msg = [{payload: data}, {payload: sendWriteValue}, {payload: sendMapping}];

            node.send(msg);
        });
    }

    RED.nodes.registerType("ISA95-M2MOM", ISA95M2MOMNode);
};