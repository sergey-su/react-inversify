// this needs to be imported to enable access to decorators metadata at runtime 
import "reflect-metadata";

// use and (re)export DI decorators from inversify.
import { injectable, inject, interfaces, Container, decorate } from "inversify";
export { injectable, inject, Container, decorate } from "inversify";

// redux.
// note: redux is not exposed by this module, it's implementation detail
import { connect as reduxConnect, Provider as ReduxProvider, Store as ReduxStore, createProvider as createReduxProvider } from "react-redux";
import { createStore, Action } from "redux";

import * as React from 'react';

export { ChangeNotification, ChangeNotificationCallback, returntypeof, ReactDIProvider as Provider, connect };

// react-redux typings are missing this advanced function. 
// it has to be declated manually.
declare module "react-redux" {
    export function createProvider(storeKey: string): typeof ReduxProvider;
};

const storeName = "react-di-store";
const ReduxProviderWithCustomName = createReduxProvider(storeName);

type ChangeNotificationCallback = () => void;

class ChangeNotification {
    private _posted: boolean = false;
    private _callbacks: Set<ChangeNotificationCallback> = new Set<ChangeNotificationCallback>();
    
    constructor() {
        this.post = this.post.bind(this);
        this.subscribe = this.subscribe.bind(this);
        this.unsubsribe = this.unsubsribe.bind(this);
    }

    post(): void {
        if (!this._posted) {
            this._posted = true;
            setTimeout(this._notifyAll.bind(this), 0);
        }
    }

    subscribe(fn: ChangeNotificationCallback) {
        this._callbacks.add(fn);
    }

    unsubsribe(fn: ChangeNotificationCallback): void {
        this._callbacks.delete(fn);
    }

    private _notifyAll(): void {
        this._posted = false;
        this._callbacks.forEach(i => i());
    }
};

/**
 * The schema of {@see ReactDIProvider} component
 */
interface ProviderProps {
    /**
     * Container with dependencies to be injected to children react components
     */
    container: Container;
    /**
     * Optional notifications source that lets children react components know
     * when to re-map dependencies to props
     */
    changeNotification?: ChangeNotification;
}

/**
 * Returns an empty object having the type of function's return value
 * @param func A function object
 */
function returntypeof<T>(func: (...params: any[]) => T): T { return {} as T; }

class ReduxState {
    container: Container;
    counter: number;
}

function createReduxReducer(container: Container) {    
    return function (state: ReduxState, action: Action) {
        return { container, counter: state === undefined ? 0 : state.counter + 1 };
    }
}

/**
 * Provides react context needed for {@see connect} function to work in children components
 */
class ReactDIProvider extends React.Component<ProviderProps, {}> {  
    readonly _store: ReduxStore<ReduxState>;
    _subscribed: boolean = false;

    constructor(props: ProviderProps) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this._store = createStore(createReduxReducer(props.container));
    }
  
    componentDidMount(): void {
        if (this.props.changeNotification) {
            this._subscribed = true;
            this.props.changeNotification.subscribe(this.handleChange);
        }
    }

    componentWillUnmount(): void {
        if (this._subscribed && this.props.changeNotification)  {
            this.props.changeNotification.unsubsribe(this.handleChange);
            this._subscribed = false;
        }
    }

    render() {
        return <ReduxProviderWithCustomName store={this._store}>{this.props.children}</ReduxProviderWithCustomName>;
    }

    handleChange() {
        this._store.dispatch({type: "reactDI.changeState"});
    }
}

/**
 * Connects a React component to its depenencies.
 * @param depsType Type describing component's dependencies. It must be a class decorator with @injectable. The class must have conctructor with paremeters decorated by @inject.
 * @param depsToProps Function that maps component's depenencies to component's properties. This function is called each time Provider gets a change notification. Object returned by this function is shallow-compared to that returned previously. The component is re-rendered only if the comparision detects a difference.
 */
function connect<Deps, TDepsProps, TOwnProps = {}>(
    depsType: interfaces.Newable<Deps>, 
    depsToProps: (deps: Deps, ownProps: TOwnProps) => TDepsProps
)
{
    let lazyDeps: Deps | undefined;
    return reduxConnect((state: ReduxState, ownProps: TOwnProps) => {
        lazyDeps = lazyDeps || state.container.resolve(depsType);
        const props: TDepsProps = depsToProps(lazyDeps, ownProps);
        return props;
    }, undefined, undefined, {storeKey: storeName});
}
