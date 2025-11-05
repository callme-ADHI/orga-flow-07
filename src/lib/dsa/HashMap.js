/**
 * HashMap Implementation
 * Used for O(1) lookups of users, tasks, and groups by ID
 */
class HashMap {
  constructor(initialCapacity = 16) {
    this.capacity = initialCapacity
    this.size = 0
    this.buckets = new Array(this.capacity)
    this.loadFactorThreshold = 0.75
  }

  /**
   * Hash function to convert key to index
   * @private
   */
  _hash(key) {
    let hash = 0
    const str = String(key)
    
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i)
      hash = hash & hash // Convert to 32-bit integer
    }
    
    return Math.abs(hash) % this.capacity
  }

  /**
   * Resize the hash map when load factor exceeds threshold
   * @private
   */
  _resize() {
    const oldBuckets = this.buckets
    this.capacity *= 2
    this.buckets = new Array(this.capacity)
    this.size = 0

    // Rehash all entries
    for (const bucket of oldBuckets) {
      if (bucket) {
        for (const [key, value] of bucket) {
          this.set(key, value)
        }
      }
    }
  }

  /**
   * Set a key-value pair
   * @param {string} key
   * @param {*} value
   */
  set(key, value) {
    // Check load factor
    if (this.size / this.capacity > this.loadFactorThreshold) {
      this._resize()
    }

    const index = this._hash(key)
    
    if (!this.buckets[index]) {
      this.buckets[index] = []
    }

    // Check if key already exists
    const bucket = this.buckets[index]
    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i][0] === key) {
        bucket[i][1] = value // Update existing
        return
      }
    }

    // Add new entry
    bucket.push([key, value])
    this.size++
  }

  /**
   * Get value by key
   * @param {string} key
   * @returns {*}
   */
  get(key) {
    const index = this._hash(key)
    const bucket = this.buckets[index]

    if (!bucket) return undefined

    for (const [k, v] of bucket) {
      if (k === key) return v
    }

    return undefined
  }

  /**
   * Check if key exists
   * @param {string} key
   * @returns {boolean}
   */
  has(key) {
    return this.get(key) !== undefined
  }

  /**
   * Delete a key-value pair
   * @param {string} key
   * @returns {boolean}
   */
  delete(key) {
    const index = this._hash(key)
    const bucket = this.buckets[index]

    if (!bucket) return false

    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i][0] === key) {
        bucket.splice(i, 1)
        this.size--
        return true
      }
    }

    return false
  }

  /**
   * Clear all entries
   */
  clear() {
    this.buckets = new Array(this.capacity)
    this.size = 0
  }

  /**
   * Get all keys
   * @returns {string[]}
   */
  keys() {
    const keys = []
    
    for (const bucket of this.buckets) {
      if (bucket) {
        for (const [key] of bucket) {
          keys.push(key)
        }
      }
    }
    
    return keys
  }

  /**
   * Get all values
   * @returns {Array}
   */
  values() {
    const values = []
    
    for (const bucket of this.buckets) {
      if (bucket) {
        for (const [, value] of bucket) {
          values.push(value)
        }
      }
    }
    
    return values
  }

  /**
   * Get all entries as [key, value] pairs
   * @returns {Array}
   */
  entries() {
    const entries = []
    
    for (const bucket of this.buckets) {
      if (bucket) {
        entries.push(...bucket)
      }
    }
    
    return entries
  }

  /**
   * Iterate over all entries
   * @param {Function} callback
   */
  forEach(callback) {
    for (const bucket of this.buckets) {
      if (bucket) {
        for (const [key, value] of bucket) {
          callback(value, key, this)
        }
      }
    }
  }

  /**
   * Get the size
   * @returns {number}
   */
  getSize() {
    return this.size
  }

  /**
   * Check if empty
   * @returns {boolean}
   */
  isEmpty() {
    return this.size === 0
  }

  /**
   * Get load factor
   * @returns {number}
   */
  getLoadFactor() {
    return this.size / this.capacity
  }

  /**
   * Print hash map (for debugging)
   */
  print() {
    console.log(`HashMap (size: ${this.size}, capacity: ${this.capacity})`)
    
    for (let i = 0; i < this.buckets.length; i++) {
      const bucket = this.buckets[i]
      if (bucket && bucket.length > 0) {
        console.log(`Bucket ${i}:`, bucket)
      }
    }
  }

  /**
   * Convert to regular object
   * @returns {Object}
   */
  toObject() {
    const obj = {}
    this.forEach((value, key) => {
      obj[key] = value
    })
    return obj
  }

  /**
   * Convert to JSON
   * @returns {Object}
   */
  toJSON() {
    return this.toObject()
  }

  /**
   * Load from object
   * @param {Object} obj
   */
  fromObject(obj) {
    this.clear()
    for (const [key, value] of Object.entries(obj)) {
      this.set(key, value)
    }
  }
}

/**
 * Specialized HashMaps for Orga
 */

/**
 * UserMap - Fast user lookups by ID
 */
class UserMap extends HashMap {
  /**
   * Add a user
   * @param {Object} user
   */
  addUser(user) {
    this.set(user.id, user)
  }

  /**
   * Get user by ID
   * @param {string} userId
   * @returns {Object|undefined}
   */
  getUser(userId) {
    return this.get(userId)
  }

  /**
   * Update user
   * @param {string} userId
   * @param {Object} updates
   * @returns {boolean}
   */
  updateUser(userId, updates) {
    const user = this.get(userId)
    if (!user) return false
    
    this.set(userId, { ...user, ...updates })
    return true
  }

  /**
   * Get users by role
   * @param {string} role
   * @returns {Array}
   */
  getUsersByRole(role) {
    return this.values().filter(user => user.role === role)
  }

  /**
   * Get users by rank
   * @param {string} rank
   * @returns {Array}
   */
  getUsersByRank(rank) {
    return this.values().filter(user => user.rank === rank)
  }

  /**
   * Get users by org
   * @param {string} orgId
   * @returns {Array}
   */
  getUsersByOrg(orgId) {
    return this.values().filter(user => user.org_id === orgId)
  }
}

/**
 * TaskMap - Fast task lookups by ID
 */
class TaskMap extends HashMap {
  /**
   * Add a task
   * @param {Object} task
   */
  addTask(task) {
    this.set(task.id, task)
  }

  /**
   * Get task by ID
   * @param {string} taskId
   * @returns {Object|undefined}
   */
  getTask(taskId) {
    return this.get(taskId)
  }

  /**
   * Update task
   * @param {string} taskId
   * @param {Object} updates
   * @returns {boolean}
   */
  updateTask(taskId, updates) {
    const task = this.get(taskId)
    if (!task) return false
    
    this.set(taskId, { ...task, ...updates })
    return true
  }

  /**
   * Get tasks by status
   * @param {string} status
   * @returns {Array}
   */
  getTasksByStatus(status) {
    return this.values().filter(task => task.status === status)
  }

  /**
   * Get tasks by assignee
   * @param {string} userId
   * @returns {Array}
   */
  getTasksByAssignee(userId) {
    return this.values().filter(task => task.assigned_to_id === userId)
  }

  /**
   * Get tasks by assigner
   * @param {string} userId
   * @returns {Array}
   */
  getTasksByAssigner(userId) {
    return this.values().filter(task => task.assigned_by === userId)
  }

  /**
   * Get overdue tasks
   * @returns {Array}
   */
  getOverdueTasks() {
    const now = new Date()
    return this.values().filter(task => {
      const dueDate = new Date(task.due_date)
      return dueDate < now && task.status !== 'completed'
    })
  }

  /**
   * Get completed tasks
   * @returns {Array}
   */
  getCompletedTasks() {
    return this.values().filter(task => task.status === 'completed')
  }
}

/**
 * GroupMap - Fast group lookups by ID
 */
class GroupMap extends HashMap {
  /**
   * Add a group
   * @param {Object} group
   */
  addGroup(group) {
    this.set(group.id, group)
  }

  /**
   * Get group by ID
   * @param {string} groupId
   * @returns {Object|undefined}
   */
  getGroup(groupId) {
    return this.get(groupId)
  }

  /**
   * Update group
   * @param {string} groupId
   * @param {Object} updates
   * @returns {boolean}
   */
  updateGroup(groupId, updates) {
    const group = this.get(groupId)
    if (!group) return false
    
    this.set(groupId, { ...group, ...updates })
    return true
  }

  /**
   * Get groups by rank
   * @param {string} rank
   * @returns {Array}
   */
  getGroupsByRank(rank) {
    return this.values().filter(group => group.rank === rank)
  }

  /**
   * Get groups by creator
   * @param {string} userId
   * @returns {Array}
   */
  getGroupsByCreator(userId) {
    return this.values().filter(group => group.created_by === userId)
  }

  /**
   * Get groups by org
   * @param {string} orgId
   * @returns {Array}
   */
  getGroupsByOrg(orgId) {
    return this.values().filter(group => group.org_id === orgId)
  }
}

export { HashMap, UserMap, TaskMap, GroupMap }
export default HashMap