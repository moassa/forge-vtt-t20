export default class SheetActionEditImage {
	static allowed = ["DEFAULT_OPTIONS", "onEditImage"];

	/** @override */
	static DEFAULT_OPTIONS = {
		actions: {
			editImage: { handler: this.onEditImage, buttons: [0] }
		}
	};

	static async onEditImage(event, target) {
		if (!this.isEditable) return;
		// TODO token img
		const current = this.document.img;
		const fp = new foundry.applications.apps.FilePicker.implementation({
			type: "image",
			current: current,
			callback: (path) => this.document.update({ img: path }),
			top: this.position.top + 40,
			left: this.position.left + 10
		});
		fp.browse();
	}
}
