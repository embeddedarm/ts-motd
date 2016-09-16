'use strict'

// SERVER SIDE

var pathsCollection;

function Events(socket) {

    console.log("Events initialized!");

    console.log("Grabbing paths collection from app.db.getCollection from function Events(socket)");
    pathsCollection = app.db.getCollection('paths');

    // A client adds a path.
    socket.on('object:added', function(msg) {
        var pathObj = JSON.parse(msg);

        if(pathObj.type === 'group' && 'objects' in pathObj) {
            pathObj.__objects = pathObj.objects;
            delete pathObj.fill;
        }

        fabric.util.enlivenObjects([pathObj], function(_objects) {
            _objects.forEach(function(fabricObj) {
                //delete fabricObj.fill;
                console.info('Adding %s with UUID: %s', pathObj.type, pathObj.uuid);
                app.canvas.add(fabricObj);
                pathsCollection.insert(pathObj);
                socket.broadcast.emit('object:added', pathObj);
            });
        });
    });

    socket.on('canvas:background', function(msg) {
        //var rawObject = JSON.parse(msg);
        //console.log("Canvas background color changed to: " + rawObject.value);

        console.log("Canvas background color changed: " + msg.value);
        socket.broadcast.emit('canvas:background', msg.value);
    });

    socket.on('object:modified', function(msg) {
        var rawObject = JSON.parse(msg);
        var fabricObject = app.canvas.getObjectByUUID(rawObject.uuid);

        if(fabricObject) {
            console.info('%s has modifications: %s', fabricObject.type, fabricObject.uuid);
            if(fabricObject.type === 'group') {
                // Somehow this is set to black during group serialization...
                delete rawObject.fill;
            }
            fabricObject.set(rawObject);
            var dbPath = pathsCollection.findOne({uuid: fabricObject.uuid});
            if(dbPath) {
                // Update all the properties of the fabric object.
                Object.keys(rawObject).forEach(function(key) {
                    dbPath[key] = rawObject[key];
                });
                pathsCollection.update(dbPath);
            } else {
                console.warn('No object found in scene:', rawObject.uuid);
            }
        } else {
            console.warn('No object found in scene:', rawObject.uuid);
        }

        socket.broadcast.emit('object:modified', rawObject);
    });

    socket.on('object:removed', function(msg) {
        var rawObject = JSON.parse(msg);

        var fabricObj = app.canvas.getObjectByUUID(rawObject.uuid);
        if(fabricObj) {
            console.info('Removing %s with UUID: %s', rawObject.type, rawObject.uuid);
            app.canvas.remove(fabricObj);
            var dbPath = pathsCollection.findOne({uuid: rawObject.uuid});
            if(dbPath) {
                pathsCollection.remove(dbPath);
                socket.broadcast.emit('object:removed', rawObject);
            } else {
                console.warn('No object found in scene:', rawObject.uuid);
            }
        }
    });

    // This was used for clearing the canvas for the day... 
    //socket.on('app.canvas:clear', function() {
    //    console.log("Called socket.app.canvas:clear in events");
    //    app.canvas.clear();
    //    socket.broadcast.emit('app.canvas:clear');
    //});

    socket.on('canvas:clear', function() {

        console.log("Clearing the canvas server side!");
        pathsCollection.removeDataOnly();
        app.canvas.clear();
        socket.broadcast.emit('canvas:clear');
    });

    socket.on('app.canvas:bringForward', function(uuid) {
        var fabricObj = app.canvas.getObjectByUUID(uuid);
        app.canvas.bringForward(fabricObj);
        socket.broadcast.emit('app.canvas:bringForward', uuid);

        // UNTESTED!
        //var dbPaths = getFabricObjects();
        //pathsCollection.remove(dbPaths);
        pathsCollection.removeDataOnly();

        app.canvas.getObjects().forEach(function(fabricObject) {
            pathsCollection.insert(JSON.parse(JSON.stringify(fabricObject)));
        });
    });

    socket.on('app.canvas:sendBackwards', function(uuid) {
        var fabricObj = app.canvas.getObjectByUUID(uuid);
        app.canvas.sendBackwards(fabricObj);
        socket.broadcast.emit('app.canvas:sendBackwards', uuid);

        // UNTESTED!
        //var dbPaths = getFabricObjects();
        //pathsCollection.remove(dbPaths);
        pathsCollection.removeDataOnly();
        app.canvas.getObjects().forEach(function(fabricObject) {
            pathsCollection.insert(JSON.parse(JSON.stringify(fabricObject)));
        });
    });
}

module.exports = Events
