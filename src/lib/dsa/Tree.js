/**
 * Tree Node Class
 * Represents a single node in the organization hierarchy
 */
class TreeNode {
  constructor(id, data = {}) {
    this.id = id
    this.data = data // { name, role, rank, email, etc. }
    this.children = [] // Array of child nodes
    this.parent = null // Reference to parent node
  }

  /**
   * Add a child node
   * @param {TreeNode} node - Child node to add
   */
  addChild(node) {
    if (node instanceof TreeNode) {
      node.parent = this
      this.children.push(node)
    } else {
      throw new Error('Child must be a TreeNode instance')
    }
  }

  /**
   * Remove a child node by ID
   * @param {string} nodeId - ID of the child to remove
   * @returns {boolean} - True if removed, false if not found
   */
  removeChild(nodeId) {
    const index = this.children.findIndex(child => child.id === nodeId)
    if (index !== -1) {
      this.children[index].parent = null
      this.children.splice(index, 1)
      return true
    }
    return false
  }

  /**
   * Check if this node has any children
   * @returns {boolean}
   */
  hasChildren() {
    return this.children.length > 0
  }

  /**
   * Get all children IDs
   * @returns {string[]}
   */
  getChildrenIds() {
    return this.children.map(child => child.id)
  }

  /**
   * Find a child by ID
   * @param {string} nodeId
   * @returns {TreeNode|null}
   */
  findChild(nodeId) {
    return this.children.find(child => child.id === nodeId) || null
  }
}

/**
 * Organization Tree Class
 * Manages the entire organizational hierarchy
 */
class OrgTree {
  constructor() {
    this.root = null // CEO node
    this.nodeMap = new Map() // HashMap for O(1) lookups: id -> node
  }

  /**
   * Set the root node (CEO)
   * @param {string} id
   * @param {Object} data
   */
  setRoot(id, data) {
    this.root = new TreeNode(id, { ...data, role: 'CEO' })
    this.nodeMap.set(id, this.root)
  }

  /**
   * Add a node to the tree
   * @param {string} id
   * @param {Object} data
   * @param {string} parentId
   * @returns {TreeNode|null}
   */
  addNode(id, data, parentId) {
    if (!this.root) {
      throw new Error('Root node (CEO) must be set first')
    }

    if (this.nodeMap.has(id)) {
      throw new Error(`Node with ID ${id} already exists`)
    }

    const parent = this.nodeMap.get(parentId)
    if (!parent) {
      throw new Error(`Parent node with ID ${parentId} not found`)
    }

    const newNode = new TreeNode(id, data)
    parent.addChild(newNode)
    this.nodeMap.set(id, newNode)
    
    return newNode
  }

  /**
   * Remove a node and all its descendants
   * @param {string} nodeId
   * @returns {boolean}
   */
  removeNode(nodeId) {
    if (nodeId === this.root?.id) {
      throw new Error('Cannot remove root node (CEO)')
    }

    const node = this.nodeMap.get(nodeId)
    if (!node) return false

    // Remove from parent's children
    if (node.parent) {
      node.parent.removeChild(nodeId)
    }

    // Remove this node and all descendants from nodeMap
    this._removeNodeRecursive(node)
    
    return true
  }

  /**
   * Helper: Recursively remove node and descendants
   * @private
   */
  _removeNodeRecursive(node) {
    // Remove all children first
    for (const child of node.children) {
      this._removeNodeRecursive(child)
    }
    
    // Remove this node
    this.nodeMap.delete(node.id)
  }

  /**
   * Get a node by ID
   * @param {string} nodeId
   * @returns {TreeNode|null}
   */
  getNode(nodeId) {
    return this.nodeMap.get(nodeId) || null
  }

  /**
   * Get all nodes with a specific role
   * @param {string} role - 'CEO', 'Manager', or 'Employee'
   * @returns {TreeNode[]}
   */
  getNodesByRole(role) {
    const nodes = []
    for (const node of this.nodeMap.values()) {
      if (node.data.role === role) {
        nodes.push(node)
      }
    }
    return nodes
  }

  /**
   * Get all nodes with a specific rank
   * @param {string} rank - 'S', 'A', 'B', 'C', 'D', or 'E'
   * @returns {TreeNode[]}
   */
  getNodesByRank(rank) {
    const nodes = []
    for (const node of this.nodeMap.values()) {
      if (node.data.rank === rank) {
        nodes.push(node)
      }
    }
    return nodes
  }

  /**
   * Get all employees under a manager
   * @param {string} managerId
   * @returns {TreeNode[]}
   */
  getEmployeesUnderManager(managerId) {
    const manager = this.nodeMap.get(managerId)
    if (!manager) return []
    
    return manager.children.filter(node => node.data.role === 'Employee')
  }

  /**
   * Depth-First Search traversal
   * @param {Function} callback - Function to call on each node
   * @param {TreeNode} startNode - Node to start from (default: root)
   */
  dfs(callback, startNode = null) {
    const start = startNode || this.root
    if (!start) return

    const stack = [start]
    const visited = new Set()

    while (stack.length > 0) {
      const node = stack.pop()
      
      if (visited.has(node.id)) continue
      visited.add(node.id)
      
      callback(node)
      
      // Add children to stack (in reverse order for proper DFS)
      for (let i = node.children.length - 1; i >= 0; i--) {
        stack.push(node.children[i])
      }
    }
  }

  /**
   * Breadth-First Search traversal
   * @param {Function} callback - Function to call on each node
   * @param {TreeNode} startNode - Node to start from (default: root)
   */
  bfs(callback, startNode = null) {
    const start = startNode || this.root
    if (!start) return

    const queue = [start]
    const visited = new Set()

    while (queue.length > 0) {
      const node = queue.shift()
      
      if (visited.has(node.id)) continue
      visited.add(node.id)
      
      callback(node)
      
      // Add all children to queue
      queue.push(...node.children)
    }
  }

  /**
   * Get the path from root to a specific node
   * @param {string} nodeId
   * @returns {TreeNode[]}
   */
  getPathToNode(nodeId) {
    const node = this.nodeMap.get(nodeId)
    if (!node) return []

    const path = []
    let current = node

    while (current) {
      path.unshift(current)
      current = current.parent
    }

    return path
  }

  /**
   * Get the depth of a node (distance from root)
   * @param {string} nodeId
   * @returns {number}
   */
  getNodeDepth(nodeId) {
    const path = this.getPathToNode(nodeId)
    return path.length - 1 // Subtract 1 because root is depth 0
  }

  /**
   * Get all nodes at a specific depth level
   * @param {number} depth
   * @returns {TreeNode[]}
   */
  getNodesAtDepth(depth) {
    const nodes = []
    
    this.bfs((node) => {
      const nodeDepth = this.getNodeDepth(node.id)
      if (nodeDepth === depth) {
        nodes.push(node)
      }
    })
    
    return nodes
  }

  /**
   * Count total nodes in the tree
   * @returns {number}
   */
  getNodeCount() {
    return this.nodeMap.size
  }

  /**
   * Get tree height (maximum depth)
   * @returns {number}
   */
  getHeight() {
    let maxDepth = 0
    
    this.dfs((node) => {
      const depth = this.getNodeDepth(node.id)
      maxDepth = Math.max(maxDepth, depth)
    })
    
    return maxDepth
  }

  /**
   * Convert tree to JSON for serialization
   * @returns {Object}
   */
  toJSON() {
    if (!this.root) return null

    const serialize = (node) => ({
      id: node.id,
      data: node.data,
      children: node.children.map(child => serialize(child))
    })

    return serialize(this.root)
  }

  /**
   * Build tree from JSON
   * @param {Object} json
   */
  fromJSON(json) {
    if (!json) return

    const deserialize = (nodeData, parent = null) => {
      const node = new TreeNode(nodeData.id, nodeData.data)
      this.nodeMap.set(node.id, node)
      
      if (parent) {
        parent.addChild(node)
      }
      
      for (const childData of nodeData.children || []) {
        deserialize(childData, node)
      }
      
      return node
    }

    this.root = deserialize(json)
  }

  /**
   * Print tree structure (for debugging)
   * @param {TreeNode} node
   * @param {string} prefix
   * @param {boolean} isLast
   */
  printTree(node = null, prefix = '', isLast = true) {
    const current = node || this.root
    if (!current) return

    console.log(
      prefix + 
      (isLast ? '└── ' : '├── ') + 
      `${current.data.name} (${current.data.role}${current.data.rank ? ` - Rank ${current.data.rank}` : ''})`
    )

    const children = current.children
    for (let i = 0; i < children.length; i++) {
      const child = children[i]
      const newPrefix = prefix + (isLast ? '    ' : '│   ')
      this.printTree(child, newPrefix, i === children.length - 1)
    }
  }

  /**
   * Clear the entire tree
   */
  clear() {
    this.root = null
    this.nodeMap.clear()
  }
}

export { TreeNode, OrgTree }
export default OrgTree