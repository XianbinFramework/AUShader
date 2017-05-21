class AUIndex {
  index:THREE.BufferAttribute;
  constructor(index: number[]) {
    var vertexIndexArr = new Uint32Array(index);
    var indexAttr:THREE.BufferAttribute = new THREE.BufferAttribute(vertexIndexArr ,1);
    this.index = indexAttr;
  }
}
