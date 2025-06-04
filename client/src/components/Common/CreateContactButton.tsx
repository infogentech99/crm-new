"use client";

import React from 'react';
import { Button } from "@components/ui/button";

interface CreateContactButtonProps {
  onClick: () => void;
}

const CreateContactButton: React.FC<CreateContactButtonProps> = ({ onClick }) => {
  return (
    <Button onClick={onClick}>Create Contact</Button>
  );
};

export default CreateContactButton;
