class AUUniform extends AUBase{
  constructor(uniforms: Object) {
    super();
    // binding object attributes to instance
    Object.keys(uniforms).forEach((key) => {
      let value = uniforms[key];
      let type  = this.getTypeOfValue(value);
      if(type == ""){
          throw new TypeError("AUUniform constructor error : variable " + key + " is not valid type");
      }
      this[key] = uniforms[key];

    })
  };
}
