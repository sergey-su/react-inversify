import * as Immutable from 'immutable';

export class Todo {
    constructor (id, changeNotification, text) {
        this._id = id;
        this._changeNotification = changeNotification;
        this._checked = false;
        this._text = text;
          
        this.toggle = this.toggle.bind(this);
    }

    toggle() {
        this._checked = !this._checked;
        this._changeNotification();
    }

    setText(value) {
        this._text = value;
        this._changeNotification();
    }

    getId() {
        return this._id;
    }

    isChecked() {
        return this._checked;
    }

    getText() {
        return this._text;
    }    
}

export class Todos {
    constructor (changeNotification) {
        this._changeNotification = changeNotification;
        this._items = new Immutable.List();
        this._lastId = 0;
    }

    static TypeTag = Symbol();

    add(text) {
        this._items = this._items.push(new Todo(
            (++this._lastId).toString(), this._changeNotification, text));
        this._changeNotification();
    }

    getItems() {
        return this._items;
    }

    delete(item) {
        this._items = this._items.filter(i => i !== item);
        this._changeNotification();
    }

    deleteCompleted() {
        this._items = this._items.filter(i => !i.isChecked());
        this._changeNotification();
    }
}