# d3.js Drag selector

This is a small plugin for d3.js to allow for selecting nodes using a selection rectangle while clicking and dragging your mouse. The main aim is to assist with dashboarding, providing an easy method of allowing drill down across potentially multiple separate graphs.

---

## Instructions
To use it, simply call it like so:

```js
var dragSelector = d3dragSelector();
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

### **_selectedClass_**
*Required*

The class to be applied to elements which are selected by the dragging rectangle. This is required - it is used to keep track of what elements have been found and what have not been found. If, for some reason, you do not want to apply styling to selected elements, you must still pass something to this in order for it to keep track of what has been selected and what has not.

### **_selectFilter_** 
If supplied, only elements matching the filter will be scanned. For example, if your *selectNode* is "rect", you can pass ".bars" to *selectFilter* and only "rect.bars" will be scanned for.

### **_rectangleClass_**

The class to be applied to the dragging rectangle.

### **_rectRelativeToNode_**

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

### **_preventDragBubbling_**
A boolean to indicate whether or not to stop the bubbling of the "mousemove" event up the DOM tree. Defaults to *false*.

---

## Dependency
[D3.js](https://github.com/mbostock/d3)

---
## License
MIT