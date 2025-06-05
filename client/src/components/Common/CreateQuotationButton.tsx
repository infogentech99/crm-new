"use client";

import React from 'react';
import { Button } from "@components/ui/button";

interface CreateQuotationButtonProps {
  onClick: () => void;
}

const CreateQuotationButton: React.FC<CreateQuotationButtonProps> = ({ onClick }) => {
  return (
    <Button onClick={onClick}>Create Quotation</Button>
  );
};

export default CreateQuotationButton;
