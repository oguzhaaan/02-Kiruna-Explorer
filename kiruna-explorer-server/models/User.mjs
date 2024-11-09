/**
 * Represents a user in the system.
 */
/**
 * Represents the role of a user.
 * The values present in this enum are the only valid values for the role of a user.
 */
const Role = {
  URBAN_PLANNER : "urban_planner",
  RESIDENT : "resident",
  ADMIN : "admin"
}

class User {
  id
  role
  username

  /**
   * Creates a new instance of the User class.
   * @param id - The id of the user. This is unique for each user.
   * @param username - The username of the user. This is unique for each user.
   * @param role - The role of the user. This can be "urban_planner" or "resident".
   */
  constructor(id, role, username) {
      this.id = id
      this.username = username
      this.role = role
  }
}

export { User, Role }