import * as React from 'react';
import { findDOMNode } from 'react-dom';
import * as inversify from 'inversify';
import { Todos } from "./model";
import { connect } from 'react-inversify';

class Dependencies {
    constructor(todos) {
        this.todos = todos;
    }
}

inversify.decorate(inversify.injectable(), Dependencies);
inversify.decorate(inversify.inject(Todos.TypeTag), Dependencies, 0);

class TodoItemView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editText: undefined
        };
        this.handleEdit = this.handleEdit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleToggle = this.handleToggle.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
    }

    handleChange (event) {
		this.setState({editText: event.target.value});
	};

    handleToggle (event) {
        event.preventDefault();
		this.props.item.toggle();
    };
    
    handleEdit(event) {
        event.preventDefault();
        this.setState({ editText: this.props.text });
    }

    componentDidUpdate (prevProps, prevState) {
        if (prevState.editText === undefined && this.state.editText !== undefined) {
            var node = findDOMNode(this.refs.editInput);
            node.focus();
            node.setSelectionRange(node.value.length, node.value.length);
        }
    }

    handleBlur() {
        this.handleSubmit();
    }

    handleKeyDown (event) {
        var ESCAPE_KEY = 27;
	    var ENTER_KEY = 13;        
        if (event.which === ESCAPE_KEY) {
            this.setState({editText: undefined});
        } else if (event.which === ENTER_KEY) {
            this.handleSubmit();
        }
    }
    
    handleSubmit() {
        var txt = this.state.editText.trim();
        if (txt == '')
            this.props.todos.delete(this.props.item);
        else
            this.props.item.setText(txt);
        this.setState({editText: undefined});
    }

    handleDelete() {
        this.props.todos.delete(this.props.item);
    }

    render() {
        if (this.state.editText !== undefined) {
            return <li>
                <input type='text' value={this.state.editText} ref='editInput'
                    onChange={this.handleChange} onBlur={this.handleBlur} onKeyDown={this.handleKeyDown}/>
            </li>;
        }
        return <li>
            <label>
                <input type='checkbox' title='mark as completed' checked={this.props.checked} onChange={this.handleToggle}/>
                {this.props.text}
            </label>
            <a href='#' title='edit todo text' onClick={this.handleEdit}>✎</a>
            <a href='#' title='delete this todo' onClick={this.handleDelete}>×</a>
        </li>;
    }
}

export default connect(Dependencies, (deps, ownProps) => ({
    checked: ownProps.item.isChecked(),
    text: ownProps.item.getText(),
    todos: deps.todos,
    item: ownProps.item
}))(TodoItemView);