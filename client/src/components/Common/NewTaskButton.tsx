"use client";

import React from 'react';
import { Button } from "@components/ui/button";

interface NewTaskButtonProps {
  onClick: () => void;
}

const NewTaskButton: React.FC<NewTaskButtonProps> = ({ onClick }) => {
  return (
    <Button onClick={onClick}>New Task</Button>
  );
};

export default NewTaskButton;
