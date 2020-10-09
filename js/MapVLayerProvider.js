function MapvlayerProvider(viewer, dataSet, options, container) {
    this.map = viewer;
    this.scene = viewer.scene;
    this.mapvBaseLayer = new MapVRenderer(viewer, dataSet, options, this);
    this.mapVOptions = options;
    this.initDevicePixelRatio();
    this.canvas = this._createCanvas();
    this.render = this.render.bind(this);
    if (container) {
        this.container = container;
        container.appendChild(this.canvas);
    } else {
        this.container = viewer.container;
        this.addInnerContainer()
    }
    this.bindEvent();
    this._reset()
}

MapvlayerProvider.prototype.initDevicePixelRatio = function(){
    this.devicePixelRatio = window.devicePixelRatio || 1
}

MapvlayerProvider.prototype.addInnerContainer = function(){
    this.container.appendChild(this.canvas)
}

MapvlayerProvider.prototype.bindEvent = function(){
    var self = this;
    this.innerMoveStart = this.moveStartEvent.bind(this);
    this.innerMoveEnd = this.moveEndEvent.bind(this);
    this.scene.camera.moveStart.addEventListener(this.innerMoveStart, this);
    this.scene.camera.moveEnd.addEventListener(this.innerMoveEnd, this);
    var eventHandler = new Cesium.ScreenSpaceEventHandler(this.canvas);
    // 添加左键监听
    eventHandler.setInputAction(function (t) {
        self.innerMoveEnd()
    }, Cesium.ScreenSpaceEventType.LEFT_UP);
    // 添加右键监听
    eventHandler.setInputAction(function (t) {
        self.innerMoveEnd()
    }, Cesium.ScreenSpaceEventType.MIDDLE_UP);
    this.handler = eventHandler
}

MapvlayerProvider.prototype.unbindEvent = function(){
    this.scene.camera.moveStart.removeEventListener(this.innerMoveStart, this);
    this.scene.camera.moveEnd.removeEventListener(this.innerMoveEnd, this);
    this.scene.postRender.removeEventListener(this._reset, this);
    if (this.handler) {
        this.handler.destroy();
        this.handler = null;
    }
}

MapvlayerProvider.prototype.moveStartEvent = function(){
    if (this.mapvBaseLayer) {
        this.mapvBaseLayer.animatorMovestartEvent();
        this.scene.postRender.addEventListener(this._reset, this);
    }
}
MapvlayerProvider.prototype.moveEndEvent = function(){
    this.scene.postRender.removeEventListener(this._reset, this);
    if (this.mapvBaseLayer) {
        this.mapvBaseLayer.animatorMoveendEvent();
    }
    this._reset();
}
MapvlayerProvider.prototype.zoomStartEvent = function(){
    this._unvisiable()
}
MapvlayerProvider.prototype.zoomEndEvent = function(){
    this._unvisiable()
}
MapvlayerProvider.prototype.addData = function(e,t){
    if (this.mapvBaseLayer) {
        this.mapvBaseLayer.addData(e, t)
    }
}
MapvlayerProvider.prototype.updateData = function(e,t){
    if (this.mapvBaseLayer) {
        this.mapvBaseLayer.updateData(e, t)
    }
}
MapvlayerProvider.prototype.getData = function(){
    if (this.mapvBaseLayer) {
        this.dataSet = this.mapvBaseLayer.getData();
        return this.dataSet
    }
}
MapvlayerProvider.prototype.removeData = function(data){
    if (this.mapvBaseLayer) {
        this.mapvBaseLayer.removeData(data);
    }
}
MapvlayerProvider.prototype.removeAllData = function(){
    if (this.mapvBaseLayer) {
        this.mapvBaseLayer.clearData();
    }
}
MapvlayerProvider.prototype._visiable= function(){
    return this.canvas.style.display = "block"
}
MapvlayerProvider.prototype._unvisiable = function(){
    return this.canvas.style.display = "none"
}
MapvlayerProvider.prototype._createCanvas = function(){
    var id = 0;
    var canvas = document.createElement("canvas");
    canvas.id = this.mapVOptions.layerid || "mapv" + id++;
    canvas.style.position = "absolute";
    canvas.style.top = "0px";
    canvas.style.left = "0px";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = this.mapVOptions.zIndex || 100;
    canvas.width = parseInt(this.map.canvas.width);
    canvas.height = parseInt(this.map.canvas.height);
    canvas.style.width = this.map.canvas.style.width;
    canvas.style.height = this.map.canvas.style.height;
    var pixelRatio = this.devicePixelRatio;
    if (this.mapVOptions.context === "2d") {
        canvas.getContext(this.mapVOptions.context).scale(pixelRatio, pixelRatio)
    }
    return canvas
}
MapvlayerProvider.prototype._reset = function(){
    this.resizeCanvas();
    // this.fixPosition();
    // this.onResize();
    this.render();
}
MapvlayerProvider.prototype.draw = function(){
    this._reset();
}
MapvlayerProvider.prototype.show = function(){
    this._visiable();   
}    
MapvlayerProvider.prototype.hide = function(){
    this._visiable();   
}
MapvlayerProvider.prototype.destroy = function(){
    this.unbindEvent();
    this.remove();
}
MapvlayerProvider.prototype.remove = function(){
    if (this.mapvBaseLayer) {
        this.removeAllData();
        this.mapvBaseLayer.destroy();
        this.mapvBaseLayer = undefined;
        this.canvas.parentElement.removeChild(this.canvas)
    }
}
MapvlayerProvider.prototype.update = function(value){
    if (value) {
        this.updateData(value.data, value.options)
    }
}

MapvlayerProvider.prototype.resizeCanvas = function(){
    if (this.canvas) {
        var canvas = this.canvas;
        canvas.style.position = "absolute";
        canvas.style.top = "0px";
        canvas.style.left = "0px";
        canvas.width = parseInt(this.map.canvas.width);
        canvas.height = parseInt(this.map.canvas.height);
        canvas.style.width = this.map.canvas.style.width;
        canvas.style.height = this.map.canvas.style.height;
    }
}
MapvlayerProvider.prototype.render = function(){
    if (this.mapvBaseLayer) {
        this.mapvBaseLayer._canvasUpdate();
    }
}