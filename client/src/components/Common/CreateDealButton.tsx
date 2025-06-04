"use client";

import React from 'react';
import { Button } from "@components/ui/button";

interface CreateDealButtonProps {
  onClick: () => void;
}

const CreateDealButton: React.FC<CreateDealButtonProps> = ({ onClick }) => {
  return (
    <Button onClick={onClick}>Create Deal</Button>
  );
};

export default CreateDealButton;
