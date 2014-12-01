(function(){

    var dacena = window.dacena || (window.dacena = {});

    dacena.graph = function(){

        var _s,
            _c,
            filter,
            settings = {
                labelThreshold: 3,
                font: 'Source Sans Pro',
                zoomingRatio : 1,
                mouseWheelEnabled: false
            },
            label,
            selectedNodes = [],
            selectedEdges = [],
            setSelectedNode,
            dragged = false,
            dispatch = d3.dispatch("filtered", "clicked");

        //drag and drop event listener
        sigma.utils.pkg('sigma.events');

        /**
         * Dispatch 'drag' and 'drop' events by dealing with mouse events.
         *
         * @param {object} renderer The renderer to listen.
         */
        sigma.events.drag = function(renderer) {
            sigma.classes.dispatcher.extend(this);

            var _self = this,
                _drag = false,
                _x = 0,
                _y = 0;

            renderer.container.addEventListener('mousedown', function(e) {
                _x = e.clientX;
                _y = e.clientY;
            })

            renderer.container.addEventListener('mouseup', function(e) {

                if(Math.abs(e.clientX - _x) || Math.abs(e.clientY - _y) > 1) {
                    _self.dispatchEvent('drag');
                }else{
                    _self.dispatchEvent('drop');
                }

            })
        };
        // end drag and drop

//custom nodes
        sigma.utils.pkg('sigma.canvas.nodes');

        sigma.canvas.nodes.outline = function(node, context, settings) {
            var prefix = settings('prefix') || '';

            context.fillStyle = "#fff"
            context.beginPath();
            context.arc(
                node[prefix + 'x'],
                node[prefix + 'y'],
                node[prefix + 'size'],
                0,
                    Math.PI * 2,
                true
            );

            context.closePath();
            context.fill();
            context.lineWidth = 2;
            context.strokeStyle = node.color || settings('borderColor');
            context.stroke();
        };

// custom hover

        // Initialize packages:
        sigma.utils.pkg('sigma.canvas.hovers');

        /**
         * This hover renderer will basically display the label with a background.
         *
         * @param  {object}                   node     The node object.
         * @param  {CanvasRenderingContext2D} context  The canvas context.
         * @param  {configurable}             settings The settings function.
         */
        sigma.canvas.hovers.def = function(node, context, settings) {
            var fontStyle = settings('hoverFontStyle') || settings('fontStyle'),
                prefix = settings('prefix') || '',
                size = node[prefix + 'size'],
                fontSize = (settings('labelSize') === 'fixed') ?
                    settings('defaultLabelSize') :
                    settings('labelSizeRatio') * size;

            // Label background:
            context.font = (fontStyle ? fontStyle + ' ' : '') +
                fontSize + 'px ' + (settings('hoverFont') || settings('font'));

            // Display the label:
            if (typeof node.label === 'string') {
                context.fillStyle = (settings('labelHoverColor') === 'node') ?
                    (node.color || settings('defaultNodeColor')) :
                    settings('defaultLabelHoverColor');

                context.fillText(
                    node.label,
                    Math.round(node[prefix + 'x'] - context.measureText(node.label).width / 2 ),
                    Math.round(node[prefix + 'y'] + node[prefix + 'size'] + fontSize)
                );
            }
        };

        // Initialize packages:
        sigma.utils.pkg('sigma.canvas.labels');

        /**
         * This label renderer will just display the label on the right of the node.
         *
         * @param  {object}                   node     The node object.
         * @param  {CanvasRenderingContext2D} context  The canvas context.
         * @param  {configurable}             settings The settings function.
         */
        sigma.canvas.labels.def = function(node, context, settings) {
            var fontSize,
                prefix = settings('prefix') || '',
                size = node[prefix + 'size'];

            if (size < settings('labelThreshold'))
                return;

            if (typeof node.label !== 'string')
                return;

            fontSize = (settings('labelSize') === 'fixed') ?
                settings('defaultLabelSize') :
                settings('labelSizeRatio') * size;

            context.font = (settings('fontStyle') ? settings('fontStyle') + ' ' : '') +
                fontSize + 'px ' + settings('font');
            context.fillStyle = (settings('labelColor') === 'node') ?
                (node.color || settings('defaultNodeColor')) :
                settings('defaultLabelColor');

            context.fillText(
                node.label,
                Math.round(node[prefix + 'x'] - context.measureText(node.label).width / 2 ),
                Math.round(node[prefix + 'y'] + node[prefix + 'size'] + fontSize)
            );
        };

        function vis(selection){
            selection.each(function(data){

                //var filter;

                //initialize sigma
                if(selection.select("canvas").empty()){
                    _s = new sigma({
                        renderer: {
                            container: selection.node(),
                            type: 'canvas'
                        },
                        settings: settings
                    });

                    // add custom listener to avoid click triggering on drag
                    var _dragListener = new sigma.events.drag(_s.renderers[0]);
                    _dragListener.bind('drag', function(e) {
                        dragged = true;
                    });

                    _dragListener.bind('drop', function(e) {
                        dragged = false;
                    });

                    // add nodes interaction
                    _s.bind("clickNode", function(e) {

                        // add filter to manage egonet
                        filter = new sigma.plugins.filter(_s)


                        var selected = e.data.node.selected

                        if(selected){
                            filter.undo()

                            e.data.node.selected = false
                            _s.graph.nodes().forEach(function(d){
                                d.color = d.file_color;
                            })

                            selectedNodes = []
                            selectedEdges = []

                            dispatch.filtered({nodes:selectedNodes, edges: selectedEdges})

                            filter.apply()

                        }else{
                            filter.undo()
                            _s.graph.nodes().forEach(function(d){
                                d.color = d.file_color;
                                d.selected = false
                            })

                            selectedNodes = []
                            selectedEdges = []

                            filter.apply()

                            e.data.node.selected = true

                            filter.neighborsOf(e.data.node.id).apply()

                            _s.graph.nodes().forEach(function(d){
                                if(!d.hidden){
                                    d.color = !d.selected ? "#aaa" : d.file_color;
                                    selectedNodes.push(d)
                                }
                            })

                            _s.graph.edges().forEach(function(d){
                                if(!d.hidden){
                                    selectedEdges.push(d)
                                }
                            })

                            _s.refresh()

                            dispatch.filtered({nodes:selectedNodes, edges: selectedEdges, nodeID: e.data.node.id})

                        }
                    })

                    // add reset egonet on stage click
                    _s.bind('clickStage', function(e) {
                        if(!dragged){

                            filter = new sigma.plugins.filter(_s)

                            filter.undo()

                            _s.graph.nodes().forEach(function(d){
                                d.color = d.file_color;
                                d.selected = false
                            })

                            selectedNodes = []
                            selectedEdges = []

                            dispatch.filtered({nodes:selectedNodes, edges: selectedEdges})

                            filter = new sigma.plugins.filter(_s)

                            filter.apply()
                        }
                    });

                    _c = _s.camera;

                } //end initialize

                // update data
                _s.graph.clear()

                data.nodes.forEach(function(d){
                    d.file_color = d.color;
                    d.file_label = d.label;
                    d.type = d.attributes.node_render ? d.attributes.node_render : "def";
                })

                _s.graph.read(data);

                // render graph
                _s.refresh()

                // if set filter on graph
                if(setSelectedNode){

                    filter = new sigma.plugins.filter(_s);

                    var node = _s.graph.nodes([setSelectedNode])

                    filter.undo()
                    _s.graph.nodes().forEach(function(d){
                        d.color = d.file_color;
                        d.selected = false
                    })

                    selectedNodes = []
                    selectedEdges = []

                    filter.apply()

                    node[0].selected = true


                    filter.neighborsOf(node[0].id).apply()

                    _s.graph.nodes().forEach(function(d){
                        if(!d.hidden){
                            d.color = !d.selected ? "#aaa" : d.file_color;
                            selectedNodes.push(d)
                        }
                    })

                    _s.graph.edges().forEach(function(d){
                        if(!d.hidden){
                            selectedEdges.push(d)
                        }
                    })

                    _s.refresh()

                    dispatch.filtered({nodes:selectedNodes, edges: selectedEdges, nodeID: node[0].id})

                    setSelectedNode = null;


                }

            }); //end selection
        } // end vis

        vis.label = function(x){
            if (!arguments.length) return label;
            label = x;
            return vis;
        }

        vis.settings = function(x){
            if (!arguments.length) return settings;
            settings = x;
            return vis;
        }

        vis.getNodes = function(){
            return _s.graph.nodes();
        }

        vis.setSelectedNode = function(x){
            setSelectedNode = x;
            return vis;
        }

        vis.selectedNodes = function(){
            return selectedNodes;
        }

        vis.zoomIn = function(){
            if (_c.ratio < _s.settings("zoomMin")) return;
            sigma.misc.animation.camera(_c, {
                ratio: _c.ratio / _c.settings('zoomingRatio')
            }, {
                duration: 200
            });
        }

        vis.zoomOut = function(){
            if (_c.ratio > _s.settings("zoomMax")) return;
            sigma.misc.animation.camera(_c, {
                ratio: _c.ratio * _c.settings('zoomingRatio')
            }, {
                duration: 200
            });
        }

        vis.zoomReset = function(){
            sigma.misc.animation.camera(_c, {
                ratio: 1 ,
                x: 0,
                y: 0,
                angle: 0
            }, {
                duration: 200
            });
        }

        vis.centerView = function(x){
            sigma.misc.animation.camera(_c, {
                ratio: _c.ratio ,
                x: x["read_cam0:x"],
                y: x["read_cam0:y"],
                angle: 0
            }, {
                duration: 200
            });
        }

        d3.rebind(vis, dispatch, 'on');

        return vis;
    }

})();