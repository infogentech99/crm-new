"use client";

import React from 'react';
import { Button } from "@components/ui/button";

interface AddMeetingButtonProps {
  onClick: () => void;
}

const AddMeetingButton: React.FC<AddMeetingButtonProps> = ({ onClick }) => {
  return (
    <Button onClick={onClick}>Add Meeting</Button>
  );
};

export default AddMeetingButton;
