class AUVarying extends AUBase {

  constructor(varyings: Object) {
    super();
    // binding object attributes to instance
    Object.keys(varyings).forEach((key) => {
      let value = varyings[key];
      let type  = this.getTypeOfValue(value);
      if(type == "" || type == "sampler2D"){
          throw new TypeError("AUVarying constructor error : variable " + key + " is not valid type");
      }
      this[key] = varyings[key];
    })
  };
}
