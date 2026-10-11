/**
 *
 */
export default class RegionLayerT20 extends foundry.canvas.layers.RegionLayer {
	/**
	 * Avoid Aura Manager multiple calls
	 */
	auraManagerState = 0;

	/**
	 *
	 * @param {Object} shape ShapeData required for creating the shape
	 * @param {Object} options Data that may modify this;
	 */
	async placeRegionT20(shape, options) {
		const { message } = options;
		if (!shape) shape = this.parseShapeData(options.item);
		const regionData = this.getRegionTemplateData();
		regionData.name = shape.name;
		if (message) {
			Object.assign(regionData, {
				flags: { tormenta20: { message: message.id } }
			});
		}
		shape.quantity ??= 1;
		for (let index = 0; index < shape.quantity; index++) {
			const shapeData = this.getShapeTemplateData(shape);
			regionData.shapes.push(shapeData);
		}
		if (shape.behaviors) {
			// TODO Automate Behaviors
		}
		const placementOptions = {};
		placementOptions.tormenta20 = { vizael: 10 };
		if (shape.type == "emanation") {
			placementOptions.attachToToken = true;
		}
		if (["cone", "line"].includes(shape.type)) {
			placementOptions.onRotate = this._placementOnRotate;
		}
		if (true) {
			placementOptions.onMove = this._placementOnMove;
		}
		await canvas.regions.placeRegion(regionData, placementOptions);
	}

	parseShapeData(item) {
		const alcance = item.system.alcance;
		const area = item.system.area.toLowerCase().stripDiacritics().replace(",", ".");
		const shape = {
			name: item.name
		};
		if (area.match(/cone/)) shape.type = "cone";
		else if (area.match(/linha|parede|muralha/)) shape.type = "line";
		else if (area.match(/quadrado|cubo/)) shape.type = "square";
		else if (area.match(/esfera|circulo|raio|cilindro/)) shape.type = "circle";
		else if (area.match(/aura/)) shape.type = "emanation";

		const ranges = { short: 9, medium: 30, long: 90 };
		const length = area.match(/(\d+[,|.]?\d?)[m|km|q]/)?.at(1);
		shape.length = length ? Number(length) : (ranges[alcance] ?? 9);
		const quantity = area.match(/^\d+/);
		shape.quantity = quantity ? quantity[0] : 1;
		return shape;
	}

	getRegionTemplateData() {
		return {
			shapes: [],
			behaviors: [],
			color: game.user.color,
			restriction: { enabled: true },
			levels: [canvas.level.id],
			highlightMode: "coverage",
			displayMeasurements: true,
			restriction: {
				enabled: true,
				priority: 0,
				type: "move"
			},
			visibility: CONST.REGION_VISIBILITY.OBSERVER,
			ownership: {
				default: CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER,
				[game.user.id]: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER
			}
		};
	}

	/**
	 *
	 * @param {*} shape.type
	 * @param {*} shape.length
	 * @param {*} shape.width
	 */
	getShapeTemplateData(shape) {
		const shapeData = {
			type: shape.type,
			x: 0,
			y: 0,
			gridBased: true
		};
		const lengthPixels = shape.length * canvas.dimensions.distancePixels;
		switch (shape.type) {
			case "circle":
			case "sphere":
			case "cilinder":
				shapeData.type = "circle";
				shapeData.radius = lengthPixels;
				break;
			case "cone":
				shapeData.radius = lengthPixels;
				shapeData.rotation = 0;
				shapeData.angle = 55;
				shapeData.curvature = "flat";
				break;
			case "square":
			case "cube":
				shapeData.type = "rectangle";
				shapeData.width = lengthPixels;
				shapeData.height = lengthPixels;
				break;
			case "line":
				shapeData.width = (shape.width ?? 1) * canvas.dimensions.distancePixels;
				shapeData.length = lengthPixels;
				break;
			case "emanation":
				shapeData.radius = lengthPixels;
				shapeData.gridBased = true;
				shapeData.base = {
					type: "token",
					shape: 4,
					hole: false,
					width: 1,
					height: 1,
					x: 0,
					y: 0
				};
				break;
			default:
				break;
		}
		return shapeData;
	}

	/**
	 *
	 * @param {*} data
	 * @returns
	 */
	_placementOnRotate(data) {
		const { event, preview, document, shape, index, count, precise } = data;
		if (!canvas.grid.isSquare) return true;

		const interval = 45;
		const delta = interval * Math.sign(event.delta);
		const rotate = (shape.rotation + delta).toNearest(interval) - shape.rotation;
		shape.rotate(rotate);
		if (shape.type == "cone") {
			// Update cone angle
			if (shape._source.rotation % 90) {
				shape.updateSource({ angle: 90 });
			} else {
				shape.updateSource({ angle: 55 });
			}
		}
		return false;
	}

	/**
	 *
	 * @param {*} data
	 * @returns
	 */
	_placementOnMove(data) {
		// console.log("_placementOnMove", data);
		if (!data.rangePreview) {
		}
	}

	/**
	 * Iterate over scene actors and regions managing creation, update and deletion of auras
	 */
	async manageAuras() {
		if (!game.user.isActiveGM) return;
		if (!game.settings.get("tormenta20", "experimentalAuras")) return;

		if (this.auraManagerState) return;
		this.auraManagerState = 1;
		// Traverse all token actors and create effects for auras
		for (const token of canvas.scene.tokens) {
			for (const effect of token.actor?.effects) {
				if (!effect.system.aura?.isAura) continue;
				const aura = canvas.scene.regions.find((r) => r.getFlag("tormenta20", "effect") == effect.uuid);
				if (!aura) await this._createAura(effect, token);
			}
		}
		// Delete aura with missing effects
		for (const region of canvas.scene.regions) {
			const uuid = region.getFlag("tormenta20", "effect");
			if (!uuid) continue;
			const effect = foundry.utils.fromUuidSync(region.getFlag("tormenta20", "effect"));
			if (!effect || !effect.active) {
				await region.delete();
			}
		}
		this.auraManagerState = 0;
	}

	async _createAura(effect, token) {
		const aura = effect.system.aura;
		const behaviors = aura.behaviors
			? JSON.parse(effect.system._source.aura.behaviors.replace("@uuid", effect.uuid))
			: [];

		const regionData = canvas.regions.getAttachedRegionTemplateData(token, aura.range);
		foundry.utils.mergeObject(regionData, {
			flags: { tormenta20: { effect: effect.uuid } },
			behaviors: behaviors,
			name: `${effect.name} (Aura)`,
			ownership: token.actor.ownership
		});
		// return;
		await CONFIG.Region.documentClass.implementation.create(regionData, {
			parent: canvas.scene
		});
	}

	getAttachedRegionTemplateData(token, range = 9) {
		if (!token.persisted) throw new Error("The Token must be persisted.");
		const regionData = canvas.regions.getRegionTemplateData();

		const { x, y, elevation, width, height, depth, shape, level } = token._source;
		const { distance, distancePixels } = token.parent.dimensions;
		const radius = range * distancePixels;
		return {
			...regionData,
			shapes: [
				{
					type: "emanation",
					base: { type: "token", x, y, width, height, shape, hole: false },
					radius,
					gridBased: true
				}
			],
			elevation: { bottom: elevation - range, top: elevation + depth * distance + range },
			attachment: { token: token.id },
			levels: [level]
		};
	}
}
