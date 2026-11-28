import { Injectable, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';
import { AbstractEvent, EventType } from '../event-registry/abstract-event';
import { EventRegistryService } from '../event-registry/event-registry.service';

@Injectable({
	providedIn: 'root'
})
export class EventHelperService {
	private eventRegistry = inject(EventRegistryService);
	private domSanitizer = inject(DomSanitizer);

	
	selectedEvent: BehaviorSubject<AbstractEvent<any> | null> = new BehaviorSubject<AbstractEvent<any> | null>(null);
	
	public getEventFromType(val: EventType, actionStep: boolean): AbstractEvent<any> {
		const eventClass = this.eventRegistry.getEvent(val.type);
		const instance: AbstractEvent<any> = new eventClass(this.domSanitizer, val, actionStep);

		const branchNames = instance.getBranchNames();
		if (branchNames) {
			const valAny = val as any;
			for (const name of branchNames) {
				const opt = valAny[name];
				if (!Array.isArray(opt)) {
					continue;
				}
				valAny[name] = opt.map((v: EventType) => this.getEventFromType(v, actionStep));
			}
		}
		
		instance.update();
		
		return instance;
	}
}
