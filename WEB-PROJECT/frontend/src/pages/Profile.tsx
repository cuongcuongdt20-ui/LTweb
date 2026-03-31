import { useMemo, useState } from "react";

interface StoredUser {
  id?: number;
  name?: string;
  email?: string;
  avatarUrl?: string;
}

function readStoredUser(): StoredUser {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export default function Profile() {
  const storedUser = useMemo(readStoredUser, []);
  const [name, setName] = useState(storedUser.name || "");
  const [email, setEmail] = useState(storedUser.email || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    setTimeout(() => {
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...storedUser,
          name,
          email,
        }),
      );
      alert("Da cap nhat thong tin local profile.");
      setIsSaving(false);
    }, 500);
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col pb-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Ho so ca nhan</h1>
        <p className="text-gray-500 text-sm">
          Backend README chua co endpoint profile, nen trang nay dang dung du lieu local sau khi dang nhap.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex items-center gap-6 bg-gray-50/50">
          <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-black shadow-inner uppercase">
            {email ? email.charAt(0) : "U"}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{name || "Chua co ten"}</h2>
            <p className="text-gray-500 mt-1">{email || "Chua co email"}</p>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Ho va ten</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Dia chi Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition shadow-sm hover:shadow flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? "Dang luu..." : "Luu thay doi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
