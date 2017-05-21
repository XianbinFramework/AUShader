
type AUAttributeArray = Array<AUAttribute>;
class AUProvider extends AUBase{
    private auModel    :AUProviderDelegate;;
    private uniforms   :any = {};
    private arrtitbutes:any = {};
    private auIndex      :AUIndex;
    private vertexFunc:string = (`
      [auVertexGlobal]
      [attributeStructString]
      [uniformStructString]
      [varyingDelcarationString]
      void main() {
        [attributeInitString]
        vec4 auPosition = vec4( position, 1.0 );
        [auVertexMain]
        gl_Position = projectionMatrix * modelViewMatrix * auPosition;
        // gl_Position = auPosition;
      }`
    );
    private fragFunc:string = (`
      [auFragmentGlobal]
      [uniformStructString]
      [varyingDelcarationString]
      [samplerDelcarationString]
      void main(){
        vec4 auColor = vec4(0.0,0.0,0.0,1.0);
        [auFragmentMain]
        gl_FragColor = auColor;
      }`
    );

    private attributeStructString:      string = "";
    private attributeInitString:        string = "";
    private uniformStructString:        string = "";
    private varyingDelcarationString:   string = "";
    private samplerDelcarationString:   string = "";
    private auVertexGlobal:             string = "";
    private auFragmentGlobal:           string = "";





    constructor(){
      super();
    }

    configureModel(auModel:AUProviderDelegate){
      this.auModel = auModel;
    }

    commit(){
        if(this.auModel == undefined){
          throw new ReferenceError("AUProvider can't commit without an auModel, please set an AUModel with function configureModel()");
        }
        this.clean();
        // read
        for(let property in this.auModel){
            let object = this.auModel[property];
            switch(true){
                // AUAttribute[]
                case object instanceof Array:{
                  if(object.length > 0 && object.length == object.filter(this.isAUAttribute).length){
                    this.setupAttribute(property,this.auModel[property]);
                  }
                  break;
                }
                case object instanceof AUIndex:{
                  this.auIndex = this.auModel[property];
                  break;
                }
                case object instanceof AUUniform:{
                  this.setupUniform(property,this.auModel[property]);
                  break;
                }
                case object instanceof AUVarying:{

                  this.setupVarying(property,this.auModel[property]);
                  break;
                }
                case object instanceof AUSampler:{

                  this.setupSampler(property,this.auModel[property]);
                  break;
                }
                default: break;
            }
        }
        console.log("attributes:",this.arrtitbutes);
    }

    private setupAttribute(key:string, attributes:AUAttribute[]){
      var attributeData : any = {};

      for(let attribute of attributes){
        let names = Object.getOwnPropertyNames(attribute);
        if(names.length <= 0) continue;
        for(let name of names){
            if(attributeData[key+name] == undefined){
              var data:number[] = [];
              var itemSize = this.getItemSizeOfValue(attribute[name]);
              attributeData[key+name] = {data:data,itemSize:itemSize}
            }
            attributeData[key+name]["data"].push(...attribute[name].toArray());

        }
      }
      this.arrtitbutes[key] = attributeData;
      this.attributeStructString += this.unwrapValueToStructString(key,attributes[0]);
      this.attributeStructString += "au" + key + " " + key + ";\n";
      this.attributeStructString += this.createAttributedeclarationString(key,attributes[0]);
      this.attributeInitString   += this.unwrapValueToInitString(key,attributes[0]);
      console.log("=====>",this.arrtitbutes);
    }


    private setupUniform(key:string,value:AUUniform){
      let names = Object.getOwnPropertyNames(value);
      if(names.length <= 0) return;
      var subUniform : any = {};
      for(let name of names){
        subUniform[name] = value[name];
      }
      subUniform = {value:subUniform};
      this.uniforms[key] = subUniform;
      this.uniformStructString += this.unwrapValueToStructString(key,value);
      this.uniformStructString += "uniform " + " au" + key + " " + key + ";\n";
    }

    private setupVarying(key:string,value:AUVarying){
      let names = Object.getOwnPropertyNames(value);
      if(names.length <= 0) return;
      for(let name of names){
        let type = this.getTypeOfValue(value[name]);
        this.varyingDelcarationString += "varying " + type + " " + name + ";\n";
      }
    }

    private createAttributedeclarationString(key:string,value:AUAttribute):string{
      var declarationString = "";
      let names = Object.getOwnPropertyNames(value);
      if(names.length <= 0) return "";
      for(let name of names){
        let type = this.getTypeOfValue(value[name]);
        declarationString += "attribute " + type + " " + key + name + ";\n";
      }
      return declarationString;
    }

    private setupSampler(key:string,value:AUSampler){
      let names = Object.getOwnPropertyNames(value);
      if(names.length <= 0) return;
      for(let name of names){
        this.uniforms[name] = {type:"sampler2D",value:value[name]};;
        this.samplerDelcarationString += "uniform sampler2D " + name + ";\n";
      }
    }


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
    private unwrapValueToStructString(key:string,value:AUUniform|AUAttribute):string{
      let names = Object.getOwnPropertyNames(value);
      if(names.length <= 0) return "";
      var structString = "struct au" + key + "{\n";
      for(let name of names){
        let type = this.getTypeOfValue(value[name]);
        structString  += type + " " + name + ";\n";
      }
      structString += "};\n";
      return structString;
    }

    private unwrapValueToInitString(key:string,value:AUAttribute):string{
      let names = Object.getOwnPropertyNames(value);
      if(names.length <= 0) return "";
      var initString = "";
      for(let name of names){
        initString += key + "." + name + " = " + key + name  + ";\n";
      }
      return initString;
    }

    public get material():THREE.ShaderMaterial{
      if(this.auModel == undefined) return undefined;
     var material = new THREE.ShaderMaterial({
       uniforms        : this.uniforms,
       vertexShader    : this.setupVertexFunction(),
       fragmentShader  : this.setupFragmentFunction()
     });
     return material;
   }

   public get geometry():THREE.BufferGeometry{
     if(this.auModel == undefined) return undefined;
     var geometry = new THREE.BufferGeometry;
     for(let key in this.arrtitbutes){
       // key ==> indexIn
       for(let attributeName in this.arrtitbutes[key]){
         var itemSize = this.arrtitbutes[key][attributeName].itemSize;
         var dataBuffer = this.arrtitbutes[key][attributeName].data;
         var array = new Float32Array(dataBuffer);
         var attribute = new THREE.BufferAttribute(array,itemSize);
         geometry.addAttribute(attributeName,attribute);
       }
     }
     geometry.setIndex(this.auIndex.index);
     return geometry;
   }



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

    private clean(){
      // clean
      this.attributeStructString      = "";
      this.attributeInitString        = "";
      this.uniformStructString        = "";
      this.varyingDelcarationString   = "";
      this.samplerDelcarationString   = "";
      this.uniforms   = {};
      this.arrtitbutes = {};
    }

    isAUAttribute(x:any):x is AUAttribute{
      return x instanceof AUAttribute;
    }

    isNumber(x: any): x is number {
      return typeof x === "number";
    }

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
    private setupVertexFunction():string{
      var result = this.vertexFunc;
      result = result.replace("[attributeStructString]",      this.attributeStructString);
      result = result.replace("[attributeInitString]",        this.attributeInitString);
      result = result.replace("[uniformStructString]",        this.uniformStructString);
      // result = result.replace("[uniformInitString]",          this.uniformInitString);
      result = result.replace("[varyingDelcarationString]",   this.varyingDelcarationString);
      if(this.auModel.auVertexGlobal == undefined){
        result = result.replace("[auVertexGlobal]","");
      } else {
        result = result.replace("[auVertexGlobal]",this.auModel.auVertexGlobal());
      }
      if(this.auModel.auVertexMain == undefined){
        result = result.replace("[auVertexMain]","");
      } else {
        result = result.replace("[auVertexMain]",this.auModel.auVertexMain());
      }
      return result;
    }

    private setupFragmentFunction():string{
      var result = this.fragFunc;
      result = result.replace("[uniformStructString]",this.uniformStructString);
      // result = result.replace("[uniformInitString]",        this.uniformInitString);
      result = result.replace("[varyingDelcarationString]", this.varyingDelcarationString);
      result = result.replace("[samplerDelcarationString]", this.samplerDelcarationString);
      if(this.auModel.auFragmentGlobal == undefined){
        result = result.replace("[auFragmentGlobal]","");
      } else {
        result = result.replace("[auFragmentGlobal]",this.auModel.auFragmentGlobal());
      }
      if(this.auModel.auFragmentMain == undefined){
        result = result.replace("[auFragmentMain]","");
      } else {
        result = result.replace("[auFragmentMain]",this.auModel.auFragmentMain());
      }
      return result;
    }





}
