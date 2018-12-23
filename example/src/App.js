import React, { Component } from 'react';
import Tree from 'rc-fastree';

class App extends Component {
  state = {
    tree: [],
    count: [100, 10000]
  }
  componentWillMount() {
    const root = { name: 'tree' }
    this.parseTreeChildren(root, 0)
    console.log(root)
    this.state.tree = [root]
  }

  parseTreeChildren(parent, deep) {
    const { count } = this.state
    parent.children = []
    const isLeaf = (count.length - 1) === deep
    for (let i = 0; i < count[deep]; i++) {
      const node = { name: parent.name + '-' + i }
      if (isLeaf) {
        node.leaf = true
      } else {
        this.parseTreeChildren(node, deep + 1)
      }
      parent.children.push(node)
    }
  }

  render() {
    return (
      <div className="App">
        <Tree tree={this.state.tree} defaultSelectKey='tree-2-17' />
      </div>
    );
  }
}

export default App;