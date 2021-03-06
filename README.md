# d3.js Drag selector

This is a small plugin for d3.js to allow for selecting nodes using a selection rectangle while clicking and dragging your mouse. The main aim is to assist with dashboarding, providing an easy method of allowing drill down across potentially multiple separate graphs.

---
## Demos

Please note that the below demos are all nested within iframes and thus are prone to misbehaving. Please report any bugs you can find!

- [a simple demonstrative bar chart](http://bl.ocks.org/lmcnulty4/f522f553679580a5690c)
- [with circles, demonstrating the accuracy of the rectangle](http://bl.ocks.org/lmcnulty4/f809dea8acfa5b28cf58) 
- [a map](http://bl.ocks.org/lmcnulty4/f1a25a9458b698f8b09f)
- [a zoomable, pannable map](http://bl.ocks.org/lmcnulty4/8f67ae7b4e01ca2dcb8a)

Note that, for the maps, Chrome is recommended for performance reasons, or if you're very attached to Firefox, then Firefox Nightly has significant improvements over vanilla Firefox. Microsoft's new Edge is also lacking, though hopefully the browser wars will continue due to Edge. 

Further note that the topoJSON used in the above demos produces maps which resolve to 50 sqm. Another common topoJSON file exists which produces maps resolving to 110 sqm, which results in significant performance gains, though producing a less detailed map.

---

## Instructions
To use it, simply call it like so:

```js
var dragSelect = d3dragSelector();
```

Configuration can either be passed in as a single object on calling, or by method chaining the particular configurable setting you want to change, like so:

```js
// Via configuration object
var dragSelect = d3dragSelect({ rectangleClass: "selector", selectedClass: "selected" });

// Via method chaining
var dragSelect = d3dragSelect().rectangleClass("selector").selectedClass("selected");
```

Once you have set up your instance, apply it to a d3.js selection using .call and the "selector" method, like so:

```js
var svg = d3.select("svg");
svg.call(dragSelect.selector());
```

---
## Configuration options
### **_selectNode_** 
*Required* 

Describes what type of SVG element the rectangle will scan for while it's being dragged.

Possible values:

- "path"
- "rect"
- "circle"
- "line"

**Please note that the plugin does not yet support elements that have been rotated or skewed. 
It does, however, support elements that have been translated or scaled.**

### **_selectedClass_**
*Required*

The class to be applied to elements which are selected by the dragging rectangle. This is required - it is used to keep track of what elements have been found and what have not been found. If, for some reason, you do not want to apply styling to selected elements, you must still pass something to this in order for it to keep track of what has been selected and what has not.

### **_selectFilter_** 
If supplied, only elements matching the filter will be scanned. For example, if your *selectNode* is "rect", you can pass ".bars" to *selectFilter* and only "rect.bars" will be scanned for.

### **_rectangleClass_**
The class to be applied to the dragging rectangle.

### **_rectTranslateNode_**
The node which contains a transform which should be applied to the dragging rectangle. Frequently when drawing pie charts and geographic maps, a transform is applied to a svg:g element in order change the origin point to be a more natural position (usually the centre). In cases like this, pass in the svg:g element, either as a document node or d3 selection, and the same transformation will be applied to the dragging rectangle.

### **_onSelect_**
The callback function invoked while dragging the rectangle and either new elements are found under the rectangle, or old elements are no longer found under the rectangle.

### **_onDragStart_**
The callback function invoked on first clicking to initiate dragging of the rectangle.

### **_onDragEnd_**
The callback function invoked on letting go of the mouse, which ceases dragging the rectangle.

### **_multiSelectKey_**
The string representation of the key used to allow multiselection - allowing you to resume dragging and keep the currently selected elements as selected.

Possible values:

- "ctrl" (**default**)
- "alt"
- "shift"

### **_bindToWindow_**
A boolean to indicate whether or not to bind to the window's mousemove event. While dragging the rectangle, if your mouse exits the node to which you have bound the plugin (typically the SVG node), the rectangle does not cease to be responsive. This is because the default behaviour is to bind to the window's mousemove event. If you wish to override this behaviour, set this configuration value to false. Defaults to *true*.


### **_useDblClick_**
A boolean to indicate whether or not to use double clicks, instead of single clicks, to start dragging the rectangle. This is particularly useful, and recommended, when used with a map that has zooming and panning, allowing panning  Defaults to *false*.

### **_preventDragBubbling_**
A boolean to indicate whether or not to stop the bubbling of the "mousemove" event up the DOM tree. Defaults to *false*.

---

## Dependency
[D3.js](https://github.com/mbostock/d3)

---
## License
MIT