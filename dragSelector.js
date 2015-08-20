(function(window){
    'use strict';
    function dragSelector(config) {
        return new DSInternal(config);
    }
    
    dragSelector.version = "0.0.1";
    
    function DSInternal(config) {
        if (typeof window.d3 === 'undefined') {
            throw Error("d3.js must exist in order to use the d3.js drag selector plugin. Ensure that it is placed above this file when referencing your scripts.")
        }
        this.d3 = window.d3;
        config = config || {};
        this.config = {};
        this.config.selectNode = config.selectNode;
        this.config.selectFilter = config.selectFilter;
        this.config.selectedClass = config.selectedClass || "";
        this.config.rectangleClass = config.rectangleClass || "";
        this.config.rectTranslateNode = (config.rectTranslateNode && config.rectTranslateNode.select) ? config.rectTranslateNode.node() : config.rectTranslateNode;
        this.config.onSelect = config.onSelect;
        this.config.onDragStart = config.onDragStart;
        this.config.onDragEnd = config.onDragEnd;
        this.config.multiSelectKey = config.multiSelectKey || "ctrl";
        this.config.preventDragBubbling = config.preventDragBubbling === true ? true : false; // default to false - do not prevent drag bubbling 
        this.config.bindToWindow = config.bindToWindow === false ? false : true;     // defaults to true - do bind to the window
        this.config.useDblClick = config.useDblClick === true ? true : false;     // defaults to false - don't use double click for rect drawing
    }
    
    var fn = DSInternal.prototype;
    
    fn.selectNode = function(nodeTag) {
        if (!arguments.length) return this.config.selectNode;
        this.config.selectNode = nodeTag;
        return this;
    };
    fn.selectFilter = function(filter) {
        if (!arguments.length) return this.config.selectFilter;
        this.config.selectFilter = filter;
        return this;
    };
    fn.selectedClass = function(className) {
        if (!arguments.length) return this.config.selectedClass;
        this.config.selectedClass = className;
        return this;
    };
    fn.rectangleClass = function(className) {
        if (!arguments.length) return this.config.rectangleClass;
        this.config.rectangleClass = className;
        return this;
    };
    fn.rectTranslateNode = function(node) {
        if (!arguments.length) return this.config.rectTranslateNode;
        this.config.rectTranslateNode = (node && node.select) ? node.node() : node;
        return this;
    };
    fn.onSelect = function(cb) {
        if (!arguments.length) return this.config.onSelect;
        this.config.onSelect = cb;
        return this;
    };
    fn.onDragStart = function(cb) {
        if (!arguments.length) return this.config.onDragStart;
        this.config.onDragStart = cb;
        return this;
    };
    fn.onDragEnd = function(cb) {
        if (!arguments.length) return this.config.onDragEnd;
        this.config.onDragEnd = cb;
        return this;
    };
    fn.multiSelectKey = function(key) {
        if (!arguments.length) return this.config.multiSelectKey;
        this.config.multiSelectKey = key;
        return this;
    };
    fn.preventDragBubbling = function(bool) {
        if (!arguments.length) return this.config.preventDragBubbling;
        this.config.preventDragBubbling = bool;
        return this;
    };
    fn.bindToWindow = function(bool) {
        if (!arguments.length) return this.config.bindToWindow;
        this.config.bindToWindow = bool;
        return this;
    };
    fn.useDblClick = function(bool) {
        if (!arguments.length) return this.config.useDblClick;
        this.config.useDblClick = bool;
        return this;
    };
    
    fn.selector = function() {
        var $$ = this;
        if (!(($$.config.selectNode === "path") || ($$.config.selectNode === "rect") || ($$.config.selectNode === "circle") || ($$.config.selectNode === "line"))) {
            throw Error("The \"selectNode\" configuration option must be either \"path\", \"rect\", \"circle\" or \"line\".");
        }
        if (!$$.config.selectedClass) {
            throw Error("The \"selectedClass\" configuration option must be specified and must not be falsy");
        }
        return function(node) {
            internalSelectInit.call($$, node);
        };
    };
    
    function internalSelectInit(node) {
        var $$ = this,
            nodeSelector = $$.config.selectNode + ($$.config.selectFilter || ""),
            targets = node.selectAll(nodeSelector),
            currentSelection,
            clickedNode,
            scan = 0,
            dblClicked = false;
        node.on("mousedown", function(d, i, a) {
            if ($$.config.useDblClick && !dblClicked) {
                dblClicked = true;
                setTimeout(function() { dblClicked = false; }, 300);
                return;
            } else if ($$.config.useDblClick) {
                $$.d3.event.stopImmediatePropagation(); // this prevents other mousedown events firing afterwards on our "node" selection - it is required to prevent panning when using d3.behavior.zoom(), particularly for maps
                dblClicked = false;
            }
            if (($$.config.multiSelectKey === "ctrl" && $$.d3.event.ctrlKey) || 
                ($$.config.multiSelectKey === "shift" && $$.d3.event.shiftKey) || 
                ($$.config.multiSelectKey === "alt" && $$.d3.event.altKey)) {
                targets = targets.filter(":not(." + $$.config.selectedClass + ")"); // set the targets (the things to be searched) to exclude those already selected
            } else {
                targets = node.selectAll(nodeSelector); // else reset - we search all
            }
            $$.d3.event.preventDefault(); // this prevents text from being selected - this should not be configurable due to how necessary it is
            if ($$.rect) { 
                $$.rect.remove();
                delete $$.rect;
            }
            if ($$.config.onDragStart) $$.config.onDragStart.call(this);
            $$.rect = new Rect($$.d3.mouse($$.config.rectTranslateNode || this),$$.config.rectTranslateNode ? $$.d3.select($$.config.rectTranslateNode).attr("transform") : "translate(0,0)", $$.config.rectangleClass);
            $$.rect.appendTo(node);
            if ($$.config.selectNode === "path") { // check whether, when clicking, we are clicking inside a path and hence should select it
                targets
                    .each(function(d, i, a) {
                        if ($$.d3.event.target === this) { // ought this be currentTarget?
                            clickedNode = $$.d3.select(this);
                        }
                    });
            }
            currentSelection = $$.d3.select(null);
        });
        (function() {
            if (!$$.config.bindToWindow) return node;
            return $$.d3.select(window);
        })()
        .on("mousemove", function(d, i, a) {
            if ($$.rect) {
                if ($$.config.preventDragBubbling) pauseEvent($$.d3.event);
                $$.rect.reDraw($$.d3.mouse($$.config.rectTranslateNode || node.node()));
                if ((scan++ === 5)) { 
                    scan = 0;
                    return; // scan only every 4th event - this is fine due to frequency that this event occurs
                }
                if ($$.config.selectNode === "circle") {
                    circleSearch.call($$, targets, $$.rect.getDimensions(), $$.rect.node);
                } else if ($$.config.selectNode === "rect") {
                    rectSearch.call($$, targets, $$.rect.getDimensions(), $$.rect.node);
                } else if ($$.config.selectNode === "path") {
                    pathSearch.call($$, targets, $$.rect.getDimensions(), $$.rect.node);
                } else if ($$.config.selectNode === "line") {
                    lineSearch.call($$, targets, $$.rect.getDimensions(), $$.rect.node);
                }
                if (clickedNode) clickedNode.classed($$.config.selectedClass,true);
                if ($$.config.onSelect) {
                    var foundThisScan = node.selectAll(nodeSelector).filter("." + $$.config.selectedClass); // do not filter "targets" here due to "targets" possibly not containing all elements (in case of multiselect)
                    if (currentSelection.size() !== foundThisScan.size()) {
                        $$.config.onSelect.call(node, foundThisScan/*, currentSelection*/); // leaving this out for now
                    }
                    currentSelection = foundThisScan;
                }
            }
        })
        .on("mouseup", function(d, i, a) {
            if ($$.rect)  {
                $$.rect.remove();
                delete $$.rect; // delete to prevent entering mousemove event's main body after finishing, and this event
                clickedNode = null;
                if ($$.config.onDragEnd) {
                    var selected = node.selectAll(nodeSelector).filter("." + $$.config.selectedClass); // do not filter "targets" here due to "targets" possibly not containing all elements (in case of multiselect)
                    $$.config.onDragEnd.call(selected, selected);
                }
            }
        });
    }
    
    function Rect(anchorPoint, transform, className) {
        this.anchor = { x: anchorPoint[0], y: anchorPoint[1] };
        this.transform = transform;
        this.className = className;
        this.d3 = window.d3;
        this.dimensions = {};
        this.node = null;
        this.selection = null;
    }
    
    var r_fn = Rect.prototype;
    
    r_fn.getDimensions = function() { 
        return this.dimensions;
    };
    r_fn.remove = function() {
        this.selection.remove();
    };
    r_fn.appendTo = function(node) {
        var d3Node = (node.select) ? node : this.d3.select(node);
        this.dimensions.x = this.anchor.x;
        this.dimensions.y = this.anchor.y;
        this.dimensions.width = 0;
        this.dimensions.height = 0;
        this.selection = d3Node
                        .append("rect")
                        .attr(this.dimensions)
                        .attr("transform", this.transform)
                        .style("pointer-events", "none !important")
                        .classed(this.className, true);
        this.node = this.selection.node();
    };
    r_fn.reDraw = function(mouseCoordinates) {
        var movement = { 
                x: mouseCoordinates[0] - this.dimensions.x,
                y: mouseCoordinates[1] - this.dimensions.y
        };
        if (movement.x < 1 || movement.x * 2 < this.dimensions.width) {
            this.dimensions.width = Math.abs(this.anchor.x - mouseCoordinates[0]); // abs stops errors when moving extremely fast
            this.dimensions.x = mouseCoordinates[0];
        } else {
            this.dimensions.x = this.anchor.x;
            this.dimensions.width = movement.x;
        }
        if (movement.y < 1 || movement.y * 2 < this.dimensions.height) {
            this.dimensions.height = Math.abs(this.anchor.y - mouseCoordinates[1]); // abs stops errors when moving extremely fast
            this.dimensions.y = mouseCoordinates[1];
        } else {
            this.dimensions.y = this.anchor.y;
            this.dimensions.height = movement.y;
        }
        this.selection.attr(this.dimensions);
    };
    
    // This function is a fast and lazy approximation - for the purposes of what this tool is designed for, it works
    // It will not universally work - e.g. it works with translations, but not rotations or skews
    function applyMatrixTransformToRect(CTMmatrix, rect) {
        var xt = CTMmatrix.e + rect.x*CTMmatrix.a + rect.y*CTMmatrix.c,
            yt = CTMmatrix.f + rect.y*CTMmatrix.d + rect.x*CTMmatrix.b;
        return { x: xt, y: yt, width: rect.width * CTMmatrix.a, height: rect.height * CTMmatrix.d }; // width and height do not take rotation into account here...
    }
    
    function circleSearch(targetCircles, rect, rectNode) {
        var $$ = this;
        targetCircles
            .each(function(d, i, a) {
                var thisCircle = $$.d3.select(this);
                if (thisCircle.attr("r") !== "0") {
                    if (circleWithinArea({ x: thisCircle.attr("cx"), y: thisCircle.attr("cy"), r: thisCircle.attr("r") }, applyMatrixTransformToRect(rectNode.getTransformToElement(this), rect))) {
                        thisCircle.classed($$.config.selectedClass, true);
                    } else {
                    thisCircle.classed($$.config.selectedClass, false);
                    }
                } else {
                    if (rectWithinArea({ x: thisCircle.attr("cx")|0, y: thisCircle.attr("cy")|0, width: 0, height: 0 }, applyMatrixTransformToRect(rectNode.getTransformToElement(this), rect))) {
                        thisCircle.classed($$.config.selectedClass, true);
                    } else {
                    thisCircle.classed($$.config.selectedClass, false);
                    }
                }
        });
    }
    
    function rectSearch(targetRects, rect, rectNode) {
        var $$ = this;
        targetRects
            .each(function(d, i, a) {
                var thisRect = $$.d3.select(this);
                if (rectWithinArea( 
                        { x: thisRect.attr("x")|0, y: thisRect.attr("y")|0, width: thisRect.attr("width")|0, height: thisRect.attr("height")|0 },
                        applyMatrixTransformToRect(rectNode.getTransformToElement(this), rect)
                        )
                   ) {
                    thisRect.classed($$.config.selectedClass, true);
                } else {
                    thisRect.classed($$.config.selectedClass, false);
                }
        });
    }
    
    function lineSearch(targetLines, rect, rectNode) {
        var $$ = this;
        targetLines.each(function(d, i, a) {
            var xformRect = applyMatrixTransformToRect(rectNode.getTransformToElement(this), rect),
                lineSelection = $$.d3.select(this);
            if (!rectWithinArea(this.getBBox(),xformRect)) { // if it isn't within the boundary box, don't bother scanning
                    lineSelection.classed($$.config.selectedClass, false);
                    return;
                }
                if (lineWithinArea({ 
                        start: { x: (lineSelection.attr("x1")|0)||0, y: (lineSelection.attr("y1")|0)||0 }, 
                        end: { x: (lineSelection.attr("x2")|0)||0, y: (lineSelection.attr("y2")|0)||0 } 
                    }, xformRect)) {
                    lineSelection.classed($$.config.selectedClass, true);
                    return;
                } else {
                    lineSelection.classed($$.config.selectedClass, false);
                }
        });
    }
    
    function pathSearch(targetPath, rect, rectNode) {
        var $$ = this;
        targetPath
            .each(function(d, i, a) {
                var xformRect = applyMatrixTransformToRect(rectNode.getTransformToElement(this), rect);
                if (!rectWithinArea(this.getBBox(),xformRect)) { // if it isn't within the boundary box, don't bother scanning
                    $$.d3.select(this).classed($$.config.selectedClass, false);
                    return;
                }
                var lineSegments = this.pathSegList,
                    previousPoint = lineSegments.getItem(0),
                    curSubPath = lineSegments.getItem(0),
                    lineSelection = $$.d3.select(this),
                    l = lineSegments.numberOfItems, j = 0;
                while (++j < l) {
                    var segment = lineSegments.getItem(j);
                    switch (segment.pathSegType) {
                        case SVGPathSeg.PATHSEG_MOVETO_ABS :
                            curSubPath = segment;
                            break;
                        case SVGPathSeg.PATHSEG_LINETO_ABS:
                            if (lineWithinArea({ start: previousPoint, end: segment }, xformRect)) {
                                lineSelection.classed($$.config.selectedClass, true);
                                return;
                            }
                            break;
                        case SVGPathSeg.PATHSEG_CLOSEPATH:
                            if (lineWithinArea({ start: previousPoint, end: curSubPath }, xformRect)) {
                                lineSelection.classed($$.config.selectedClass, true);
                                return;
                            }
                            break;
                        default:
                            var sampledLines = getResampledLine(this.cloneNode(), previousPoint, segment);
                            if (sampledLines.some(function(e) { return lineWithinArea(e, xformRect); })) {
                                lineSelection.classed($$.config.selectedClass, true);
                                return;
                            }
                    }
                    previousPoint = segment;
                }
                lineSelection.classed($$.config.selectedClass, false);
            });
    }
    
    function circleWithinArea(circle, area) {
        var half = { x: area.width/2, y: area.height/2 },
            center = {
            x: circle.x - (area.x+half.x),
            y: circle.y - (area.y+half.y)
        },
            side = {
            x: Math.abs (center.x) - half.x,
            y: Math.abs (center.y) - half.y
        };
        if (side.x >  circle.r || side.y >  circle.r) 
            return false; 
        if (side.x < -circle.r && side.y < -circle.r)
            return true;
        if (side.x < 0 || side.y < 0) 
            return true;
            
        return side.x*side.x + side.y*side.y  < circle.r*circle.r;
    }
    
    function rectWithinArea(rect, area) {
        return rect.x < (area.x + area.width) &&
               (rect.x + rect.width) > area.x &&
               rect.y < (area.y + area.height) &&
               (rect.y + rect.height) > area.y;
    }
    
    function lineWithinArea(line, area) {
        var tl = { x: area.x, y: area.y + area.height },
            tr = { x: area.x + area.width, y: area.y + area.height },
            br = { x: area.x + area.width, y: area.y },
            bl = { x: area.x, y: area.y };
        return (endProject(line.start, line.end, tl, tr, br, bl) && cornersSameSide([bl,br,tr,tl],line.start,line.end)); // pass the cornors in array from bottom left c-clockwise to top left
    }
    
    function cornersSameSide(cornorsArr, lineStart, lineEnd) {
        var xC = lineStart.x - lineEnd.x, 
            yC = lineEnd.y - lineStart.y, 
            os = lineEnd.x * lineStart.y - lineStart.x * lineEnd.y,
            v = cornorsArr[3].x * yC + cornorsArr[3].y * xC + os,
            sign = (v < 0 ? -1 : (v > 0 ? 1 : 0)), 
            i = 3;
        if (v < 0) {
            sign = -1; 
        }
        else if (v > 0) {
            sign = 1; 
        }
        else {
            sign = 0;
        }
        while (i--) {
            v = cornorsArr[i].x * yC + cornorsArr[i].y * xC + os;
            if (v<0) {
                if (sign>0) {
                    return true;
                }
            } else if (v>0) {
                if (sign < 0) {
                    return true;
                }
            }
        }
        return false;
    }
    function endProject(lineStart, lineEnd, tl, tr, br, bl) {
        if (lineStart.y > tr.y && lineEnd.y > tr.y) return false;
        if (lineStart.y < bl.y && lineEnd.y < bl.y) return false;
        if (lineStart.x > tr.x && lineEnd.x > tr.x) return false;
        if (lineStart.x < bl.x && lineEnd.x < bl.x) return false;
        return true;
    }
    
    function getResampledLine(clonedNode, start, segment) {
        var lines = [],
            points = [],
            i = 0, 
            segmentLength = getSegmentLength(clonedNode, start, segment),
            precision = 8; // increasing this will degrade performance but will increase the accuracy of the resampling. ** hard coded for the present **
        points.push(clonedNode.getPointAtLength(0));
        while ((i+=(1/precision)) <= 1) {
            var curPoint = clonedNode.getPointAtLength(i * segmentLength),
                pi = points.length - 1;
            lines.push({ start: { x: points[pi].x, y: points[pi].y }, end: { x: curPoint.x, y: curPoint.y }});
            points.push(curPoint);
        }
        return lines;
    }
    
    function getSegmentLength(node, start, segment) {
        var startX = typeof start.x !== 'undefined' ? start.x : start.x1, 
            startY = typeof start.y !== 'undefined' ? start.y : start.y1,
            startEl = node.createSVGPathSegMovetoAbs(startX, startY);
        node.pathSegList.clear();
        node.pathSegList.appendItem(startEl);
        node.pathSegList.appendItem(segment);
        return node.getTotalLength();
    }
    
    function pauseEvent(e){
        if(e.stopPropagation) e.stopPropagation();
        if(e.preventDefault) e.preventDefault();
        e.cancelBubble=true;
        e.returnValue=false;
        return false;
    }
    
    window.d3dragSelector = dragSelector;
    
})(window);