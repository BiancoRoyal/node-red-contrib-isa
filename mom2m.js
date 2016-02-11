module.exports = function(RED) {
    function MOM2MNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        this.on('input', function(msg) {
        	var data = msg.payload;
            if ((typeof data === "object") && (!Buffer.isBuffer(data))) {
                data = JSON.stringify(data);
            }
            msg.payload = data
            node.send(msg);
        });
    }
    RED.nodes.registerType("mom2m",MOM2MNode);
}