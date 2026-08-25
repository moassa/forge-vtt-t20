
const fields = foundry.data.fields;
const _fields = tormenta20.data.fields;

export default class CreatureData extends Tormenta20TypeData {
	static defineSchema() {
		const schema = super.defineSchema();

		const atributos = {};
		schema.atributos = this.schemaAtributos();
		schema.attributes = new fields();
		schema.detalhes = new fields();
		schema.dinheiro = new fields();
		schema.modificadores = new fields();
		schema.pericias = new fields();
		schema.resources = new fields();
		schema.tracos = new fields();

		return schema;
	}


	/* -------------------------------------------- */
	/*  Schema Factory                              */
	/* -------------------------------------------- */

	schemaAtributos() {
		const BaseNumberField = { required: true, initial: 0, min: 0 };
		const schema = {};

		return new fields.SchemaField(schema);
	}


	/* -------------------------------------------- */
	/*  Schema Factory                              */
	/* -------------------------------------------- */

}