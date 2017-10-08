import * as React from 'react';
import * as inversify from 'inversify';
import { Todos } from "./model";
import { connect } from 'react-inversify';
import TodoItemView from './todoItemView.jsx';

class Dependencies {
    constructor(todos) {
        this.todos = todos;
    }
}

inversify.decorate(inversify.injectable(), Dependencies);
inversify.decorate(inversify.inject(Todos.TypeTag), Dependencies, 0);

class TodoListView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            newTodoText: ""
        };
        this.handleNewTodoTextChange = this.handleNewTodoTextChange.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleDeleteCompleted = this.handleDeleteCompleted.bind(this);
    }

    handleNewTodoTextChange (event) {
		this.setState({newTodoText: event.target.value});
	};
    
    handleKeyDown (event) {
	    var ENTER_KEY = 13;        
        if (event.which === ENTER_KEY) {
            var txt = this.state.newTodoText.trim();
            if (txt != '') {
                this.props.todos.add(this.state.newTodoText);
                this.setState({newTodoText: ''});
            }
        }
    }

    handleDeleteCompleted(event) {
        event.preventDefault();
        this.props.todos.deleteCompleted();
    }
    
    render() {
        var list;
        if (this.props.items.size == 0)
            list = <center>No todos</center>;
        else
            list = <ul>
                {this.props.items.map(i => <TodoItemView key={i.getId()} item={i}/>)}
            </ul>;
        var deleteCompleted = undefined;
        if (this.props.hasCompleted)
            deleteCompleted = <a href='#' onClick={this.handleDeleteCompleted}>Delete completed</a>;
        return <div className='todos'>
            {list}
            <input 
                placeholder='enter new todo'
                value={this.state.newTodoText} 
                onChange={this.handleNewTodoTextChange}
                onKeyDown={this.handleKeyDown}/>
            <footer>
                {deleteCompleted}
            </footer>
        </div>;
    }
}

export default connect(Dependencies, deps => ({
    items: deps.todos.getItems(),
    todos: deps.todos,
    hasCompleted: deps.todos.getItems().reduce((f, i) => f || i.isChecked(), false)
}))(TodoListView);