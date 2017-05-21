/// <reference path="../libs/threejs/three.d.ts"/>
var QuickStart = (function () {
    function QuickStart() {
        this.leftColor = new AUUniform({
            color: new THREE.Vector4(1, 0, 0, 1),
            offset: new THREE.Vector4(0, 0, 0, 0)
        });
        this.rightColor = new AUUniform({
            color: new THREE.Vector4(0, 0, 1, 1),
            offset: new THREE.Vector4(0, 0, 0, 0)
        });
        this.varyings = new AUVarying({
            vUv: new THREE.Vector2(0, 0)
        });
        this.auProvider = new AUProvider();
        this.auProvider.configureModel(this);
        this.auProvider.commit();
        var planeGeometry = new THREE.PlaneGeometry(900, 600, 50, 50);
        var material = this.auProvider.material;
        var mesh = new THREE.Mesh(planeGeometry, material);
        // screen size
        var height = window.innerHeight;
        var width = window.innerWidth;
        // Create the renderer, in this case using WebGL, we want an alpha channel
        this.renderer = new THREE.WebGLRenderer({ alpha: true });
        // Set dimensions to 500x500 and background color to white
        this.renderer.setSize(900, 600);
        // Bind the renderer to the HTML, parenting it to our 'content' DIV
        document.getElementById('content').appendChild(this.renderer.domElement);
        // Create camera
        var aspectRatio = width / height;
        var fieldOfView = 45;
        var nearPlane = 0.1;
        var farPlane = 10000000;
        this.camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);
        this.camera.position.x = 0;
        this.camera.position.z = 500;
        this.camera.position.y = 0;
        // Create a Scene
        this.scene = new THREE.Scene();
        this.scene.add(mesh);
        // star rendering
        this.renderer.render(this.scene, this.camera);
    }
    QuickStart.prototype.render = function () {
        var _this = this;
        // Each frame we want to render the scene again
        requestAnimationFrame(function () { return _this.render(); });
        // this.colorAndOffset.offset.z = 0;
        this.update();
        this.renderer.render(this.scene, this.camera);
    };
    QuickStart.prototype.start = function () {
        // Not so pointless now!
        this.render();
    };
    QuickStart.prototype.update = function () {
        this.leftColor.offset.y += 0.01;
        if (this.leftColor.offset.y > 1)
            this.leftColor.offset.y = 0;
    };
    QuickStart.prototype.auVertexMain = function () {
        var vertFunc = ("\n          vUv = uv;\n        ");
        return vertFunc;
    };
    QuickStart.prototype.auFragmentMain = function () {
        var fragFunc = ("\n        if(vUv.x < 0.5){\n          auColor += leftColor.color + leftColor.offset;\n        } else {\n          auColor += rightColor.color + rightColor.offset;\n        }\n        ");
        return fragFunc;
    };
    return QuickStart;
}());
window.onload = function () {
    var mainApp = new QuickStart();
    mainApp.start();
};
//# sourceMappingURL=QuickStart.js.map