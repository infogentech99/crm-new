
"use client";

import React, { useEffect, useState } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import {
  fetchUsers,
  deleteUser,
} from "@services/userService";
import DataTable from "@components/Common/DataTable";
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
import { PaginationComponent } from '@components/ui/pagination';
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@store/store";
import { User } from "@customTypes/index";

type ModalMode = "Edit" | "Create";

export default function ManageUsersPage() {
  const userRole = useSelector((s: RootState) => s.user.role || "");

  const queryClient = useQueryClient();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "salesperson" | "accounts">("all");


  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    document.title = "Manage Users – CRM Application";
    setIsMounted(true);
  }, []);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode | null>(null);


  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["users", page, limit, search, roleFilter],
    queryFn: () => fetchUsers(page, limit, search, roleFilter),
    enabled: isMounted,
  });


  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && userRole !== "superadmin") {
      router.replace("/dashboard");
    }
  }, [isMounted, userRole, router]);


  if (!isMounted || userRole !== "superadmin") {
    return null;
  }

  const users = data?.users || [];
  const totalPages = data?.pages || 1;
  const filteredUsers = users;


  const openCreate = () => {
    setSelectedUser(null);
    setModalMode("Create");
  };
  const openEdit = (u: User) => {
    setSelectedUser(u);
    setModalMode("Edit");
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
    queryClient.invalidateQueries({ queryKey: ["users", page, limit, search, roleFilter] });
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedUser(null);
  };

  const config = manageUsersConfig(openView, openEdit, openDelete, openCreate, page, limit);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    } else if (newPage < 1) {
      setPage(1);
    } else if (newPage > totalPages) {
      setPage(totalPages);
    }
  };

  return (
    <>
      <div className="p-6 bg-white rounded-lg shadow-md space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">{config.pageTitle}</h1>
          <CreateUserButton onClick={openCreate} />
        </div>

        <div className="flex items-center justify-between mb-4">
          <Input
            className="max-w-sm"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />

          <div className="flex items-center space-x-4">
            <Select
              value={roleFilter}
              onValueChange={(val: "all" | "admin" | "salesperson") => {
                setRoleFilter(val);
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
                <SelectItem value="accounts">Accounts</SelectItem>
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
        <DataTable
          columns={config.tableColumns}
          data={filteredUsers}
          isLoading={isLoading}
          error={isError ? error?.message : null}
        />
        <div className="mt-4 flex justify-end">
          <PaginationComponent
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>

        {(modalMode === "Edit" || modalMode === "Create") && (
          <Modal isOpen onClose={closeModal} widthClass="max-w-sm">
            <UserForm
              data={modalMode === "Edit" ? selectedUser! : undefined}
              mode={modalMode}
              onClose={() => {
                closeModal();
                queryClient.invalidateQueries({ queryKey: ["users", page, limit, search, roleFilter] });
              }}
            />
          </Modal>
        )}
        {userToDelete && (
          <DeleteModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={confirmDelete}
            itemLabel={userToDelete.name}
          />
        )}
      </div>
    </>
  );
}
