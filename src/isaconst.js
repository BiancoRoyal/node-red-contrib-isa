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
 * Basic constant messages.
 * @module ISAConstants
 */
var ISAResultMessage = {};

module.exports = {
    /**
     * Constants of results in ISA context.
     * @constant
     * @property {number} ISAResultMessage.None                             - None
     * @property {number} ISAResultMessage.ReferenceNotFound                - The reference wasn't found
     * @property {number} ISAResultMessage.NodeIdNotValid                   - The NodeId isn't valid
     * @property {number} ISAResultMessage.AddressSpaceNotValid             - The address space isn't valid
     * @property {number} ISAResultMessage.AddressSpaceOperationDone        - The address space operation is done
     * @property {number} ISAResultMessage.ParentNodeReferenceNotFound      - The parent NodeId was not found
     * @property {number} ISAResultMessage.ServerNotReady                   - The server is not ready for address space operations
     */
    ISAResultMessage: ISAResultMessage
};

Object.defineProperty(ISAResultMessage, 'None', {
    writable: false,
    enumerable: true,
    configurable: false,
    value: 0
});

Object.defineProperty(ISAResultMessage, 'ReferenceNotFound', {
    writable: false,
    enumerable: true,
    configurable: false,
    value: 1
});

Object.defineProperty(ISAResultMessage, 'NodeIdNotValid', {
    writable: false,
    enumerable: true,
    configurable: false,
    value: 2
});

Object.defineProperty(ISAResultMessage, 'AddressSpaceNotValid', {
    writable: false,
    enumerable: true,
    configurable: false,
    value: 3
});

Object.defineProperty(ISAResultMessage, 'AddressSpaceOperationDone', {
    writable: false,
    enumerable: true,
    configurable: false,
    value: 4
});

Object.defineProperty(ISAResultMessage, 'ParentNodeReferenceNotFound', {
    writable: false,
    enumerable: true,
    configurable: false,
    value: 5
});

Object.defineProperty(ISAResultMessage, 'ServerNotReady', {
    writable: false,
    enumerable: true,
    configurable: false,
    value: 6
});