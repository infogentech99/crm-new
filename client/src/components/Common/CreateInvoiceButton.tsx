"use client";

import React from 'react';
import { Button } from "@components/ui/button";

interface CreateInvoiceButtonProps {
  onClick: () => void;
}

const CreateInvoiceButton: React.FC<CreateInvoiceButtonProps> = ({ onClick }) => {
  return (
    <Button onClick={onClick}>Create Invoice</Button>
  );
};

export default CreateInvoiceButton;
