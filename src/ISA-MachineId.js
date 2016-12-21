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

/**
 * That node is to centralize the information about the machine.
 * With this node you have to configure the machine information only once
 * and you can use it in many mapping nodes.
 *
 * @namespace ISAMachine
 * @param RED
 */
module.exports = function (RED) {

    function ISAMachineIdNode(configNode) {

        RED.nodes.createNode(this, configNode);

        this.machine = configNode.machine;
        this.protocolName = configNode.protocolName;

        var node = this;

        var machineInfo = "machine " + node.machine + " on interface " + node.protocolName;

        function verbose_warn(logMessage) {
            if (RED.settings.verbose) {
                node.warn('MachineId -> ' + logMessage + " " + machineInfo);
            }
        }

        function verbose_log(logMessage) {
            if (RED.settings.verbose) {
                node.log('MachineId -> ' + logMessage + " " + machineInfo);
            }
        }

        verbose_log('initialization');

        node.on("close", function () {
            verbose_log("close");
        });
    }

    RED.nodes.registerType("ISA-MachineId", ISAMachineIdNode);
};