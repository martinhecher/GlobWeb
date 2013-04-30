/***************************************
 * Copyright 2011, 2012 GlobWeb contributors.
 *
 * This file is part of GlobWeb.
 *
 * GlobWeb is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, version 3 of the License, or
 * (at your option) any later version.
 *
 * GlobWeb is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with GlobWeb. If not, see <http://www.gnu.org/licenses/>.
 ***************************************/

define(['./BaseLayer', './Utils', './Program', './Mesh', './CoordinateSystem'],

function(BaseLayer, Utils, Program, Mesh, CoordinateSystem) {

	/**************************************************************************************************************/

	/** 
	 *  @constructor
	 *  Function constructor for EffectLayer
     */
	var EffectLayer = function(options) {
		BaseLayer.prototype.constructor.call(this, options);
		this.globe = null;

		this.effects = {};
		this.num_effects = 0;
	}

	/**************************************************************************************************************/

	Utils.inherits(BaseLayer, EffectLayer);

	/**************************************************************************************************************/

	EffectLayer.prototype.addEffect = function(desc) {
		this.effects[desc.id] = desc;
		this.num_effects++;
	}

	/** 
	 *  Attach the layer to the globe
 	 */
	EffectLayer.prototype._attach = function(g) {
		BaseLayer.prototype._attach.call(this, g);

		if (this._visible) {
			this.globe.tileManager.addPostRenderer(this);
		}
	}

	/**************************************************************************************************************/

	/** 
	 *  Detach the layer from the globe
	 */
	EffectLayer.prototype._detach = function() {
		for (key in this.effects) {
			if (this.effects.hasOwnProperty(key)) {
				var effect = this.effects[key];
				effect.mesh.dispose();
				console.debug("[EffectLayer] disposed effect " + this.effects.id);
				delete this.effects[key];
			}
		}

		this.globe.tileManager.removePostRenderer(this);
		BaseLayer.prototype._detach.call(this);
	}

	/**************************************************************************************************************/

	/**
	 *  Render the effects
	 */
	EffectLayer.prototype.render = function(tiles) {
		var renderContext = this.globe.renderContext;
		var gl = renderContext.gl;

		gl.disable(gl.DEPTH_TEST);
		gl.enable(gl.BLEND);
		gl.blendEquation(gl.FUNC_ADD);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

		mat4.multiply(renderContext.projectionMatrix, renderContext.viewMatrix, renderContext.modelViewMatrix)

		for (key in this.effects) {
			if (this.effects.hasOwnProperty(key)) {
				var effect = this.effects[key];
				effect.program.apply();

				gl.uniformMatrix4fv(effect.program.uniforms["viewProjectionMatrix "], false, renderContext.modelViewMatrix);
				gl.uniform1f(effect.program.uniforms["alpha "], this._opacity);

				effect.mesh.render(effect.program.attributes);

				//console.log("[EffectLayer] rendered " + effect.id);
			}
		}

		gl.enable(gl.DEPTH_TEST);
		gl.disable(gl.BLEND);
	}

	/**************************************************************************************************************/

	/**
	 * 	Set visibility of the layer
	 */
	EffectLayer.prototype.visible = function(arg) {
		if (typeof arg == "boolean " && this._visible != arg) {
			this._visible = arg;

			if (arg) {
				this.globe.tileManager.addPostRenderer(this);
			} else {
				this.globe.tileManager.removePostRenderer(this);
			}
		}

		return this._visible;
	}

	/**************************************************************************************************************/

	/**
	 * 	Set opacity of the layer
	 */
	EffectLayer.prototype.opacity = function(arg) {
		return BaseLayer.prototype.opacity.call(this, arg);
	}

	/**************************************************************************************************************/

	return EffectLayer;

});
