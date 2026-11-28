import { DomSanitizer } from '@angular/platform-browser';
import { AttributeValue, EntityAttributes } from '../../../../services/phaser/entities/cc-entity';
import { AbstractEvent, EventType } from './abstract-event';
import { Globals } from '../../../../services/globals';

export interface ActionsJson {
	[key: string]: JsonEventType;
}

export interface EventsJson {
	[key: string]: JsonEventType;
}

interface DefaultEventData extends EventType {
	[key: string]: any;
}

export interface BranchesData {
	type: 'list';
	names: string[];
}

interface JsonEventType {
	attributes: {
		[key: string]: { noLabel: boolean } & AttributeValue;
	};
	branches?: BranchesData;
}

export class DefaultEvent<T extends EventType = DefaultEventData> extends AbstractEvent<T> {
	private readonly type?: JsonEventType;
	
	constructor(
		domSanitizer: DomSanitizer,
		data: T,
		actionStep = false,
	) {
		super(domSanitizer, data, actionStep);
		const jsonLoader = Globals.jsonLoader;
		if (actionStep) {
			this.type = jsonLoader.loadJsonMergedSync<ActionsJson>('actions.json')[this.data.type];
		} else {
			this.type = jsonLoader.loadJsonMergedSync<EventsJson>('events.json')[this.data.type];
		}
	}
	
	getAttributes(): EntityAttributes | undefined {
		if (this.type) {
			return this.type.attributes;
		}
		return undefined;
	}

	override getBranchNames(): string[] | undefined {
		const branchData = this.type?.branches;
		if (!branchData) {
			return undefined;
		}
		if (branchData.type === 'list') {
			return branchData.names;
		} else {
			throw new Error('unhandled branchData type');
		}
	}
	
	update() {
		this.info = this.getTypeString('#ff5a5b');
		if (!this.type) {
			this.info += ' ' + this.getAllPropStrings();
			return;
		}
		
		for (const key of Object.keys(this.type.attributes)) {
			if (this.type.attributes[key].noLabel) {
				continue;
			}
			if (this.data[key as keyof T] !== undefined) {
				this.info += ' ' + this.getPropString(key);
			}
		}

		const branchNames = this.getBranchNames() ?? [];
		for (let i = 0; i < branchNames.length; i++) {
			const branchName = branchNames[i];
			const events = this.data[branchName as keyof typeof this.data] as AbstractEvent<any>[] ?? [];
			this.children[i] = {
				title: branchName,
				events,
				draggable: false
			};

		}
	}
	
	protected generateNewDataInternal() {
		return {};
	}
	
}
