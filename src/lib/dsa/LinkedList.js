/**
 * Node class for LinkedList
 * Represents a single task in the task chain
 */
class TaskNode {
  constructor(data) {
    this.data = data // { id, title, description, dueDate, status, priority, etc. }
    this.next = null
    this.prev = null // For doubly linked list
  }
}

/**
 * Doubly Linked List for Task Management
 * Allows efficient traversal in both directions
 */
class TaskLinkedList {
  constructor() {
    this.head = null
    this.tail = null
    this.size = 0
  }

  /**
   * Add a task to the end of the list
   * @param {Object} taskData
   * @returns {TaskNode}
   */
  append(taskData) {
    const newNode = new TaskNode(taskData)

    if (!this.head) {
      this.head = newNode
      this.tail = newNode
    } else {
      newNode.prev = this.tail
      this.tail.next = newNode
      this.tail = newNode
    }

    this.size++
    return newNode
  }

  /**
   * Add a task to the beginning of the list
   * @param {Object} taskData
   * @returns {TaskNode}
   */
  prepend(taskData) {
    const newNode = new TaskNode(taskData)

    if (!this.head) {
      this.head = newNode
      this.tail = newNode
    } else {
      newNode.next = this.head
      this.head.prev = newNode
      this.head = newNode
    }

    this.size++
    return newNode
  }

  /**
   * Insert a task at a specific position
   * @param {Object} taskData
   * @param {number} index
   * @returns {TaskNode|null}
   */
  insertAt(taskData, index) {
    if (index < 0 || index > this.size) {
      return null
    }

    if (index === 0) {
      return this.prepend(taskData)
    }

    if (index === this.size) {
      return this.append(taskData)
    }

    const newNode = new TaskNode(taskData)
    let current = this.head
    let currentIndex = 0

    while (currentIndex < index) {
      current = current.next
      currentIndex++
    }

    newNode.prev = current.prev
    newNode.next = current
    current.prev.next = newNode
    current.prev = newNode

    this.size++
    return newNode
  }

  /**
   * Remove a task by ID
   * @param {string} taskId
   * @returns {boolean}
   */
  remove(taskId) {
    if (!this.head) return false

    let current = this.head

    while (current) {
      if (current.data.id === taskId) {
        // Update links
        if (current.prev) {
          current.prev.next = current.next
        } else {
          // Removing head
          this.head = current.next
        }

        if (current.next) {
          current.next.prev = current.prev
        } else {
          // Removing tail
          this.tail = current.prev
        }

        this.size--
        return true
      }
      current = current.next
    }

    return false
  }

  /**
   * Remove task at a specific index
   * @param {number} index
   * @returns {Object|null}
   */
  removeAt(index) {
    if (index < 0 || index >= this.size) {
      return null
    }

    let current = this.head
    let currentIndex = 0

    if (index === 0) {
      const data = this.head.data
      this.head = this.head.next
      if (this.head) {
        this.head.prev = null
      } else {
        this.tail = null
      }
      this.size--
      return data
    }

    while (currentIndex < index) {
      current = current.next
      currentIndex++
    }

    const data = current.data

    if (current.prev) {
      current.prev.next = current.next
    }

    if (current.next) {
      current.next.prev = current.prev
    } else {
      this.tail = current.prev
    }

    this.size--
    return data
  }

  /**
   * Find a task by ID
   * @param {string} taskId
   * @returns {Object|null}
   */
  find(taskId) {
    let current = this.head

    while (current) {
      if (current.data.id === taskId) {
        return current.data
      }
      current = current.next
    }

    return null
  }

  /**
   * Find task by a custom condition
   * @param {Function} predicate
   * @returns {Object|null}
   */
  findBy(predicate) {
    let current = this.head

    while (current) {
      if (predicate(current.data)) {
        return current.data
      }
      current = current.next
    }

    return null
  }

  /**
   * Get task at a specific index
   * @param {number} index
   * @returns {Object|null}
   */
  getAt(index) {
    if (index < 0 || index >= this.size) {
      return null
    }

    let current = this.head
    let currentIndex = 0

    while (currentIndex < index) {
      current = current.next
      currentIndex++
    }

    return current.data
  }

  /**
   * Update a task by ID
   * @param {string} taskId
   * @param {Object} updates
   * @returns {boolean}
   */
  update(taskId, updates) {
    let current = this.head

    while (current) {
      if (current.data.id === taskId) {
        current.data = { ...current.data, ...updates }
        return true
      }
      current = current.next
    }

    return false
  }

  /**
   * Get all tasks as an array
   * @returns {Object[]}
   */
  toArray() {
    const tasks = []
    let current = this.head

    while (current) {
      tasks.push(current.data)
      current = current.next
    }

    return tasks
  }

  /**
   * Filter tasks by a condition
   * @param {Function} predicate
   * @returns {Object[]}
   */
  filter(predicate) {
    const tasks = []
    let current = this.head

    while (current) {
      if (predicate(current.data)) {
        tasks.push(current.data)
      }
      current = current.next
    }

    return tasks
  }

  /**
   * Get tasks by status
   * @param {string} status
   * @returns {Object[]}
   */
  getByStatus(status) {
    return this.filter(task => task.status === status)
  }

  /**
   * Get tasks by priority
   * @param {string|number} priority
   * @returns {Object[]}
   */
  getByPriority(priority) {
    return this.filter(task => task.priority === priority)
  }

  /**
   * Get overdue tasks
   * @returns {Object[]}
   */
  getOverdueTasks() {
    const now = new Date()
    return this.filter(task => {
      const dueDate = new Date(task.dueDate)
      return dueDate < now && task.status !== 'completed'
    })
  }

  /**
   * Get completed tasks
   * @returns {Object[]}
   */
  getCompletedTasks() {
    return this.filter(task => task.status === 'completed')
  }

  /**
   * Get pending tasks
   * @returns {Object[]}
   */
  getPendingTasks() {
    return this.filter(task => task.status !== 'completed')
  }

  /**
   * Sort tasks by due date (modifies list in place)
   * @param {boolean} ascending
   */
  sortByDueDate(ascending = true) {
    if (this.size <= 1) return

    const tasks = this.toArray()
    tasks.sort((a, b) => {
      const dateA = new Date(a.dueDate)
      const dateB = new Date(b.dueDate)
      return ascending ? dateA - dateB : dateB - dateA
    })

    this.clear()
    tasks.forEach(task => this.append(task))
  }

  /**
   * Sort tasks by priority (modifies list in place)
   * @param {boolean} ascending
   */
  sortByPriority(ascending = true) {
    if (this.size <= 1) return

    const priorityOrder = { high: 1, medium: 2, low: 3 }
    const tasks = this.toArray()
    
    tasks.sort((a, b) => {
      const priorityA = priorityOrder[a.priority] || 4
      const priorityB = priorityOrder[b.priority] || 4
      return ascending ? priorityA - priorityB : priorityB - priorityA
    })

    this.clear()
    tasks.forEach(task => this.append(task))
  }

  /**
   * Reverse the linked list
   */
  reverse() {
    if (!this.head) return

    let current = this.head
    let temp = null

    // Swap head and tail
    this.tail = this.head

    while (current) {
      // Swap next and prev
      temp = current.prev
      current.prev = current.next
      current.next = temp

      // Move to next node (which is now prev)
      current = current.prev
    }

    // Update head
    if (temp) {
      this.head = temp.prev
    }
  }

  /**
   * Check if list is empty
   * @returns {boolean}
   */
  isEmpty() {
    return this.size === 0
  }

  /**
   * Get the size of the list
   * @returns {number}
   */
  getSize() {
    return this.size
  }

  /**
   * Clear all tasks
   */
  clear() {
    this.head = null
    this.tail = null
    this.size = 0
  }

  /**
   * Traverse the list and execute a callback on each task
   * @param {Function} callback
   */
  forEach(callback) {
    let current = this.head
    let index = 0

    while (current) {
      callback(current.data, index)
      current = current.next
      index++
    }
  }

  /**
   * Map over the list
   * @param {Function} callback
   * @returns {Array}
   */
  map(callback) {
    const results = []
    let current = this.head
    let index = 0

    while (current) {
      results.push(callback(current.data, index))
      current = current.next
      index++
    }

    return results
  }

  /**
   * Print the list (for debugging)
   */
  print() {
    if (!this.head) {
      console.log('Empty list')
      return
    }

    let current = this.head
    const tasks = []

    while (current) {
      tasks.push(`[${current.data.id}] ${current.data.title} (${current.data.status})`)
      current = current.next
    }

    console.log(tasks.join(' <-> '))
  }

  /**
   * Convert to JSON for serialization
   * @returns {Object[]}
   */
  toJSON() {
    return this.toArray()
  }

  /**
   * Load from JSON array
   * @param {Object[]} tasks
   */
  fromJSON(tasks) {
    this.clear()
    tasks.forEach(task => this.append(task))
  }
}

export { TaskNode, TaskLinkedList }
export default TaskLinkedList