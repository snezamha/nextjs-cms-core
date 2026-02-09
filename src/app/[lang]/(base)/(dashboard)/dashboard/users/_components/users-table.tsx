"use client";

import { useMemo, useState } from "react";

import { toastTimedLoading, useToast } from "@/hooks/use-toast";
import { useDictionary } from "@/contexts/dictionary-context";
import { fetchJson } from "@/lib/api/fetch-json";
import { isApiError } from "@/lib/api/errors";

import { Button } from "@/components/base/ui/button";
import { Spinner } from "@/components/base/ui/spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/base/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/base/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/base/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/base/ui/alert-dialog";

type Role = "super_admin" | "admin" | "user";

export type UsersTableRow = {
  id: number;
  name: string | null;
  email: string;
  role: Role;
};

async function apiPatchRole(id: number, role: Exclude<Role, "super_admin">) {
  return await fetchJson<{ user: UsersTableRow }>(`/api/admin/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });
}

async function apiDeleteUser(id: number) {
  return await fetchJson<{ ok: true }>(`/api/admin/users/${id}`, {
    method: "DELETE",
  });
}

export function UsersTable({
  initialUsers,
  meUserId,
  meRole,
}: {
  initialUsers: UsersTableRow[];
  meUserId: number;
  meRole: Role;
}) {
  const { toast } = useToast();
  const dictionary = useDictionary();

  const strings = useMemo(() => {
    const d = dictionary as unknown as {
      userManagementPage?: {
        title?: string;
        description?: string;
        columns?: {
          name?: string;
          email?: string;
          role?: string;
          actions?: string;
        };
        roles?: { superAdmin?: string; admin?: string; user?: string };
        actions?: { delete?: string; saving?: string; deleting?: string };
        messages?: {
          roleUpdated?: string;
          roleUpdateFailed?: string;
          superAdminImmutable?: string;
          userDeleted?: string;
          userDeleteFailed?: string;
        };
        confirmDelete?: {
          title?: string;
          description?: string;
          cancel?: string;
          confirm?: string;
        };
      };
    };

    const fallback = {
      title: dictionary.navigation.userManagement ?? "User Management",
      description: "Manage application users and roles.",
      columns: {
        name: "Name",
        email: "Email",
        role: "Role",
        actions: "Actions",
      },
      roles: { superAdmin: "Super Admin", admin: "Admin", user: "User" },
      actions: {
        delete: "Delete",
        saving: "Saving...",
        deleting: "Deleting...",
      },
      messages: {
        roleUpdated: "Role updated.",
        roleUpdateFailed: "Failed to update role.",
        superAdminImmutable: "Super admin cannot be changed.",
        userDeleted: "User deleted.",
        userDeleteFailed: "Failed to delete user.",
      },
      confirmDelete: {
        title: "Delete user?",
        description:
          "This will remove the user from both the database and Clerk.",
        cancel: "Cancel",
        confirm: "Delete",
      },
    };

    return {
      title: d.userManagementPage?.title ?? fallback.title,
      description: d.userManagementPage?.description ?? fallback.description,
      columns: {
        name: d.userManagementPage?.columns?.name ?? fallback.columns.name,
        email: d.userManagementPage?.columns?.email ?? fallback.columns.email,
        role: d.userManagementPage?.columns?.role ?? fallback.columns.role,
        actions:
          d.userManagementPage?.columns?.actions ?? fallback.columns.actions,
      },
      roles: {
        superAdmin:
          d.userManagementPage?.roles?.superAdmin ?? fallback.roles.superAdmin,
        admin: d.userManagementPage?.roles?.admin ?? fallback.roles.admin,
        user: d.userManagementPage?.roles?.user ?? fallback.roles.user,
      },
      actions: {
        delete:
          d.userManagementPage?.actions?.delete ?? fallback.actions.delete,
        saving:
          d.userManagementPage?.actions?.saving ?? fallback.actions.saving,
        deleting:
          d.userManagementPage?.actions?.deleting ?? fallback.actions.deleting,
      },
      messages: {
        roleUpdated:
          d.userManagementPage?.messages?.roleUpdated ??
          fallback.messages.roleUpdated,
        roleUpdateFailed:
          d.userManagementPage?.messages?.roleUpdateFailed ??
          fallback.messages.roleUpdateFailed,
        superAdminImmutable:
          d.userManagementPage?.messages?.superAdminImmutable ??
          fallback.messages.superAdminImmutable,
        userDeleted:
          d.userManagementPage?.messages?.userDeleted ??
          fallback.messages.userDeleted,
        userDeleteFailed:
          d.userManagementPage?.messages?.userDeleteFailed ??
          fallback.messages.userDeleteFailed,
      },
      confirmDelete: {
        title:
          d.userManagementPage?.confirmDelete?.title ??
          fallback.confirmDelete.title,
        description:
          d.userManagementPage?.confirmDelete?.description ??
          fallback.confirmDelete.description,
        cancel:
          d.userManagementPage?.confirmDelete?.cancel ??
          fallback.confirmDelete.cancel,
        confirm:
          d.userManagementPage?.confirmDelete?.confirm ??
          fallback.confirmDelete.confirm,
      },
    };
  }, [dictionary]);

  const [users, setUsers] = useState<UsersTableRow[]>(initialUsers);
  const [pending, setPending] = useState<
    Record<number, "role" | "delete" | undefined>
  >({});

  const setPendingFor = (id: number, value: "role" | "delete" | undefined) =>
    setPending((p) => ({ ...p, [id]: value }));

  const resolveApiErrorMessage = (data: unknown, fallback: string): string => {
    const error = (data as { error?: unknown } | null)?.error;
    if (error === "SUPER_ADMIN_IMMUTABLE")
      return strings.messages.superAdminImmutable;
    if (typeof error === "string" && error.trim()) return error;
    return fallback;
  };

  const handleRoleChange = async (userId: number, nextRole: Role) => {
    setPendingFor(userId, "role");
    const loading = toastTimedLoading({
      description: strings.actions.saving,
      seconds: 2,
    });
    try {
      if (nextRole === "super_admin") {
        toast({
          description: strings.messages.superAdminImmutable,
          variant: "destructive",
        });
        return;
      }

      await apiPatchRole(userId, nextRole);

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: nextRole } : u))
      );
      toast({ description: strings.messages.roleUpdated, variant: "success" });
    } catch (e) {
      console.error(e);
      const msg = isApiError(e)
        ? resolveApiErrorMessage(e.body, strings.messages.roleUpdateFailed)
        : strings.messages.roleUpdateFailed;
      toast({
        description: msg,
        variant: "destructive",
      });
    } finally {
      loading.cancel();
      setPendingFor(userId, undefined);
    }
  };

  const handleDelete = async (userId: number) => {
    setPendingFor(userId, "delete");
    const loading = toastTimedLoading({
      description: strings.actions.deleting,
      seconds: 3,
    });
    try {
      await apiDeleteUser(userId);

      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast({ description: strings.messages.userDeleted, variant: "success" });
    } catch (e) {
      console.error(e);
      const msg = isApiError(e)
        ? resolveApiErrorMessage(e.body, strings.messages.userDeleteFailed)
        : strings.messages.userDeleteFailed;
      toast({
        description: msg,
        variant: "destructive",
      });
    } finally {
      loading.cancel();
      setPendingFor(userId, undefined);
    }
  };

  return (
    <div className="container py-6">
      <Card>
        <CardHeader>
          <CardTitle>{strings.title}</CardTitle>
          <CardDescription>{strings.description}</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="px-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-start">
                    {strings.columns.name}
                  </TableHead>
                  <TableHead className="text-start">
                    {strings.columns.email}
                  </TableHead>
                  <TableHead className="text-start">
                    {strings.columns.role}
                  </TableHead>
                  <TableHead className="text-end">
                    {strings.columns.actions}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => {
                  const isPending = !!pending[u.id];
                  const isMe = u.id === meUserId;
                  const isSuperAdmin = u.role === "super_admin";
                  const canManageThisRow =
                    meRole === "super_admin"
                      ? !isSuperAdmin && !isMe
                      : meRole === "admin"
                        ? u.role === "user" && !isMe
                        : false;
                  const deleting = pending[u.id] === "delete";
                  const saving = pending[u.id] === "role";

                  return (
                    <TableRow key={u.id}>
                      <TableCell className="text-start">
                        {u.name || "-"}
                      </TableCell>
                      <TableCell className="text-start">{u.email}</TableCell>
                      <TableCell className="text-start">
                        {isSuperAdmin ? (
                          <span className="inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium">
                            {strings.roles.superAdmin}
                          </span>
                        ) : (
                          <Select
                            value={u.role}
                            onValueChange={(value) =>
                              handleRoleChange(u.id, value as Role)
                            }
                            disabled={isPending || !canManageThisRow}
                          >
                            <SelectTrigger size="sm" className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent align="start">
                              <SelectItem value="user">
                                {strings.roles.user}
                              </SelectItem>
                              <SelectItem value="admin">
                                {strings.roles.admin}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                      <TableCell className="text-end">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={
                                isPending || !canManageThisRow || isSuperAdmin
                              }
                            >
                              {deleting ? (
                                <>
                                  <Spinner className="me-2" />
                                  {strings.actions.deleting}
                                </>
                              ) : (
                                strings.actions.delete
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                {strings.confirmDelete.title}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {strings.confirmDelete.description}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel disabled={isPending}>
                                {strings.confirmDelete.cancel}
                              </AlertDialogCancel>
                              <AlertDialogAction
                                variant="destructive"
                                disabled={isPending}
                                onClick={() => handleDelete(u.id)}
                              >
                                {saving ? (
                                  <>
                                    <Spinner className="me-2" />
                                    {strings.actions.saving}
                                  </>
                                ) : deleting ? (
                                  <>
                                    <Spinner className="me-2" />
                                    {strings.actions.deleting}
                                  </>
                                ) : (
                                  strings.confirmDelete.confirm
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {!users.length ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="py-10 text-center text-sm text-muted-foreground"
                    >
                      -
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
