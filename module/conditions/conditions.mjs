export const T20Conditions = {};

T20Conditions.abalado = {
	uuid: "Compendium.world.statuses.ActiveEffect.ABALADO000000000",
	id: "abalado",
	name: "Abalado",
	img: "systems/tormenta20/icons/conditions/abalado.svg",
	statuses: ["abalado"],
	duration: {
		expiry: "sceneEnd"
	},
	system: {
		changes: [
			{
				key: "system.pericias.*.condi",
				value: -2,
				type: "downgrade"
			}
		],
		status: {
			category: "medo",
			stack: "apavorado"
		}
	}
};

T20Conditions.agarrado = {
	uuid: "Compendium.world.statuses.ActiveEffect.AGARRADO00000000",
	id: "agarrado",
	name: "Agarrado",
	img: "systems/tormenta20/icons/conditions/agarrado.svg",
	statuses: ["agarrado"],
	duration: {
		expiry: "sceneEnd"
	},
	system: {
		changes: [
			{
				key: "system.pericias.luta.condi",
				value: -2,
				type: "downgrade"
			},
			{
				key: "system.pericias.pont.condi",
				value: -2,
				type: "downgrade"
			}
		],
		status: {
			category: "movimento",
			childEffect: ["desprevenido", "imovel"]
		}
	}
};

T20Conditions.alquebrado = {
	uuid: "Compendium.world.statuses.ActiveEffect.ALQUEBRADO000000",
	id: "alquebrado",
	name: "Alquebrado",
	img: "systems/tormenta20/icons/conditions/alquebrado.svg",
	statuses: ["alquebrado"],
	duration: {
		expiry: "sceneEnd"
	},
	system: {
		changes: [
			{
				key: "system.modificadores.custoPM",
				value: 1,
				type: "add"
			}
		],
		status: {
			category: "mental"
		}
	}
};

T20Conditions.apavorado = {
	uuid: "Compendium.world.statuses.ActiveEffect.APAVORADO0000000",
	id: "apavorado",
	name: "Apavorado",
	img: "systems/tormenta20/icons/conditions/apavorado.svg",
	statuses: ["apavorado"],
	duration: {
		expiry: "sceneEnd"
	},
	system: {
		changes: [
			{
				key: "system.pericias.*.condi",
				value: -5,
				type: "downgrade"
			}
		],
		status: {
			category: "medo"
		}
	}
};

T20Conditions.atordoado = {
	uuid: "Compendium.world.statuses.ActiveEffect.ATORDOADO0000000",
	id: "atordoado",
	name: "Atordoado",
	img: "systems/tormenta20/icons/conditions/atordoado.svg",
	statuses: ["atordoado"],
	duration: {
		expiry: "sceneEnd"
	},
	system: {
		status: {
			category: "mental",
			childEffect: ["desprevenido"]
		}
	}
};

T20Conditions.caido = {
	uuid: "Compendium.world.statuses.ActiveEffect.CAIDO00000000000",
	id: "caido",
	name: "Caído",
	img: "systems/tormenta20/icons/conditions/caido.svg",
	statuses: ["caido"],
	duration: {
		expiry: "sceneEnd"
	},
	system: {
		changes: [
			{
				key: "system.pericias.luta.condi",
				value: -5,
				type: "downgrade"
			},
			{
				key: "system.attributes.defesa.outros",
				value: -5,
				type: "downgrade"
			},
			{
				key: "system.attributes.movement.*.base",
				value: 1.5,
				type: "downgrade"
			}
		],
		status: {}
	}
};

T20Conditions.cego = {
	uuid: "Compendium.world.statuses.ActiveEffect.CEGO000000000000",
	id: "cego",
	name: "Cego",
	img: "systems/tormenta20/icons/conditions/cego.svg",
	statuses: ["cego"],
	duration: {
		expiry: "sceneEnd"
	},
	system: {
		changes: [
			{
				key: "system.pericias.acro.condi",
				value: -5,
				type: "downgrade"
			},
			{
				key: "system.pericias.atle.condi",
				value: -5,
				type: "downgrade"
			},
			{
				key: "system.pericias.cava.condi",
				value: -5,
				type: "downgrade"
			},
			{
				key: "system.pericias.furt.condi",
				value: -5,
				type: "downgrade"
			},
			{
				key: "system.pericias.inic.condi",
				value: -5,
				type: "downgrade"
			},
			{
				key: "system.pericias.luta.condi",
				value: -5,
				type: "downgrade"
			},
			{
				key: "system.pericias.pilo.condi",
				value: -5,
				type: "downgrade"
			},
			{
				key: "system.pericias.pont.condi",
				value: -5,
				type: "downgrade"
			},
			{
				key: "system.pericias.refl.condi",
				value: -5,
				type: "downgrade"
			}
		],
		status: {
			category: "sentidos",
			childEffect: ["desprevenido", "lento"]
		}
	}
};

T20Conditions.confuso = {
	uuid: "Compendium.world.statuses.ActiveEffect.CONFUSO000000000",
	id: "confuso",
	name: "Confuso",
	img: "systems/tormenta20/icons/conditions/confuso.svg",
	statuses: ["confuso"],
	duration: {
		expiry: "sceneEnd"
	},
	system: {
		status: {
			category: "mental"
		}
	}
};

T20Conditions.debilitado = {
	uuid: "Compendium.world.statuses.ActiveEffect.DEBILITADO000000",
	id: "debilitado",
	name: "Debilitado",
	img: "systems/tormenta20/icons/conditions/debilitado.svg",
	statuses: ["debilitado"],
	duration: {
		expiry: "sceneEnd"
	},
	system: {
		changes: [
			{
				key: "system.modificadores.atributos.for",
				value: -5,
				type: "add"
			},
			{
				key: "system.modificadores.atributos.des",
				value: -5,
				type: "add"
			},
			{
				key: "system.modificadores.atributos.con",
				value: -5,
				type: "add"
			},
			{
				key: "system.pericias.acro.condi",
				value: -5,
				type: "downgrade"
			},
			{
				key: "system.pericias.atle.condi",
				value: -5,
				type: "downgrade"
			},
			{
				key: "system.pericias.cava.condi",
				value: -5,
				type: "downgrade"
			},
			{
				key: "system.pericias.fort.condi",
				value: -5,
				type: "downgrade"
			},
			{
				key: "system.pericias.furt.condi",
				value: -5,
				type: "downgrade"
			},
			{
				key: "system.pericias.inic.condi",
				value: -5,
				type: "downgrade"
			},
			{
				key: "system.pericias.luta.condi",
				value: -5,
				type: "downgrade"
			},
			{
				key: "system.pericias.pilo.condi",
				value: -5,
				type: "downgrade"
			},
			{
				key: "system.pericias.pont.condi",
				value: -5,
				type: "downgrade"
			},
			{
				key: "system.pericias.refl.condi",
				value: -5,
				type: "downgrade"
			}
		],
		status: {
			stack: "inconsciente"
		}
	}
};

T20Conditions.desprevenido = {
	uuid: "Compendium.world.statuses.ActiveEffect.DESPREVENIDO0000",
	id: "desprevenido",
	name: "Desprevenido",
	img: "systems/tormenta20/icons/conditions/desprevenido.svg",
	statuses: ["desprevenido"],
	duration: {
		expiry: "sceneEnd"
	},
	system: {
		changes: [
			{
				key: "system.pericias.refl.condi",
				value: -5,
				type: "downgrade"
			},
			{
				key: "system.attributes.defesa.condi",
				value: -5,
				type: "downgrade"
			}
		],
		status: {}
	}
};

T20Conditions.doente = {
	uuid: "Compendium.world.statuses.ActiveEffect.DOENTE0000000000",
	id: "doente",
	name: "Doente",
	img: "systems/tormenta20/icons/conditions/doente.svg",
	statuses: ["doente"],
	duration: {
		expiry: "sceneEnd"
	},
	system: {
		status: {
			category: "metabolismo"
		}
	}
};

T20Conditions.emchamas = {
	uuid: "Compendium.world.statuses.ActiveEffect.EMCHAMAS00000000",
	id: "emchamas",
	name: "Em Chamas",
	img: "systems/tormenta20/icons/conditions/em-chamas.svg",
	statuses: ["emchamas"],
	duration: {
		expiry: "sceneEnd"
	},
	system: {
		changes: [
			{
				key: "dano",
				value: "1d6[fogo]",
				type: "custom"
			}
		],
		status: {}
	}
};

T20Conditions.enfeiticado = {
	uuid: "Compendium.world.statuses.ActiveEffect.ENFEITICADO00000",
	id: "enfeiticado",
	name: "Enfeitiçado",
	img: "systems/tormenta20/icons/conditions/enfeiticado.svg",
	statuses: ["enfeiticado"],
	duration: {
		expiry: "sceneEnd"
	},
	system: {
		status: {
			category: "mental"
		}
	}
};

T20Conditions.enjoado = {
	uuid: "Compendium.world.statuses.ActiveEffect.ENJOADO000000000",
	id: "enjoado",
	name: "Enjoado",
	img: "systems/tormenta20/icons/conditions/enjoado.svg",
	statuses: ["enjoado"],
	duration: {
		expiry: "sceneEnd"
	},
	system: {
		status: {
			category: "metabolismo"
		}
	}
};

T20Conditions.enredado = {
	uuid: "Compendium.world.statuses.ActiveEffect.ENREDADO00000000",
	id: "enredado",
	name: "Enredado",
	img: "systems/tormenta20/icons/conditions/enredado.svg",
	statuses: ["enredado"],
	duration: {
		expiry: "sceneEnd"
	},
	system: {
		changes: [
			{
				key: "system.pericias.luta.condi",
				value: -2,
				type: "downgrade"
			},
			{
				key: "system.pericias.pont.condi",
				value: -2,
				type: "downgrade"
			}
		],
		status: {
			category: "movimento",
			childEffect: ["lento", "vulneravel"]
		}
	}
};

T20Conditions.envenenado = {
	uuid: "Compendium.world.statuses.ActiveEffect.ENVENENADO000000",
	id: "envenenado",
	name: "Envenenado",
	img: "systems/tormenta20/icons/conditions/envenenado.svg",
	statuses: ["envenenado"],
	duration: {
		expiry: "sceneEnd"
	},
	system: {
		status: {
			category: "veneno"
		}
	}
};

T20Conditions.esmorecido = {
	uuid: "Compendium.world.statuses.ActiveEffect.ESMORECIDO000000",
	id: "esmorecido",
	name: "Esmorecido",
	img: "systems/tormenta20/icons/conditions/esmorecido.svg",
	statuses: ["esmorecido"],
	duration: {
		expiry: "sceneEnd"
	},
	system: {
		changes: [
			{
				key: "system.modificadores.atributos.int",
				value: -5,
				type: "add"
			},
			{
				key: "system.modificadores.atributos.sab",
				value: -5,
				type: "add"
			},
			{
				key: "system.modificadores.atributos.car",
				value: -5,
				type: "add"
			},
			{
				key: "system.pericias.ades.condi",
				value: -5,
				type: "downgrade"
			},
			{
				key: "system.pericias.atua.condi",
				value: -5,
				type: "downgrade"
			},
			{
				key: "system.pericias.conh.condi",
				value: -5,
				type: "downgrade"
			},
			{
				key: "system.pericias.cura.condi",
				value: -5,
				type: "downgrade"
			},
			{
				key: "system.pericias.dipl.condi",
				value: -5,
				type: "downgrade"
			},
			{
				key: "system.pericias.enga.condi",
				value: -5,
				type: "downgrade"
			},
			{
				key: "system.pericias.guer.condi",
				value: -5,
				type: "downgrade"
			},
			{
				key: "system.pericias.inti.condi",
				value: -5,
				type: "downgrade"
			},
			{
				key: "system.pericias.intu.condi",
				value: -5,
				type: "downgrade"
			},
			{
				key: "system.pericias.inve.condi",
				value: -5,
				type: "downgrade"
			},
			{
				key: "system.pericias.joga.condi",
				value: -5,
				type: "downgrade"
			},
			{
				key: "system.pericias.mist.condi",
				value: -5,
				type: "downgrade"
			},
			{
				key: "system.pericias.nobr.condi",
				value: -5,
				type: "downgrade"
			},
			{
				key: "system.pericias.perc.condi",
				value: -5,
				type: "downgrade"
			},
			{
				key: "system.pericias.reli.condi",
				value: -5,
				type: "downgrade"
			},
			{
				key: "system.pericias.sobr.condi",
				value: -5,
				type: "downgrade"
			},
			{
				key: "system.pericias.vont.condi",
				value: -5,
				type: "downgrade"
			}
		],
		status: {
			category: "mental"
		}
	}
};

T20Conditions.exausto = {
	uuid: "Compendium.world.statuses.ActiveEffect.EXAUSTO000000000",
	id: "exausto",
	name: "Exausto",
	img: "systems/tormenta20/icons/conditions/exausto.svg",
	statuses: ["exausto"],
	duration: {
		expiry: "sceneEnd"
	},
	system: {
		status: {
			category: "cansaco",
			childEffect: ["debilitado", "lento", "vulneravel"],
			stack: "inconsciente"
		}
	}
};

T20Conditions.fascinado = {
	uuid: "Compendium.world.statuses.ActiveEffect.FASCINADO0000000",
	id: "fascinado",
	name: "Fascinado",
	img: "systems/tormenta20/icons/conditions/fascinado.svg",
	statuses: ["fascinado"],
	duration: {
		expiry: "sceneEnd"
	},
	system: {
		changes: [
			{
				key: "system.pericias.perc.condi",
				value: -5,
				type: "downgrade"
			}
		],
		status: {
			category: "mental"
		}
	}
};

T20Conditions.fatigado = {
	uuid: "Compendium.world.statuses.ActiveEffect.FATIGADO00000000",
	id: "fatigado",
	name: "Fatigado",
	img: "systems/tormenta20/icons/conditions/fatigado.svg",
	statuses: ["fatigado"],
	duration: {
		expiry: "sceneEnd"
	},
	system: {
		status: {
			category: "cansaco",
			childEffect: ["fraco", "vulneravel"],
			stack: "exausto"
		}
	}
};

T20Conditions.fraco = {
	uuid: "Compendium.world.statuses.ActiveEffect.FRACO00000000000",
	id: "fraco",
	name: "Fraco",
	img: "systems/tormenta20/icons/conditions/fraco.svg",
	statuses: ["fraco"],
	duration: {
		expiry: "sceneEnd"
	},
	system: {
		changes: [
			{
				key: "system.modificadores.atributos.for",
				value: -2,
				type: "add"
			},
			{
				key: "system.modificadores.atributos.des",
				value: -2,
				type: "add"
			},
			{
				key: "system.modificadores.atributos.con",
				value: -2,
				type: "add"
			},
			{
				key: "system.pericias.acro.condi",
				value: -2,
				type: "downgrade"
			},
			{
				key: "system.pericias.atle.condi",
				value: -2,
				type: "downgrade"
			},
			{
				key: "system.pericias.cava.condi",
				value: -2,
				type: "downgrade"
			},
			{
				key: "system.pericias.fort.condi",
				value: -2,
				type: "downgrade"
			},
			{
				key: "system.pericias.furt.condi",
				value: -2,
				type: "downgrade"
			},
			{
				key: "system.pericias.inic.condi",
				value: -2,
				type: "downgrade"
			},
			{
				key: "system.pericias.luta.condi",
				value: -2,
				type: "downgrade"
			},
			{
				key: "system.pericias.pilo.condi",
				value: -2,
				type: "downgrade"
			},
			{
				key: "system.pericias.pont.condi",
				value: -2,
				type: "downgrade"
			},
			{
				key: "system.pericias.refl.condi",
				value: -2,
				type: "downgrade"
			}
		],
		status: {
			stack: "debilitado"
		}
	}
};

T20Conditions.frustrado = {
	uuid: "Compendium.world.statuses.ActiveEffect.FRUSTRADO0000000",
	id: "frustrado",
	name: "Frustrado",
	img: "systems/tormenta20/icons/conditions/frustrado.svg",
	statuses: ["frustrado"],
	duration: {
		expiry: "sceneEnd"
	},
	system: {
		changes: [
			{
				key: "system.modificadores.atributos.int",
				value: -2,
				type: "add"
			},
			{
				key: "system.modificadores.atributos.sab",
				value: -2,
				type: "add"
			},
			{
				key: "system.modificadores.atributos.car",
				value: -2,
				type: "add"
			},
			{
				key: "system.pericias.ades.condi",
				value: -2,
				type: "downgrade"
			},
			{
				key: "system.pericias.atua.condi",
				value: -2,
				type: "downgrade"
			},
			{
				key: "system.pericias.conh.condi",
				value: -2,
				type: "downgrade"
			},
			{
				key: "system.pericias.cura.condi",
				value: -2,
				type: "downgrade"
			},
			{
				key: "system.pericias.dipl.condi",
				value: -2,
				type: "downgrade"
			},
			{
				key: "system.pericias.enga.condi",
				value: -2,
				type: "downgrade"
			},
			{
				key: "system.pericias.guer.condi",
				value: -2,
				type: "downgrade"
			},
			{
				key: "system.pericias.inti.condi",
				value: -2,
				type: "downgrade"
			},
			{
				key: "system.pericias.intu.condi",
				value: -2,
				type: "downgrade"
			},
			{
				key: "system.pericias.inve.condi",
				value: -2,
				type: "downgrade"
			},
			{
				key: "system.pericias.joga.condi",
				value: -2,
				type: "downgrade"
			},
			{
				key: "system.pericias.mist.condi",
				value: -2,
				type: "downgrade"
			},
			{
				key: "system.pericias.nobr.condi",
				value: -2,
				type: "downgrade"
			},
			{
				key: "system.pericias.perc.condi",
				value: -2,
				type: "downgrade"
			},
			{
				key: "system.pericias.reli.condi",
				value: -2,
				type: "downgrade"
			},
			{
				key: "system.pericias.sobr.condi",
				value: -2,
				type: "downgrade"
			},
			{
				key: "system.pericias.vont.condi",
				value: -2,
				type: "downgrade"
			}
		],
		status: {
			category: "mental",
			stack: "esmorecido"
		}
	}
};

T20Conditions.imovel = {
	uuid: "Compendium.world.statuses.ActiveEffect.IMOVEL0000000000",
	id: "imovel",
	name: "Imóvel",
	img: "systems/tormenta20/icons/conditions/imovel.svg",
	statuses: ["imovel"],
	duration: {
		expiry: "sceneEnd"
	},
	system: {
		changes: [
			{
				key: "system.attributes.movement.walk.base",
				value: 0,
				type: "downgrade"
			},
			{
				key: "system.attributes.movement.burrow.base",
				value: 0,
				type: "downgrade"
			},
			{
				key: "system.attributes.movement.climb.base",
				value: 0,
				type: "downgrade"
			},
			{
				key: "system.attributes.movement.fly.base",
				value: 0,
				type: "downgrade"
			},
			{
				key: "system.attributes.movement.swim.base",
				value: 0,
				type: "downgrade"
			}
		],
		status: {
			category: "movimento"
		}
	}
};

T20Conditions.inconsciente = {
	uuid: "Compendium.world.statuses.ActiveEffect.INCONSCIENTE0000",
	id: "inconsciente",
	name: "Inconsciente",
	img: "systems/tormenta20/icons/conditions/inconsciente.svg",
	statuses: ["inconsciente"],
	duration: {
		expiry: "sceneEnd"
	},
	system: {
		status: {
			childEffect: ["indefeso"]
		}
	}
};

T20Conditions.indefeso = {
	uuid: "Compendium.world.statuses.ActiveEffect.INDEFESO00000000",
	id: "indefeso",
	name: "Indefeso",
	img: "systems/tormenta20/icons/conditions/indefeso.svg",
	statuses: ["indefeso"],
	duration: {
		expiry: "sceneEnd"
	},
	system: {
		changes: [
			{
				key: "system.attributes.defesa.condi",
				value: -10,
				type: "downgrade"
			}
		],
		status: {
			childEffect: ["desprevenido"]
		}
	}
};

T20Conditions.invisivel = {
	uuid: "Compendium.world.statuses.ActiveEffect.INVISIVEL0000000",
	id: "invisivel",
	name: "Invisível",
	img: "icons/svg/invisible.svg",
	statuses: ["invisivel"],
	duration: {
		expiry: "sceneEnd"
	},
	system: {
		status: {}
	}
};

T20Conditions.lento = {
	uuid: "Compendium.world.statuses.ActiveEffect.LENTO00000000000",
	id: "lento",
	name: "Lento",
	img: "systems/tormenta20/icons/conditions/lento.svg",
	statuses: ["lento"],
	duration: {
		expiry: "sceneEnd"
	},
	system: {
		status: {
			category: "movimento"
		}
	}
};

T20Conditions.morto = {
	uuid: "Compendium.world.statuses.ActiveEffect.MORTO00000000000",
	id: "morto",
	name: "Morto",
	img: "systems/tormenta20/icons/conditions/morto.svg",
	statuses: ["morto"],
	duration: {
		expiry: "sceneEnd"
	},
	system: {
		status: {}
	}
};

T20Conditions.ofuscado = {
	uuid: "Compendium.world.statuses.ActiveEffect.OFUSCADO00000000",
	id: "ofuscado",
	name: "Ofuscado",
	img: "systems/tormenta20/icons/conditions/ofuscado.svg",
	statuses: ["ofuscado"],
	duration: {
		expiry: "sceneEnd"
	},
	system: {
		changes: [
			{
				key: "system.pericias.perc.condi",
				value: -2,
				type: "downgrade"
			},
			{
				key: "system.pericias.luta.condi",
				value: -2,
				type: "downgrade"
			},
			{
				key: "system.pericias.pont.condi",
				value: -2,
				type: "downgrade"
			}
		],
		status: {
			category: "sentidos"
		}
	}
};

T20Conditions.paralisado = {
	uuid: "Compendium.world.statuses.ActiveEffect.PARALISADO000000",
	id: "paralisado",
	name: "Paralisado",
	img: "systems/tormenta20/icons/conditions/paralisado.svg",
	statuses: ["paralisado"],
	duration: {
		expiry: "sceneEnd"
	},
	system: {
		status: {
			category: "movimento",
			childEffect: ["imovel", "indefeso"]
		}
	}
};

T20Conditions.pasmo = {
	uuid: "Compendium.world.statuses.ActiveEffect.PASMO00000000000",
	id: "pasmo",
	name: "Pasmo",
	img: "systems/tormenta20/icons/conditions/pasmo.svg",
	statuses: ["pasmo"],
	duration: {
		expiry: "sceneEnd"
	},
	system: {
		status: {
			category: "mental"
		}
	}
};

T20Conditions.petrificado = {
	uuid: "Compendium.world.statuses.ActiveEffect.PETRIFICADO00000",
	id: "petrificado",
	name: "Petrificado",
	img: "systems/tormenta20/icons/conditions/petrificado.svg",
	statuses: ["petrificado"],
	duration: {
		expiry: "sceneEnd"
	},
	system: {
		changes: [
			{
				key: "system.tracos.resistencias.dano.value",
				value: 8,
				type: "downgrade"
			}
		],
		status: {
			category: "metamorfose",
			childEffect: ["inconsciente"]
		}
	}
};

T20Conditions.sangrando = {
	uuid: "Compendium.world.statuses.ActiveEffect.SANGRANDO0000000",
	id: "sangrando",
	name: "Sangrando",
	img: "systems/tormenta20/icons/conditions/sangrando.svg",
	statuses: ["sangrando"],
	duration: {
		expiry: "sceneEnd"
	},
	system: {
		changes: [
			{
				key: "dano",
				value: "1d6[perda]",
				type: "custom"
			}
		],
		status: {
			category: "metabolismo"
		}
	}
};

T20Conditions.sustentando = {
	uuid: "Compendium.world.statuses.ActiveEffect.SUSTENTANDO00000",
	id: "sustentando",
	name: "Sustentando",
	img: "systems/tormenta20/icons/conditions/sustentando.svg",
	statuses: ["sustentando"],
	duration: {
		expiry: "sceneEnd"
	},
	system: {
		changes: [
			{
				key: "sustentado",
				value: "",
				type: "custom"
			}
		],
		status: {}
	}
};

T20Conditions.surdo = {
	uuid: "Compendium.world.statuses.ActiveEffect.SURDO00000000000",
	id: "surdo",
	name: "Surdo",
	img: "systems/tormenta20/icons/conditions/surdo.svg",
	statuses: ["surdo"],
	duration: {
		expiry: "sceneEnd"
	},
	system: {
		changes: [
			{
				key: "system.pericias.inic.condi",
				value: -5,
				type: "downgrade"
			}
		],
		status: {
			category: "sentidos"
		}
	}
};

T20Conditions.surpreendido = {
	uuid: "Compendium.world.statuses.ActiveEffect.SURPREENDIDO0000",
	id: "surpreendido",
	name: "Surpreendido",
	img: "systems/tormenta20/icons/conditions/surpreendido.svg",
	statuses: ["surpreendido"],
	duration: {
		expiry: "sceneEnd"
	},
	system: {
		status: {
			childEffect: ["desprevenido"]
		}
	}
};

T20Conditions.vulneravel = {
	uuid: "Compendium.world.statuses.ActiveEffect.VULNERAVEL000000",
	id: "vulneravel",
	name: "Vulnerável",
	img: "systems/tormenta20/icons/conditions/vulneravel.svg",
	statuses: ["vulneravel"],
	duration: {
		expiry: "sceneEnd"
	},
	system: {
		changes: [
			{
				key: "system.attributes.defesa.condi",
				value: -2,
				type: "downgrade"
			}
		],
		status: {}
	}
};

T20Conditions.sobrecarregado = {
	uuid: "Compendium.world.statuses.ActiveEffect.SOBRECARREGADO00",
	id: "sobrecarregado",
	name: "Sobrecarregado",
	img: "systems/tormenta20/icons/conditions/sobrecarregado.svg",
	statuses: ["sobrecarregado"],
	duration: {
		expiry: "sceneEnd"
	},
	system: {
		changes: [
			{
				key: "system.attributes.defesa.pda",
				value: 5,
				type: "add"
			}
		],
		status: {
			category: "movimento"
		}
	}
};
