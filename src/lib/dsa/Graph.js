/**
 * Graph Class for Group Management
 * Manages many-to-many relationships between groups and employees
 * Each employee can belong to multiple groups
 * Each group can have multiple employees
 */
class GroupGraph {
  constructor() {
    this.adjacencyList = new Map() // groupId -> Set of userIds
    this.reverseList = new Map()   // userId -> Set of groupIds
    this.groupData = new Map()     // groupId -> group metadata
    this.userData = new Map()      // userId -> user metadata
  }

  /**
   * Add a new group to the graph
   * @param {string} groupId
   * @param {Object} data - { name, rank, leaderId, createdBy, ... }
   */
  addGroup(groupId, data = {}) {
    if (!this.adjacencyList.has(groupId)) {
      this.adjacencyList.set(groupId, new Set())
      this.groupData.set(groupId, data)
    }
  }

  /**
   * Add a user to the graph (if not exists)
   * @param {string} userId
   * @param {Object} data - { name, email, role, rank, ... }
   */
  addUser(userId, data = {}) {
    if (!this.reverseList.has(userId)) {
      this.reverseList.set(userId, new Set())
      this.userData.set(userId, data)
    }
  }

  /**
   * Add a user to a group (create edge)
   * @param {string} groupId
   * @param {string} userId
   * @returns {boolean} Success status
   */
  addMember(groupId, userId) {
    // Ensure group exists
    if (!this.adjacencyList.has(groupId)) {
      this.addGroup(groupId)
    }

    // Ensure user exists
    if (!this.reverseList.has(userId)) {
      this.addUser(userId)
    }

    // Add to both directions
    this.adjacencyList.get(groupId).add(userId)
    this.reverseList.get(userId).add(groupId)

    return true
  }

  /**
   * Remove a user from a group
   * @param {string} groupId
   * @param {string} userId
   * @returns {boolean} Success status
   */
  removeMember(groupId, userId) {
    if (!this.adjacencyList.has(groupId) || !this.reverseList.has(userId)) {
      return false
    }

    this.adjacencyList.get(groupId).delete(userId)
    this.reverseList.get(userId).delete(groupId)

    return true
  }

  /**
   * Remove a group entirely
   * @param {string} groupId
   * @returns {boolean} Success status
   */
  removeGroup(groupId) {
    if (!this.adjacencyList.has(groupId)) {
      return false
    }

    // Remove group from all members' lists
    const members = this.adjacencyList.get(groupId)
    members.forEach(userId => {
      if (this.reverseList.has(userId)) {
        this.reverseList.get(userId).delete(groupId)
      }
    })

    // Remove group
    this.adjacencyList.delete(groupId)
    this.groupData.delete(groupId)

    return true
  }

  /**
   * Remove a user from all groups
   * @param {string} userId
   * @returns {boolean} Success status
   */
  removeUser(userId) {
    if (!this.reverseList.has(userId)) {
      return false
    }

    // Remove user from all groups
    const groups = this.reverseList.get(userId)
    groups.forEach(groupId => {
      if (this.adjacencyList.has(groupId)) {
        this.adjacencyList.get(groupId).delete(userId)
      }
    })

    // Remove user
    this.reverseList.delete(userId)
    this.userData.delete(userId)

    return true
  }

  /**
   * Get all members of a group
   * @param {string} groupId
   * @returns {string[]} Array of user IDs
   */
  getGroupMembers(groupId) {
    if (!this.adjacencyList.has(groupId)) {
      return []
    }
    return Array.from(this.adjacencyList.get(groupId))
  }

  /**
   * Get all groups a user belongs to
   * @param {string} userId
   * @returns {string[]} Array of group IDs
   */
  getUserGroups(userId) {
    if (!this.reverseList.has(userId)) {
      return []
    }
    return Array.from(this.reverseList.get(userId))
  }

  /**
   * Get detailed group information with member data
   * @param {string} groupId
   * @returns {Object|null}
   */
  getGroupDetails(groupId) {
    if (!this.adjacencyList.has(groupId)) {
      return null
    }

    const memberIds = this.getGroupMembers(groupId)
    const members = memberIds.map(id => ({
      id,
      ...this.userData.get(id)
    }))

    return {
      id: groupId,
      ...this.groupData.get(groupId),
      members,
      memberCount: members.length
    }
  }

  /**
   * Get detailed user information with group data
   * @param {string} userId
   * @returns {Object|null}
   */
  getUserDetails(userId) {
    if (!this.reverseList.has(userId)) {
      return null
    }

    const groupIds = this.getUserGroups(userId)
    const groups = groupIds.map(id => ({
      id,
      ...this.groupData.get(id)
    }))

    return {
      id: userId,
      ...this.userData.get(userId),
      groups,
      groupCount: groups.length
    }
  }

  /**
   * Check if a user is member of a group
   * @param {string} groupId
   * @param {string} userId
   * @returns {boolean}
   */
  isMember(groupId, userId) {
    return this.adjacencyList.has(groupId) && 
           this.adjacencyList.get(groupId).has(userId)
  }

  /**
   * Get common groups between two users
   * @param {string} userId1
   * @param {string} userId2
   * @returns {string[]}
   */
  getCommonGroups(userId1, userId2) {
    const groups1 = new Set(this.getUserGroups(userId1))
    const groups2 = this.getUserGroups(userId2)
    
    return groups2.filter(groupId => groups1.has(groupId))
  }

  /**
   * Get users who are in multiple groups together
   * @param {string} userId
   * @returns {Map} Map of userId -> count of shared groups
   */
  getUserConnections(userId) {
    const userGroups = this.getUserGroups(userId)
    const connections = new Map()

    userGroups.forEach(groupId => {
      const members = this.getGroupMembers(groupId)
      members.forEach(memberId => {
        if (memberId !== userId) {
          connections.set(
            memberId, 
            (connections.get(memberId) || 0) + 1
          )
        }
      })
    })

    return connections
  }

  /**
   * Get all groups by rank
   * @param {string} rank - 'S', 'A', 'B', 'C', 'D', 'E'
   * @returns {Array}
   */
  getGroupsByRank(rank) {
    const groups = []
    
    for (const [groupId, data] of this.groupData.entries()) {
      if (data.rank === rank) {
        groups.push({
          id: groupId,
          ...data,
          memberCount: this.adjacencyList.get(groupId).size
        })
      }
    }
    
    return groups
  }

  /**
   * Get groups managed by a specific manager
   * @param {string} managerId
   * @returns {Array}
   */
  getGroupsByManager(managerId) {
    const groups = []
    
    for (const [groupId, data] of this.groupData.entries()) {
      if (data.createdBy === managerId) {
        groups.push({
          id: groupId,
          ...data,
          memberCount: this.adjacencyList.get(groupId).size
        })
      }
    }
    
    return groups
  }

  /**
   * Get group statistics
   * @param {string} groupId
   * @returns {Object}
   */
  getGroupStats(groupId) {
    if (!this.adjacencyList.has(groupId)) {
      return null
    }

    const members = this.getGroupMembers(groupId)
    const memberData = members.map(id => this.userData.get(id))

    // Count by rank
    const rankCount = memberData.reduce((acc, user) => {
      acc[user.rank] = (acc[user.rank] || 0) + 1
      return acc
    }, {})

    return {
      totalMembers: members.length,
      rankDistribution: rankCount,
      groupData: this.groupData.get(groupId)
    }
  }

  /**
   * Find isolated users (not in any group)
   * @returns {string[]}
   */
  getIsolatedUsers() {
    const isolated = []
    
    for (const [userId, groups] of this.reverseList.entries()) {
      if (groups.size === 0) {
        isolated.push(userId)
      }
    }
    
    return isolated
  }

  /**
   * Find empty groups (no members)
   * @returns {string[]}
   */
  getEmptyGroups() {
    const empty = []
    
    for (const [groupId, members] of this.adjacencyList.entries()) {
      if (members.size === 0) {
        empty.push(groupId)
      }
    }
    
    return empty
  }

  /**
   * Get all groups
   * @returns {Array}
   */
  getAllGroups() {
    return Array.from(this.groupData.entries()).map(([id, data]) => ({
      id,
      ...data,
      memberCount: this.adjacencyList.get(id).size
    }))
  }

  /**
   * Get all users
   * @returns {Array}
   */
  getAllUsers() {
    return Array.from(this.userData.entries()).map(([id, data]) => ({
      id,
      ...data,
      groupCount: this.reverseList.get(id).size
    }))
  }

  /**
   * Update group data
   * @param {string} groupId
   * @param {Object} updates
   * @returns {boolean}
   */
  updateGroup(groupId, updates) {
    if (!this.groupData.has(groupId)) {
      return false
    }

    const currentData = this.groupData.get(groupId)
    this.groupData.set(groupId, { ...currentData, ...updates })
    return true
  }

  /**
   * Update user data
   * @param {string} userId
   * @param {Object} updates
   * @returns {boolean}
   */
  updateUser(userId, updates) {
    if (!this.userData.has(userId)) {
      return false
    }

    const currentData = this.userData.get(userId)
    this.userData.set(userId, { ...currentData, ...updates })
    return true
  }

  /**
   * Get graph size statistics
   * @returns {Object}
   */
  getGraphStats() {
    let totalEdges = 0
    this.adjacencyList.forEach(members => {
      totalEdges += members.size
    })

    return {
      groupCount: this.adjacencyList.size,
      userCount: this.reverseList.size,
      totalMemberships: totalEdges,
      averageMembersPerGroup: totalEdges / this.adjacencyList.size || 0,
      averageGroupsPerUser: totalEdges / this.reverseList.size || 0
    }
  }

  /**
   * Clear all data
   */
  clear() {
    this.adjacencyList.clear()
    this.reverseList.clear()
    this.groupData.clear()
    this.userData.clear()
  }

  /**
   * Print graph structure (for debugging)
   */
  print() {
    console.log('=== Group Graph ===')
    console.log('\nGroups and their members:')
    
    for (const [groupId, members] of this.adjacencyList.entries()) {
      const groupInfo = this.groupData.get(groupId)
      console.log(`\n${groupInfo?.name || groupId} (${members.size} members):`)
      members.forEach(userId => {
        const userInfo = this.userData.get(userId)
        console.log(`  - ${userInfo?.name || userId}`)
      })
    }

    console.log('\n' + '='.repeat(50))
  }

  /**
   * Convert to JSON for serialization
   * @returns {Object}
   */
  toJSON() {
    return {
      groups: Array.from(this.adjacencyList.entries()).map(([id, members]) => ({
        id,
        data: this.groupData.get(id),
        members: Array.from(members)
      })),
      users: Array.from(this.reverseList.entries()).map(([id, groups]) => ({
        id,
        data: this.userData.get(id),
        groups: Array.from(groups)
      }))
    }
  }

  /**
   * Load from JSON
   * @param {Object} json
   */
  fromJSON(json) {
    this.clear()

    // Add all groups
    json.groups.forEach(group => {
      this.addGroup(group.id, group.data)
    })

    // Add all users
    json.users.forEach(user => {
      this.addUser(user.id, user.data)
    })

    // Add memberships
    json.groups.forEach(group => {
      group.members.forEach(userId => {
        this.addMember(group.id, userId)
      })
    })
  }
}

export default GroupGraph