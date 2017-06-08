(function () {
    var loader = new THREE.TextureLoader();
    loadTexture = function (path) {
        return new Promise(function (resolve, reject) {
            loader.load(path, resolve, reject);
        });
    }
})();

var RenderPart = function () {
    this.target = new THREE.WebGLRenderTarget(512, 512, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat } );
    this.scene = new THREE.Scene();

    this.g = new THREE.PlaneGeometry(2, 2);
    this.m = new THREE.MeshBasicMaterial({ map: undefined });

    this.mesh = new THREE.Mesh(this.g, this.m);

    this.scene.add(this.mesh);

    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
};

RenderPart.prototype.render = function (renderer, pixmap, x, y) {
    this.mesh.position.set(x || 0, y || 0, 0);
    this.m.map = pixmap;

    renderer.setClearColor(0x000000, 1);
    renderer.render(this.scene, this.camera, this.target);

    return this.target;
};

var RenderShadowDepth = function () {
    this.target = new THREE.WebGLRenderTarget(2048, 1, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat } );
    this.scene = new THREE.Scene();

    this.g = new THREE.PlaneGeometry(2, 2);
    this.m = new THREE.ShaderMaterial({
        uniforms: { tDiffuse: { type: "t", value: undefined } },
        vertexShader: document.getElementById('vertexShader').textContent,
        fragmentShader: document.getElementById('fragmentShaderShadowDepth').textContent

    });

    this.mesh = new THREE.Mesh(this.g, this.m);

    this.scene.add(this.mesh);

    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
};

RenderShadowDepth.prototype.render = function (renderer, texture) {
    this.m.uniforms.tDiffuse.value = texture;

    renderer.setClearColor(0xffffff, 1);
    renderer.render(this.scene, this.camera, this.target);

    return this.target;
};

var RenderShadowMap = function () {
    this.target = new THREE.WebGLRenderTarget(512, 512, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat } );
    this.scene = new THREE.Scene();

    this.g = new THREE.PlaneGeometry(2, 2);
    this.m = new THREE.ShaderMaterial({
        uniforms: { tDiffuse: { type: "t", value: undefined } },
        vertexShader: document.getElementById('vertexShader').textContent,
        fragmentShader: document.getElementById('fragmentShaderShadowMap').textContent

    });

    this.mesh = new THREE.Mesh(this.g, this.m);

    this.scene.add(this.mesh);

    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
};

RenderShadowMap.prototype.render = function (renderer, depthmap) {
    this.m.uniforms.tDiffuse.value = depthmap;

    renderer.setClearColor(0xffffff, 1);
    renderer.render(this.scene, this.camera, this.target);

    return this.target;
};

var RenderShadowMapBlur = function () {
    this.target = new THREE.WebGLRenderTarget(512, 512, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat } );
    this.scene = new THREE.Scene();

    this.g = new THREE.PlaneGeometry(2, 2);
    this.m = new THREE.ShaderMaterial({
        uniforms: { tDiffuse: { type: "t", value: undefined } },
        vertexShader: document.getElementById('vertexShader').textContent,
        fragmentShader: document.getElementById('fragmentShaderShadowMapBlur').textContent

    });

    this.mesh = new THREE.Mesh(this.g, this.m);

    this.scene.add(this.mesh);

    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
};

RenderShadowMapBlur.prototype.render = function (renderer, shadowmap) {
    this.m.uniforms.tDiffuse.value = shadowmap;

    renderer.setClearColor(0xffffff, 1);
    renderer.render(this.scene, this.camera, this.target);

    return this.target;
};

var RenderCompose = function () {
    this.scene = new THREE.Scene();

    this.g = new THREE.PlaneGeometry(2, 2);
    this.m = new THREE.ShaderMaterial({
        uniforms: {
            tShadow: { type: "t", value: undefined },
            tDiffuse: { type: "t", value: undefined }
        },
        vertexShader: document.getElementById('vertexShader').textContent,
        fragmentShader: document.getElementById('fragmentShaderLightCompose').textContent

    });

    this.mesh = new THREE.Mesh(this.g, this.m);

    this.scene.add(this.mesh);

    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
};

RenderCompose.prototype.render = function (renderer, shadowmap, pixmap, x, y) {
    this.mesh.position.set(x || 0, y || 0, 0);

    this.m.uniforms.tShadow.value = shadowmap;
    this.m.uniforms.tDiffuse.value = pixmap;

    renderer.setClearColor(0xffffff, 1);
    renderer.render(this.scene, this.camera);
};

var RenderFullScreen = function () {
    this.scene = new THREE.Scene();

    this.g = new THREE.PlaneGeometry(2, 2);
    this.m = new THREE.MeshBasicMaterial({ map: undefined });

    this.mesh = new THREE.Mesh(this.g, this.m);

    this.scene.add(this.mesh);

    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
};

RenderFullScreen.prototype.render = function (renderer, texture, x, y) {
    this.mesh.position.set(x || 0, y || 0, 0);
    this.m.map = texture;

    renderer.setClearColor(0x000000, 1);
    renderer.render(this.scene, this.camera);
};

window.onload = function () {
    Promise.all([
        loadTexture('img/shadow-occlusion1.png'),
        loadTexture('img/shadow-occlusion2.png')
    ]).then(create);
};

var create = function (pixmaps) {
    var w = 512;
    var h = 512;

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(w, h);

    var renderPart = new RenderPart();

    var renderShadowDepth = new RenderShadowDepth();
    var renderShadowMap = new RenderShadowMap();
    var renderShadowMapBlur = new RenderShadowMapBlur();
    var renderLight = new RenderPart();
    var renderFullScreen = new RenderFullScreen();
    var renderCompose = new RenderCompose();

    document.body.appendChild(renderer.domElement);

    const mousePosition = { x: 0, y: 0 };
    $(renderer.domElement).mousemove(function (e) {
       var parentOffset = $(this).parent().offset(); 
       var relX = e.pageX - parentOffset.left;
       var relY = e.pageY - parentOffset.top;

       mousePosition.x = (Math.min(relX, 512) / 256) - 1.0;
       mousePosition.y = (Math.min(relY, 512) / 256) - 1.0;
    });

    var render = function () {
        var offset = { x: 0, y: 0 };
        if ($("#options input[name='mouse']").is(':checked')) {
            offset = mousePosition;
        }

        var whatPixmap = $("#pixmap input[type='radio']:checked").val();
        var pixmap = pixmaps[parseInt(whatPixmap, 10) - 1];


        var part = renderPart.render(renderer, pixmap, -offset.x, offset.y);

        var shadowDepth   = renderShadowDepth.render(renderer, part);
        var shadowMap     = renderShadowMap.render(renderer, shadowDepth.texture);
        var shadowMapBlur = renderShadowMapBlur.render(renderer, shadowMap.texture);

        var light = renderLight.render(renderer, shadowMapBlur, offset.x, -offset.y);

        var what = $("#pipeline input[type='radio']:checked").val();
        if (what == 'part') {
            renderFullScreen.render(renderer, part);
        } else if (what == 'shadowdepth') {
            renderFullScreen.render(renderer, shadowDepth);
        } else if (what == 'shadowmap') {
            renderFullScreen.render(renderer, shadowMap);
        } else if (what == 'shadowmap_blurred') {
            renderFullScreen.render(renderer, shadowMapBlur);
        } else if (what == 'lightmap') {
            renderFullScreen.render(renderer, light);
        } else {
            renderCompose.render(renderer, light.texture, pixmap);
        }
    };

    var animate = function () {
        render();
        requestAnimationFrame(animate);
    };

    animate();
};