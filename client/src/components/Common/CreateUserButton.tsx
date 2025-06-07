// File: src/components/Common/CreateUserButton.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@components/ui/button";

interface CreateUserButtonProps {
  onClick: () => void;
}

function getRoleFromToken(): string | null {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payloadJson = atob(parts[1]);
    const payload = JSON.parse(payloadJson);
    return (payload.role as string) || null;
  } catch {
    return null;
  }
}

const CreateUserButton: React.FC<CreateUserButtonProps> = ({ onClick }) => {
  // Track whether we've mounted on the client
  const [mounted, setMounted] = useState(false);
  // Store the decoded role after mount
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const role = getRoleFromToken();
    setUserRole(role);
  }, []);

  // If not mounted yet, render null (same as server)
  if (!mounted) {
    return null;
  }

  // Only show the button if userRole is exactly "superadmin" (case-insensitive)
  if (!userRole || userRole.toLowerCase() !== "superadmin") {
    return null;
  }

  return <Button onClick={onClick}>Create User</Button>;
};

export default CreateUserButton;
