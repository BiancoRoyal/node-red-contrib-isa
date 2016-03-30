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

    function ISAMachineMapperIdNode(n) {

        RED.nodes.createNode(this, n);

        this.machine = n.machine;
        this.interface = n.interface;
    }

    RED.nodes.registerType("ISA-MachineId", ISAMachineMapperIdNode);

    function ISA95MachineMapperNode(n) {

        RED.nodes.createNode(this, n);

        this.name = n.name;
        this.topic = n.topic;
        this.group = n.group;
        this.order = n.order;
        this.mappings = n.mappings;

        var node = this;

        var machineConfig = RED.nodes.getNode(n.machineid);

        function verbose_warn(logMessage) {
            if (RED.settings.verbose) {
                node.warn((node.name) ? node.name + ': ' + logMessage : 'B2MML-Helper: ' + logMessage);
            }
        }

        function verbose_log(logMessage) {
            if (RED.settings.verbose) {
                node.log(logMessage);
            }
        }
        
        this.on('input', function (msg) {

            var data = msg.payload;

            var sendMapping = {
                'mappingType': 'new',
                'machine': machineConfig.machine,
                'interface': machineConfig.interface,
                'name': node.name,
                'topic': node.topic,
                'group': node.group,
                'order': node.order,
                'mappings': node.mappings
            };


            var structuredValues = [];

            if (node.mappings.length > 0 && data.length > 0) {

                node.mappings.forEach(function (mapping) {

                    if (!mapping.structureNodeId) {
                        verbose_warn("mapping.structureNodeId not valid " + mapping.structureNodeId);
                        return;
                    }

                    var modbusValue = 0;

                    if (mapping.quantity > 1) {
                        for (var i = mapping.start; i < mapping.start + mapping.quantity; i++) {
                            if (data.length > i) {
                                modbusValue += data[i];
                            }
                            else {
                                node.error("check start and quantity of structureNodeId mapping " + mapping.structureNodeId);
                            }
                        }
                    }
                    else {
                        if (data.length >= mapping.quantity) {
                            modbusValue += data[mapping.start];
                        }
                        else {
                            node.error("check start and quantity of structureNodeId mapping " + mapping.structureNodeId);
                        }
                    }

                    var mappedValue = {
                        'nodeId': mapping.structureNodeId,
                        'value': modbusValue,
                        'datatype': mapping.typeStructure,
                        'mapping': mapping,
                        'payload': mapping.structureNodeId + ' write value ' + modbusValue
                    };
                    structuredValues.add(mappedValue);
                });
            }

            var sendWriteValue = {
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

            msg = [{payload: data}, {payload: sendWriteValue}, {payload: sendMapping}];

            node.send(msg);
        });
    }

    RED.nodes.registerType("ISA95-Machine-Mapper", ISA95MachineMapperNode);
};