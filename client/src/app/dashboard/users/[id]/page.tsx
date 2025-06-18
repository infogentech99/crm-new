// File: src/app/dashboard/users/[id]/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@components/ui/pagination";
import { toast } from "sonner";
import { User, RecentActivity } from "@customTypes/index";

export default function UserDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  // deletion modal
  const [deleting, setDeleting] = useState<RecentActivity | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // handlers for Leads
  const onView = useCallback(
    (act: RecentActivity) => router.push(`/dashboard/leads/${act.id}`),
    [router]
  );
  const onDelete = useCallback((act: RecentActivity) => {
    setDeleting(act);
    setIsDeleteOpen(true);
  }, []);

  // state
  const [user, setUser] = useState<User | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [tab, setTab] = useState<"Leads" | "Meetings" | "Tasks">("Leads");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // pagination
  const [page, setPage] = useState(1);
  const limit = 10;

  // load data
  const load = useCallback(async () => {
    if (!id) return;
    const userId: string = Array.isArray(id) ? id[0] : id;
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
    load();
  }, [load]);

  const handleConfirmDelete = async () => {
    if (!deleting) return;
    try {
      await deleteLead(deleting.id);
      toast.success("Lead deleted");
      await load();
    } catch (e: any) {
      toast.error(e.message || "Delete failed");
    } finally {
      setIsDeleteOpen(false);
      setDeleting(null);
    }
  };

  if (loading) return <UserDetailsShimmer/>;
  if (error)   return <DashboardLayout><div className="p-6 text-red-500 text-center">{error}</div></DashboardLayout>;
  if (!user)   return <DashboardLayout><div className="p-6 text-gray-600 text-center">User not found.</div></DashboardLayout>;

  // filter + paginate
  const filtered = activities.filter(a =>
    tab === "Leads" ? a.type==="Lead"
    : tab==="Meetings" ? a.type==="Meeting"
    : a.type==="Task"
  );
  const totalPages = Math.ceil(filtered.length/limit);
  const pageItems = filtered.slice((page-1)*limit, page*limit);

  // build columns
  const cfg = manageActivitiesConfig(
    page,
    limit,
    tab,
    tab==="Leads"? onView : undefined,
    tab==="Leads"? onDelete : undefined
  );

  return (
    <DashboardLayout>
      {/* User Details */}
      <div className="mb-4 bg-white shadow-sm rounded-md px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">User Details</h2>
          <Button onClick={()=>setIsEditOpen(true)}>Edit User</Button>
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

      {/* Recent Activity */}
      <div className="bg-white shadow-sm rounded-md my-6 p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Recent Activity</h3>
          <div className="flex space-x-2">
            {["Leads","Meetings","Tasks"].map(t=>(
              <Button key={t} onClick={()=>{setTab(t as any); setPage(1)}}>
                {t}
              </Button>
            ))}
          </div>
        </div>

        <DataTable
          data={pageItems.map(item => ({ ...item, _id: item.id }))}
          columns={cfg.tableColumns}
          isLoading={false}
          error={null}
        />

        {totalPages>1 && (
          <div className="mt-4 flex justify-end">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={e=>{e.preventDefault(); setPage(p=>Math.max(p-1,1))}}
                    className={page===1?"pointer-events-none opacity-50":""}
                  />
                </PaginationItem>
                {Array.from({length:Math.min(totalPages,10)},(_,i)=>i+1).map(pn=>(
                  <PaginationItem key={pn}>
                    <PaginationLink
                      href="#"
                      isActive={page===pn}
                      onClick={e=>{e.preventDefault(); setPage(pn)}}
                    >{pn}</PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={e=>{e.preventDefault(); setPage(p=>Math.min(p+1,totalPages))}}
                    className={page===totalPages?"pointer-events-none opacity-50":""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      <Modal isOpen={isEditOpen} onClose={()=>setIsEditOpen(false)} widthClass="max-w-3xl">
        <UserForm
          initialData={user}
          mode="edit"
          onClose={()=>{ setIsEditOpen(false); toast.success("Saved") }}
        />
      </Modal>

      {/* Delete Lead Confirmation */}
      {deleting && (
        <DeleteModal
          isOpen={isDeleteOpen}
          onClose={()=>setIsDeleteOpen(false)}
          onConfirm={handleConfirmDelete}
          itemLabel={deleting.name}
        />
      )}
    </DashboardLayout>
  );
}
