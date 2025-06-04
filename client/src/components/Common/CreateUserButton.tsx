import React from 'react';
import { Button } from "@components/ui/button";

interface CreateUserButtonProps {
  userRole: string | null;
  onClick: () => void;
}

const CreateUserButton: React.FC<CreateUserButtonProps> = ({ userRole, onClick }) => {
  if (userRole === 'superadmin') {
    return (
      <Button className="mb-4" onClick={onClick}>Create User</Button>
    );
  }
  return null;
};

export default CreateUserButton;
