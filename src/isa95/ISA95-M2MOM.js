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

module.exports = function (RED) {
    'use strict';
    var isaBasics = require('./../core/isabasics');

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