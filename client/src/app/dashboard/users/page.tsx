// File: src/app/dashboard/users/page.tsx
"use client";

import React, { useCallback, useState } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import {
  fetchUsers,
  deleteUser,
  fetchUserActivities,
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@components/ui/pagination";
import { Button } from "@components/ui/button";
import { useSelector } from "react-redux";
import { RootState } from "@store/store";
import { User, RecentActivity } from "@customTypes/index";

type ModalMode = "view" | "edit" | "create";

export default function ManageUsersPage() {
  const queryClient = useQueryClient();

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
    keepPreviousData: true,
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
    setSelectedUser(u);
    setModalMode("view");
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
  const config = manageUsersConfig(openView, openEdit, openDelete, openCreate, userRole, page, limit);

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
        <div className="flex items-center space-x-4">
          <Input
            className="max-w-sm"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
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

        {/* DataTable */}
        <DataTable
          columns={config.tableColumns}
          data={filteredUsers}
          isLoading={isLoading}
          error={isError ? error?.message : null}
        />

        {/* Pagination */}
        <div className="flex justify-end">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => { e.preventDefault(); changePage(page - 1); }}
                  className={page === 1 ? "opacity-50 pointer-events-none" : ""}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => { e.preventDefault(); changePage(i + 1); }}
                    isActive={page === i + 1}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => { e.preventDefault(); changePage(page + 1); }}
                  className={page === totalPages ? "opacity-50 pointer-events-none" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>

        {/* CRUD Modal */}
        {!!modalMode && (
          <Modal isOpen onClose={closeModal} widthClass="max-w-lg">
            {modalMode === "view" && selectedUser ? (
              <DetailUser user={selectedUser} onClose={closeModal} />
            ) : (
              <UserForm
                initialData={modalMode === "edit" ? selectedUser! : undefined}
                mode={modalMode}
                onClose={() => {
                  closeModal();
                  queryClient.invalidateQueries({ queryKey: ["users"] });
                }}
              />
            )}
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

function DetailUser({ user, onClose }: { user: User; onClose: () => void }) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["userActivities", user._id],
    queryFn: () => fetchUserActivities(user._id),
  });

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold">{user.name}</h2>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>

      <h3 className="font-medium">Recent Activity</h3>
      {isLoading ? (
        <p>Loading…</p>
      ) : isError ? (
        <p className="text-red-500">{(error as Error).message}</p>
      ) : data && data.length ? (
        <ul className="space-y-2 max-h-64 overflow-y-auto">
          {data.map((act) => (
            <li key={act.id} className="flex justify-between">
              <span><strong>{act.type}:</strong> {act.description}</span>
              <span className="text-gray-500 text-sm">{act.date}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p>No recent activity.</p>
      )}

      <div className="text-right">
        <Button onClick={onClose}>Close</Button>
      </div>
    </div>
  );
}
