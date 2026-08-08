"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RoleChangeDropdown({ userId, currentRole }: { userId: string, currentRole: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRoleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value;
    if (newRole === currentRole) return;

    if (!confirm(`Kullanıcı yetkisini ${newRole} olarak değiştirmek istediğinize emin misiniz?`)) {
      e.target.value = currentRole; // Reset
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/users/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole })
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Bir hata oluştu");
        e.target.value = currentRole;
      }
    } catch (error) {
      console.error(error);
      alert("Bağlantı hatası");
      e.target.value = currentRole;
    } finally {
      setLoading(false);
    }
  };

  return (
    <select 
      disabled={loading}
      defaultValue={currentRole} 
      onChange={handleRoleChange}
      className={`px-2 py-1 rounded-md text-xs font-bold border-none cursor-pointer focus:ring-2 focus:ring-[var(--primary)] ${
        currentRole === 'ADMIN' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
        currentRole === 'EXPERT' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
        'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
      }`}
    >
      <option value="USER">USER</option>
      <option value="EXPERT">EXPERT</option>
      <option value="ADMIN">ADMIN</option>
    </select>
  );
}
