var Square = (function () {
    function Square() {
        this.geometry = new THREE.PlaneGeometry(900, 600, 90, 60);
        this.size = new AUUniform({
            screen: new THREE.Vector2(900, 600),
            image: new THREE.Vector2(90, 60)
        });
        this.varyings = new AUVarying({
            vUv: new THREE.Vector2(0, 0),
            alpha: 0
        });
    }
    Object.defineProperty(Square.prototype, "mesh", {
        get: function () {
            if (this.material == undefined || this.geometry == undefined)
                return undefined;
            if (this._mesh == undefined) {
                this._mesh = new THREE.Mesh(this.geometry, this.material);
            }
            return this._mesh;
        },
        enumerable: true,
        configurable: true
    });
    ;
    Square.prototype.auVertexMain = function () {
        var vertFunc = ("\n        vUv = uv;\n        auPosition.xy *= size.image/size.screen;\n      ");
        return vertFunc;
    };
    Square.prototype.auFragmentGlobal = function () {
        var fragGlobal = ("\n      float calculateCircle(vec2 pixelPosition,vec2 center,vec2 edge){\n        float ratio = 900.0/600.0;\n        vec2  v     = vec2((pixelPosition.x - center.x)*ratio,pixelPosition.y - center.y);\n        return smoothstep(edge.x,edge.y,length(v));\n      }\n      ");
        return fragGlobal;
    };
    Square.prototype.auFragmentMain = function () {
        var fragFunc = ("\n      auColor      = vec4(0.0,0.0,1.0,1.0);\n      float circle = calculateCircle(vUv,vec2(0.5),vec2(0.3,0.5));\n      auColor.a   *= circle;\n      ");
        return fragFunc;
    };
    return Square;
}());
//# sourceMappingURL=Square.js.map