import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import style from './styles.css'

// todo
// 1. 传入指定选中叶子节点，默认展开其所有父节点 done
// 2. 传入指定展开节点列表，默认展开其所有父节点 done
// 3. 大量树节点 渲染性能优化 5K-5W性能测试
// 4. 代码开源、规范组件
// 5. 接入生产系统并调试
console.log(style)
export default class Tree extends PureComponent {
  state = {
    _version: 1,
    showTree: [],
    selectedKey: null,
    expandKeyMap: {}
  }

  componentWillMount() {
    const { defaultSelectKey, defaultExpandKeys, key, tree } = this.props
    if (defaultSelectKey) {
      this.parseExpanededKeys(defaultSelectKey, key, tree, true)
      this.state.selectedKey = defaultSelectKey
    }
    defaultExpandKeys && defaultExpandKeys.length > 0 && defaultExpandKeys.map(k => this.parseExpanededKeys(k, key, tree))
    console.log(this.state.expandKeyMap)
  }

  parseExpanededKeys(key, keyName, tree, isSelect) {
    for (const t of tree) {
      const k = t[keyName]
      if (k === key) {
        isSelect || (this.state.expandKeyMap[k] = false)
        return true
      } else if (t.children && t.children.length > 0) {
        if (this.parseExpanededKeys(key, keyName, t.children, isSelect)) {
          this.state.expandKeyMap[k] = false
          return true
        }
      }
    }
    return false
  }

  update() {
    this.setState({ _version: this.state._version + 1 })
  }

  onExpand(expandKeyMap, node, k, expanded) {
    const { onExpanding } = this.props
    if (expanded) {
      delete expandKeyMap[k]
      this.update()
      return
    }
    if (onExpanding) {
      expandKeyMap[k] = true
      onExpanding(k, !expanded, node, expandKeyMap).then((children) => {
        this.state.expandKeyMap[k] = false
        children && (node.children = children)
        this.update()
      })
      this.state.expandKeyMap[k] === true && this.update()
    }
  }

  onSelect(key, node) {
    const { onSelected } = this.props
    const cancel = this.state.selectedKey === key
    onSelected && onSelected(key, cancel, node)
    cancel ? this.setState({ selectedKey: null }) : this.setState({ selectedKey: key })
  }

  renderNode(node) {
    const { expandKeyMap, selectedKey } = this.state
    const { key, selectKey } = this.props
    const k = node[key]
    const selected = selectKey ? (k === selectKey) : (k === selectedKey)
    let n = node.render ? node.render(node, selected) : <div>{node.name || ''}</div>
    const expanded = expandKeyMap.hasOwnProperty(k)
    const expanding = expandKeyMap[k]
    return (
      <div key={k} className={node.leaf ? style.leaf : style.node}>
        {node.leaf || this.renderExpand(expanded, expanding, () => this.onExpand(expandKeyMap, node, k, expanded))}
        <div className={[style.content, (selected ? style.selected : '')].join(' ')} onClick={() => this.onSelect(k, node)}>{n}</div>
        {expanded && !expanding && node.children && node.children.map(c => this.renderNode(c))}
      </div >
    )
  }

  renderExpand(expanded, expanding, click) {
    return (
      expanding
        ? <div className={style.loading} />
        : <div className={[style.dropdown, (expanded ? style.expanded : '')].join(' ')} onClick={click} />
    )
  }

  render() {
    const { tree } = this.props
    return (
      <div>
        {tree.map(t => this.renderNode(t))}
      </div>
    )
  }
}

Tree.propTypes = {
  tree: PropTypes.arrayOf(PropTypes.object), // 树型结构数据
  key: PropTypes.string, // key属性名称
  selectKey: PropTypes.string, // 强制选中节点KEY
  defaultSelectKey: PropTypes.string, // 初始化时选中的树节点
  defaultExpandKeys: PropTypes.array, // 初始化时展开的树节点列表
  onExpanding: PropTypes.func, // 树展开时的回调-函数返回值为Promise,res若返回数据，则视为子节点并加至选中节点下
  onSelected: PropTypes.func // 树选中时的回调
}

Tree.defaultProps = {
  key: 'name',
  defaultSelectKey: '22',
  tree: [
    {
      name: '1', children: [{ name: '11', leaf: true }, { name: '12', leaf: true }]
    }, {
      name: '2',
      children: [
        { name: '21', leaf: true },
        { name: '22', children: [{ name: '221', leaf: true }, { name: '222', leaf: true }] }
      ]
    }
  ],
  selectStyle: { backgroundColor: '#bae7ff' },
  onExpanding: (key, expanded, node, keys) => new Promise((resolve, reject) => {
    resolve()
  }),
  onSelected: (key, cancel, node) => console.log(key, cancel, node)
}
