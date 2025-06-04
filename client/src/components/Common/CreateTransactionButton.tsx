"use client";

import React from 'react';
import { Button } from "@components/ui/button";

interface CreateTransactionButtonProps {
  onClick: () => void;
}

const CreateTransactionButton: React.FC<CreateTransactionButtonProps> = ({ onClick }) => {
  return (
    <Button onClick={onClick}>Create Transaction</Button>
  );
};

export default CreateTransactionButton;
