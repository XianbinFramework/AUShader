class AUBase{
  getTypeOfValue(value:AUAvaibleType):string{
    switch(true){
      case value instanceof THREE.Vector4:
        return "vec4";
      case value instanceof THREE.Vector3:
        return "vec3";
      case value instanceof THREE.Vector2:
        return "vec2";
      case value instanceof THREE.Matrix4:
        return "mat4";
      case value instanceof THREE.Matrix3:
        return "mat3";
      case value instanceof THREE.Texture:
        return "sampler2D";
      case typeof value === "number":
      return "float";
      default:
      return "";
    }
  }

  getItemSizeOfValue(value:AUAvaibleType):number{
    switch(true){
      case value instanceof THREE.Vector4:
        return 4;
      case value instanceof THREE.Vector3:
        return 3;
      case value instanceof THREE.Vector2:
        return 2;
      case value instanceof THREE.Matrix4:
        return 16;
      case value instanceof THREE.Matrix3:
        return 9;
      case typeof value === "number":
      return 1;
      default:
      return 0;
    }
  }

}
