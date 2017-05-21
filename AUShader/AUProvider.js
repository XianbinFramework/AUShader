var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var AUProvider = (function (_super) {
    __extends(AUProvider, _super);
    function AUProvider() {
        var _this = _super.call(this) || this;
        _this.uniforms = {};
        _this.arrtitbutes = {};
        _this.vertexFunc = ("\n      [auVertexGlobal]\n      [attributeStructString]\n      [uniformStructString]\n      [varyingDelcarationString]\n      void main() {\n        [attributeInitString]\n        vec4 auPosition = vec4( position, 1.0 );\n        [auVertexMain]\n        gl_Position = projectionMatrix * modelViewMatrix * auPosition;\n        // gl_Position = auPosition;\n      }");
        _this.fragFunc = ("\n      [auFragmentGlobal]\n      [uniformStructString]\n      [varyingDelcarationString]\n      [samplerDelcarationString]\n      void main(){\n        vec4 auColor = vec4(0.0,0.0,0.0,1.0);\n        [auFragmentMain]\n        gl_FragColor = auColor;\n      }");
        _this.attributeStructString = "";
        _this.attributeInitString = "";
        _this.uniformStructString = "";
        _this.varyingDelcarationString = "";
        _this.samplerDelcarationString = "";
        _this.auVertexGlobal = "";
        _this.auFragmentGlobal = "";
        return _this;
    }
    ;
    AUProvider.prototype.configureModel = function (auModel) {
        this.auModel = auModel;
    };
    AUProvider.prototype.commit = function () {
        if (this.auModel == undefined) {
            throw new ReferenceError("AUProvider can't commit without an auModel, please set an AUModel with function configureModel()");
        }
        this.clean();
        // read
        for (var property in this.auModel) {
            var object = this.auModel[property];
            switch (true) {
                // AUAttribute[]
                case object instanceof Array: {
                    if (object.length > 0 && object.length == object.filter(this.isAUAttribute).length) {
                        this.setupAttribute(property, this.auModel[property]);
                    }
                    break;
                }
                case object instanceof AUIndex: {
                    this.auIndex = this.auModel[property];
                    break;
                }
                case object instanceof AUUniform: {
                    this.setupUniform(property, this.auModel[property]);
                    break;
                }
                case object instanceof AUVarying: {
                    this.setupVarying(property, this.auModel[property]);
                    break;
                }
                case object instanceof AUSampler: {
                    this.setupSampler(property, this.auModel[property]);
                    break;
                }
                default: break;
            }
        }
        console.log("attributes:", this.arrtitbutes);
    };
    AUProvider.prototype.setupAttribute = function (key, attributes) {
        var attributeData = {};
        for (var _i = 0, attributes_1 = attributes; _i < attributes_1.length; _i++) {
            var attribute = attributes_1[_i];
            var names = Object.getOwnPropertyNames(attribute);
            if (names.length <= 0)
                continue;
            for (var _a = 0, names_1 = names; _a < names_1.length; _a++) {
                var name_1 = names_1[_a];
                if (attributeData[key + name_1] == undefined) {
                    var data = [];
                    var itemSize = this.getItemSizeOfValue(attribute[name_1]);
                    attributeData[key + name_1] = { data: data, itemSize: itemSize };
                }
                (_b = attributeData[key + name_1]["data"]).push.apply(_b, attribute[name_1].toArray());
            }
        }
        this.arrtitbutes[key] = attributeData;
        this.attributeStructString += this.unwrapValueToStructString(key, attributes[0]);
        this.attributeStructString += "au" + key + " " + key + ";\n";
        this.attributeStructString += this.createAttributedeclarationString(key, attributes[0]);
        this.attributeInitString += this.unwrapValueToInitString(key, attributes[0]);
        console.log("=====>", this.arrtitbutes);
        var _b;
    };
    AUProvider.prototype.setupUniform = function (key, value) {
        var names = Object.getOwnPropertyNames(value);
        if (names.length <= 0)
            return;
        var subUniform = {};
        for (var _i = 0, names_2 = names; _i < names_2.length; _i++) {
            var name_2 = names_2[_i];
            subUniform[name_2] = value[name_2];
        }
        subUniform = { value: subUniform };
        this.uniforms[key] = subUniform;
        this.uniformStructString += this.unwrapValueToStructString(key, value);
        this.uniformStructString += "uniform " + " au" + key + " " + key + ";\n";
    };
    AUProvider.prototype.setupVarying = function (key, value) {
        var names = Object.getOwnPropertyNames(value);
        if (names.length <= 0)
            return;
        for (var _i = 0, names_3 = names; _i < names_3.length; _i++) {
            var name_3 = names_3[_i];
            var type = this.getTypeOfValue(value[name_3]);
            this.varyingDelcarationString += "varying " + type + " " + name_3 + ";\n";
        }
    };
    AUProvider.prototype.createAttributedeclarationString = function (key, value) {
        var declarationString = "";
        var names = Object.getOwnPropertyNames(value);
        if (names.length <= 0)
            return "";
        for (var _i = 0, names_4 = names; _i < names_4.length; _i++) {
            var name_4 = names_4[_i];
            var type = this.getTypeOfValue(value[name_4]);
            declarationString += "attribute " + type + " " + key + name_4 + ";\n";
        }
        return declarationString;
    };
    AUProvider.prototype.setupSampler = function (key, value) {
        var names = Object.getOwnPropertyNames(value);
        if (names.length <= 0)
            return;
        for (var _i = 0, names_5 = names; _i < names_5.length; _i++) {
            var name_5 = names_5[_i];
            this.uniforms[name_5] = { type: "sampler2D", value: value[name_5] };
            ;
            this.samplerDelcarationString += "uniform sampler2D " + name_5 + ";\n";
        }
    };
    /**
    this.size = new AUUniform({
      screen: new THREE.Vector2(900,600),
      image: new THREE.Vector2(90,60)
    });
    return :
    struct ausize{
        vec2 screen;
        vec2 image;
    };
    */
    AUProvider.prototype.unwrapValueToStructString = function (key, value) {
        var names = Object.getOwnPropertyNames(value);
        if (names.length <= 0)
            return "";
        var structString = "struct au" + key + "{\n";
        for (var _i = 0, names_6 = names; _i < names_6.length; _i++) {
            var name_6 = names_6[_i];
            var type = this.getTypeOfValue(value[name_6]);
            structString += type + " " + name_6 + ";\n";
        }
        structString += "};\n";
        return structString;
    };
    AUProvider.prototype.unwrapValueToInitString = function (key, value) {
        var names = Object.getOwnPropertyNames(value);
        if (names.length <= 0)
            return "";
        var initString = "";
        for (var _i = 0, names_7 = names; _i < names_7.length; _i++) {
            var name_7 = names_7[_i];
            initString += key + "." + name_7 + " = " + key + name_7 + ";\n";
        }
        return initString;
    };
    Object.defineProperty(AUProvider.prototype, "material", {
        get: function () {
            if (this.auModel == undefined)
                return undefined;
            var material = new THREE.ShaderMaterial({
                uniforms: this.uniforms,
                vertexShader: this.setupVertexFunction(),
                fragmentShader: this.setupFragmentFunction()
            });
            return material;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AUProvider.prototype, "geometry", {
        get: function () {
            if (this.auModel == undefined)
                return undefined;
            var geometry = new THREE.BufferGeometry;
            for (var key in this.arrtitbutes) {
                // key ==> indexIn
                for (var attributeName in this.arrtitbutes[key]) {
                    var itemSize = this.arrtitbutes[key][attributeName].itemSize;
                    var dataBuffer = this.arrtitbutes[key][attributeName].data;
                    var array = new Float32Array(dataBuffer);
                    var attribute = new THREE.BufferAttribute(array, itemSize);
                    geometry.addAttribute(attributeName, attribute);
                }
            }
            geometry.setIndex(this.auIndex.index);
            return geometry;
        },
        enumerable: true,
        configurable: true
    });
    //  private setupShaderProgram(){
    //    for(let property in this.auModel){
    //      let object = this.auModel[property];
    //      if(object instanceof AUUniform){
    //        // uniforms
    //        this.uniformStructString      += this.unwrapObjectToStructString(object,property);
    //        this.uniformDeclarationString += this.unwrapUniformObjectToDeclarationString(object,property);
    //       //  this.uniformInitString        += this.unwrapObjectToInitString(object,property);
    //        // texture samplers
    //       //  this.samplerInitString        += this.unwrapObjectToSamplerString(object);
    //      } else if(object instanceof AUVarying){
    //        this.varyingDeclarationString += this.unwrapUVaryingObjectToDeclarationString(object,property);
    //      } else if(object instanceof AUAttribute){
    //        this.attributeStructString      += this.unwrapObjectToStructString(object,property);
    //        this.attributeDeclarationString += this.unwrapAttributeObjectToDeclarationString(object,property);
    //        this.attributeInitString        += this.unwrapObjectToInitString(object,property);
    //      }
    //    }
    //  }
    AUProvider.prototype.clean = function () {
        // clean
        this.attributeStructString = "";
        this.attributeInitString = "";
        this.uniformStructString = "";
        this.varyingDelcarationString = "";
        this.samplerDelcarationString = "";
        this.uniforms = {};
        this.arrtitbutes = {};
    };
    AUProvider.prototype.isAUAttribute = function (x) {
        return x instanceof AUAttribute;
    };
    AUProvider.prototype.isNumber = function (x) {
        return typeof x === "number";
    };
    /**
      var colorAndOffset = new AUUniform({
      color : new THREE.Vector3(0,0,0),
      offset : new THREE.Vector3(0,1,0,1,0.1),
    })
    return :
      attribute/uniform/varying vec3 colorAndOffsetcolor;
      uniform vec3 colorAndOffsetoffset;
      }
    */
    // private unwrapObjectToDeclarationString(type:string):(object:AUType,prefix:string)=>string{
    //   return function(object,prefix):string{
    //     var declarationString = "";
    //     for(let variable of object.variables){
    //       let uniformVariableName = prefix + variable.name;
    //         this.uniforms[prefix+variable.name] = {type:variable.type,value:variable.reference};
    //         if(type == "varying" || type == "sampler2D"){
    //           declarationString  += type + " " + variable.type + " " + variable.name + ";\n";
    //         } else {
    //             declarationString += type + " " + variable.type + " " + uniformVariableName + ";\n";
    //         }
    //
    //     }
    //     return declarationString;
    //   }
    // }
    // private unwrapUniformObjectToDeclarationString   = this.unwrapObjectToDeclarationString("uniform");
    // private unwrapAttributeObjectToDeclarationString = this.unwrapObjectToDeclarationString("attribute");
    // private unwrapUVaryingObjectToDeclarationString  = this.unwrapObjectToDeclarationString("varying");
    /**
      var colorAndOffset = new AUUniform({
      color : new THREE.Vector3(0,0,0),
      offset : new THREE.Vector3(0,1,0,1,0.1),
    })
    return :
      struct aucolorAndOffset{
        vec3 color;
        vec3 offset;
      }
    */
    // private unwrapObjectToStructString(object:AUType,prefix:string):string{
    //
    //   if(object.variables.length <= 0){ return "" }
    //   let structName   = "au" + prefix;
    //   var structString = "struct " + structName + "{\n";
    //   for(let variable of object.variables){
    //     if(variable.type != "sampler2D"){
    //       structString  += variable.type + " " + variable.name + ";\n";
    //     }
    //   }
    //   structString += "};\n";
    // }
    /**
      var colorAndOffset = new AUUniform({
      color : new THREE.Vector3(0,0,0),
      offset : new THREE.Vector3(0,1,0,1,0.1),
    })
    return :
      aucolorAndOffset colorAndOffset;
      colorAndOffset.color = colorAndOffsetcolor;
      colorAndOffset.offset = colorAndOffsetoffset;
    */
    // private unwrapObjectToInitString(object:AUType,prefix:string):string{
    //   if(object.variables.length <= 0){ return ""};
    //   var structString = "au" + prefix + " " + prefix + ";\n";
    //   for(let variable of object.variables){
    //     if(variable.type != "sampler2D"){
    //       structString += prefix + "." + variable.name + " = " + prefix + variable.name + ";\n";
    //     }
    //   }
    //   return structString;
    // }
    /**
      var colorAndOffset = new AUUniform({
      color : new THREE.Vector3(0,0,0),
      offset : new THREE.Vector3(0,1,0,1,0.1),
    })
    return :
      aucolorAndOffset colorAndOffset;
      colorAndOffset.color = colorAndOffsetcolor;
      colorAndOffset.offset = colorAndOffsetoffset;
    */
    // private unwrapObjectToSamplerString(objtect:AUUniform):string{
    //   var samplerString = "";
    //   for(let sampler of objtect.samplers){
    //     this.uniforms[sampler.name] = {type:sampler.type,value:sampler.reference};
    //       samplerString +=  "uniform sampler2D " + sampler.name + ";\n";
    //     }
    //   return samplerString;
    // }
    AUProvider.prototype.setupVertexFunction = function () {
        var result = this.vertexFunc;
        result = result.replace("[attributeStructString]", this.attributeStructString);
        result = result.replace("[attributeInitString]", this.attributeInitString);
        result = result.replace("[uniformStructString]", this.uniformStructString);
        // result = result.replace("[uniformInitString]",          this.uniformInitString);
        result = result.replace("[varyingDelcarationString]", this.varyingDelcarationString);
        if (this.auModel.auVertexGlobal == undefined) {
            result = result.replace("[auVertexGlobal]", "");
        }
        else {
            result = result.replace("[auVertexGlobal]", this.auModel.auVertexGlobal());
        }
        if (this.auModel.auVertexMain == undefined) {
            result = result.replace("[auVertexMain]", "");
        }
        else {
            result = result.replace("[auVertexMain]", this.auModel.auVertexMain());
        }
        return result;
    };
    AUProvider.prototype.setupFragmentFunction = function () {
        var result = this.fragFunc;
        result = result.replace("[uniformStructString]", this.uniformStructString);
        // result = result.replace("[uniformInitString]",        this.uniformInitString);
        result = result.replace("[varyingDelcarationString]", this.varyingDelcarationString);
        result = result.replace("[samplerDelcarationString]", this.samplerDelcarationString);
        if (this.auModel.auFragmentGlobal == undefined) {
            result = result.replace("[auFragmentGlobal]", "");
        }
        else {
            result = result.replace("[auFragmentGlobal]", this.auModel.auFragmentGlobal());
        }
        if (this.auModel.auFragmentMain == undefined) {
            result = result.replace("[auFragmentMain]", "");
        }
        else {
            result = result.replace("[auFragmentMain]", this.auModel.auFragmentMain());
        }
        return result;
    };
    return AUProvider;
}(AUBase));
//# sourceMappingURL=AUProvider.js.map