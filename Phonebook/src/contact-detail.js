import {inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {WebAPI} from './web-api';
import {ContactUpdated,ContactViewed} from './messages';
import {areEqual} from './utility';

@inject(WebAPI, EventAggregator)
export class ContactDetail {
  constructor(api, ea){
    this.api = api;
    this.ea = ea;
  }

  activate(params, routeConfig) {
    this.routeConfig = routeConfig;

    return this.api.getContactDetails(params.id).then(contact => {
      this.contact = contact;
      this.routeConfig.navModel.setTitle(contact.firstName);
      this.originalContact = JSON.parse(JSON.stringify(contact));
      
      this.ea.publish(new ContactViewed(this.contact));
    });
  }

  get canSave() {
    return this.contact.firstName && this.contact.lastName && !this.api.isRequesting;
  }

  //función para actualizar contactos
  save() {
    this.api.saveContact(this.contact).then(contact => {
      this.contact = contact;
      this.routeConfig.navModel.setTitle(contact.firstName);
      this.originalContact = JSON.parse(JSON.stringify(contact));
      this.ea.publish(new ContactUpdated(this.contact));
    });
  }

  //función para eliminar contactos
  delete() {
    this.api.deleteContact(this.contact).then(contact => {
      this.contact = contact;
      this.routeConfig.navModel.setTitle(contact.firstName);
      this.originalContact = JSON.parse(JSON.stringify(contact));
      this.ea.publish(new ContactUpdated(this.contact));
    });
  }

  //función para agregar contactos
  add()
  {
    console.log(JSON.stringify(this.contact));
    this.api.addContact(this.contact).then(contact => {
      this.contact = contact;
      this.routeConfig.navModel.setTitle(contact.firstName);
      this.ea.publish(new ContactUpdated(this.contact));
    });
  }


  canDeactivate() {
    if(!areEqual(this.originalContact, this.contact)){
      let result = confirm('Hay cambios sin guardar, seguro que desea salir?');

      if(!result) {
        this.ea.publish(new ContactViewed(this.contact));
      }

      return result;
    }

    return true;
  }
}
