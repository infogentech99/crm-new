// File: src/app/dashboard/users/page.tsx
"use client";

import React, { useCallback, useState } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import {
  fetchUsers,
  deleteUser,
} from "@services/userService";
import DataTable from "@components/Common/DataTable";
import DashboardLayout from "@components/Dashboard/DashboardLayout";
import CreateUserButton from "@components/Common/CreateUserButton";
import { manageUsersConfig } from "@config/manageUsersConfig";
import Modal from "@components/Common/Modal";
import DeleteModal from "@components/Common/DeleteModal";
import UserForm from "@components/Users/UserForm";
import { Input } from "@components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@components/ui/select";
import { PaginationComponent } from "@components/ui/pagination";
import { Button } from "@components/ui/button";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@store/store";
import { User } from "@customTypes/index";

type ModalMode = "edit" | "create";

export default function ManageUsersPage() {
  const queryClient = useQueryClient();
  const router = useRouter();

  // Filters
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "salesperson">("all");

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // CRUD modal
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode | null>(null);

  // Delete modal
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Role from store
  const userRole = useSelector((s: RootState) => s.user.role || "");

  // Fetch
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["users", page, limit],
    queryFn: () => fetchUsers(page, limit),
  });
  const users = data?.users || [];
  const totalPages = data?.pages || 1;

  // Client-side filtering
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  // Handlers
  const openCreate = () => {
    setSelectedUser(null);
    setModalMode("create");
  };
  const openEdit = (u: User) => {
    setSelectedUser(u);
    setModalMode("edit");
  };
  const openView = (u: User) => {
    router.push(`/dashboard/users/${u._id}`);
  };
  const openDelete = (u: User) => {
    setUserToDelete(u);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    await deleteUser(userToDelete._id);
    queryClient.invalidateQueries({ queryKey: ["users"] });
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedUser(null);
  };

   // Table config
  const config = manageUsersConfig(openView, openEdit, openDelete, openCreate);

  // Pagination
  const changePage = (n: number) => {
    if (n >= 1 && n <= totalPages) setPage(n);
  };

  return (
    <DashboardLayout>
      <div className="p-6 bg-white rounded-lg shadow-md space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">{config.pageTitle}</h1>
          <CreateUserButton onClick={openCreate} />
        </div>

         {/* Filters (moved directly below header) */}
      <div className="flex items-center justify-between mb-4">
  {/* Left: search input */}
  <Input
    className="max-w-sm"
    placeholder="Search by name or email…"
    value={search}
    onChange={(e) => {
      setSearch(e.target.value);
      setPage(1);
    }}
  />

  {/* Right: both selects */}
  <div className="flex items-center space-x-4">
    <Select
      value={roleFilter}
      onValueChange={(val) => {
        setRoleFilter(val as any);
        setPage(1);
      }}
    >
      <SelectTrigger className="w-[150px]">
        <SelectValue placeholder="All Roles" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Roles</SelectItem>
        <SelectItem value="admin">Admin</SelectItem>
        <SelectItem value="salesperson">Salesperson</SelectItem>
      </SelectContent>
    </Select>
    <Select
      value={String(limit)}
      onValueChange={(val) => {
        setLimit(Number(val));
        setPage(1);
      }}
    >
      <SelectTrigger className="w-[100px]">
        <SelectValue placeholder="Limit" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="5">5</SelectItem>
        <SelectItem value="10">10</SelectItem>
        <SelectItem value="20">20</SelectItem>
        <SelectItem value="50">50</SelectItem>
      </SelectContent>
    </Select>
  </div>
</div>

        {/* DataTable */}
        <DataTable
          columns={config.tableColumns}
          data={filteredUsers}
          isLoading={isLoading}
          error={isError ? error?.message : null}
        />

        {/* Pagination */}
        <div className="flex justify-end">
          <PaginationComponent
            currentPage={page}
            totalPages={totalPages}
            onPageChange={changePage}
          />
        </div>

        {/* Edit / Create Modal */}
        {(modalMode === "edit" || modalMode === "create") && (
          <Modal isOpen onClose={closeModal} widthClass="max-w-lg">
            <UserForm
              initialData={modalMode === "edit" ? selectedUser! : undefined}
              mode={modalMode}
              onClose={() => {
                closeModal();
                queryClient.invalidateQueries({ queryKey: ["users"] });
              }}
            />
          </Modal>
        )}

        {/* Delete Confirmation */}
        {userToDelete && (
          <DeleteModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={confirmDelete}
            itemLabel={userToDelete.name}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
