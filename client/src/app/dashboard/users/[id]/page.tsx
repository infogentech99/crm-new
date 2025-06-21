"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@components/Dashboard/DashboardLayout";
import { fetchUserById, fetchUserActivities } from "@services/userService";
import { deleteLead } from "@services/leadService";
import DataTable from "@components/Common/DataTable";
import { manageActivitiesConfig } from "@config/manageActivitiesConfig";
import DeleteModal from "@components/Common/DeleteModal";
import Modal from "@components/Common/Modal";
import UserForm from "@components/Users/UserForm";
import UserDetailsShimmer from "@components/ui/UserDetailsShimmer";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@components/ui/select";
import {
  PaginationComponent,
} from "@components/ui/pagination";
import { toast } from "sonner";
import { User, RecentActivity } from "@customTypes/index";

export default function UserDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  // Deletion modal state
  const [deleting, setDeleting] = useState<RecentActivity | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // View/Delete handlers
  const onView = useCallback(
    (act: RecentActivity) => router.push(`/dashboard/leads/${act.id}`),
    [router]
  );
  const onDelete = useCallback((act: RecentActivity) => {
    setDeleting(act);
    setIsDeleteOpen(true);
  }, []);

  // User & activities
  const [user, setUser] = useState<User | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [tab, setTab] = useState<"Leads" | "Meetings" | "Tasks">("Leads");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Filters & pagination
  const [search, setSearch] = useState<string>("");
  const [limit, setLimit] = useState<number>(10);
  const [page, setPage] = useState<number>(1);

  // Fetch data
  const load = useCallback(async () => {
    if (!id) return;
    const userId = Array.isArray(id) ? id[0] : id;
    setLoading(true);
    try {
      const [u, acts] = await Promise.all([
        fetchUserById(userId),
        fetchUserActivities(userId),
      ]);
      setUser(u);
      setActivities(acts);
    } catch (e: any) {
      setError(e.message || "Unable to load");
    } finally {
      setLoading(false);
    }
  }, [id]);

   useEffect(() => {
     document.title = "User Details – CRM Application";
   }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!deleting) return;
    try {
      await deleteLead(String(deleting.id));
      toast.success("Activity deleted");
      await load();
    } catch (e: any) {
      toast.error(e.message || "Delete failed");
    } finally {
      setIsDeleteOpen(false);
      setDeleting(null);
    }
  };

  if (loading) return <UserDetailsShimmer />;
  if (error)
    return (
      <DashboardLayout>
        <div className="p-6 text-red-500 text-center">{error}</div>
      </DashboardLayout>
    );
  if (!user)
    return (
      <DashboardLayout>
        <div className="p-6 text-gray-600 text-center">User not found.</div>
      </DashboardLayout>
    );

  const filtered = activities
    .filter((a) =>
      tab === "Leads"
        ? a.type === "Lead"
        : tab === "Meetings"
          ? a.type === "Meeting"
          : a.type === "Task"
    )
    .filter((a) =>
      search ? a.description.toLowerCase().includes(search.toLowerCase()) : true
    );

  const totalPages = Math.ceil(filtered.length / limit);
  const pageItems = filtered.slice((page - 1) * limit, page * limit);

  const cfg = manageActivitiesConfig(
    page,
    limit,
    tab,
    tab === "Leads" ? onView : undefined,
    tab === "Leads" ? onDelete : undefined
  );

  const handleLimitChange = (val: string) => {
    setLimit(Number(val));
    setPage(1);
  };

  return (
    <DashboardLayout>
      <div className="mb-4 bg-white shadow-sm rounded-md px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">User Details</h2>
          <Button onClick={() => setIsEditOpen(true)}>Edit User</Button>
        </div>
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <div className="space-y-2">
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>Joined:</strong> {new Date((user as any).createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-md my-6 p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Recent Activity</h3>
          <div className="flex space-x-2">
            {[
              "Leads",
              "Meetings",
              "Tasks",
            ].map((t) => (
              <Button
                key={t}
                variant={tab === t ? "default" : "outline"}
                onClick={() => {
                  setTab(t as any);
                  setPage(1);
                  setSearch("");
                }}
              >
                {t}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4 space-x-4">
          <Input
            placeholder="Search activities..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="max-w-sm"
          />
          <Select value={String(limit)} onValueChange={handleLimitChange}>
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

        <DataTable
          data={pageItems.map(item => ({ ...item, _id: String(item.id) }))}
          columns={cfg.tableColumns}
          isLoading={false}
          error={null}
        />

        {totalPages > 1 && (
          <div className="mt-4 flex justify-end">
            <PaginationComponent
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} widthClass="max-w-3xl">
        <UserForm
          initialData={user!}
          mode="edit"
          onClose={() => { setIsEditOpen(false); toast.success("Saved"); }}
        />
      </Modal>

      {/* Delete Confirmation */}
      {deleting && (
        <DeleteModal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={handleConfirmDelete}
          itemLabel={deleting.name}
        />
      )}
    </DashboardLayout>
  );
}
