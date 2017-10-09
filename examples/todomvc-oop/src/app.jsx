import * as inversify from 'inversify';
import { Provider, ChangeNotification } from 'react-inversify';

import TodoListView from './todoListView.jsx';
import { Todos } from './model';
import * as React from 'react';
import * as ReactDOM from 'react-dom';


// manual depenedency injection for model objects
var changeNotification = new ChangeNotification();
var todos = new Todos(changeNotification.post);

// use container to deliver dependencies to UI
var container = new inversify.Container();
container.bind(Todos.TypeTag).toConstantValue(todos);

// test data
todos.add("learn encapsulation");
todos.add("learn React");
todos.add("internalize SOLID");

ReactDOM.render(
    <Provider container={container} changeNotification={changeNotification}>
        <TodoListView />
    </Provider>,
    document.getElementById('todoapp')
);
