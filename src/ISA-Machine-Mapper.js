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

    var opcua = require("node-opcua");
    var isaBasics = require('./isabasics');
    var isaOpcUa = require('./isaopcua');

    isaOpcUa.opcua = opcua;

    function ISAMachineMapperNode(n) {

        RED.nodes.createNode(this, n);

        this.name = n.name;
        this.topic = n.topic;
        this.register = n.register;
        this.group = n.group;
        this.order = n.order;
        this.mappings = n.mappings;

        var node = this;

        var machineConfig = RED.nodes.getNode(n.machineid);

        function verbose_warn(logMessage) {
            if (RED.settings.verbose) {
                node.warn((node.name) ? node.name + ': ' + logMessage : 'Machine-Mapper: ' + logMessage);
            }
        }

        function verbose_log(logMessage) {
            if (RED.settings.verbose) {
                node.log(logMessage);
            }
        }

        this.on('input', function (msg) {

            var data = msg.payload;

            if (node.register != msg.payload.length) {
                node.error("configured size doesn't match input length of register (array)");
                node.send(msg);
                return;
            }

            var structuredValues = [];

            if (node.mappings.length > 0 && data.length > 0) {

                console.time("mapping");

                node.mappings.forEach(function (mapping) {

                    if (!mapping.structureNodeId) {
                        verbose_warn("mapping.structureNodeId not valid " + mapping.structureNodeId);
                        return;
                    }

                    var bitValue = 0;
                    var machineValue = 0;

                    if (mapping.quantity > 1) {

                        bitValue = isaBasics.get_bits_from_quantity(mapping.quantity);
                        if (bitValue) {
                            machineValue = isaBasics.reconnect_values(bitValue, mapping.start, data);
                        }
                    }
                    else {

                        if (data.length >= mapping.quantity) {
                            machineValue += data[mapping.start];
                            bitValue = 16;
                        }
                        else {
                            node.error("check start and quantity of structureNodeId mapping " + mapping.structureNodeId);
                            return;
                        }
                    }

                    structuredValues.add(isaOpcUa.mapOpcUaMachineValue(mapping, machineValue, bitValue));
                });

                console.timeEnd("mapping");
            }

            var sendMapping = isaOpcUa.newOpcUaMachineMapping(machineConfig, node);
            var sendWriteValue = isaOpcUa.writeOpcUaMachineMapping(machineConfig, node, structuredValues);

            msg = [{payload: data}, {payload: sendWriteValue}, {payload: sendMapping}];

            node.send(msg);
        });
    }

    RED.nodes.registerType("ISA-Machine-Mapper", ISAMachineMapperNode);
};