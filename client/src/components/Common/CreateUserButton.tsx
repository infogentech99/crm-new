"use client";

import React from 'react';
import { Button } from "@components/ui/button";
import { useSelector } from 'react-redux';
import { RootState } from '@store/store';

interface CreateUserButtonProps {
  onClick: () => void;
}

const CreateUserButton: React.FC<CreateUserButtonProps> = ({ onClick }) => {
  const userRole = useSelector((state: RootState) => state.user.role);

  if (userRole !== 'superadmin') {
    return null;
  }

  return (
    <Button onClick={onClick}>Create User</Button>
  );
};

export default CreateUserButton;
