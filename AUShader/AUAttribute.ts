class AUAttribute extends AUBase{

  constructor(attributes: Object) {
    super();
    // binding object attributes to instance
    Object.keys(attributes).forEach((key) => {
      let value = attributes[key];
      let type  = this.getTypeOfValue(value);
      if(type == "" || type == "sampler2D"){
          throw new TypeError("AUAttribute constructor error : variable " + key + " is not valid type");
      }
      this[key] = attributes[key];

    });
  };
}
