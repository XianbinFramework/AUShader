var AUIndex = (function () {
    function AUIndex(index) {
        var vertexIndexArr = new Uint32Array(index);
        var indexAttr = new THREE.BufferAttribute(vertexIndexArr, 1);
        this.index = indexAttr;
    }
    return AUIndex;
}());
//# sourceMappingURL=AUIndex.js.map