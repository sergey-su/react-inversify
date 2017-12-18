import { connect, Provider, returntypeof, ChangeNotification } from '../src/index';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {injectable, inject, Container } from 'inversify';
import * as renderer from 'react-test-renderer';


const ChangeNotificationTag = Symbol("ChangeNotification");

@injectable() class Dep1 {
    constructor (public readonly val: string) {}
    public static readonly Tag = Symbol("Dep1");
};

@injectable() class Dep2 {
    public val: string;

    constructor (
        @inject(Dep1.Tag) d: Dep1, 
        @inject(ChangeNotificationTag) private _change: ChangeNotification
    ) {
        this.val = `dep2(${d.val})`; 
    }
    public changeValue() {
        this.val += ' (changed)';
        this._change.post();
    }

    public static readonly Tag = Symbol("Dep2");
};

@injectable() class Deps {
    constructor(
        @inject(Dep1.Tag) public readonly dep1: Dep1,
        @inject(Dep2.Tag) public readonly dep2: Dep2
    ) {}
}


test('<Provider/> delivers dependencies', () => {
    const mapDepsToProps = (deps: Deps) => ({
        dep1prop: deps.dep1.val,
        dep2prop: deps.dep2.val
    });
    const DepsProps = returntypeof(mapDepsToProps);
    
    class MyComponent extends React.Component<typeof DepsProps>  {
        render() {
            return `dep1prop=${this.props.dep1prop}, dep2prop=${this.props.dep2prop}`;
        }
    }
    const MyComponentConnected = connect(Deps, mapDepsToProps)(MyComponent);
        
    const container = new Container();
    container.bind(Dep1.Tag).toConstantValue(new Dep1("foo"));
    container.bind(Dep2.Tag).to(Dep2);
    container.bind(ChangeNotificationTag).toConstantValue(new ChangeNotification());
    
    expect(renderer.create(
        <Provider container={container} changeNotification={container.get(ChangeNotificationTag)}>
            <MyComponentConnected/>
        </Provider>,    
    ).toJSON()).toBe("dep1prop=foo, dep2prop=dep2(foo)");
});


test('<Provider/> delivers dependencies keeping own component properties', () => {
    interface OwnProps {
        x: string;
    };
    
    const mapDepsToProps = (deps: Deps, ownProps: OwnProps) => ({
        dep1prop: deps.dep1.val,
        dep2prop: deps.dep2.val
    });
    const DepsProps = returntypeof(mapDepsToProps);
    
    class MyComponent extends React.Component<OwnProps & typeof DepsProps>  {
        render() {
            return `x=${this.props.x}, dep1prop=${this.props.dep1prop}, dep2prop=${this.props.dep2prop}`;
        }
    }
    const MyComponentConnected = connect(Deps, mapDepsToProps)(MyComponent);
        
    const container = new Container();
    container.bind(Dep1.Tag).toConstantValue(new Dep1("foo"));
    container.bind(Dep2.Tag).to(Dep2);
    container.bind(ChangeNotificationTag).toConstantValue(new ChangeNotification());
    
    expect(renderer.create(
        <Provider container={container} changeNotification={container.get(ChangeNotificationTag)}>
            <MyComponentConnected x={"bar"}/>
        </Provider>,    
    ).toJSON()).toBe("x=bar, dep1prop=foo, dep2prop=dep2(foo)");
});

@injectable() class DepsAsProps {
    dep1str: string;

    constructor(
        @inject(Dep1.Tag) public readonly dep1: Dep1
    ) {
        this.dep1str = dep1.val;
    }
}

test('one can use Deps type as props', () => {
    class MyComponent extends React.Component<DepsAsProps>  {
        render() {
            return `dep1str=${this.props.dep1str}`;
        }
    }
    const MyComponentConnected = connect(DepsAsProps)(MyComponent);

    const container = new Container();
    container.bind(Dep1.Tag).toConstantValue(new Dep1("foo"));
    container.bind(ChangeNotificationTag).toConstantValue(new ChangeNotification());

    expect(renderer.create(
        <Provider container={container} changeNotification={container.get(ChangeNotificationTag)}>
            <MyComponentConnected />
        </Provider>,
    ).toJSON()).toBe("dep1str=foo");
});

test('one can use Deps type as props in addition to own props', () => {
    interface OwnProps {
        x: string;
    };

    class MyComponent extends React.Component<DepsAsProps & OwnProps>  {
        render() {
            return `x=${this.props.x}, dep1str=${this.props.dep1str}`;
        }
    }
    const MyComponentConnected = connect(DepsAsProps)(MyComponent);

    const container = new Container();
    container.bind(Dep1.Tag).toConstantValue(new Dep1("foo"));
    container.bind(ChangeNotificationTag).toConstantValue(new ChangeNotification());
    
    expect(renderer.create(
        <Provider container={container} changeNotification={container.get(ChangeNotificationTag)}>
            <MyComponentConnected x={"bar"}/>
        </Provider>,
    ).toJSON()).toBe("x=bar, dep1str=foo");
});
