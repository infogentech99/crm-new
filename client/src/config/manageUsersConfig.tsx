export const manageUsersConfig = {
  pageTitle: 'Manage Users',
  showCreateUserButton: true,
  createUserButtonAction: () => alert('Create User functionality is under development.'),
  tableColumns: [
    { key: '_id', label: 'S.NO', render: () => 1 },
    { key: 'name', label: 'NAME' },
    { key: 'email', label: 'EMAIL' },
    { key: 'role', label: 'ROLE' },
    {
      key: 'actions',
      label: 'ACTIONS',
      render: () => (
        <div className="flex items-center space-x-2">
          <button className="text-gray-500 hover:text-gray-700">View</button>
          <button className="text-red-500 hover:text-red-700">Delete</button>
        </div>
      ),
    },
  ],
};
