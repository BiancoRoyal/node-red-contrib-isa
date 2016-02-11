module.exports = function(RED) {
    function LowerCaseNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        this.on('input', function(msg) {
        	var data = msg.payload;
            if ((typeof data === "object") && (!Buffer.isBuffer(data))) {
                data = JSON.stringify(data);
            }
            msg.payload = eval('(' + data.toLowerCase() + ')');
            node.send(msg);
        });
    }
    RED.nodes.registerType("lower-case",LowerCaseNode);
}