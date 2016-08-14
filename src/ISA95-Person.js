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


module.exports = function(RED) {
    function ISA95PersonNode(config) {

        RED.nodes.createNode(this, config);
        this.action = config.action;

        var node = this;
        this.on('input', function (msg) {
            console.log("ISA95PersonTypeNode Action: " + node.action);

            var data = msg.payload;
            console.log("ISA95PersonTypeNode Type:" + typeof data);

            switch (node.action) {
                case "default":
                    if (typeof data === "string") {
                        data = { 'version': 'PersonType', 'data': data };
                    }
                    else
                    {
                        data = { 'info': 'ISA95PersonTypeNode unknown data type for default action', 'data': data, 'type': typeof data }
                    }
                    break;
                case "extended":
                    if (typeof data === "string") {
                        data = { 'version': 'PersonTypeExtended', 'data': data };
                    }
                    else
                    {
                        data = { 'info': 'ISA95PersonTypeNode unknown data type for extended action', 'data': data, 'type': typeof data }
                    }
                    break;
                default:
                    data = { 'info': 'ISA95PersonTypeNode unknown action or data type', 'data': data, 'type': typeof data };
            }

            msg.payload = data;
            node.send(msg);
        });
    }
    RED.nodes.registerType("ISA95-Person", ISA95PersonNode);
};