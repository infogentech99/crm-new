// File: src/app/dashboard/users/page.tsx
"use client";

import React, { useCallback, useState, useEffect } from "react";
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
import { PaginationComponent } from "@components/ui/pagination";
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
  const [isMounted, setIsMounted] = useState(false);

  // CRUD modal
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode | null>(null);

  // Delete modal
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Role from store
  const userRole = useSelector((s: RootState) => s.user.role || "");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["allUsers"],
    queryFn: () => fetchUsers(1, 10000),
    placeholderData: (previousData) => previousData,
    enabled: isMounted, // Only fetch data if mounted
  });

  const allUsers = data?.users || [];


  const filteredUsers = allUsers.filter((u: User) => {
    const matchSearch =
      (u.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (u.email?.toLowerCase() || '').includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const totalUsers = filteredUsers.length;
  const totalPages = Math.ceil(totalUsers / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const usersToDisplay = filteredUsers.slice(startIndex, endIndex);


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

  const config = manageUsersConfig(openView, openEdit, openDelete, openCreate);

  // Pagination
  const changePage = (n: number) => {
    if (n >= 1 && n <= totalPages) {
      setPage(n);
    } else if (n < 1) {
      setPage(1);
    } else if (n > totalPages) {
      setPage(totalPages);
    }
  };

  if (!isMounted) {
    return null; // Or a loading spinner, to prevent hydration mismatch
  }

  return (
    <DashboardLayout>
      <div className="p-6 bg-white rounded-lg shadow-md space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">{config.pageTitle}</h1>
          <CreateUserButton onClick={openCreate} />
        </div>

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
          data={usersToDisplay}
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

        {/* CRUD Modal */}
        {!!modalMode && (
          <Modal isOpen onClose={closeModal} widthClass="max-w-lg">
            {modalMode === "view" && selectedUser ? (
              <DetailUser user={selectedUser} onClose={closeModal} />
            ) : (
              <UserForm
                initialData={modalMode === "edit" ? selectedUser! : undefined}
                mode={modalMode === "edit" ? "edit" : "create"}
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
