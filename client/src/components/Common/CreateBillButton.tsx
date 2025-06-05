"use client";

import React from 'react';
import { Button } from "@components/ui/button";

interface CreateBillButtonProps {
  onClick: () => void;
}

const CreateBillButton: React.FC<CreateBillButtonProps> = ({ onClick }) => {
  return (
    <Button onClick={onClick}>Create Bill</Button>
  );
};

export default CreateBillButton;
