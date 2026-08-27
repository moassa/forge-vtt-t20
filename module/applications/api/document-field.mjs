const { HandlebarsApplicationMixin, DocumentSheet } = foundry.applications.api;

export default class DocumentFieldSheet extends HandlebarsApplicationMixin(DocumentSheet) {
	constructor(options) {
		super(options);
		if (foundry.utils.isEmpty(options.fields)) throw new Error("DocumentFieldSheet must receive an array of field paths");
		this.#fields = options.fields;
	}

	/** @inheritdoc */
	static DEFAULT_OPTIONS = {
		sheetConfig: false,
		classes: ["tormenta20"],
		form: {
			submitOnChange: true,
		},
		position: {
			width: 400,
			height: "auto",
		},
	}

	static PARTS = {
		body: {
			template: "systems/tormenta20/templatesV2/api/document-field.hbs"
		}
	}

	#fields = [];

	/** @inheritdoc */
	async _prepareContext(options) {
		const context = await super._prepareContext(options);
		context.system = this.document.system;
		context.source = this.document.system._source;
		context.schema = this.document.system.schema.fields;
		context.fields = [];
		for (const path of this.#fields) {
			const field = this.document.getFieldForProperty(path);
			const value = foundry.utils.getProperty(this.document._source, path);
			context.fields.push({ field, value });
		}
		return context;
	}
} 