# d3.js Drag selector

This is a small plugin for d3.js to allow for selecting nodes using a selection rectangle while clicking and dragging your mouse. The main aim is to assist with dashboarding, providing an easy method of allowing drill down across potentially multiple separate graphs.

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

Once you have set up your instance, apply it to a d3.js selection using .call, like so:

```js
var svg = d3.select("svg");
svg.call(dragSelect.selector());
```

## Options
- selectNode
- selectFilter
- selectedClass
- rectangleClass
- rectRelativeToNode
- onSelect
- onDragStart
- onDragEnd
- multiSelectKey
- preventDragBubbling

These will be expanded upon in the immediate future.

## Dependency
+ [D3.js](https://github.com/mbostock/d3)

## License
MIT