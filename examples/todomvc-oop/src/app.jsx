import * as inversify from 'inversify';
import { Provider, ChangeNotification } from 'react-inversify';

import TodoListView from './todoListView.jsx';
import { Todos } from './model';
import * as React from 'react';
import * as ReactDOM from 'react-dom';


var changeNotification = new ChangeNotification();
var todos = new Todos(changeNotification.post);
todos.add("asas");
var container = new inversify.Container();
container.bind(Todos.TypeTag).toConstantValue(todos);

ReactDOM.render(
    <Provider container={container} changeNotification={changeNotification}>
        <TodoListView />
    </Provider>,
    document.getElementById('todoapp')
);
