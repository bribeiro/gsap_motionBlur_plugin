var _gsScope = (typeof(module) !== "undefined" && module.exports && typeof(global) !== "undefined") ? global : this || window; //helps ensure compatibility with AMD/RequireJS and CommonJS/Node
(_gsScope._gsQueue || (_gsScope._gsQueue = [])).push( function() {
	"use strict";

    /**
     * Transforms a value from one scale to another
     * @param {*} value current value
     * @param {*} inputMin minimum value for the first scale
     * @param {*} inputMax maximum value for the first scale
     * @param {*} outMin minimum value for the result
     * @param {*} outMax maximum value for the result
     */
    const convertRange = ( value, inputMin, inputMax, outMin, outMax ) => {
        return (((value - inputMin) / (inputMax - inputMin)) * (outMax - outMin) + outMin) || 0;
    }

    /**
     * Creates a new instance of SVG and the filter
     * @param {*} uid unique id for the SVG
     * @param {*} blurX initial blurX intensity
     * @param {*} blurY initial blurY intensity
     */
    const createSVG = (uid, blurX, blurY) => {
        const div = document.createElement("div");
        div.style["transform"] = "rotateZ(0.00001deg);";
        div.setAttribute('id', `container-${uid}`);

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute('style', 'position: absolute; opacity: 0; pointer-events: none;')
        svg.setAttribute('id', `svg-${uid}`);

        const filter = document.createElement('filter');
        filter.setAttribute('id', `filter-${uid}`);
        filter.setAttributeNS (null, "width", '150%');
        filter.setAttributeNS (null, "height", '150%');
        filter.setAttributeNS (null, "x", '-25%');
        filter.setAttributeNS (null, "y", '-25%');
        filter.setAttribute('color-interpolation-filters', 'sRGB');
        
        const gaussian = document.createElement('feGaussianBlur');
        gaussian.setAttribute('in', 'SourceGraphic');
        gaussian.setAttribute('stdDeviation', `${blurX}, ${blurY}`);
        
        filter.appendChild(gaussian);
        svg.appendChild(filter);
        div.appendChild(svg);

        return div;
    }

	_gsScope._gsDefine.plugin({
		propName: "blur",
		priority: -1,
		API: 2,
		version: "1.0.0",
		overwriteProps: ["blurX", "blurY"],

		init: function(target, values, tween, index) {
            // if there're no start value, stops processing
            if(! tween.vars.startAt) return;

            this.isIE = (document.documentMode || /Edge/.test(navigator.userAgent)) ? true : false;
            
            // define initial blur
            const {blurX, blurY}  = tween.vars.startAt ? tween.vars.startAt.blur : {blurX: 0, blurY: 0}; 

            // record the target so that we can refer to it in the set method when doing updates.
			this._target = target; 
            this.startAt = { blurX, blurY};
            this.values = values;

            // define an unique id for the svg
            this.svgObjId = `${parseInt(new Date().getTime()*Math.random(),10)}`;
            
            // create a new instance of the SVG
            this.svg = createSVG.call(this,this.svgObjId, blurX, blurY);
            
            // append the svg
            target.appendChild(this.svg);

            // define tween for each prop
            Object.keys(values).forEach( (property) => {
                var value = values[property];
                switch(property) {
                    case 'blurX': 
                        this._addTween(this.svg, property, target.blurX, value, property);
                    break;
                    case 'blurY': 
                        this._addTween(this.svg, property, target.blurY, value, property);
                    break;
                }
            });

            // workaround to make the html re-render and apply the effect
            target.innerHTML = target.innerHTML;

			return true;
		},

		set: function(ratio) {
            // convert the ratio to a real value based on initial and targeted value
            const blurX = convertRange(ratio, 0, 1, this.startAt.blurX, this.values.blurX);
            const blurY = convertRange(ratio, 0, 1, this.startAt.blurY, this.values.blurY);

            // if the tween is done, remove filter and dom element
            if(ratio === 1 && !blurX && !blurY) {
                const container = document.querySelector(`#container-${this.svgObjId}`);
                container.parentNode.removeChild(container);
                this._target.style["filter"] = `none`;
                return;
            }

            if(! this.isIE) {
                // remove filter
                this._target.style["filter"] = `none`;
                
                // update gaussian blur
                document.querySelector(`#svg-${this.svgObjId}`).
                        querySelector('feGaussianBlur').
                        setAttribute("stdDeviation", `${blurX}, ${blurY}`);

                // reaply filter
                this._target.style["filter"] = `url(#filter-${this.svgObjId})`;
            } else {
                // IE fallback
                this._target.style['filter'] = `blur(${blurX}px);`
            }
		},
	});

}); if (_gsScope._gsDefine) { _gsScope._gsQueue.pop()(); }