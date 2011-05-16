var ImageCache;
if (!ImageCache) {
    ImageCache = {};
}

(function () {
    var gCacheName = 'imageList';
    var gImageList;

    // initialize the list in local storage
    gImageList = localStorage.getItem(gCacheName);
    if (gImageList == null || gImageList.length == 0) {
        gImageList = { 'images': [] };
        localStorage.setItem(gCacheName, JSON.stringify(gImageList));
    }
    else
        gImageList = JSON.parse(gImageList);

    // Adds an image to the local storage. If we exceed our quota, we will remove the first image 
    // from the list and try adding it again.  This is pretty rudimentary
    if(typeof ImageCache.addToCache !== 'function') {
        ImageCache.addToCache = function(url, callback) {
            if (url == null || url.length == 0) return;
          
            // see if this image exists already
            var existingItem = ImageCache.getImageFromCacheByUrl(url);
            if(existingItem != null) return;
            
            // the is the callback when the image finishes being drawn to the canvas and will contain
            // a valid dataURL representing the image
            var imageDrawn = function(url, dataURL) {            
                // create the object we are going to store
                var newItem = { 'dataURL': dataURL, 'url': url };
 
                // add the new object to the data store
                gImageList.images[gImageList.images.length] = newItem;
                try 
                {
                    localStorage.setItem(gCacheName, JSON.stringify(gImageList));
                }
                catch(e)
                {
                    // quota exceeded, remove first image and try again
                    gImageList.images.splice(0,1);
                    localStorage.setItem(gCacheName, JSON.stringify(gImageList));
                }

                if(typeof callback === 'function')
                    callback(newItem);
            };

            // create the canvas and draw the image onto it so we can get the data url
            var canvas = document.createElement('canvas');
            ImageCache.drawImageToCanvas(canvas, url, imageDrawn);
        };
    }


    // draws an image to a canvas, with an optional callback that will be called once the
    // image has been drawn. The callback will provide the url and the dataURL of the image
    if(typeof ImageCache.drawImageToCanvas !== 'function') {
        ImageCache.drawImageToCanvas = function(canvas, url, callback) {
            var context = canvas.getContext('2d');
            var image = new Image();

            image.onload = function (evt) {
                context.canvas.width = this.width;
                context.canvas.height = this.height;
                context.drawImage(image, 0, 0);
                if(typeof callback === 'function')
                    callback(url, context.canvas.toDataURL());
            };
            image.src = url;
        };
    }

    // gets an image from the cache based on index
    if(typeof ImageCache.getImageFromCache !== 'function') {
        ImageCache.getImageFromCache = function(idx) {
            if(gImageList == null || gImageList.images.length == 0) return null;
            return gImageList.images[idx];
        };
    }

    // gets an image from the cache based on url
    if(typeof ImageCache.getImageFromCacheByUrl !== 'function') {
        ImageCache.getImageFromCacheByUrl = function(url) {
            if(gImageList == null || gImageList.images.length == 0) return null;
            for(i = 0; i < gImageList.images.length; i++) 
                if(gImageList.images[i].url === url)
                    return gImageList.images[i];

            return null;
        };
    }

    // gets the list of image objects from cache as an array
    if(typeof ImageCache.getImageListFromCache !== 'function') {
        ImageCache.getImageListFromCache = function() {
            if(gImageList == null || gImageList.images.length == 0) return null;
            return gImageList.images;
        };
    }

    // removes an item from the cache based on index
    if(typeof ImageCache.removeImageFromCache !== 'function') {
        ImageCache.removeImageFromCache = function(idx) {
            if(gImageList == null || gImageList.images.length == 0) return;
            gImageList.images.splice(idx, 1);
            localStorage.setItem(gCacheName, JSON.stringify(gImageList));
        };
    }
}());