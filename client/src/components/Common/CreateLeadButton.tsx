"use client";

import React from 'react';
import { Button } from "@components/ui/button";

interface CreateLeadButtonProps {
  onClick: () => void;
}

const CreateLeadButton: React.FC<CreateLeadButtonProps> = ({ onClick }) => {
  return (
    <Button onClick={onClick}>Create Lead</Button>
  );
};

export default CreateLeadButton;
