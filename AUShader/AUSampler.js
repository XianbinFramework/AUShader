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
var AUSampler = (function (_super) {
    __extends(AUSampler, _super);
    function AUSampler(varyings) {
        var _this = _super.call(this) || this;
        // binding object attributes to instance
        Object.keys(varyings).forEach(function (key) {
            var value = varyings[key];
            var type = _this.getTypeOfValue(value);
            if (type != "sampler2D") {
                throw new TypeError("AUVarying constructor error : variable " + key + " is not valid type");
            }
            _this[key] = varyings[key];
        });
        return _this;
    }
    ;
    return AUSampler;
}(AUBase));
//# sourceMappingURL=AUSampler.js.map