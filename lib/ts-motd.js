'use strict'


//CLIENT SIDE

// jQuery-like shortcut for $('id') instead of document.getElementById(id)
var $ = function(id) {return document.getElementById(id)};

var canvas;
var common = require('./common.js');
var objectModified;
var socket;

var TsMotd = function () {
    var _this = this;
    //socket = io();
    socket = io('//'+document.location.hostname+':'+document.location.port);

    console.log("In TsMotd initialization section");

    socket.on('connect', function() {
        console.log("Socket connected, initializing application.");
        canvas = new fabric.Canvas('c', {isDrawingMode: true}); 

        // For debugging
        //window._canvas = canvas;

        // Load initial state from the server
        if(_this.loaded) {
            // For now just reload the page. May be possible to reinject
            // state.js and update state in place.
            location.reload();
        }
        else {
            canvas.loadFromJSON(initialState)
            canvas.renderAll() 
            _this.initUI();
            _this.initEvents();
            _this.responsive();
            _this.loaded = true;
        }
    });
}

window.app = {
    brushes: {},
    init: function() {
        var _this = this;
        console.info("Init ts-motd board...");
        this.TsMotd = new TsMotd();

        console.log("Calling common.init() -- client side");
        common.init(_this);
    },
    fabric: fabric,
}

TsMotd.prototype.setDrawingColor = function (color) {
    if (!color) color = "#000000";

    canvas.freeDrawingBrush.color = color;

    // Changing color while object selected, changes the fill of that object.
    var fabricObject = canvas.getActiveObject();
    if(fabricObject) {
        if(fabricObject.type === 'group') {
            var newColor = new fabric.Color(color);
            fabricObject._objects.forEach(function(groupObject) {
                var currentColor = new fabric.Color(groupObject.fill);
                // Keep opacity intact.
                newColor._source[3] = currentColor._source[3];
                groupObject.set({ stroke: newColor.toRgba() });
            });

        } else {
            fabricObject.set({ stroke: color})
        }

        canvas.renderAll()
        // Trigger an object update.
        objectModified({target: fabricObject})
    }
}

TsMotd.prototype.setDrawingLineWidth = function (width) {
    width = parseInt(width, 10) || 1;
    canvas.freeDrawingBrush.width = width;
}


TsMotd.prototype.initUI = function() {
    var _this = this;
    var canvasBgColorEl = $('canvas-background-picker');
    var drawingModeEl = $('drawing-mode');
    var drawingColorEl = $('drawing-color');
    var drawingLineWidthEl = $('drawing-line-width');
    var insertImageEl = $('insert-image');
    var insertTextEl = $('insert-text');
    var textStrokeColorEl = $('text-stroke-color');
    var clearEl = $('clear-canvas');
    var openNavEl = $('open-nav');
    var closeNavEl = $('close-nav');

    fabric.Object.prototype.transparentCorners = false;

    drawingModeEl.onclick = function() {
      canvas.isDrawingMode = !canvas.isDrawingMode;
      if (canvas.isDrawingMode) {
        drawingModeEl.innerHTML = '<i class="fa fa-i-cursor"></i> Enter Edit Mode';
      }
      else {
        drawingModeEl.innerHTML = '<i class="fa fa-pencil"></i> Enter Drawing Mode';
      }
    };

    canvasBgColorEl.onchange = function() {
        canvas.backgroundColor = this.value;
        canvas.renderAll();

        socket.emit('canvas:background', {'value':this.value});
    };

    insertImageEl.onchange = function(e) {
        var reader = new FileReader();

        reader.onload = function (event) { 
            var imgObj = new Image();
            imgObj.src = event.target.result;
            imgObj.onload = function () {
                var image = new fabric.Image(imgObj);
                image.set({
                    left: 100,
                    top: 100,
                    padding: 10,
                    cornersize: 10
                });

                canvas.add(image);
            }
            
        }
        reader.readAsDataURL(e.target.files[0]);
    }

    insertTextEl.onclick = function() {
        canvas.isDrawingMode = false;
        drawingModeEl.innerHTML = 'Enter Drawing Mode';
        
        var textObject = new fabric.IText('Edit me...', {
            left: 100,
            top: 100,
        })

        canvas.add(textObject)
    }

    clearEl.onclick = function() { 
        //if (confirm('Are you sure you want to clear the whiteboard?')) {
            canvas.backgroundColor = '#ffffff';
            canvas.renderAll();

            canvas.clear() 

            socket.emit('canvas:clear', {});
        //}
    }

    drawingColorEl.onchange = function() {_this.setDrawingColor(this.value)};
    drawingLineWidthEl.onchange = function() {_this.setDrawingLineWidth(this.value)};

    openNavEl.onclick = function() {
        $("mySidenav").style.width = "200px";
        $("main").style.marginLeft = "200px";
        $("guide").style.left = "200px";
        $("open-nav").style.display = "none";
    }

    closeNavEl.onclick = function() {
        $("mySidenav").style.width = "0";
        $("main").style.marginLeft= "0";
        $("guide").style.left = "0px";
        $("open-nav").style.display = "block";
    }

    // Default options when page is loaded
    canvas.freeDrawingBrush = new fabric['PencilBrush'](canvas);
    canvas.freeDrawingBrush.width = 10;
    canvas.freeDrawingBrush.color = drawingColorEl.value;
    canvas.freeDrawingBrush.width = parseInt(drawingLineWidthEl.value, 10) || 1;
}

TsMotd.prototype.responsive = function() {
    canvas.setHeight(window.innerHeight);
    canvas.setWidth(window.innerWidth);
    canvas.renderAll();
}

TsMotd.prototype.initEvents = function() {
    var _this = this;

    // objectModified event may be used by other similar events like
    // 'text:changed'.
    objectModified = function(e) {
        var fabricObject = e.target;
        socket.emit('object:modified', JSON.stringify(fabricObject));
    }

    /*** WINDOW EVENTS ***/
    window.addEventListener('resize', _this.responsive, false);

    window.onkeyup = function(e) {
        var key = e.keyCode ? e.keyCode : e.which;
        var fabricObject = canvas.getActiveObject();
        if(!fabricObject) return null;

        if (key === 46) {
            // 'Delete' key removes a selected object.
            canvas.remove(fabricObject);
        } else if (key === 33 || key === 38) {
            // 'Page Up' or 'Up Arrow' adjusts z-index of selected object.
            canvas.bringForward(fabricObject);
            //socket.emit('canvas:bringForward', fabricObject.uuid)
        } else if (key === 34 || key === 40) {
            // 'Page Down' or 'Down Arrow' adjusts z-index of selected object.
            canvas.sendBackwards(fabricObject);
            //socket.emit('canvas:sendBackwards', fabricObject.uuid)
        }

        e.preventDefault();
        return false;
    }

    /*** CANVAS EVENTS ***/
    canvas.on('object:modified', objectModified);
    canvas.on('text:changed', objectModified);
    
    // Change current colors to the selected object's.
    canvas.on('object:selected', function(e) {
        var fabricObject = e.target

        // TODO: Add to UI and support it (for text, I assume)
        //if(fabricObject.stroke) {
        //    _this.setStrokeColor(fabricObject.stroke)
        //}

        if(fabricObject.fill) {
            if(fabricObject.type !== 'group') {
                _this.setDrawingColor(e.target.fill);
            } else {
                // Doesn't handle transparency, but ok for now.
                var color = new fabric.Color(e.target._objects[0].fill);
            }
        }
    });

    canvas.on('object:added', function(e) {
        var fabricObject = e.target;

        if(!fabricObject.remote) {
            socket.emit('object:added', JSON.stringify(fabricObject));
        }
        delete fabricObject.remote;
    });
   
    canvas.on('object:removed', function(e) {
        var fabricObject = e.target;
        socket.emit('object:removed', JSON.stringify(fabricObject));
    });


    /*** SOCKET EVENTS ***/
    socket.on('object:modified', function(rawObject) {
        // TODO: This can probably be fixed in fabricjs' toObject.
        // Serialization issue. Remove group fill.
        if(rawObject.type === 'group') {
            delete rawObject.fill;
            delete rawObject.stroke;
        }

        var fabricObject = canvas.getObjectByUUID(rawObject.uuid);
        if(fabricObject) {
            // Update all the properties of the fabric object.
            fabricObject.set(rawObject);
            canvas.renderAll();
        } else {
            console.warn('No object found in scene:', rawObject.uuid);
        }
    });

    socket.on('canvas:background', function(value) {
        canvas.backgroundColor = value;
        canvas.renderAll();
    });

    // Update canvas when other clients made changes.
    socket.on('object:added', function(rawObject) {
        // Revive group objects.
        if(rawObject.type === 'group') {
            rawObject.objects = rawObject.__objects;
            delete rawObject.fill;
        }

        fabric.util.enlivenObjects([rawObject], function(fabricObjects) {
            fabricObjects.forEach(function(fabricObject) {
                // Prevent infinite loop, because this triggers canvas`
                // object:added, which in turn calls this function.
                fabricObject.remote = true;
                canvas.add(fabricObject);
            });
        });
    });

    socket.on('object:removed', function(rawObject) {
        var fabricObject = canvas.getObjectByUUID(rawObject.uuid);
        if(fabricObject) {
            canvas.remove(fabricObject);
        } else {
            console.warn('No object found in scene:', rawObject.uuid);
        }
    });

    socket.on('canvas:clear', function() {
        canvas.backgroundColor = '#ffffff';
        canvas.renderAll();

        canvas.clear();
    });

    socket.on('canvas:bringForward', function(uuid) {
        var fabricObject = canvas.getObjectByUUID(uuid);
        canvas.clear(); //TODO: Not sure why this is here?
        canvas.bringForward(fabricObject);
    });

    socket.on('canvas:sendBackwards', function(uuid) {
        var fabricObject = canvas.getObjectByUUID(uuid);
        canvas.sendBackwards(fabricObject);
    });
}


document.addEventListener('DOMContentLoaded', function(event) {
    app.init();
});
