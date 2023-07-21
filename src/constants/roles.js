const allRoles = {
  user: ['getUsers', 'getProducts', 'manageProducts'],
  admin: ['admin', 'getUsers', 'manageUsers', 'getProducts', 'manageProducts'],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
