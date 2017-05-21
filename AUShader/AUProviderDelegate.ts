type AUAvaibleType  = THREE.Vector4 | THREE.Vector3 | THREE.Vector2 | THREE.Matrix4 | THREE.Matrix3 | THREE.Texture | Float32Array | number;
type ShaderVariable = {name:string, type:string, reference:any};
type AUType         = AUAttribute | AUUniform | AUVarying;
type AttributeVariable = {data:Float32Array, size:number}









interface AUProviderDelegate{
  auVertexMain?():string;
  auFragmentMain?():string;
  auVertexGlobal?():string;
  auFragmentGlobal?():string;

}
