# What's react-inversify
react-inversify delivers objects from your inversify container to your React components. Additionally (and that's important part) react-inversify provides ways to map component's dependencies to React props and to trigger re-mapping from model objects. It enables use of React as UI layer and have object-oriented decomposition on layers below. react-inversify can be used with TypeScript.

# Installation
``npm install react-inversify --save``

# Usage
1. In your React components
```javascript
import * as React from 'react';
import * as inversify from 'inversify';
import { Todos } from "./model";
import { connect } from 'react-inversify';

// Declare a class that will hold the dependencies of the React component
class Dependencies {
    constructor(todos) {
        this.todos = todos;
    }
}

// Tell inversify how to resolve Dependencies's constructor arguments.
// Note: in TypeScript this job is done nicer with decorators.
inversify.decorate(inversify.injectable(), Dependencies);
inversify.decorate(inversify.inject(Todos.TypeTag), Dependencies, 0);

class TodoItemView extends React.Component {
    // ... use this.props.checked,  this.props.text, etc. All these calculated by code below.
}

// Use react-inversify's connect() to tie together view's class (TodoItemView), 
// information about dependencies, and React properties that parent component could pass down.
// The first connects()'s argument is the type decscribing the dependencies.
// The second argument is a mapping function with two arguments:
//   deps - instance of class Dependencies.
//   ownProps - optional argument that holds whatever parent component passed as React properties.
// Mapping function returns final properties TodoItemView's properties.
export default connect(Dependencies, (deps, ownProps) => ({
    checked: ownProps.item.isChecked(),
    text: ownProps.item.getText(),
    todos: deps.todos,
    item: ownProps.item
}))(TodoItemView);
```

2. In the app's [composition root](https://stackoverflow.com/questions/6277771/what-is-a-composition-root-in-the-context-of-dependency-injection) add ``<Provider>`` element near the root of the React tree.
```javascript
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as inversify from 'inversify';
import { Provider, ChangeNotification } from 'react-inversify';

var container = new inversify.Container(); // your DI container
var changeNotification = new ChangeNotification(); // handles changes in model objects
// ...
// full up the container with model objects/classes.
// pass changeNotification.post function to objects that want to notify UI about data changes.

ReactDOM.render(
    // <Provider> enables use of connect()-ed React components in the React tree.
    // changeNotification enables triggering of properties remapping when the model changes.
    <Provider container={container} changeNotification={changeNotification}>
        <TodoListView />
    </Provider>,
    document.getElementById('app')
);
```

3. Fire change notification in model objects that hold data exposed to UI layer
```javascript
export class Todos {
    // obtain reference to change notification function
    constructor (changeNotification) {
        this._changeNotification = changeNotification;
        ...
    }

    delete(item) {
        this._items = this._items.filter(i => i !== item);
        // fire the change notification to trigger props remapping for connect()-ed components
        this._changeNotification();
    }
```

# Why react-inversify?
react-inversify connects two good ideas: 
1. object-oriented application design (OOD)
2. one-directional data flow model->view used in React/Flux

OOD does not need advocating. It's been a default way of thinking for decades in the mainstream languages like Java, C++, C#. One of the reasons why OOD is not wide-spread in JavaScript is difficulties with integration of it with React UI framework. react-inversify offers such integration.

Object-oriented application architectire might look like this
![diagram](https://raw.githubusercontent.com/sergey-su/react-inversify/master/doc/react-inversify.png "OOD runtime diagram")

Circles are objects. Arrows represent "uses at runtime" relation. Dotted arrows are callback. Arrows are set up by Dependency Injection, manual or automated. Arrows from views below are wired by react-inversify. The technologies of model and presentation layers are up to you. These could be plain JS classes. Presentation objects are optional. These objects are P in [MVP](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93presenter) model.
